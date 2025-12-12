# Publishing Guide

This project is configured to publish the compiled distribution files to a specific branch (`dist`) in your Git repository. This allows you to install the library directly from GitHub or use it as a submodule without needing to publish to the public npm registry.

## Quick Start

1. Ensure all your changes are committed to your working branch (e.g., `main`).
2. Run the publish script:

   ```bash
   npm run publish:dist
   ```

   **Note:** You may be prompted for your GitHub credentials if you are not using SSH keys.

## What Happens Behind the Scenes?

The `npm run publish:dist` command executes a sequence of tasks defined in `package.json`:

1. **Build** (`npm run build`): 
   - Compiles the TypeScript code into CommonJS (`.js`) and ESM (`.mjs`) formats.
   - Generates type definitions (`.d.ts`).
   - Outputs everything to the `dist/` folder.

2. **Prepare** (`node scripts/prepare-dist.js`):
   - Copies the `README.md` into `dist/`.
   - Copies `package.json` into `dist/` and modifies it (removes `dist/` prefixes from paths) so the package resolves correctly when installed from the root of the branch.

3. **Deploy** (`npx gh-pages ...`):
   - Uses the `gh-pages` utility to forcefully push the contents of the `dist` folder to the `dist` branch of your `origin` remote.

## How to Install the Published Package

Once the `dist` branch is updated, you can install the library in other projects using the Git URL targeting that specific branch.

### Using npm

```bash
# Replace 'username/repo' with your actual GitHub path
npm install git+https://github.com/username/code-shoebox.git#dist
```

### In `package.json`

```json
{
  "dependencies": {
    "code-shoebox": "git+https://github.com/username/code-shoebox.git#dist"
  }
}
```

## Troubleshooting

- **Permissions**: Ensure you have push access to the repository.
- **Diverged History**: Since the script force-pushes to the `dist` branch, it overwrites history on that branch. This is intended for distribution branches.
- **gh-pages error**: If `npx gh-pages` fails, ensure the `dist` directory was created successfully by the build step.
