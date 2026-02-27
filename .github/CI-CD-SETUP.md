# CI/CD Pipeline Setup Guide

This document explains the automated CI/CD workflows configured for the somnia-react-autonomous project.

## Overview

The project uses GitHub Actions for automated testing, linting, coverage reporting, and npm publishing. All workflows are defined in `.github/workflows/`.

## Workflows

### 1. **Test Workflow** (`test.yml`)

**Triggers:** Push to `main`/`develop` branches, Pull Requests to `main`/`develop`

**Jobs:**

- **test-solidity**: Runs Foundry smart contract tests with coverage
  - Installs Foundry toolchain
  - Runs `forge test --via-ir`
  - Generates LCOV coverage report
- **test-typescript**: Runs TypeScript SDK tests
  - Installs Node.js 18 and pnpm 8
  - Runs type checking: `pnpm --filter sdk type-check`
  - Runs linting: `pnpm run lint:ts`
  - Runs tests: `pnpm run test:sdk` (88 tests with 85.31% coverage)
- **test-hardhat**: Runs Hardhat tests for contract integration testing
  - Installs dependencies
  - Runs `pnpm run test:hardhat`

### 2. **Lint Workflow** (`lint.yml`)

**Triggers:** Push to `main`/`develop` branches, Pull Requests to `main`/`develop`

**Jobs:**

- **lint-solidity**: Lints Solidity code with Solhint
  - Checks all `.sol` files in `packages/contracts/src/`
- **lint-typescript**: Performs type checking and linting
  - Type checking: `pnpm --filter sdk type-check`
  - ESLint: `pnpm run lint:ts`
- **format-check**: Verifies code formatting with Prettier
  - Checks `pnpm run format:check`

### 3. **Coverage Workflow** (`coverage.yml`)

**Triggers:** Push to `main`/`develop` branches, Weekly schedule (Sundays at midnight UTC)

**Jobs:**

- Generates test coverage reports for both Solidity and TypeScript
- Uploads coverage data to Codecov for tracking
  - Solidity: Forge coverage LCOV report
  - TypeScript: Vitest v8 coverage report
- Files tracked:
  - `packages/contracts/lcov.info`
  - `packages/sdk/coverage/lcov.info`

### 4. **Publish Workflow** (`publish.yml`)

**Triggers:** Push of git tags matching `v*.*.*` pattern (e.g., `v0.1.0`)

**Permissions:**

- Write access to contents (for GitHub releases)
- Write access to packages (for npm publishing)

**Jobs:**

1. **Build & Test**
   - Runs full test suite: `pnpm test`
   - Builds all packages: `pnpm build`

2. **Publish to npm**
   - Publishes packages to npm registry using `NPM_TOKEN` secret
   - Publishes both `@somnia-react/autonomous-contracts` and `@somnia-react/autonomous-sdk`

3. **Deploy Documentation**
   - Builds documentation: `pnpm docs:build`
   - Deploys to GitHub Pages at `somnia-react.dev`

4. **Create GitHub Release**
   - Creates GitHub Release with:
     - Contract artifacts (ABI JSONs)
     - CHANGELOG.md
     - Auto-generated release notes

## Required GitHub Secrets

### For Publishing (`publish.yml`)

You must set these secrets in your GitHub repository settings:

#### `NPM_TOKEN`

**Purpose:** Authenticate with npm registry for package publishing

**How to Create:**

1. Go to https://www.npmjs.com/settings/~token
2. Create a new "Granular Access Token"
3. Permissions needed:
   - `read:packages` - Read packages
   - `write:packages` - Publish packages
   - `read:org` - Read organization info
4. Copy the token

**How to Add to GitHub:**

1. Go to `Settings` → `Secrets and variables` → `Actions`
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your npm token
5. Click "Add secret"

#### `GITHUB_TOKEN`

**Status:** Automatically provided by GitHub Actions, no manual setup needed

This token allows automatic release creation and gh-pages deployment.

## Usage Guide

### Local Development & Testing

```bash
# Run all tests
pnpm test

# Run TypeScript tests only
pnpm run test:sdk

# Run with coverage
pnpm run test:sdk -- --coverage

# Type check
pnpm --filter sdk type-check

# Lint
pnpm lint

# Format (auto-fix)
pnpm format

# Build
pnpm build
```

### Continuous Integration

All workflows run automatically:

1. **On every push to main/develop:**
   - ✅ Test (Solidity + TypeScript + Hardhat)
   - ✅ Lint (Solidity + TypeScript format check)
   - ✅ Coverage (generate reports)

2. **On every Pull Request to main/develop:**
   - ✅ Test (must pass to merge)
   - ✅ Lint (must pass to merge)

3. **On schedule (Weekly):**
   - ✅ Coverage report generation

### Publishing a Release

#### Step 1: Create a Git Tag

```bash
# Create and push a version tag (e.g., v0.1.0)
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0
```

#### Step 2: Verify All Checks Pass

The `publish` workflow will:

- ✅ Check out code
- ✅ Install Foundry & dependencies
- ✅ Run full test suite
- ✅ Build all packages
- ✅ Publish to npm (if all tests pass)
- ✅ Deploy docs to GitHub Pages
- ✅ Create GitHub Release with artifacts

#### Step 3: Verify npm Package

After publish workflow completes:

```bash
# Check npm registry
npm view @somnia-react/autonomous-sdk

# Install and test locally
npm install @somnia-react/autonomous-sdk@0.1.0
```

Within a few minutes:

- 📦 Package available on npm: https://www.npmjs.com/package/@somnia-react/autonomous-sdk
- 📚 Documentation deployed: https://somnia-react.dev
- 📄 GitHub Release created with release notes

### Beta/Test Release

To publish a beta release without affecting the main version:

```bash
# Create beta tag (e.g., v0.1.0-beta.1)
git tag -a v0.1.0-beta.1 -m "Beta release"
git push origin v0.1.0-beta.1
```

Then install as:

```bash
npm install @somnia-react/autonomous-sdk@0.1.0-beta.1
```

## Workflow Status

You can view the status of all workflows in the GitHub Actions tab:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. View running/completed workflows
4. Click on a workflow to see detailed logs

## Monitoring & Debugging

### If a workflow fails:

1. Click on the failed workflow in the Actions tab
2. Expand the failed job to see error output
3. Check the error log for specific failures
4. Fix locally, commit, and push
5. Workflow will re-run automatically

### Common Issues:

**"pnpm not found"**

- Caused by: Old action-setup version
- Solution: Update to `pnpm/action-setup@v2`

**"npm ERR! 401 Unauthorized"**

- Caused by: Invalid or expired NPM_TOKEN
- Solution: Regenerate token and update GitHub secret

**"Test failures on CI but passing locally"**

- Caused by: Environment differences, race conditions
- Solution: Check log output, ensure deterministic tests

## Security Best Practices

1. ✅ Never commit secrets to repository
2. ✅ Use GitHub Secrets for all tokens
3. ✅ Rotate NPM_TOKEN regularly
4. ✅ Limit token permissions to minimum required
5. ✅ Review GitHub Actions logs for suspicious activity

## Troubleshooting Checklist

- [ ] All tests pass locally: `pnpm test`
- [ ] Code is formatted: `pnpm format:check`
- [ ] No linting errors: `pnpm lint`
- [ ] Types check: `pnpm --filter sdk type-check`
- [ ] Git tag format is correct: `v*.*.*`
- [ ] NPM_TOKEN is set in GitHub Secrets
- [ ] Repository has write access enabled for Actions
- [ ] CHANGELOG.md is updated

## Next Steps

1. **Create NPM_TOKEN:** Follow instructions above to generate npm token
2. **Add to GitHub Secrets:** Add NPM_TOKEN to Actions secrets
3. **Trigger a Release:** Create a git tag and push to trigger publish workflow
4. **Monitor:** Check Actions tab to verify all workflows complete successfully
5. **Verify:** Check npm registry and GitHub releases to confirm successful publication

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Foundry Testing](https://book.getfoundry.sh/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [npm Granular Access Tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub Pages Deployment](https://github.com/peaceiris/actions-gh-pages)
