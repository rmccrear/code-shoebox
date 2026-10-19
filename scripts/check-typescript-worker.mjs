import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { build, createServer, preview } from 'vite';
import { chromium } from 'playwright';

// Test the distributable as a dependency, not a relative source import. Vite
// must emit the package worker itself, including under a non-root base URL.
const source = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['scripts/prepare-dist.js'], { cwd: source, stdio: 'inherit' });
const root = await realpath(await mkdtemp(join(tmpdir(), 'code-shoebox-ts-consumer-')));
let browser;
const checks = [];
try {
  const modules = join(root, 'node_modules');
  await mkdir(modules);
  const installed = resolve(dirname(createRequire(import.meta.url).resolve('react/package.json')), '..');
  for (const name of await readdir(installed)) {
    if (!name.startsWith('.') && name !== 'code-shoebox') await symlink(join(installed, name), join(modules, name));
  }
  await cp(join(source, 'dist'), join(modules, 'code-shoebox'), { recursive: true });
  await writeFile(join(root, 'package.json'), JSON.stringify({ type: 'module', private: true }));
  await writeFile(join(root, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>');
  await writeFile(join(root, 'main.jsx'), `
    import React, {useState,useEffect} from 'react';
    import {createRoot} from 'react-dom/client';
    import {CodeShoebox,baseTheme} from 'code-shoebox';
    import TypeScriptWorker from 'code-shoebox/ts-checker.worker.js?worker';
    import 'code-shoebox/styles.css';
    window.workerCalls=0;
    const factory=()=>{window.workerCalls++;return new TypeScriptWorker();};
    function App(){
      const [state,setState]=useState({environmentMode:'node-js',code:'const n = 1;',sessionId:1,themeMode:'dark',enabled:true});
      useEffect(()=>{window.qa={state,configure:patch=>setState(old=>({...old,...patch}))};},[state]);
      return <div style={{height:550,width:900}}><CodeShoebox {...state} theme={baseTheme} createTypeScriptWorker={state.enabled?factory:undefined} onCodeChange={code=>setState(old=>({...old,code}))}/></div>;
    }
    createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
  `);
  const config = { configFile: false, root, base: '/lesson-app/', logLevel: 'error', cacheDir: join(root, '.vite-cache') };
  await build(config);
  const assets = await readdir(join(root, 'dist/assets'));
  const worker = assets.find(name => /^ts-checker\.worker-.*\.js$/.test(name));
  assert.ok(worker, 'Vite must emit a separate hashed worker asset');
  const compilerMarker = 'getSyntacticDiagnostics';
  assert.ok((await readFile(join(root, 'dist/assets', worker), 'utf8')).includes(compilerMarker));
  for (const asset of assets.filter(name => name.endsWith('.js') && name !== worker)) {
    assert.ok(!(await readFile(join(root, 'dist/assets', asset), 'utf8')).includes(compilerMarker), `Compiler leaked into ${asset}`);
  }
  browser = await chromium.launch({ headless: true });
  for (const kind of ['production', 'development']) {
    const server = kind === 'production'
      ? await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } })
      : await createServer({ ...config, server: { host: '127.0.0.1', port: 0 } });
    if (kind === 'development') await server.listen();
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    const failures = [];
    const requests = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && message.text().startsWith('[CodeShoebox]')) failures.push(message.text()); });
    page.on('request', request => { if (request.url().includes('ts-checker.worker') && (!request.url().includes('?worker') || request.url().includes('worker_file'))) requests.push(request.url()); });
    try {
      const address = server.httpServer.address();
      await page.goto(`http://127.0.0.1:${address.port}/lesson-app/`);
      await page.waitForFunction(() => window.qa && document.querySelector('.cm-content'));
      async function configure(patch) {
        await page.evaluate(patch => window.qa.configure(patch), patch);
        await page.waitForFunction(patch => Object.entries(patch).every(([key,value])=>window.qa.state[key]===value),patch);
      }
      for (const mode of ['node-js', 'react', 'html']) {
        await configure({environmentMode:mode});
        await page.locator('[data-typescript-status="disabled"]').waitFor();
        assert.equal(await page.evaluate(()=>window.workerCalls),0,`${mode} started a checker`);
      }
      await configure({enableEmmet:true,code:''});
      await page.locator('[data-emmet-status="ready"]').waitFor();
      await page.locator('.cm-content').click();
      await page.keyboard.type('div.worker-check{Hello}',{delay:40});
      await page.waitForTimeout(150);
      await page.keyboard.press('Tab');
      await page.waitForFunction(()=>window.qa.state.code.includes('<div class="worker-check">Hello</div>'));
      assert.equal(requests.length,0,'Emmet downloaded the TypeScript compiler');
      await configure({environmentMode:'node-ts',prediction_prompt:'Predict this code.'});
      await page.waitForFunction(()=>!document.querySelector('.cm-editor'));
      assert.equal(await page.evaluate(()=>window.workerCalls),0,'Prediction preview started a checker');
      assert.equal(requests.length,0,'Compiler downloaded before an editable TS lesson');

      await configure({prediction_prompt:null,code:'const count: number = "wrong";'});
      await page.locator('[data-typescript-status="ready"]').waitFor();
      await page.locator('.cm-lintRange-error').waitFor();
      assert.equal(await page.evaluate(()=>window.workerCalls),1,'Strict Mode started duplicate workers');
      if(kind==='production')assert.ok(requests.some(url=>url.includes('/lesson-app/assets/ts-checker.worker-')));
      await page.locator('.cm-content').click();
      await page.keyboard.press('ControlOrMeta+Shift+m');
      await page.getByText("Type 'string' is not assignable to type 'number'.",{exact:true}).waitFor();
      await configure({themeMode:'light',code:'const count: number = 1; console.log(count);'});
      await page.waitForFunction(()=>!document.querySelector('.cm-lintRange-error'));
      assert.equal(await page.evaluate(()=>window.workerCalls),1,'Typing/theme change restarted the worker');

      await page.locator('.cm-content').click();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('const second: number = "bad";');
      await page.locator('.cm-lintRange-error').first().waitFor();
      assert.equal(await page.evaluate(()=>window.workerCalls),1,'Native typing restarted the checker');
      await configure({code:'const second: number = 2;'});
      await page.waitForFunction(()=>!document.querySelector('.cm-lintRange-error'));

      await configure({enabled:false,sessionId:2});
      await page.locator('[data-typescript-status="disabled"]').waitFor();
      await page.waitForFunction(()=>window.workerCalls===1);
      assert.equal(page.workers().length,0,'Disabled checker worker was not terminated');
      await configure({enabled:true,environmentMode:'react-ts',code:'import React,{useState} from "react"; const [n,setN]=useState(1); setN("wrong");'});
      await page.locator('[data-typescript-status="ready"]').waitFor();
      await page.locator('.cm-lintRange-error').first().waitFor();
      await configure({environmentMode:'node-js',code:'const n = 1;'});
      await page.locator('[data-typescript-status="disabled"]').waitFor();
      await page.waitForTimeout(100);
      assert.equal(page.workers().length,0,'Leaving TS did not terminate the worker');
      assert.deepEqual(failures,[],`${kind} browser errors`);
      checks.push({kind,workerAsset:worker,workerRequests:requests.length,status:'passed'});
      console.log(`PASS ${kind}: automatic worker bundling, base URL, TS-only loading, real diagnostics, correction and disposal`);
    } finally {
      await page.close();
      await new Promise(resolve => server.httpServer.close(resolve));
      if (kind === 'development') await server.close();
    }
  }
  await mkdir(join(source,'output/playwright'),{recursive:true});
  await writeFile(join(source,'output/playwright/typescript-worker.json'),JSON.stringify(checks,null,2)+'\n');
} finally {
  await browser?.close();
  await rm(root,{recursive:true,force:true});
}
