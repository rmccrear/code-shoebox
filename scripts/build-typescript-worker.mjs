import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
await build({
  entryPoints: ['components/typescript.worker.ts'], outfile: 'dist/ts-checker.worker.js',
  bundle: true, minify: true, platform: 'browser', format: 'esm', target: 'es2020',
  legalComments: 'eof',
  plugins: [{ name: 'standard-library-text', setup(bundler) {
    bundler.onResolve({ filter: /\?raw$/ }, args => ({ path: require.resolve(args.path.split('?')[0]), namespace: 'library' }));
    bundler.onLoad({ filter: /.*/, namespace: 'library' }, async args => ({ contents: await readFile(args.path, 'utf8'), loader: 'text' }));
  } }],
});
console.log('Built standalone optional TypeScript checker worker');
