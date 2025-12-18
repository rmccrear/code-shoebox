
# Publishing & Release Guide

This project is configured to automate versioning, Git tagging, and the deployment of compiled distribution files.

## Releasing a New Version (Recommended)

The `release` script is the primary tool for publishing updates. It automates the tedious parts of the Git workflow to ensure consistency across versions.

### Prerequisites
- **Git CLI**: You must have `git` installed and configured.
- **Push Access**: You must have write permissions for the repository.
- **Clean State**: It is recommended (but not strictly required) to have a clean working directory before running the release.

### Step-by-Step Instructions

1.  **Update the version**: 
    Open `package.json` and increment the `"version"` field (e.g., from `1.0.15` to `1.0.16`).
2.  **Commit your changes**: 
    Stage and commit your updates. **Important:** The message of this last commit will be used as the description for your Git tag. Make it descriptive (e.g., "feat: add SQL support and fix console scrolling").
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
- **Commit Fetching**: Automatically grabs the message from your most recent commit.
- **Tagging**: Creates an annotated Git tag (e.g., `v1.0.16`) using the version number and that commit message.
- **Syncing**: Pushes the new tag to GitHub.
- **Distribution**: Automatically triggers `npm run publish:dist`, which builds the library and updates the `dist` branch.

---

## Updating the Distribution Branch Only

If you need to push a fix to the `dist` branch without incrementing the version number or creating a new tag:

```bash
npm run publish:dist
```

This is useful for documentation updates or minor internal adjustments that don't warrant a version bump.

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

## Best Practices
- **Atomic Commits**: Always commit your version bump separately or as the final commit in a feature set to ensure the tag description is accurate.
- **GitHub Releases**: After running the script, visit the GitHub "Releases" page. You will see your new tag there. You can manually edit it to add richer release notes or attach assets if needed.
- **Branch Protection**: If you have branch protection enabled, ensure your local credentials allow pushing tags directly to the origin.
