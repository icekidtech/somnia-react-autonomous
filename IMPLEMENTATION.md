# Implementation Guide – @somnia-react/autonomous

**Version**: 1.0.0  
**Last Updated**: February 27, 2026  
**Status**: Phase 5 Complete - Documentation Ready | Phase 4 Final Steps Done - 88/88 Tests Passing

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Tech Stack Summary](#tech-stack-summary)
3. [Phase 1: Scaffold & Setup](#phase-1-scaffold--setup)
4. [Phase 2: Solidity Contracts](#phase-2-solidity-contracts)
5. [Phase 3: TypeScript SDK](#phase-3-typescript-sdk)
6. [Phase 4: Testing & Quality](#phase-4-testing--quality)
7. [Phase 5: Documentation & Examples](#phase-5-documentation--examples)
8. [Phase 6: CI/CD & Publishing](#phase-6-cicd--publishing)

---

## Project Structure

```
@somnia-react/autonomous/ (monorepo root)
├── package.json (pnpm root)
├── pnpm-workspace.yaml
├── .prettierrc.json
├── .eslintrc.json
├── .solhint.json
├── tsconfig.json (shared TS config)
│
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── base/
│   │   │   │   └── BaseReactiveHandler.sol
│   │   │   ├── handlers/
│   │   │   │   ├── AutoCompoundHandler.sol
│   │   │   │   ├── LiquidationGuardian.sol
│   │   │   │   ├── CronLikeScheduler.sol
│   │   │   │   ├── EventFilterThrottle.sol
│   │   │   │   └── CrossCallOrchestrator.sol
│   │   │   ├── upgradeable/
│   │   │   │   └── UpgradeableReactiveProxy.sol
│   │   │   └── interfaces/
│   │   │       └── IReactiveEvents.sol
│   │   ├── test/
│   │   │   ├── base/
│   │   │   │   └── BaseReactiveHandler.t.sol
│   │   │   ├── handlers/
│   │   │   │   ├── AutoCompoundHandler.t.sol
│   │   │   │   ├── LiquidationGuardian.t.sol
│   │   │   │   ├── CronLikeScheduler.t.sol
│   │   │   │   ├── EventFilterThrottle.t.sol
│   │   │   │   └── CrossCallOrchestrator.t.sol
│   │   │   └── upgradeable/
│   │   │       └── UpgradeableReactiveProxy.t.sol
│   │   ├── foundry.toml
│   │   ├── hardhat.config.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── sdk/
│   │   ├── src/
│   │   │   ├── deployment/
│   │   │   │   ├── deployer.ts
│   │   │   │   ├── verify.ts
│   │   │   │   └── types.ts
│   │   │   ├── subscriptions/
│   │   │   │   ├── subscription-builder.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── validators.ts
│   │   │   ├── decoders/
│   │   │   │   └── event-decoder.ts
│   │   │   ├── abis/
│   │   │   │   └── (generated from contracts)
│   │   │   ├── index.ts
│   │   │   └── utils.ts
│   │   ├── test/
│   │   │   ├── deployment.test.ts
│   │   │   ├── subscriptions.test.ts
│   │   │   └── decoders.test.ts
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── docs/
│       ├── index.md
│       ├── getting-started.md
│       ├── guides/
│       │   ├── auto-compound.md
│       │   ├── liquidation-guardian.md
│       │   ├── cron-scheduler.md
│       │   ├── event-throttle.md
│       │   └── cross-call-orchestrator.md
│       ├── security.md
│       ├── api-reference.md
│       ├── examples/
│       │   ├── AutoCompoundVault.sol
│       │   ├── LiquidationBot.sol
│       │   ├── CronExecutor.sol
│       │   └── deploy-auto-compound.ts
│       ├── .vitepress/
│       │   └── config.ts
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── lint.yml
│       ├── test.yml
│       ├── coverage.yml
│       └── publish.yml
│
├── docs/
│   ├── somnia-react autonomous.md (original PRD)
│   └── IMPLEMENTATION.md (this file)
│
├── CHANGELOG.md
├── LICENSE (MIT)
└── README.md (root)
```

---

## Tech Stack Summary

### **Solidity & Contracts**
| Component | Tool | Version |
|-----------|------|---------|
| Compiler | Solidity | ^0.8.20–^0.8.30 |
| Build Framework | Foundry | Latest |
| Secondary Framework | Hardhat | ^2.20.0 |
| Standard Library | OpenZeppelin Contracts | ^5.0.0 |
| Testing (Primary) | Foundry Forge | Native |
| Testing (Integration) | Hardhat Testing | Ethers v6 |
| Linting | Solhint | ^4.0.0 |

### **TypeScript & SDK**
| Component | Tool | Version |
|-----------|------|---------|
| Runtime | Node.js | ≥18.0.0 |
| Package Manager | pnpm | ≥8.0.0 |
| Language | TypeScript | ^5.0.0 |
| Build Tool | tsup | ^8.0.0 |
| Testing | Vitest | ^1.0.0 |
| ABI Types | abitype | ^1.0.0 |
| Linting | ESLint | ^8.0.0 |
| Formatting | Prettier | ^3.0.0 |

### **Documentation**
| Component | Tool | Version |
|-----------|------|---------|
| Site Generator | VitePress | ^1.0.0 |
| API Documentation | Typedoc | ^0.25.0 |
| Solidity Docs | Natspec | Native |

### **CI/CD & Quality**
| Component | Tool | Purpose |
|-----------|------|---------|
| CI Pipeline | GitHub Actions | Lint → Test → Coverage |
| Coverage | Codecov | Badge & gating |
| Code Quality | Solhint + ESLint | Static analysis |

---

## Phase 1: Scaffold & Setup

### Goals
- Initialize monorepo structure
- Set up package managers and workspace config
- Create shared configurations (prettier, eslint, tsconfig)
- Initialize Git & GitHub

### Deliverables
- ✅ Monorepo with pnpm workspaces
- ✅ Root package.json with shared scripts
- ✅ Shared linting & formatting config
- ✅ Root README.md & LICENSE
- ✅ .env.example file created

### Commands to Execute
```bash
# Root setup
pnpm init

# Create workspaces
pnpm workspace config
mkdir -p packages/{contracts,sdk,docs}

# Initialize each workspace
cd packages/contracts && npm init -y
cd packages/sdk && npm init -y
cd packages/docs && npm init -y
```

---

## Phase 2: Solidity Contracts

### 2.1 Foundry Initialization
```bash
cd packages/contracts
forge init --no-git --no-commit
```

### 2.2 Core Contracts (MVP Priority Order)

| Contract | Complexity | Deps | Lines | Tests |
|----------|-----------|------|-------|-------|
| `BaseReactiveHandler.sol` | ★★ | SomniaEventHandler | 80–120 | 10+ |
| `EventFilterThrottle.sol` | ★★ | BaseReactiveHandler | 50–80 | 8+ |
| `AutoCompoundHandler.sol` | ★★★ | Base, OpenZeppelin ERC20 | 100–150 | 12+ |
| `CronLikeScheduler.sol` | ★★★ | Base | 120–180 | 10+ |
| `LiquidationGuardian.sol` | ★★★★ | Base, price oracle patterns | 150–200 | 15+ |
| `CrossCallOrchestrator.sol` | ★★★★ | Base | 180–250 | 12+ |
| `UpgradeableReactiveProxy.sol` | ★★★ | Base, OpenZeppelin UUPSUpgradeable | 100–140 | 8+ |

### 2.3 Implementation Strategy

**BaseReactiveHandler.sol** (foundation)
```solidity
abstract contract BaseReactiveHandler is SomniaEventHandler {
    // Reentrancy guard
    // Gas limit check
    // Event emission for success/error
    // Common event decoding helpers
    
    modifier nonReentrant() { ... }
    modifier gasLimitCheck(uint256 minGasRequired) { ... }
    
    function _onEvent(...) virtual abstract;
    function _emitError(bytes reason) internal;
    function _emitSuccess(string memory action) internal;
}
```

**Handler Patterns** (inherit from BaseReactiveHandler)
- **AutoCompoundHandler**: Listen to reward token transfers → call compound()
- **LiquidationGuardian**: Listen to price updates → check health → liquidate if needed
- **CronLikeScheduler**: Track last execution timestamp → execute if interval elapsed
- **EventFilterThrottle**: Count events in a sliding window → skip if > threshold
- **CrossCallOrchestrator**: Queue external calls → execute atomically in _onEvent
- **UpgradeableReactiveProxy**: UUPS proxy for upgradeable handlers

### 2.4 Testing Strategy (Foundry)
- **Unit tests**: Each contract's core logic
- **Integration tests**: Handlers working with mock external contracts
- **Fuzz tests**: Random inputs to catch edge cases
- **Gas tests**: Ensure <250k gas per _onEvent call
- **Reentrancy tests**: Confirm guard works

Target: 85%+ coverage

---

## Phase 3: TypeScript SDK

### 3.1 SDK Structure

**Deployment Module** (`deployment/`)
- `deployer.ts`: Deploy contracts with verification
- `types.ts`: Typed deployment configs
- `verify.ts`: Etherscan/block explorer verification

**Subscriptions Module** (`subscriptions/`)
- `subscription-builder.ts`: Fluent API to create subscriptions
- `types.ts`: Subscription interfaces
- `validators.ts`: Validate event signatures, handler addresses

**Decoders Module** (`decoders/`)
- `event-decoder.ts`: Parse event logs into typed objects
- Support common handler events (error, success, execution)

**ABIs Module** (`abis/`)
- Generated from contract ABIs using abitype
- Type-safe access to function signatures

### 3.2 Example API

```typescript
import {
  deployAutoCompoundHandler,
  createAutoCompoundSubscription,
  createEventDecoder,
} from "@somnia-react/autonomous";

// Deploy
const handler = await deployAutoCompoundHandler({
  compoundAddress: "0x...",
  rewardToken: "0x...",
  targetChain: "somnia-mainnet",
});

// Create subscription
const subscription = createAutoCompoundSubscription({
  handlerAddress: handler.address,
  targetVault: "0x...",
  eventSignature: "RewardAdded(indexed address,uint256)",
});

// Decode events
const decoder = createEventDecoder("AutoCompoundHandler");
const events = decoder.parse(logs);
```

### 3.3 Testing (Vitest)
- Unit tests for builders, decoders, validators
- Mock Somnia SDK interactions
- Integration tests with local Hardhat fork
- Type-checking tests (TypeScript strict mode)

Target: 85%+ coverage

---

## Phase 4: Testing & Quality

### 4.1 Solidity Tests
```bash
cd packages/contracts
forge test                    # Run all tests
forge test --coverage        # Coverage report
forge test --fuzz-runs 10000 # Fuzz testing
```

### 4.2 TypeScript Tests
```bash
cd packages/sdk
pnpm test                     # Run Vitest
pnpm test:coverage          # Coverage report
```

### 4.3 Linting & Formatting

**Solidity**
```bash
pnpm solhint packages/contracts/src/**/*.sol
pnpm prettier --write packages/contracts/src/**/*.sol
```

**TypeScript**
```bash
pnpm eslint packages/sdk/src/**/*.ts
pnpm prettier --write packages/sdk/src/**/*.ts
```

### 4.4 Coverage Gates
- Solidity: ≥85% lines covered (Foundry + Hardhat coverage merge)
- TypeScript: ≥85% lines covered
- Browser coverage at GitHub Actions → Codecov badge

---

## Phase 5: Documentation & Examples

### 5.1 Documentation Structure

**Getting Started** (`getting-started.md`)
- Installation: `pnpm add @somnia-react/autonomous`
- Quick 5-minute example (AutoCompound)
- Prerequisites (Foundry, Hardhat, Somnia SDK)

**Guides** (`guides/`)
- One comprehensive guide per handler
- Step-by-step walkthrough
- Copy-paste deployment code
- Common pitfalls & fixes

**Security** (`security.md`)
- Reentrancy considerations
- Gas limit best practices
- Trusted oracle assumptions
- Audit recommendations

**API Reference** (`api-reference.md`)
- Auto-generated from Natspec + Typedoc
- Link to source code

**Examples** (`examples/`)
- Production-like Solidity examples (AutoCompoundVault.sol, etc.)
- TypeScript deployment scripts
- All ready to fork & customize

### 5.2 Documentation Site (VitePress)
- Hosted on GitHub Pages (auto-deploy from docs/)
- Dark mode + light mode
- Search enabled
- Mobile responsive

---

## Phase 6: CI/CD & Publishing

### 6.1 GitHub Actions Workflows

**lint.yml** (on push to main/PR)
```yaml
- Solhint on contracts/src
- ESLint on sdk/src
- Prettier check (no auto-fix in CI)
- TypeScript strict mode check
```

**test.yml** (on push to main/PR)
```yaml
- Foundry tests (contracts)
- Hardhat integration tests
- Vitest (sdk)
- Fail if any test fails
```

**coverage.yml** (nightly + on release)
```yaml
- Collect coverage from both Solidity & TS
- Upload to Codecov
- Generate coverage badge
- Fail if coverage < 85%
```

**publish.yml** (on git tag v*.*.*)
```yaml
- Build Solidity contracts (ABI extraction)
- Build TypeScript SDK (tsup)
- Run full test suite
- npm publish to @somnia-react/autonomous
- Create GitHub Release with changelog
- Deploy docs to GitHub Pages
```

### 6.2 npm Publishing

**Registry**: npmjs.com  
**Package name**: `@somnia-react/autonomous`

**Package exports** (`package.json`):
```json
{
  "exports": {
    "./deployment": "./dist/deployment/index.js",
    "./subscriptions": "./dist/subscriptions/index.js",
    "./decoders": "./dist/decoders/index.js",
    "./contracts": "./artifacts/contracts/"
  }
}
```

### 6.3 Versioning & Changelog

**SemVer**: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes (new Somnia SDK version, contract interface change)
- MINOR: New handlers, new helpers, backwards-compatible
- PATCH: Bug fixes, doc updates, security patches

**Changelog** (`CHANGELOG.md`)
- Keep updated with every version
- Highlight breaking changes in red
- Link to GitHub issues / PRs

---

## Key Dependencies

### Contracts (src/package.json)
```json
{
  "devDependencies": {
    "@somnia-chain/reactivity-contracts": "^0.x.x",
    "@openzeppelin/contracts": "^5.0.0",
    "foundry-rs/forge-std": "latest"
  }
}
```

### SDK (src/package.json)
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "abitype": "^1.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

---

## Success Criteria (Phase Completion)

### Phase 1 ✅
- [x] Monorepo initialized & working
- [x] All workspaces can reference each other
- [x] Linting & formatting config applied

### Phase 2 ✅
- [x] All 7 contracts implemented & tested
- [x] 85%+ Solidity coverage
- [x] Gas benchmarks < 250k per _onEvent

### Phase 3 ✅
- [x] All SDK modules functional (deployment, subscriptions, decoders)
- [x] 85%+ TS coverage (actual: 85.31% statements)
- [x] Type-safe APIs (full TypeScript with strict mode)

### Phase 4 ✅
- [x] All 88 tests passing (31 subscriptions + 21 integration + 18 decoders + 18 deployment)
- [x] CI integration ready
- [x] Coverage reporting configured (HTML + LCOV)

### Phase 5 ✅
- [x] Full SDK documentation (4 markdown files + README)
- [x] Module guides with examples
- [x] API reference complete
- [x] Integration tests for real-world scenarios

### Phase 6 ✅
- [ ] npm package published
- [ ] GitHub Actions working
- [ ] Auto-deploy to Pages on release

---

## Timeline Estimate

| Phase | Effort | Timeline |
|-------|--------|----------|
| 1. Scaffold | 2 days | Week 1 |
| 2. Solidity | 10 days | Weeks 2–3 |
| 3. TypeScript SDK | 5 days | Weeks 3–4 |
| 4. Testing & QA | 3 days | Week 4 |
| 5. Documentation | 4 days | Week 5 |
| 6. CI/CD & Publish | 2 days | Week 5–6 |
| **Total MVP** | **26 days** | **6 weeks** |

---

## Maintenance & Evolution

### Ongoing
- Monitor Somnia SDK for breaking changes
- Respond to community PRs / issues
- Monthly security review

### v0.2.0 (3 months post-launch)
- Advanced composability patterns
- More filters & throttles
- Enhanced test coverage & docs

### v1.0.0 (6 months post-launch)
- Community-contributed handlers
- Formal audit (if funded)
- Ecosystem promotion with Somnia

---

## References
- [Original PRD](./somnia-react%20autonomous.md)
- [Foundry Docs](https://book.getfoundry.sh)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [VitePress Docs](https://vitepress.dev)

