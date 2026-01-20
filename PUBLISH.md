
# Publishing & Release Guide

This project is configured to automate versioning, Git tagging, and the deployment of compiled distribution files.

## Releasing a New Version (Recommended)

The `release` script is the primary tool for publishing updates. It automates the tedious parts of the Git workflow to ensure consistency across versions.

### Prerequisites
- **Git CLI**: You must have `git` installed and configured.
- **Push Access**: You must have write permissions for the repository.
- **Clean State**: It is highly recommended to have a clean working directory.

### Step-by-Step Instructions

1.  **Update the version**: 
    Open `package.json` and increment the `"version"` field (e.g., from `1.0.15` to `1.0.16`).
2.  **Commit your changes**: 
    Stage and commit your updates. 
    
    **Important:** The message of this last commit will be used as the description for your Git tag. 
    - The script now handles special characters (like backticks or quotes) safely using `spawnSync`.
    - If your commit message is multi-line, the entire message will be attached to the tag.
    
    ```bash
    git add .
    git commit -m "feat: your descriptive message"
    ```
3.  **Run the release command**:
    ```bash
    npm run release
    ```

### What the Release Script Does
- **Version Check**: Reads the version you just set in `package.json`.
- **Commit Fetching**: Automatically grabs the full message from your most recent commit.
- **Tagging**: Creates an annotated Git tag (e.g., `v1.0.16`) using the version number and that commit message.
- **Syncing**: Pushes the new tag to GitHub.
- **Distribution**: Automatically triggers `npm run publish:dist`, which builds the library and updates the `dist` branch.

---

## Updating the Distribution Branch Only

If you need to push a fix to the `dist` branch without incrementing the version number or creating a new tag:

```bash
npm run publish:dist
```

This is useful for documentation updates or minor internal build adjustments.

---

## How to Install the Published Package

Once the release script finishes, users can install the specific version via GitHub:

### Targeting a Specific Version (Recommended)
```bash
npm install github:rmccrear/code-shoebox#v1.0.15
```

### Targeting the Latest Build
```bash
npm install github:rmccrear/code-shoebox#dist
```

## Troubleshooting & FAQ

#### "Tag already exists"
If the script fails stating a tag already exists locally, you likely forgot to bump the version in `package.json`. If you truly intended to re-release the same version, you must manually delete the tag:
```bash
git tag -d v1.0.15
git push origin :refs/tags/v1.0.15
```

#### "Permission Denied" or Shell Errors
If you see errors related to `release: not found` or similar shell output during tagging, it's often due to special characters in your commit message being misinterpreted by shell-based execution. The script has been updated to use `spawnSync` to prevent this.

#### Authentication Errors
The script uses your local Git configuration. If you cannot `git push` manually, the script will also fail. Ensure your SSH keys or personal access tokens are set up correctly.
