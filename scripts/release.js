
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Automates the release process:
 * 1. Reads the version from package.json.
 * 2. Fetches the latest commit message.
 * 3. Creates a local git tag.
 * 4. Pushes the tag to the remote 'origin'.
 * 5. (Optional) Triggers the dist branch update.
 */

function run() {
  try {
    const rootDir = path.resolve(__dirname, '..');
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version;
    const tagName = `v${version}`;

    console.log(`🚀 Starting release process for ${tagName}...`);

    // 1. Check if the working directory is clean (optional but recommended)
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.warn('⚠️  Warning: Working directory is not clean. Proceeding anyway...');
    }

    // 2. Get the latest commit message
    const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
    console.log(`📝 Using commit message: "${commitMessage}"`);

    // 3. Check if tag already exists
    try {
      execSync(`git rev-parse ${tagName}`, { stdio: 'ignore' });
      console.error(`❌ Error: Tag ${tagName} already exists locally.`);
      process.exit(1);
    } catch (e) {
      // Tag doesn't exist, proceed
    }

    // 4. Create the tag
    console.log(`🏷️  Tagging ${tagName}...`);
    execSync(`git tag -a ${tagName} -m "${commitMessage}"`);

    // 5. Push the tag
    console.log(`⬆️  Pushing tag ${tagName} to origin...`);
    execSync(`git push origin ${tagName}`);

    // 6. Sync the dist branch (Existing workflow)
    console.log(`📦 Updating distribution branch...`);
    execSync('npm run publish:dist');

    console.log(`\n✅ Successfully released ${tagName}!`);
    console.log(`🔗 Check your repository releases at: https://github.com/${getRepoPath()}/releases`);
    
  } catch (error) {
    console.error(`\n❌ Release failed: ${error.message}`);
    process.exit(1);
  }
}

function getRepoPath() {
  try {
    const remote = execSync('git remote get-url origin').toString().trim();
    // Handles both https and ssh formats
    const match = remote.match(/github\.com[:/](.+)\.git/);
    return match ? match[1] : '[repo-path]';
  } catch (e) {
    return '[repo-path]';
  }
}

run();
