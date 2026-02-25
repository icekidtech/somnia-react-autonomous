# Getting Started

Welcome to `@somnia-react/autonomous` – the battle-tested standard library for writing reactive Solidity handlers on Somnia.

## What is it?

A collection of Solidity abstract contracts, TypeScript helpers, and deployment utilities that **cut development time 5-10× for reactive handlers** while dramatically reducing critical bugs.

## Installation

```bash
npm install @somnia-react/autonomous
```

Or with pnpm:

```bash
pnpm add @somnia-react/autonomous
```

## Quick Example

Here's a minimal auto-compound handler:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@somnia-react/autonomous/handlers/AutoCompoundHandler.sol";

contract MyAutoCompoundVault is AutoCompoundHandler {
    constructor(address _compoundToken, address _rewardToken) {
        // Initialize
    }

    function compound() external override {
        // Your compound logic
    }
}
```

Deploy with TypeScript:

```typescript
import { deployAutoCompoundHandler } from "@somnia-react/autonomous/deployment";

const handler = await deployAutoCompoundHandler({
  compoundToken: "0x...",
  rewardToken: "0x...",
  vaultAddress: "0x...",
});

console.log("Deployed:", handler.address);
```

## Next Steps

- [Read about each handler](./guides/auto-compound)
- [Check security best practices](./security)
- [See examples](./examples)

## Features

- ✅ Reentrancy guards
- ✅ Gas limit checks
- ✅ Type-safe deployment
- ✅ Event decoders
- ✅ 85%+ test coverage
- ✅ Full documentation

## Support

- 📖 [Full documentation](/)
- 💬 [GitHub Issues](https://github.com/icekidtech/somnia-react-autonomous/issues)
- 🐦 [Twitter](https://twitter.com/somnia_react)
