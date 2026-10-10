import assert from 'node:assert/strict';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
await Promise.all(['dist/export.js', 'dist/styles.css'].map(file => access(new URL(`../${file}`, import.meta.url))));
const cacheDir = await mkdtemp(join(tmpdir(), 'code-shoebox-style-isolation-'));
const server = await createServer({
  configFile: false,
  root,
  cacheDir,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});
let browser;
try {
  await server.listen();
  const { port } = server.httpServer.address();
  browser = await chromium.launch({ headless: true });
  for (const host of ['layered', 'plain']) {
    for (const scenario of ['A', 'B', 'C', 'D']) {
      for (const order of ['host-first', 'package-first']) {
        const label = `${host} host, scenario ${scenario}, ${order}`;
        const page = await browser.newPage({ viewport: { width: 1280, height: 1500 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${port}/tests/style-isolation/index.html?host=${host}&scenario=${scenario}&order=${order}`);
        await page.waitForFunction(() => window.styleIsolation && document.querySelectorAll('.component-holder > div').length === 2);
        const { before, after } = await page.evaluate(() => ({ before: window.styleIsolation.before, after: window.styleIsolation.snapshot() }));
        assert.deepEqual(after, before, `${label}: importing CSS changed host computed styles`);
        assert.deepEqual(errors, [], `${label}: browser runtime errors`);
        if (scenario !== 'A') {
          // A missing stylesheet must fail even if all external styles match.
          const sentinel = await page.evaluate(() => {
            const boundary = document.querySelector('.component-holder > div');
            const element = document.createElement('div');
            element.className = 'h-8 w-4';
            boundary.append(element);
            const style = getComputedStyle(element);
            const result = { width: style.width, height: style.height };
            element.remove();
            return result;
          });
          assert.deepEqual(sentinel, { width: '16px', height: '32px' }, `${label}: packaged CSS did not apply`);
        }
        if (scenario === 'B') {
          const fonts = await page.evaluate(() => [...document.querySelectorAll('.component-holder')].map(holder => {
            const root = holder.firstElementChild;
            return { host: getComputedStyle(holder).fontFamily, root: getComputedStyle(root).fontFamily,
              run: getComputedStyle([...root.querySelectorAll('button')]
                .find(button => button.textContent.includes('RUN CODE'))).fontFamily };
          }));
          for (const font of fonts) {
            assert.equal(font.root, font.host, `${label}: component root must inherit host font`);
            assert.equal(font.run, font.host, `${label}: Run control must inherit host font`);
          }
          const roots = await page.evaluate(() => [...document.querySelectorAll('.component-holder > div')].map(element => {
            const style = getComputedStyle(element);
            return { boundary: element.hasAttribute('data-code-shoebox'), display: style.display,
              direction: style.flexDirection, width: style.width, height: style.height, boxSizing: style.boxSizing };
          }));
          assert.deepEqual(roots, Array(2).fill({ boundary: true, display: 'flex', direction: 'column',
            width: '900px', height: '560px', boxSizing: 'border-box' }), `${label}: root utilities/reset failed`);
          for (const theme of ['light', 'dark']) {
            const component = page.locator(`[data-theme="${theme}"]`);
            const run = component.getByRole('button', { name: 'RUN CODE', exact: true });
            assert.equal(await run.isDisabled(), true, `${label}: prediction should gate Run`);
            const runStyle = await run.evaluate(element => {
              const style = getComputedStyle(element);
              return { display: style.display, height: style.height, background: style.backgroundColor };
            });
            assert.equal(runStyle.display, 'flex');
            assert.equal(runStyle.height, '32px');
            assert.notEqual(runStyle.background, 'rgba(0, 0, 0, 0)');
            await component.getByPlaceholder('What will happen when the code runs?').fill('It displays a paragraph.');
            assert.equal(await run.isEnabled(), true);
            await component.getByTitle('Vertical View (Stacked)').click();
            await component.getByTitle('Split View (Side by Side)').click();
            await run.click();
            // HTML mode intentionally renders learner markup in a second,
            // script-disabled iframe inside the messaging sandbox.
            await component.locator('iframe').contentFrame().locator('iframe.cs-html-frame')
              .contentFrame().getByText('Hello from the sandbox', { exact: true }).waitFor();
          }
        }
        assert.deepEqual(errors, [], `${label}: browser runtime errors after interaction`);
        console.log(`PASS ${label}`);
        await page.close();
      }
    }
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const editorErrors = [];
  page.on('pageerror', error => editorErrors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/tests/style-isolation/index.html?host=plain&scenario=B&editable=1`);
  await page.locator('.monaco-editor').waitFor();
  await page.getByRole('button', { name: 'script.js', exact: true }).click();
  await page.locator('.monaco-editor .view-lines').click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('// browser typing smoke');
  await page.waitForFunction(() => JSON.parse(window.editableCode).files['script.js'].includes('browser typing smoke'));
  await page.keyboard.press('Enter');
  await page.keyboard.type('console.');
  await page.waitForFunction(() => JSON.parse(window.editableCode).files['script.js'].endsWith('console.'));
  // Wait for the public language worker to finish a real completion request
  // before opening its UI; cold worker initialization can otherwise race it.
  const completionNames = await page.evaluate(async () => {
    const monaco = window.monaco;
    const editor = monaco.editor.getEditors()[0];
    const model = editor.getModel();
    const getWorker = await monaco.languages.typescript.getJavaScriptWorker();
    const worker = await getWorker(model.uri);
    const completions = await worker.getCompletionsAtPosition(model.uri.toString(), model.getOffsetAt(editor.getPosition()));
    return completions?.entries.map(entry => entry.name) ?? [];
  });
  assert.ok(completionNames.includes('log'), 'JavaScript worker did not offer console.log');
  await page.keyboard.press('Control+Space');
  await page.locator('.suggest-widget.visible').waitFor();
  await page.locator('.suggest-widget.visible .monaco-list-row').first().waitFor();
  const escapedWidget = await page.locator('.suggest-widget.visible').evaluate(element => !element.closest('[data-code-shoebox]'));
  assert.equal(escapedWidget, false, 'Monaco suggestions escaped the owned stylesheet boundary');
  await page.keyboard.press('Escape');
  await page.keyboard.type('log("suggestions smoke");');
  await page.waitForFunction(() => JSON.parse(window.editableCode).files['script.js'].includes('console.log("suggestions smoke");'));
  await page.getByRole('button', { name: 'style.css', exact: true }).click();
  await page.getByRole('button', { name: 'index.html', exact: true }).click();
  await page.getByRole('button', { name: 'Media', exact: true }).click();
  await page.getByAltText('Fixture media').waitFor();
  assert.equal(await page.getByAltText('Fixture media').evaluate(element => element.complete && element.naturalWidth > 0), true);
  await page.getByRole('button', { name: 'script.js', exact: true }).click();
  await page.getByRole('button', { name: 'RUN CODE', exact: true }).click();
  await page.locator('iframe').contentFrame().getByText('Editable sandbox ran', { exact: true }).waitFor();
  await page.locator('.break-all.whitespace-pre').filter({ hasText: 'editable smoke' }).waitFor();
  await page.getByTitle('Clear Console').click();
  await page.getByText('No output', { exact: true }).waitFor();
  assert.deepEqual(editorErrors, [], 'Editable fixture runtime errors');
  console.log('PASS editable Monaco typing, suggestions, file tabs, media, console and sandbox');
  await page.close();
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
