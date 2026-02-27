# Phase 6.4: npm Publishing - Quick Start Checklist

## ✅ Pre-Publishing Status

- ✅ **88/88 tests passing** (verified just now)
- ✅ **85.31% code coverage**
- ✅ **Version set to 0.1.0**
- ✅ **CHANGELOG.md updated**
- ✅ **All workflows configured**
- ✅ **Build verified (ESM + CJS + DTS)**

**Ready to publish!** 🚀

---

## 📋 Publishing Checklist (Execute in Order)

### Step 1: Generate npm Token

**Time: 5 minutes**

```bash
# Option A: Using npm.org website (recommended)
# 1. Visit: https://www.npmjs.com/settings/~token
# 2. Click "Generate New Token"
# 3. Choose "Granular Access Token"
# 4. Name: GitHub Actions - somnia-react-autonomous
# 5. Permissions: write:packages, read:packages
# 6. Create and COPY the token immediately

# Option B: Using npm CLI
npm login
npm token create --read-only false --access public
```

**Result:** You should have a token like `npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Add NPM_TOKEN to GitHub Secrets

**Time: 1 minute**

```bash
# Method 1: GitHub Web UI (easiest)
# 1. Go to: https://github.com/icekidtech/somnia-react-autonomous/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Name: NPM_TOKEN
# 4. Value: (paste your npm token)
# 5. Click "Add secret"

# Method 2: GitHub CLI (if installed)
gh secret set NPM_TOKEN -b "your-npm-token-here" \
  -R icekidtech/somnia-react-autonomous
```

**Verification:** You should see `NPM_TOKEN` in your repository secrets

### Step 3: Verify Repository State

**Time: < 1 minute**

```bash
cd /home/icekid/Projects/somnia-react-autonomous

# Check git status
git status

# Should show: "On branch main, nothing to commit"
# If there are changes, commit them:
git add .
git commit -m "chore: Phase 6.4 npm publishing preparation"
git push origin main
```

### Step 4: Create Release Tag

**Time: < 1 minute**

Execute this command to create the release tag:

```bash
cd /home/icekid/Projects/somnia-react-autonomous

git tag -a v0.1.0 \
  -m "Release v0.1.0

Somnia Reactive Handlers TypeScript SDK - First Official Release

✨ Features:
- TypeScript SDK for Somnia reactive handlers
- 6 handler deployment functions
- 5 factory functions for handler configuration
- 8 event decoders for reactive event parsing
- Fluent subscription builder pattern
- Full type safety with TypeScript strict mode
- 88 comprehensive tests (100% pass rate)
- 85.31% code coverage
- Automated CI/CD pipeline with GitHub Actions

📊 Testing & Quality:
- 88 tests passing (31 subscriptions, 21 integration, 18 decoders, 18 deployment)
- ESLint: 0 errors
- TypeScript: 0 type errors
- Code format: Prettier compliant
- Coverage: 85.31% (v8 provider)

📦 Build:
- ESM (ES modules)
- CommonJS (CJS)
- TypeScript declarations (.d.ts)

🔧 Exports:
- @somnia-react/autonomous-sdk (main)
- @somnia-react/autonomous-sdk/deployment
- @somnia-react/autonomous-sdk/subscriptions
- @somnia-react/autonomous-sdk/decoders

🔗 Links:
- Documentation: https://github.com/icekidtech/somnia-react-autonomous
- Package: https://www.npmjs.com/package/@somnia-react/autonomous-sdk

🙏 Contributors: Icekid
📄 License: MIT"

# Verify tag was created
git tag -l -n20 v0.1.0
```

**Result:** Tag created locally with detailed release notes

### Step 5: Push Tag to GitHub

**Time: < 1 minute**

Push the tag to trigger the publish workflow:

```bash
git push origin v0.1.0

# Verify push succeeded
git ls-remote --tags origin | grep v0.1.0
```

**What happens next:**

- GitHub detects the v0.1.0 tag
- Automatically triggers the "Publish" workflow
- Workflow will: test → build → publish to npm → deploy docs → create release

### Step 6: Monitor Publish Workflow

**Time: 10-15 minutes**

Go to GitHub Actions and watch the workflow execute:

**URL:** https://github.com/icekidtech/somnia-react-autonomous/actions

**Look for:**

1. "Publish" workflow in the list
2. Status should be 🟡 "In progress"
3. Click to see real-time logs

**Expected steps (in order):**

- ✅ Checkout repository
- ✅ Install Foundry toolchain
- ✅ Setup pnpm and Node 18
- ✅ Install dependencies
- ✅ Run test suite (88/88 must pass)
- ✅ Build packages (ESM + CJS + DTS)
- ✅ Publish to npm registry
- ✅ Build documentation
- ✅ Deploy to GitHub Pages
- ✅ Create GitHub Release

**Success indicators in logs:**

```
✓ Test Files  4 passed (4)
✓ Tests  88 passed (88)
✓ npm notice published @somnia-react/autonomous-sdk@0.1.0
✓ Create GitHub Release completed
```

### Step 7: Verify Package on npm

**Time: 2 minutes**

Once workflow completes (should take ~10 minutes), verify the package:

```bash
# Check package info
npm view @somnia-react/autonomous-sdk

# Expected output:
# @somnia-react/autonomous-sdk@0.1.0
# TypeScript SDK for deploying and managing Somnia reactive handlers
# dist-tags:
# latest: 0.1.0
```

### Step 8: Test Local Installation

**Time: 3 minutes**

Verify you can install and use the published package:

```bash
# Create test directory
mkdir -p /tmp/test-npm-package && cd /tmp/test-npm-package
npm init -y

# Install published package
npm install @somnia-react/autonomous-sdk@0.1.0

# Verify it installed
npm list @somnia-react/autonomous-sdk

# Test importing (optional)
node -e "const sdk = require('@somnia-react/autonomous-sdk'); console.log('✓ SDK loaded successfully')"
```

### Step 9: Verify GitHub Release

**Time: 1 minute**

Check that GitHub automatically created a release:

**URL:** https://github.com/icekidtech/somnia-react-autonomous/releases

**Should contain:**

- ✅ Tag: v0.1.0
- ✅ Release title (auto-generated)
- ✅ Release notes (from CHANGELOG.md)
- ✅ Artifacts (ABIs, CHANGELOG)

---

## ⏱️ Timeline Summary

| Step | Task                         | Time        | Status              |
| ---- | ---------------------------- | ----------- | ------------------- |
| 1    | Generate npm token           | 5 min       | ⏳ TODO             |
| 2    | Add NPM_TOKEN to secrets     | 1 min       | ⏳ TODO             |
| 3    | Verify git state             | <1 min      | ✅ Ready            |
| 4    | Create git tag               | <1 min      | ⏳ TODO             |
| 5    | Push tag to trigger workflow | <1 min      | ⏳ TODO             |
| 6    | Monitor publish workflow     | 10 min      | ⏳ TODO (automatic) |
| 7    | Verify npm package           | 2 min       | ⏳ TODO             |
| 8    | Test installation            | 3 min       | ⏳ TODO             |
| 9    | Verify GitHub release        | 1 min       | ⏳ TODO             |
|      | **TOTAL**                    | **~23 min** |                     |

---

## 🚨 Important Notes

1. **NPM Token is sensitive:** Never commit it or paste in code. Only store in GitHub Secrets.

2. **Token is shown once:** When generating on npm.org, copy immediately. You can't retrieve it later.

3. **Tag format:** Must match `v*.*.*` pattern (e.g., `v0.1.0`)

4. **All tests must pass:** If any test fails in the workflow, publishing stops and GitHub Release is not created.

5. **No manual npm publish:** The workflow handles this with `pnpm publish --no-git-checks`

---

## 🎯 What to Do Right Now

### Option A: Automated (Recommended)

Follow the 9 steps above in order. The workflow is fully automated.

### Option B: Quick Commands

If you already have an npm token:

```bash
# Add token to GitHub secrets (web UI or CLI)
# Then execute these commands:

cd /home/icekid/Projects/somnia-react-autonomous
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# Then watch: https://github.com/icekidtech/somnia-react-autonomous/actions
```

---

## 📈 Success Criteria

Publishing is successful when:

1. ✅ npm workflow completes in GitHub Actions
2. ✅ Package appears on npm.org
3. ✅ Installation works: `npm install @somnia-react/autonomous-sdk@0.1.0`
4. ✅ GitHub Release created at `/releases/tag/v0.1.0`
5. ✅ All 88 tests passed in automated workflow
6. ✅ Artifacts included in release

---

## 🚀 Next Phase (6.5)

After successful publishing:

- [ ] Verify package in public registry
- [ ] Test in new project (optional)
- [ ] Announce release (optional)
- [ ] Start v0.2.0 planning (if applicable)
- [ ] Monitor issues/feedback

---

## 📚 Additional Resources

- **PHASE-6-4-GUIDE.md** - Detailed step-by-step guide with troubleshooting
- **CI-CD-SETUP.md** - Complete CI/CD documentation
- **npm docs:** https://docs.npmjs.com/
- **GitHub Actions:** https://docs.github.com/en/actions/

---

## ✨ Current Status

**Pre-Publishing Verification:**

- ✅ SDK: 88/88 tests passing (verified)
- ✅ Coverage: 85.31% (v8)
- ✅ Version: 0.1.0
- ✅ Workflows: All configured and tested
- ✅ Documentation: Complete
- ⏳ Publishing: Ready to begin

**Next Action:** Execute Step 1 (Generate npm token)

---

**Phase 6.4 Ready:** YES ✅
**Estimated Total Time:** 20-30 minutes
**Expected Outcome:** @somnia-react/autonomous-sdk@0.1.0 published on npm 🎉
