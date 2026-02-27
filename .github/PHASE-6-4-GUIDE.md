# Phase 6.4: npm Publishing & Release - Implementation Guide

## 📋 Quick Start (3 Steps)

If you're familiar with npm publishing, here's the express path:

```bash
# Step 1: Generate npm token at https://www.npmjs.com/settings/~token
# Step 2: Add NPM_TOKEN to GitHub Secrets
# Step 3: Create and push release tag
git tag -a v0.1.0 -m "Release v0.1.0: 88 tests, 85.31% coverage"
git push origin v0.1.0
```

Then monitor the "Publish" workflow in GitHub Actions → should complete in ~10 minutes.

---

## 🎯 Detailed Step-by-Step Guide

### Step 1️⃣: Verify Pre-Publishing Requirements

Before publishing, verify everything is ready:

```bash
cd /home/icekid/Projects/somnia-react-autonomous

# Verify all tests pass
pnpm test

# Expected output:
# ✓ test/integration.test.ts (21 tests)
# ✓ test/subscriptions.test.ts (31 tests)
# ✓ test/decoders.test.ts (18 tests)
# ✓ test/deployment.test.ts (18 tests)
# Test Files 4 passed (4)
# Tests 88 passed (88)
```

Checklist:
- [x] 88/88 tests passing
- [x] 85.31% coverage
- [x] 0 ESLint errors
- [x] 0 TypeScript errors
- [x] CHANGELOG.md updated
- [x] version set to 0.1.0
- [x] package.json metadata complete

### Step 2️⃣: Generate npm Access Token

**🔑 Important:** This token will only be shown once. Save it immediately.

#### Option A: Using npm CLI (Recommended)

```bash
# Login to npm account
npm login

# Create a new access token
npm token create --read-only false --access public

# Copy the generated token (it will look like: npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXX)
```

#### Option B: Using npm website

1. Visit: https://www.npmjs.com/settings/~token
2. Click "Generate New Token"
3. Select: **Granular Access Token**
4. Fill in:
   - **Token name:** `GitHub Actions - somnia-react-autonomous`
   - **Permissions:** 
     - ✅ `write:packages` (publish packages)
     - ✅ `read:packages` (verify packages)
   - **Packages and scopes:**
     - Select: `Only select packages and scopes`
     - Search for: `@somnia-react` (if it exists)
     - Or leave blank to allow any scope
   - **Expiration:** (optional - recommended: 6-12 months)
5. Click "Create token"
6. **COPY THE TOKEN IMMEDIATELY** - You won't see it again

**Token format example:**  
`npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 3️⃣: Add NPM_TOKEN to GitHub Secrets

Now add the token to your GitHub repository secrets:

#### Via Web Browser:

1. Go to: https://github.com/icekidtech/somnia-react-autonomous/settings/secrets/actions
2. Click: "New repository secret"
3. Fill in:
   - **Name:** `NPM_TOKEN`
   - **Value:** (paste your token)
4. Click: "Add secret"

#### Via GitHub CLI (if installed):

```bash
gh secret set NPM_TOKEN -b "your-npm-token-here" \
  -R icekidtech/somnia-react-autonomous
```

**Verify the secret was added:**
- Go to: Repository Settings → Secrets and variables → Actions
- You should see `NPM_TOKEN` in the list (value hidden)

### Step 4️⃣: Verify Git Status

Before creating the release tag, ensure your git repository is clean:

```bash
cd /home/icekid/Projects/somnia-react-autonomous

# Check git status
git status

# Expected output: "On branch main" with "nothing to commit"
# If there are uncommitted changes, commit them first:
git add .
git commit -m "chore: Phase 6.4 preparation for npm publishing"

# Verify you're on main branch
git branch
# Should show: * main
```

### Step 5️⃣: Create Release Tag

Now create the git tag that will trigger the publish workflow:

```bash
# Create an annotated tag (recommended over lightweight tags)
git tag -a v0.1.0 \
  -m "Release v0.1.0

- 88 passing tests (100% pass rate)
- 85.31% code coverage
- 6 handler deployment functions
- 5 factory functions
- 8 event decoders
- Full TypeScript SDK
- Comprehensive documentation
- Automated CI/CD pipeline"

# Verify the tag was created correctly
git tag -l -n5 v0.1.0

# Expected output:
# v0.1.0          Release v0.1.0
#                 - 88 passing tests (100% pass rate)
#                 ...
```

### Step 6️⃣: Push Tag to Repository

Push the tag to GitHub, which will trigger the publish workflow:

```bash
# Push the specific tag
git push origin v0.1.0

# Or push all tags
# git push origin --tags

# Verify the tag was pushed
git ls-remote --tags origin | grep v0.1.0

# Expected output showing the tag on remote
```

**What happens next:**
- GitHub detects the tag push
- Automatically triggers the "Publish" workflow
- Workflow runs all tests, builds packages, publishes to npm
- Creates a GitHub Release when complete

### Step 7️⃣: Monitor Publish Workflow

Now watch the publish workflow run:

1. **Go to GitHub Actions:**
   - https://github.com/icekidtech/somnia-react-autonomous/actions

2. **Find the "Publish" workflow:**
   - Should appear at the top of the list
   - Status will show: `In progress` (yellow/orange)

3. **Click on the workflow** to see detailed logs

4. **Expected execution timeline:**
   ```
   Checkout code                    ~10s
   Install Foundry                  ~30s
   Setup Node + pnpm               ~20s
   Install dependencies            ~60s
   Run full test suite (88 tests)   ~60s ✅ Must pass
   Build packages                   ~20s ✅
   Publish to npm                   ~30s ✅
   Build documentation              ~30s ✅
   Deploy to GitHub Pages           ~20s ✅
   Create GitHub Release            ~10s ✅
   ─────────────────────────────────────────
   Total duration:                  ~5-10 minutes
   ```

5. **What to look for in logs:**

   ✅ **Success indicators:**
   ```
   Test Files  4 passed (4)
   Tests  88 passed (88)
   
   ✨ built packages successfully
   
   npm notice published @somnia-react/autonomous-sdk@0.1.0
   
   ✅ Create GitHub Release
   ```

   ❌ **Failure indicators:**
   ```
   Tests FAILED
   npm ERR! 401 Unauthorized
   Error: ENOENT: no such file
   ```

### Step 8️⃣: Verify Package on npm Registry

Once the workflow completes, verify your package is available:

```bash
# Check package info on npm
npm view @somnia-react/autonomous-sdk

# Expected output:
# @somnia-react/autonomous-sdk@0.1.0
# TypeScript SDK for deploying and managing Somnia reactive handlers
# 
# dist-tags:
# latest: 0.1.0
# 
# published <timestamp>
```

### Step 9️⃣: Test Local Installation

Install and test the published package locally:

```bash
# Create a test directory
mkdir /tmp/test-sdk && cd /tmp/test-sdk

# Initialize a new npm project
npm init -y

# Install the published SDK
npm install @somnia-react/autonomous-sdk@0.1.0

# Verify installation
npm ls @somnia-react/autonomous-sdk

# Test import (optional)
cat > test.js << 'EOF'
const sdk = require('@somnia-react/autonomous-sdk');
console.log('SDK loaded successfully!');
console.log('Available exports:', Object.keys(sdk));
EOF

node test.js
```

### Step 🔟: Verify GitHub Release

GitHub should have automatically created a release:

1. Go to: https://github.com/icekidtech/somnia-react-autonomous/releases

2. You should see:
   - ✅ Tag: v0.1.0
   - ✅ Release title: v0.1.0 (auto-generated from tag)
   - ✅ Release notes (auto-generated from CHANGELOG.md)
   - ✅ Assets: Contract ABIs, CHANGELOG.md

---

## 🔍 Troubleshooting

### Issue: "npm ERR! 401 Unauthorized"

**Cause:** Invalid or expired NPM_TOKEN

**Solution:**
1. Generate a new token (see Step 2 above)
2. Update NPM_TOKEN in GitHub Secrets
3. Re-run workflow by recreating the tag:
   ```bash
   git tag -d v0.1.0              # Delete local tag
   git push origin :refs/tags/v0.1.0  # Delete remote tag
   git tag -a v0.1.0 -m "..."     # Create tag again
   git push origin v0.1.0          # Push tag
   ```

### Issue: "The following packages were not found"

**Cause:** Package name mismatch or registry issue

**Solution:**
- Verify package name: `@somnia-react/autonomous-sdk`
- Check npm is responding: `npm ping`
- Wait a few minutes for npm CDN to sync

### Issue: "Tests FAILED in workflow but pass locally"

**Cause:** Environment difference or caching issue

**Solution:**
1. Check workflow logs for specific error
2. Common fixes:
   - Clear npm cache: `npm cache clean --force`
   - Update pnpm: `npm install -g pnpm@8`
   - Verify Node version: `node --version` (should be 18+)
3. If needed, re-run workflow with debugging

### Issue: "Cannot find module during install"

**Cause:** Missing dependencies or incorrect exports

**Solution:**
1. Verify package.json exports are correct:
   ```json
   "exports": {
     ".": "./dist/index.js",
     "./deployment": "./dist/deployment/index.js",
     "./subscriptions": "./dist/subscriptions/index.js",
     "./decoders": "./dist/decoders/index.js"
   }
   ```
2. Rebuild locally: `pnpm build`
3. Check dist/ folder exists with all files
4. Verify .npmignore doesn't exclude dist/

---

## 📊 Post-Publishing Checklist

After successful publishing:

- [ ] npm package appears on registry: https://www.npmjs.com/package/@somnia-react/autonomous-sdk
- [ ] Installation works: `npm install @somnia-react/autonomous-sdk@0.1.0`
- [ ] GitHub Release created: https://github.com/icekidtech/somnia-react-autonomous/releases/tag/v0.1.0
- [ ] Documentation deployed: https://somnia-react.dev (if configured)
- [ ] Version shows correctly: `npm view @somnia-react/autonomous-sdk`
- [ ] All exports work: `require('@somnia-react/autonomous-sdk')`

---

## 🎯 Publishing Multiple Versions (Future Reference)

### For Beta Releases:

```bash
git tag -a v0.1.0-beta.1 -m "Beta release for testing"
git push origin v0.1.0-beta.1

# Install beta version:
npm install @somnia-react/autonomous-sdk@0.1.0-beta.1
```

### For Patch Releases:

```bash
# Update version in package.json
npm version patch --workspace packages/sdk

# Create tag from new version
git push origin v0.1.1
```

### For Minor/Major Releases:

```bash
npm version minor --workspace packages/sdk
git push origin v0.2.0
```

---

## 📈 Release Success Metrics

**A successful release should show:**

✅ Published on npm:
```
https://www.npmjs.com/package/@somnia-react/autonomous-sdk
```

✅ Installable:
```bash
npm install @somnia-react/autonomous-sdk@0.1.0
```

✅ In GitHub:
```
8 releases
1 tag: v0.1.0
88 tests passing
```

✅ Working imports:
```javascript
import { deployEventFilterThrottle } from '@somnia-react/autonomous-sdk/deployment';
import { subscriptionBuilder } from '@somnia-react/autonomous-sdk/subscriptions';
```

---

## 🚀 What's Next (Phase 6.5)

After successful publishing:

1. **Verify in real project:**
   ```bash
   npm install @somnia-react/autonomous-sdk
   ```

2. **Create release blog post** (optional)

3. **Announce release** on social media (optional)

4. **Close GitHub issues** related to v0.1.0

5. **Start v0.2.0 planning** (if applicable)

---

## 📞 Quick Reference

**Key URLs:**
- npm package: https://www.npmjs.com/package/@somnia-react/autonomous-sdk
- GitHub repo: https://github.com/icekidtech/somnia-react-autonomous
- GitHub Actions: https://github.com/icekidtech/somnia-react-autonomous/actions
- GitHub Releases: https://github.com/icekidtech/somnia-react-autonomous/releases

**Key Commands:**
```bash
# Check npm package
npm view @somnia-react/autonomous-sdk

# Search npm
npm search somnia react

# Install specific version
npm install @somnia-react/autonomous-sdk@0.1.0

# Test installation
npm list @somnia-react/autonomous-sdk
```

**Time Investment:**
- Generate token: 5 minutes
- Add to GitHub secrets: 1 minute
- Create & push tag: 1 minute
- Monitor workflow: 10 minutes
- Verify package: 2 minutes
- **Total: ~20 minutes**

---

**Phase 6.4 Status:** Ready to begin
**Next:** Execute steps above in order
**Expected completion time:** ~30 minutes (including monitoring)
**Final status:** v0.1.0 published on npm ✨
