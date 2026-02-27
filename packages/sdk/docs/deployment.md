# Deployment Module

Deploy and manage reactive event handlers on Somnia with automatic contract verification.

## Overview

The deployment module provides functions to deploy all 6 reactive handler types with built-in verification and type safety. Each handler is deployed with configurable parameters and returns deployment metadata including the handler address and transaction details.

## Deployment Functions

### `deployEventFilterThrottle()`

Rate-limits event processing to prevent handler overload.

```typescript
const handler = await deployEventFilterThrottle({
  maxEventsPerWindow: 100,
  windowSizeBlocks: 1000,
});

console.log(handler.address); // '0x...'
console.log(handler.transactionHash); // '0x...'
```

**Parameters:**

- `maxEventsPerWindow` (number) – Maximum events processed per window
- `windowSizeBlocks` (number) – Size of sliding window in blocks

**Returns:** `DeploymentResult`

---

### `deployAutoCompoundHandler()`

Automates vault compounding using external reward tokens.

```typescript
const handler = await deployAutoCompoundHandler({
  compoundToken: "0x2260fac5e5542a773aa44fbcff9ffc5ed186a000", // WBTC
  rewardToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
});

console.log(`Deployed to: ${handler.address}`);
```

**Parameters:**

- `compoundToken` (string) – Address of token to compound
- `rewardToken` (string) – Address of reward being swapped
- `vaultAddress?` (string) – Optional vault to compound

**Returns:** `DeploymentResult`

---

### `deployCronScheduler()`

Time-based task scheduling for periodic handler execution.

```typescript
const handler = await deployCronScheduler({
  interval: 3600, // 1 hour in seconds
  lastExecutionTime: Math.floor(Date.now() / 1000),
});

console.log(handler.address);
```

**Parameters:**

- `interval` (number) – Execution interval in seconds
- `lastExecutionTime` (number) – UNIX timestamp of last execution

**Returns:** `DeploymentResult`

---

### `deployLiquidationGuardian()`

Monitors and prevents unsafe liquidations on protocols.

```typescript
const handler = await deployLiquidationGuardian({
  minHealthFactor: 1.5,
  alertThreshold: 0.2,
});

console.log(`Guardian deployed at: ${handler.address}`);
```

**Parameters:**

- `minHealthFactor` (number) – Minimum health factor threshold
- `alertThreshold` (number) – When to trigger alerts (0-1)

**Returns:** `DeploymentResult`

---

### `deployCrossCallOrchestrator()`

Manages cross-chain message routing and execution.

```typescript
const handler = await deployCrossCallOrchestrator({
  maxQueueSize: 100,
  sourceChain: 1, // Ethereum
  destinationChain: 42161, // Arbitrum
});

console.log(handler.address);
```

**Parameters:**

- `maxQueueSize` (number) – Maximum pending operations
- `sourceChain` (number) – Source chain ID
- `destinationChain` (number) – Destination chain ID

**Returns:** `DeploymentResult`

---

### `deployUpgradeableReactiveProxy()`

Upgradeable handler wrapper for non-breaking contract updates.

```typescript
const handler = await deployUpgradeableReactiveProxy({
  implementation: "0x...",
  admin: "0x...",
});

console.log(`Proxy deployed at: ${handler.address}`);
```

**Parameters:**

- `implementation` (string) – Address of implementation contract
- `admin` (string) – Address of proxy admin

**Returns:** `DeploymentResult`

---

## Types

### `DeploymentResult`

Result object returned from all deployment functions.

```typescript
interface DeploymentResult {
  address: string; // Handler contract address
  transactionHash: string; // Deployment transaction hash
  blockNumber: number; // Block where deployed
}
```

### `DeploymentConfig`

Base type for all deployment parameters.

```typescript
interface DeploymentConfig {
  // Handler-specific parameters vary by handler type
}
```

## Validators

The deployment module includes address and hash validation utilities:

```typescript
import {
  isValidAddress,
  isValidHash,
  generateMockAddress,
  generateMockHash,
} from "@somnia-react/autonomous-sdk/deployment";

// Validation
if (!isValidAddress("0x...")) {
  console.error("Invalid address");
}

if (!isValidHash("0x...")) {
  console.error("Invalid hash");
}

// Mocking (for testing)
const mockAddr = generateMockAddress(); // Random valid address
const mockHash = generateMockHash(); // Random valid hash
```

## Error Handling

All deployment functions throw on invalid configuration:

```typescript
try {
  const handler = await deployAutoCompoundHandler({
    compoundToken: "not-an-address", // Invalid
    rewardToken: "0x...",
  });
} catch (error) {
  if (error.message.includes("Invalid")) {
    console.error("Configuration error:", error.message);
  }
}
```

## Examples

### Deploy Multiple Handlers

```typescript
import {
  deployAutoCompoundHandler,
  deployCronScheduler,
  deployEventFilterThrottle,
} from "@somnia-react/autonomous-sdk/deployment";

const handlers = await Promise.all([
  deployAutoCompoundHandler({
    compoundToken: "0x...",
    rewardToken: "0x...",
  }),
  deployCronScheduler({
    interval: 3600,
    lastExecutionTime: Math.floor(Date.now() / 1000),
  }),
  deployEventFilterThrottle({
    maxEventsPerWindow: 50,
    windowSizeBlocks: 500,
  }),
]);

handlers.forEach((h, i) => {
  console.log(`Handler ${i} deployed at ${h.address}`);
});
```

### Deploy with Verification

```typescript
const handler = await deployAutoCompoundHandler({
  compoundToken: "0x2260fac5e5542a773aa44fbcff9ffc5ed186a000",
  rewardToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
});

// Handler is automatically verified on deployment
console.log("Handler verified and ready:", handler.address);
```

## Testing

All deployment functions are tested with unit tests covering:

- Valid configuration handling
- Invalid parameter rejection
- Address validation
- Transaction metadata

```bash
pnpm test -- deployment.test.ts
```
