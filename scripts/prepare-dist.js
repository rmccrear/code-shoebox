const fs = require('fs');
const path = require('path');

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
const packageJson = require(packageJsonPath);

// 2. STRIP "dist/" from the paths
// The files will be at the root of the repo on the dist branch
packageJson.main = "export.js";
packageJson.module = "export.mjs";
packageJson.types = "export.d.ts";

// 3. FIX the "files" whitelist
// Since there is no "dist" folder anymore (we are inside it),
// we remove this restriction so NPM picks up the root files.
delete packageJson.files;

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
