import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../tailwind.config.js';
import { scopeStyles } from './scope-styles.mjs';

const input = fileURLToPath(new URL('../styles/input.css', import.meta.url));
const output = fileURLToPath(new URL('../dist/styles.css', import.meta.url));
const expanded = await postcss([tailwindcss(config)]).process(await readFile(input, 'utf8'), { from: input });
const scoped = await postcss([scopeStyles()]).process(expanded.css, { from: input, to: output });
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(output, scoped.css);
console.log('Built component-scoped dist/styles.css');
