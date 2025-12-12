
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

// Write to dist
fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkg, null, 2));

console.log('Dist folder prepared for publishing.');
