### Product Requirements Document – @somnia-react/autonomous

**Version**  
1.0.0 (MVP target)

**Status**  
Draft → Planning → Implementation

**Target release**  
Q2–Q3 2026 (after Somnia mainnet on-chain reactivity stabilization)

**Maintainer goal**  
Become the de-facto standard library for writing reactive Solidity handlers on Somnia (similar role to `@openzeppelin/contracts` for access control / tokens, but specialized for reactivity).

### 1. Overview & Purpose

**One-liner**  
A battle-tested library of Solidity abstract contracts, handler templates, and TypeScript helpers that simplify creation, deployment, and safe execution of **on-chain reactive logic** using Somnia's `SomniaEventHandler` pattern.

**Why it exists**

- Official `@somnia-chain/reactivity-contracts` provides only the minimal `SomniaEventHandler` abstract contract.
- Writing `_onEvent` implementations is error-prone: reentrancy risks, gas griefing, complex event decoding, unsafe external calls, lack of throttling/debounce, upgradeability concerns.
- Most Somnia hackathon/DeFi/gaming projects reinvent the same patterns (auto-compound, liquidation guard, cron-like scheduler, cross-contract orchestrator).
- Goal: centralize secure, gas-efficient, composable patterns so developers inherit & customize instead of starting from scratch.

**License**  
MIT (to maximize adoption)

### 2. Target Users

- Somnia dApp developers writing Solidity reactive contracts (DeFi vaults, games, automation infra)
- Teams building autonomous agents / keeper-less protocols
- Hackathon participants who want polish fast
- Protocol teams that want audited-ish base logic they can extend

### 3. Core Value Proposition

- **Cut development time** 5–10× for reactive handlers
- **Reduce critical bugs** (reentrancy, gas bombs, bad event filtering)
- **Enable composability** (mix & match handlers)
- **Improve demo velocity** for hackathons & PoCs
- **Lower barrier** for non-expert Solidity devs to use on-chain reactivity

### 4. MVP Scope – Key Features (v0.1.0)

#### Solidity Contracts (main value)

| Contract / Abstract        | Purpose                                       | Key Methods / Features                                                     | Estimated complexity |
| -------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | -------------------- |
| `BaseReactiveHandler`      | Abstract base with common safety              | Non-reentrant guard, gas limit check, event emitter for errors/success     | ★★                   |
| `AutoCompoundHandler`      | Auto-compound yield / rewards                 | `_onEvent`: check reward token transfer or oracle update → call compound() | ★★★                  |
| `LiquidationGuardian`      | Monitor health factor / liquidation threshold | `_onEvent`: price update or borrow event → check & liquidate if needed     | ★★★★                 |
| `CronLikeScheduler`        | Time-based triggers (approximate cron)        | Subscription to block/time events → execute if interval passed             | ★★★                  |
| `EventFilterThrottle`      | Throttle / debounce noisy events              | Internal counter / timestamp → skip if too frequent                        | ★★                   |
| `CrossCallOrchestrator`    | Chain multiple external calls atomically      | Queue of actions → execute sequentially in `_onEvent`                      | ★★★★                 |
| `UpgradeableReactiveProxy` | Optional UUPS / transparent proxy base        | For upgradable reactive contracts                                          | ★★★                  |

All inherit from `SomniaEventHandler` (`@somnia-chain/reactivity-contracts` dependency).

#### TypeScript / Deployment Helpers

- `deployment-utils.ts` — Hardhat / Foundry style deploy scripts + verification helpers
- Type generation for common handler ABIs (via typechain or abitype)
- Subscription creation helpers (pair with off-chain `@somnia-chain/reactivity` SDK)
  - `createAutoCompoundSubscription(handlerAddress, targetContract, eventSig)`
- Basic event decoder helpers (parse common topics/data)

#### Documentation (must-have for adoption)

- `/docs` folder with markdown + example .sol files
- One-click example: "Deploy & subscribe to an AutoCompound vault in 5 steps"
- Security considerations section (gas limits, trusted oracles, reentrancy)

### 5. Non-functional Requirements

- Solidity ^0.8.20 – ^0.8.30 range
- Dependencies: minimal – `@somnia-chain/reactivity-contracts`, `@openzeppelin/contracts` (only upgradeable & access if needed)
- Gas efficiency: aim < 150–250k gas per `_onEvent` call in happy path
- Tests: Foundry or Hardhat → 85%+ coverage on core paths
- CI: basic GitHub Actions (lint, test, coverage badge)
- Versioning: SemVer, changelog.md
- npm publish: `@somnia-react/autonomous` (scoped to avoid name squatting)

### 6. Out-of-scope for MVP (nice-to-have later)

- Full formal audits (community / sponsors can fund v1.0 audit)
- Advanced composability (handler chaining registry)
- On-chain subscription factory UI
- Integration with popular Somnia protocols (if any emerge)
- Off-chain monitoring / alerting helpers

### 7. Success Metrics (6–12 months post-launch)

- ≥ 150 weekly downloads on npm
- ≥ 5–10 public GitHub repos depending on / importing it
- ≥ 2–3 mentions in Somnia hackathon winners / showcases
- ≥ 1 protocol (vault / game) using it in production/testnet
- Active Discord / Twitter mentions & PRs from community

### 8. Roadmap Sketch

**v0.1.0** (MVP)  
Base + 3–4 most useful handlers + TS helpers + examples

**v0.2.0**  
Upgradeable patterns + more filters/throttles + better tests/docs

**v1.0.0**  
Community-contributed handlers + basic audit + Somnia ecosystem promotion

### 9. Risks & Mitigations

| Risk                                   | Mitigation                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Somnia on-chain reactivity changes API | Pin to specific `@somnia-chain/reactivity-contracts` version + changelog watcher |
| Low adoption if mainnet delayed        | Focus on testnet-first + hackathon integrations                                  |
| Security bugs in handlers              | Clear warnings, non-upgradeable by default in examples, encourage audits         |
| Name already taken on npm              | Use `@somnia-react/autonomous` (or `@somnia/autonomous-handlers` if needed)      |
