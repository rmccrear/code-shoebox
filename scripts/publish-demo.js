import { spawnSync, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCommand(command, args, options = {}) {
  const proc = spawnSync(command, args, {
    stdio: 'inherit',
    encoding: 'utf8',
    ...options
  });

  if (proc.status !== 0) {
    process.exit(proc.status ?? 1);
  }
}

function getRepoInfo() {
  const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  const match = remote.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);

  if (!match) {
    throw new Error('Could not parse GitHub repo from origin remote.');
  }

  return { owner: match[1], repo: match[2] };
}

function getOpenCommand(url) {
  if (process.platform === 'darwin') {
    return ['open', [url]];
  }

  if (process.platform === 'win32') {
    return ['cmd', ['/c', 'start', '', url]];
  }

  return ['xdg-open', [url]];
}

function openUrl(url) {
  const [command, args] = getOpenCommand(url);
  const proc = spawnSync(command, args, { stdio: 'ignore' });

  if (proc.status !== 0) {
    console.warn(`Unable to auto-open browser. Open this URL manually: ${url}`);
  }
}

function run() {
  try {
    const rootDir = path.resolve(__dirname, '..');
    const outDir = '.demo-site';
    const { owner, repo } = getRepoInfo();
    const base = `/${repo}/`;
    const url = `https://${owner}.github.io/${repo}/`;

    console.log(`🚀 Building demo site for ${owner}/${repo}...`);
    runCommand('npx', ['vite', 'build', '--outDir', outDir, '--base', base], { cwd: rootDir });

    console.log('🌿 Publishing demo site to demo branch...');
    runCommand('npx', ['gh-pages', '-d', outDir, '-b', 'demo'], { cwd: rootDir });

    console.log(`✅ Demo published: ${url}`);
    openUrl(url);
  } catch (error) {
    console.error(`❌ Demo publish failed: ${error.message}`);
    process.exit(1);
  }
}

run();
