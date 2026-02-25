# @somnia-react/autonomous

[![npm version](https://img.shields.io/npm/v/@somnia-react/autonomous.svg)](https://www.npmjs.com/package/@somnia-react/autonomous)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/somnia-react/autonomous/actions/workflows/test.yml/badge.svg)](https://github.com/somnia-react/autonomous/actions)
[![Coverage](https://codecov.io/gh/somnia-react/autonomous/branch/main/graph/badge.svg)](https://codecov.io/gh/somnia-react/autonomous)

**The battle-tested standard library for writing reactive Solidity handlers on Somnia.**

Similar to what [@openzeppelin/contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) is for access control and tokens, `@somnia-react/autonomous` specializes in secure, gas-efficient, composable patterns for on-chain reactive logic.

## Features

- 🛡️ **Battle-Tested Patterns** – Reentrancy guards, gas limit checks, safe external calls
- ⚡ **Gas Optimized** – <250k gas per `_onEvent` call in happy path
- 🧩 **Composable** – Mix & match handlers, inherit & customize
- 📚 **Zero to Hero** – Deploy reactive handlers in 5 minutes with tutorials
- 🔍 **Type-Safe SDK** – Full TypeScript support with abitype for contracts
- 🧪 **85%+ Test Coverage** – Foundry + Hardhat comprehensive tests
- 📖 **Excellent Docs** – VitePress site with examples & security guides

## Quick Start

### Installation

```bash
npm install @somnia-react/autonomous
# or
pnpm add @somnia-react/autonomous
```

### 5-Minute Example: Auto-Compound Vault

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@somnia-react/autonomous/handlers/AutoCompoundHandler.sol";

contract MyAutoCompoundVault is AutoCompoundHandler {
    constructor(
        address _compoundToken,
        address _rewardToken,
        address _vault
    ) {
        // Initialize with your parameters
    }
    
    function compound() external override {
        // Your auto-compound logic
    }
}
```

Deploy & subscribe in TypeScript:

```typescript
import {
  deployAutoCompoundHandler,
  createAutoCompoundSubscription,
} from "@somnia-react/autonomous";

const handler = await deployAutoCompoundHandler({
  compoundToken: "0x...",
  rewardToken: "0x...",
  vaultAddress: "0x...",
});

const subscription = createAutoCompoundSubscription({
  handlerAddress: handler.address,
  targetVault: "0x...",
  eventSignature: "RewardAdded(indexed address,uint256)",
});

console.log("Deployed & subscribed:", handler.address);
```

## Handlers (MVP)

| Handler | Purpose | Use Case |
|---------|---------|----------|
| `BaseReactiveHandler` | Foundation with safety | Inherit for custom handlers |
| `AutoCompoundHandler` | Auto-compound rewards | Yield farming vaults |
| `LiquidationGuardian` | Monitor & liquidate | Lending protocols |
| `CronLikeScheduler` | Time-based triggers | Scheduled execution |
| `EventFilterThrottle` | Debounce events | Noisy on-chain streams |
| `CrossCallOrchestrator` | Chain calls atomically | Multi-step automation |
| `UpgradeableReactiveProxy` | UUPS upgradeable base | Future-proof contracts |

## Documentation

- **[Getting Started](https://somnia-react.github.io/autonomous/getting-started)** – Install, setup, first handler
- **[Handlers Guide](https://somnia-react.github.io/autonomous/guides)** – Deep dive into each handler
- **[Security Best Practices](https://somnia-react.github.io/autonomous/security)** – Gas limits, oracles, reentrancy
- **[API Reference](https://somnia-react.github.io/autonomous/api)** – Full Solidity & TypeScript docs
- **[Examples](https://somnia-react.github.io/autonomous/examples)** – Production-ready code snippets

**Live Docs**: https://somnia-react.github.io/autonomous

## Project Structure

```
packages/
├── contracts/     # Solidity handlers (Foundry + Hardhat)
├── sdk/           # TypeScript deployment & helpers (Vitest)
└── docs/          # VitePress documentation site
```

## Development

### Prerequisites

- Node.js ≥18.0.0
- pnpm ≥8.0.0
- Foundry (for Solidity development)

### Setup

```bash
pnpm install
pnpm build
pnpm test
```

### Lint & Format

```bash
pnpm lint
pnpm format
```

### Run Tests

```bash
# All tests
pnpm test

# Solidity only
pnpm test:contracts

# TypeScript only
pnpm test:sdk

# Coverage
pnpm coverage
```

### Build Documentation

```bash
pnpm docs:dev    # Live server at localhost:5173
pnpm docs:build  # Static site in docs/.vitepress/dist
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Security

⚠️ **Important**: This library is not yet audited. Review the [Security Best Practices](https://somnia-react.github.io/autonomous/security) guide and test thoroughly before deploying to mainnet.

For security concerns, please email `security@somnia-react.dev` or open a private GitHub security advisory.

## License

MIT License – see [LICENSE](./LICENSE)

## Roadmap

- **v0.1.0** (MVP) – Base + 4 handlers + SDK + docs
- **v0.2.0** – Upgradeable patterns, advanced filters
- **v1.0.0** – Community handlers, audit, ecosystem promotion

## See Also

- [@somnia-chain/reactivity-contracts](https://docs.somnia.network) – Official Somnia reactivity SDK
- [@openzeppelin/contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) – Industry-standard smart contract library
- [Somnia Docs](https://docs.somnia.network) – On-chain reactivity guide

---

Built with ❤️ for the Somnia ecosystem.
