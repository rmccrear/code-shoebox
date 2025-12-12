
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const pkgPath = path.join(__dirname, '../package.json');
const readmePath = path.join(__dirname, '../README.md');

// Ensure dist exists
if (!fs.existsSync(distDir)) {
    console.error('Dist directory not found. Run build first.');
    process.exit(1);
}

// Copy README
if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, path.join(distDir, 'README.md'));
}

// Read and Patch Package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Update paths to remove 'dist/' prefix since these files are now in root of the package
// when published from the dist branch/folder
if (pkg.main) pkg.main = pkg.main.replace('dist/', '');
if (pkg.module) pkg.module = pkg.module.replace('dist/', '');
if (pkg.types) pkg.types = pkg.types.replace('dist/', '');

// CRITICAL FIX: Remove the "files" allowlist. 
// In the source package.json, "files": ["dist"] tells npm to only include the dist folder.
// However, in the published 'dist' branch, the content IS the dist folder (flattened).
// There is no nested 'dist' folder anymore. 
// Leaving "files": ["dist"] causes npm to ignore the flattened .js/.d.ts files.
delete pkg.files;

// Optional: Clean up scripts that aren't needed in the consumer
delete pkg.scripts;
delete pkg.devDependencies;

// Write to dist
fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkg, null, 2));

console.log('Dist folder prepared for publishing.');
