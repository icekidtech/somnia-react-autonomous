# @somnia-react/autonomous-sdk

Comprehensive TypeScript SDK for deploying, managing, and monitoring reactive handlers on Somnia. Provides type-safe abstractions for handler deployment, subscription management, and event decoding.

## 🚀 Features

- **Type-Safe Deployment** – Deploy all 6 handler types with automatic verification
- **Fluent Subscription API** – Build complex event subscriptions with chainable methods
- **Event Decoding** – Parse and type events from handler execution logs
- **Full TypeScript Support** – Complete type definitions for all APIs
- **Tested** – 67 comprehensive unit tests with 100% coverage of core functionality
- **ESM & CJS** – Works in modern and legacy JavaScript environments

## 📦 Installation

```bash
npm install @somnia-react/autonomous-sdk
```

Or with pnpm:

```bash
pnpm add @somnia-react/autonomous-sdk
```

Or with yarn:

```bash
yarn add @somnia-react/autonomous-sdk
```

## 📥 Imports & Subpath Exports

The SDK provides multiple entry points for modular imports:

### Main Export (Everything)

```typescript
import {
  deployAutoCompoundHandler,
  createAutoCompoundSubscription,
  createEventDecoder,
} from "@somnia-react/autonomous-sdk";
```

### Deployment Module

```typescript
import { deployAutoCompoundHandler } from "@somnia-react/autonomous-sdk/deployment";
```

### Subscriptions Module

```typescript
import { createAutoCompoundSubscription } from "@somnia-react/autonomous-sdk/subscriptions";
```

### Decoders Module

```typescript
import { createEventDecoder } from "@somnia-react/autonomous-sdk/decoders";
```

**Benefits of subpath imports:**
- Tree-shakeable for smaller bundle sizes
- Logical organization of functionality
- Clear API boundaries

## 🎯 Quick Start

### Deploy a Handler

```typescript
import { deployAutoCompoundHandler } from "@somnia-react/autonomous-sdk/deployment";

const handler = await deployAutoCompoundHandler({
  compoundToken: "0x1234567890123456789012345678901234567890",
  rewardToken: "0x0987654321098765432109876543210987654321",
});

console.log("Handler deployed at:", handler.address);
```

### Create a Subscription

```typescript
import { createAutoCompoundSubscription } from "@somnia-react/autonomous-sdk/subscriptions";

const subscription = createAutoCompoundSubscription(
  "0x1234567890123456789012345678901234567890",
  150000 // target utilization
);

console.log("Subscription ID:", subscription.id);
```

### Decode Events

```typescript
import { createEventDecoder } from "@somnia-react/autonomous-sdk/decoders";

const decoder = createEventDecoder();
const event = decoder.parseSuccessEvent(contractLog);

console.log("Event parsed:", event);
```

## 📚 Modules

### [Deployment](./docs/deployment.md)

Deploy reactive handlers with automatic contract verification and configuration.

**Handlers:**

- `EventFilterThrottle` – Rate-limit event processing
- `AutoCompound` – Automated vault compounding
- `CronScheduler` – Time-based execution
- `LiquidationGuardian` – Protocol safety monitoring
- `CrossCallOrchestrator` – Cross-chain message handling
- `UpgradeableReactiveProxy` – Upgradeable handler wrapper

### [Subscriptions](./docs/subscriptions.md)

Create and manage event subscriptions with a fluent, chainable API.

**Features:**

- Fluent builder pattern for complex subscription configs
- Event signature validation with support for indexed parameters and tuple types
- Address filtering with validation
- Chain ID validation
- Factory functions for each handler type

### [Decoders](./docs/decoders.md)

Parse and decode events from handler execution logs.

**Event Types:**

- Success events
- Error events
- Execution events
- Throttle events
- Scheduled execution events
- Cross-call events

## 🔧 API Reference

See [docs/api-reference.md](./docs/api-reference.md) for complete API documentation.

## 💡 Examples

### Example 1: Deploy and Subscribe to Auto-Compound Handler

```typescript
import {
  deployAutoCompoundHandler,
  createAutoCompoundSubscription,
} from "@somnia-react/autonomous-sdk";

// Deploy the handler
const handler = await deployAutoCompoundHandler({
  compoundToken: "0x2260fac5e5542a773aa44fbcff9ffc5ed186a000", // WBTC
  rewardToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
});

// Create a subscription to trigger on RewardAdded events
const subscription = createAutoCompoundSubscription(
  handler.address,
  150000 // 150% target utilization
);

console.log(`Handler: ${handler.address}`);
console.log(`Subscription: ${subscription.id}`);
```

### Example 2: Build Complex Subscription

```typescript
import { SubscriptionBuilder } from "@somnia-react/autonomous-sdk/subscriptions";

const subscription = new SubscriptionBuilder("0x...")
  .onEvent("SwapExactTokensForTokens(uint256,uint256,address[],address,uint256)")
  .fromChain(1) // Ethereum
  .toChain(42161) // Arbitrum
  .withAddress(["0xE592427A0AEce92De3Edee1F18E0157C05861564"]) // Swap router
  .build();
```

### Example 3: Decode Handler Events

```typescript
import { createEventDecoder } from "@somnia-react/autonomous-sdk/decoders";

const decoder = createEventDecoder();

// Parse logs from handler execution
const logs = [
  /* contract logs from handler execution */
];

for (const log of logs) {
  const event = decoder.parseSuccessEvent(log);
  console.log("Success:", event);
}
```

## 🛠️ Development

### Build

```bash
pnpm build
```

Outputs:

- ESM modules: `dist/**/*.mjs`
- CommonJS modules: `dist/**/*.js`
- Type declarations: `dist/**/*.d.ts`, `dist/**/*.d.mts`

### Test

```bash
pnpm test
```

Run with coverage:

```bash
pnpm test:coverage
```

## 📋 Requirements

- Node.js 18+
- TypeScript 4.7+
- ethers.js v6

## 📝 License

MIT

## 🗺️ Architecture

```
src/
├── deployment/          # Handler deployment utilities
│   ├── types.ts        # Deployment type definitions
│   ├── verify.ts       # Contract verification helpers
│   └── deployer.ts     # Deployment functions (6 handlers)
│
├── subscriptions/       # Subscription management
│   ├── types.ts        # Subscription type definitions
│   ├── validators.ts   # Event signature & config validators
│   └── subscription-builder.ts  # Builder class + factory functions
│
└── decoders/           # Event decoding utilities
    ├── types.ts        # Event type definitions
    └── event-decoder.ts # EventDecoder class (8 event types)
```

## 📞 Support

- Documentation: [Get Started](../../docs/)
- Issues: [GitHub Issues](https://github.com/somnia-labs/somnia-react-autonomous/issues)
