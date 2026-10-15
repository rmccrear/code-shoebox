import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer, optimizeDeps, resolveConfig } from 'vite';
import { chromium } from 'playwright';
import { workerMemory } from './editor-worker-memory.mjs';

// Browser smoke comparison, not a production performance benchmark.
// Keep optimized dependencies inside node_modules so React's source transform
// does not reprocess them. Each run is isolated from the user's dev server.
const cacheDir = await mkdtemp(join(process.cwd(), 'node_modules/.vite-editor-comparison-'));
const comparisonConfig = {
  cacheDir,
  server: { host: '127.0.0.1', port: 0, hmr: false },
  logLevel: 'error',
  optimizeDeps: {
    // Freeze dependency discovery during timed interactions. A development
    // optimizer reload would reset the exercise and invalidate the comparison.
    noDiscovery: true,
    include: [
      'react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', 'lucide-react',
      '@monaco-editor/react', 'emmet-monaco-es', 'codemirror', '@codemirror/state', '@codemirror/view',
      '@codemirror/commands', '@codemirror/autocomplete', '@codemirror/language', '@codemirror/lint',
      '@codemirror/lang-html', '@codemirror/lang-css', '@codemirror/lang-javascript', '@codemirror/theme-one-dark',
      '@emmetio/codemirror6-plugin', '@shikijs/core', '@shikijs/engine-javascript',
      '@shikijs/langs/jsx', '@shikijs/themes/dark-plus', '@shikijs/themes/light-plus', '@shikijs/monaco',
    ],
  },
};
// Finish initial dependency optimization before timing navigation. Even with
// discovery disabled, Vite can otherwise reload an early page when this ends.
await optimizeDeps(await resolveConfig(comparisonConfig, 'serve'), true);
const server = await createServer(comparisonConfig);
const results = [];
let browser;
try {
  await server.listen();
  const { port } = server.httpServer.address();
  browser = await chromium.launch({ headless: true });
  for (const editor of process.env.COMPARE_EDITORS?.split(',') ?? ['monaco', 'codemirror']) {
    for (const scenario of process.env.COMPARE_SCENARIOS?.split(',') ?? ['html-css-js-tabs-demo', 'react-app-counter-demo', 'ts-logic-demo']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      let navigations = 0;
      page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++; });
      console.log(`Checking ${editor}/${scenario}`);
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on('console', message => {
        if (message.type() !== 'error') return;
        console.log(`${editor}/${scenario}: ${message.text()}`);
        if (message.text().startsWith('[CodeShoebox]')) errors.push(message.text());
      });
      let cancellations = 0;
      page.on('pageerror', error => {
        if (editor === 'monaco' && error.message === 'Canceled') cancellations++;
        else errors.push(error.message);
      });
      await page.goto(`http://127.0.0.1:${port}/tests/editor-comparison/index.html?editor=${editor}&scenario=${scenario}`);
      const surface = editor === 'monaco' ? '.monaco-editor .view-lines' : '.cm-content';
      await page.locator(surface).waitFor();
      const readyMs = await page.evaluate(() => Math.round(performance.now()));
      let serviceReadyMs = null;
      if (scenario === 'ts-logic-demo' && editor === 'monaco') {
        await page.evaluate(() => window.editorComparison.ready());
        serviceReadyMs = await page.evaluate(() => Math.round(performance.now()));
      }
      const file = scenario.startsWith('html') ? 'script.js' : scenario.startsWith('react') ? 'App.jsx' : null;
      const otherFile = scenario.startsWith('html') ? 'style.css' : scenario.startsWith('react') ? 'Counter.jsx' : null;
      if (file) await page.getByRole('button', { name: file, exact: true }).click();
      if (editor === 'monaco' && file) await page.waitForFunction(file => window.monaco.editor.getEditors().some(editor => editor.getModel()?.uri.path.endsWith(file)), file);
      await page.locator(surface).click({ position: { x: 40, y: 15 } });
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End');
      await page.keyboard.press('Enter');
      await page.keyboard.type('// editor comparison smoke', { delay: 50 });
      await page.waitForFunction(() => document.querySelector('#source').textContent.includes('editor comparison smoke')).catch(async error => {
        await mkdir('output/playwright/editor-comparison', { recursive: true });
        await page.screenshot({ path: 'output/playwright/editor-comparison/failure.png' });
        console.log(await page.locator('#source').textContent(), errors);
        throw error;
      });
      if (otherFile) {
        await page.getByRole('button', { name: otherFile, exact: true }).click();
        await page.getByRole('button', { name: file, exact: true }).click();
      }
      await page.locator(surface).click({ position: { x: 40, y: 15 } });
      await page.keyboard.press('ControlOrMeta+z');
      // Give React's controlled value time to update before observing history.
      await page.waitForTimeout(150);
      const undoAfterTab = await page.locator('#source').evaluate(element => !element.textContent.includes('editor comparison smoke'));
      await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
      await page.getByRole('button', { name: 'Reset exercise', exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('#source').textContent.includes('editor comparison smoke'));

      let memberCompletions = [];
      let inferredHover = null;
      let completionKeys = null;
      if (scenario === 'ts-logic-demo' && editor === 'monaco') {
        await page.evaluate(() => window.editorComparison.ready());
        await page.locator(surface).click({ position: { x: 40, y: 15 } });
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End');
        await page.keyboard.press('Enter');
        await page.keyboard.type('const typedValue: number = "wrong";', { delay: 50 });
        await page.waitForFunction(() => document.querySelector('#source').textContent.includes('typedValue'));
      }
      let typeDiagnostics = [];
      if (scenario === 'ts-logic-demo' && editor === 'monaco') {
        const deadline = Date.now() + 15000;
        do {
          typeDiagnostics = await page.evaluate(() => window.editorComparison.diagnostics());
          if (typeDiagnostics.includes(2322)) break;
          await page.waitForTimeout(100);
        } while (Date.now() < deadline);
        assert.ok(typeDiagnostics.includes(2322), `${editor}: missing semantic diagnostic 2322`);
        inferredHover = await page.evaluate(() => window.editorComparison.hover('typedValue'));
        assert.ok(inferredHover.includes('typedValue: number'), `${editor}: missing inferred type hover`);
        await page.keyboard.press('Escape');
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End');
        await page.keyboard.press('Enter');
        await page.keyboard.type('const typedTask = { title: "Ship", done: false };', { delay: 50 });
        await page.keyboard.press('Escape');
        await page.keyboard.press('Enter');
        await page.keyboard.type('typedTask.', { delay: 50 });
        memberCompletions = await page.evaluate(() => window.editorComparison.completions());
        assert.ok(memberCompletions.includes('title') && memberCompletions.includes('done'), `${editor}: missing inferred member completions`);
        await page.keyboard.press('Control+Space');
        const suggestions = editor === 'monaco' ? '.suggest-widget.visible .monaco-list-row' : '.cm-tooltip-autocomplete .cm-completionLabel';
        await page.locator(suggestions).filter({ hasText: 'title' }).first().waitFor();
        await page.keyboard.press('Escape');
      }
      let localCompletions = [];
      if (editor === 'codemirror') {
        if (file) await page.getByRole('button', { name: file, exact: true }).click();
        await page.locator(surface).click({ position: { x: 40, y: 15 } });
        await page.keyboard.press(process.platform === 'darwin' ? 'Meta+ArrowDown' : 'Control+End');
        await page.keyboard.press('Enter');
        await page.keyboard.type('const learnerCount = 1;', { delay: 50 });
        await page.keyboard.press('Escape');
        await page.keyboard.press('Enter');
        await page.keyboard.type('learnerC', { delay: 50 });
        localCompletions = await page.evaluate(() => window.editorComparison.completions());
        assert.ok(localCompletions.includes('learnerCount'), 'CodeMirror: missing built-in local completion');
        await page.keyboard.press('Control+Space');
        const suggestions = '.cm-tooltip-autocomplete .cm-completionLabel';
        await page.locator(suggestions).filter({ hasText: 'learnerCount' }).first().waitFor();
        // CodeMirror's default interaction delay prevents accepting a popup
        // before the learner has had time to see it.
        await page.waitForTimeout(100);
        await page.keyboard.press('Tab');
        await page.waitForFunction(() => document.querySelector('.cm-content .cm-line:last-child')?.textContent.trim() === 'learnerCount');
        await page.keyboard.press('Enter');
        await page.keyboard.type('learnerC', { delay: 50 });
        await page.keyboard.press('Control+Space');
        await page.locator(suggestions).filter({ hasText: 'learnerCount' }).first().waitFor();
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('.cm-content .cm-line:last-child')?.textContent === '' && document.querySelector('.cm-content .cm-line:nth-last-child(2)')?.textContent.trim() === 'learnerC');
        completionKeys = 'Tab accepts; Enter inserts newline';
      }
      let emmetExpansion = null;
      if (scenario.startsWith('html')) {
        await page.getByRole('button', { name: 'index.html', exact: true }).click();
        await page.getByLabel('Enable Emmet').check();
        if (editor === 'codemirror') await page.locator('[data-emmet-status="ready"]').waitFor().catch(async error => {
          console.log(await page.locator('[data-editor-backend]').evaluate(element => element.outerHTML.slice(0, 350)), errors);
          throw error;
        });
        await page.locator(surface).click({ position: { x: 40, y: 15 } });
        await page.keyboard.press('ControlOrMeta+a');
        await page.keyboard.type('div.emmet-check>span{Hello}', { delay: 100 });
        await page.waitForFunction(() => document.querySelector('#source').textContent.includes('div.emmet-check>span{Hello}'));
        await page.keyboard.press('Control+Space');
        const suggestions = editor === 'monaco' ? '.suggest-widget.visible' : '.cm-tooltip-autocomplete';
        await page.locator(suggestions).waitFor();
        await page.keyboard.press('Tab');
        await page.waitForFunction(() => document.querySelector('#source').textContent.includes('class=\\"emmet-check\\"')).catch(async error => {
          await mkdir('output/playwright/editor-comparison', { recursive: true });
          await page.screenshot({ path: 'output/playwright/editor-comparison/emmet-failure.png' });
          console.log(await page.locator('#source').textContent(), errors);
          throw error;
        });
        emmetExpansion = true;
        await page.getByLabel('Enable Emmet').uncheck();
      }
      await page.getByRole('button', { name: 'Reset exercise', exact: true }).click();
      await page.locator('iframe').waitFor({ state: 'attached' });
      const runtimeFrame = page.frames().find(frame => frame.parentFrame() === page.mainFrame());
      await runtimeFrame.waitForFunction(() => window.messagePort && typeof window.__RUN_MODE__ === 'function');
      const run = page.getByRole('button', { name: 'RUN CODE', exact: true });
      await run.click();
      if (scenario.startsWith('html')) {
        const frame = page.locator('iframe').contentFrame();
        await frame.getByRole('button', { name: 'Run launch check' }).click();
        await frame.getByText('All systems go!', { exact: true }).waitFor();
        // The runtime animates theme/background updates; wait for the transition.
        await frame.locator('body').evaluate(element => new Promise((resolve, reject) => {
          const deadline = performance.now() + 3000;
          const check = () => {
            if (getComputedStyle(element).backgroundColor === 'rgb(236, 254, 255)') resolve(true);
            else if (performance.now() > deadline) reject(new Error('Exercise CSS background was not applied'));
            else requestAnimationFrame(check);
};
          check();
        }));
      } else if (scenario.startsWith('react')) {
        const frame = page.locator('iframe').contentFrame();
        await frame.getByRole('button', { name: 'Increment', exact: true }).click();
        await frame.getByText('Count: 1', { exact: true }).waitFor();
      } else {
        await page.locator('.break-all.whitespace-pre').filter({ hasText: 'Ship hash presets' }).waitFor().catch(async error => {
          await mkdir('output/playwright/editor-comparison', { recursive: true });
          await page.screenshot({ path: 'output/playwright/editor-comparison/ts-failure.png' });
          console.log(await page.locator('.break-all.whitespace-pre').allTextContents(), errors);
          throw error;
        });
      }
      // Sample memory with the script editor active after the reset/tab lifecycle.
      // Monaco retains its language service; CodeMirror uses built-in support.
      if (scenario.startsWith('html')) {
        await page.getByRole('button', { name: 'script.js', exact: true }).click();
        if (editor === 'monaco') await page.waitForFunction(() => window.monaco.editor.getEditors().some(editor => editor.getModel()?.uri.path.endsWith('script.js')));
      }
      if (editor === 'monaco' && !scenario.startsWith('react')) await page.evaluate(() => window.editorComparison.ready());
      assert.deepEqual(errors, [], `${editor}/${scenario}: browser errors`);
      assert.equal(navigations, 1, `${editor}/${scenario}: page reloaded during comparison`);
      await mkdir('output/playwright/editor-comparison', { recursive: true });
      await page.screenshot({ path: `output/playwright/editor-comparison/${editor}-${scenario}.png` });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Performance.enable');
      const { metrics } = await cdp.send('Performance.getMetrics');
      const heapMB = Math.round(metrics.find(metric => metric.name === 'JSHeapUsedSize').value / 1024 / 1024 * 10) / 10;
      const workerHeap = await workerMemory(browser, cdp);
      if (editor === 'codemirror') assert.equal(workerHeap.workerCount, 0, 'CodeMirror should not start a language-service worker');
      const result = { editor, scenario, readyMs, serviceReadyMs, heapMB, ...workerHeap, undoAfterTab, typeDiagnostics, localCompletions, memberCompletions, inferredHover, completionKeys, emmetExpansion, execution: 'passed', browserErrors: errors, cancellations };
      results.push(result);
      console.log(JSON.stringify(result));
      await context.close();
    }
  }
  const demoContext = await browser.newContext();
  const demoPage = await demoContext.newPage();
  await demoPage.goto(`http://127.0.0.1:${port}/?editor=codemirror#react-app-counter-demo`);
  await demoPage.locator('.cm-content').waitFor();
  await demoPage.getByLabel('Editor engine').selectOption('monaco');
  await demoPage.locator('.monaco-editor .view-lines').waitFor();
  await demoPage.getByLabel('Editor engine').selectOption('codemirror');
  await demoPage.locator('.cm-content').waitFor();
  assert.ok((await demoPage.locator('.cm-content').textContent()).includes('Vite-style App.jsx'));
  console.log('PASS demo engine selector and source preservation');
  await demoContext.close();
  await writeFile('output/playwright/editor-comparison/results.json', JSON.stringify(results, null, 2) + '\n');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
