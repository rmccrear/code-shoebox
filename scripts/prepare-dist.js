import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const packageJsonPath = path.resolve(rootDir, 'package.json');
const readmePath = path.resolve(rootDir, 'README.md');

// Ensure dist exists
if (!fs.existsSync(distDir)) {
    console.error('Dist directory not found. Run build first.');
    process.exit(1);
}

// Copy README
if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, path.join(distDir, 'README.md'));
}

// 1. Read the current package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 2. STRIP "dist/" from the paths
// The files will be at the root of the repo on the dist branch
packageJson.main = "export.js";
packageJson.module = "export.mjs";
packageJson.types = "export.d.ts";

// Add the style definition so bundlers find the CSS
packageJson.style = "styles.css";

// 3. FIX the "files" whitelist
// Since there is no "dist" folder anymore (we are inside it),
// we remove this restriction so NPM picks up the root files.
if (packageJson.files) {
    delete packageJson.files;
    console.log('✅ Removed "files" allowlist from package.json to ensure all files are included.');
}

// 4. Remove 'scripts' and 'devDependencies' to keep the install clean
delete packageJson.scripts;
delete packageJson.devDependencies;

// 5. Write the modified package.json into the dist folder
// This is the file that will be pushed to the dist branch
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('✅ Created modified package.json in dist/');