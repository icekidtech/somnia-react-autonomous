# Subscriptions Module

Create and manage reactive event subscriptions with a fluent builder API.

## Overview

The subscriptions module provides a type-safe subscription builder and factory functions for each handler type. It validates event signatures, addresses, and chain IDs before building configurations.

## Fluent Builder API

### `SubscriptionBuilder`

Build complex subscriptions with a chainable fluent interface.

```typescript
import { SubscriptionBuilder } from '@somnia-react/autonomous-sdk/subscriptions';

const config = new SubscriptionBuilder('0x1234...')
  .onEvent('Transfer(indexed address,indexed address,uint256)')
  .fromChain(1)
  .toChain(42161)
  .withAddress('0xdac17f958d2ee523a2206206994597c13d831ec7') // USDT
  .withTopic('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef')
  .build();
```

### Methods

#### `constructor(handlerAddress: string)`

Initialize builder with handler address.

```typescript
const builder = new SubscriptionBuilder('0x1234567890123456789012345678901234567890');
```

---

#### `.onEvent(signature: string)`

Set the event signature to listen for.

```typescript
builder.onEvent('Swap(address,uint256,uint256,uint256,uint256,address)');
```

**Signature Format:**
- Basic: `EventName(type1,type2)`
- Indexed: `Transfer(indexed address,indexed address,uint256)`
- Tuples: `ComplexEvent((address,uint256),bytes32)`
- Arrays: `BatchEvent(address[],uint256[])`

---

#### `.fromChain(chainId: number)`

Set source chain ID.

```typescript
builder.fromChain(1);  // Ethereum
```

Supported values: Any positive integer less than 10,000.

---

#### `.toChain(chainId: number)`

Set target chain ID.

```typescript
builder.toChain(42161);  // Arbitrum
```

---

#### `.withAddress(address: string | string[])`

Filter events by source contract address.

```typescript
// Single address
builder.withAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');

// Multiple addresses
builder.withAddress([
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
]);
```

Validate all addresses before building.

---

#### `.withTopic(topic: string | string[])`

Filter events by topic hash.

```typescript
builder.withTopic('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
```

---

#### `.build()`

Build and validate subscription configuration.

```typescript
const config = builder.build();
// Returns: SubscriptionConfig
```

Throws error if configuration is invalid.

---

## Factory Functions

### `createAutoCompoundSubscription()`

Create subscription for auto-compound handler.

```typescript
const subscription = createAutoCompoundSubscription(
  '0x1234567890123456789012345678901234567890',
  150000 // target utilization
);
```

**Returns:** `AutoCompoundSubscription`

---

### `createEventFilterThrottleSubscription()`

Create subscription for event filter throttle handler.

```typescript
const subscription = createEventFilterThrottleSubscription(
  '0x1234567890123456789012345678901234567890', // handler
  '0x...',                                        // source address
  {
    maxEventsPerWindow: 100,
    windowSizeBlocks: 1000,
  }
);
```

**Returns:** `EventFilterThrottleSubscription`

---

### `createCronSchedulerSubscription()`

Create subscription for cron scheduler handler.

```typescript
const subscription = createCronSchedulerSubscription(
  '0x1234567890123456789012345678901234567890',
  3600, // interval in seconds
  'CronTick()'
);
```

**Returns:** `CronSchedulerSubscription`

---

### `createLiquidationGuardianSubscription()`

Create subscription for liquidation guardian handler.

```typescript
const subscription = createLiquidationGuardianSubscription(
  '0x1234567890123456789012345678901234567890',
  'Liquidation(address,address,uint256)'
);
```

**Returns:** `LiquidationGuardianSubscription`

---

### `createCrossCallOrchestratorSubscription()`

Create subscription for cross-call orchestrator handler.

```typescript
const subscription = createCrossCallOrchestratorSubscription(
  '0x1234567890123456789012345678901234567890',
  50 // maxQueueSize
);
```

**Returns:** `CrossCallOrchestratorSubscription`

---

## Validators

### `isValidEventSignature(signature: string)`

Validate event signature format.

```typescript
import { isValidEventSignature } from '@somnia-react/autonomous-sdk/subscriptions';

if (isValidEventSignature('Transfer(indexed address,indexed address,uint256)')) {
  console.log('Valid signature');
}
```

---

### `isValidAddress(address: string)`

Validate Ethereum address format.

```typescript
import { isValidAddress } from '@somnia-react/autonomous-sdk/subscriptions';

if (!isValidAddress('not-an-address')) {
  console.error('Invalid address');
}
```

---

### `isValidChainId(chainId: number)`

Validate chain ID range.

```typescript
import { isValidChainId } from '@somnia-react/autonomous-sdk/subscriptions';

if (isValidChainId(1)) {
  console.log('Valid chain ID');
}
```

Valid range: 1 to 9,999

---

### `validateSubscriptionConfig(config: SubscriptionConfig)`

Validate complete subscription configuration.

```typescript
import { validateSubscriptionConfig } from '@somnia-react/autonomous-sdk/subscriptions';

const result = validateSubscriptionConfig({
  handlerAddress: '0x...',
  eventSignature: 'Transfer(indexed address,indexed address,uint256)',
  sourceChainId: 1,
  targetChainId: 42161,
});

if (result.valid) {
  console.log('Configuration is valid');
} else {
  console.error('Error:', result.message);
}
```

---

## Types

### `SubscriptionConfig`

Base subscription configuration.

```typescript
interface SubscriptionConfig {
  handlerAddress: string;       // Handler contract address
  eventSignature: string;       // Event to listen for
  sourceChainId?: number;       // Source chain
  targetChainId?: number;       // Target chain
  filters?: SubscriptionFilter; // Event filters
  id?: string;                  // Unique subscription ID
}
```

### `SubscriptionFilter`

Event filtering options.

```typescript
interface SubscriptionFilter {
  address?: string | string[];  // Contract address(es)
  topics?: string[];            // Topic hashes
}
```

### `AutoCompoundSubscription`

Extends `SubscriptionConfig` with auto-compound parameters.

```typescript
interface AutoCompoundSubscription extends SubscriptionConfig {
  targetUtilization: number;
}
```

### `EventFilterThrottleSubscription`

Extends `SubscriptionConfig` with throttle parameters.

```typescript
interface EventFilterThrottleSubscription extends SubscriptionConfig {
  threshold: number;
  windowSize: number;
}
```

---

## Error Handling

The subscription builder validates on each method call and throws clear errors:

```typescript
try {
  new SubscriptionBuilder('0x1234...')
    .onEvent('InvalidSignature')  // Missing parentheses
    .build();
} catch (error) {
  console.error('Validation error:', error.message);
  // Output: "Invalid event signature format"
}
```

Common errors:
- `Invalid handler address` – Invalid address format
- `Invalid event signature format` – Malformed event signature
- `Invalid source chain ID` – Chain ID out of valid range
- `Invalid target chain ID` – Chain ID out of valid range
- `Invalid address in filter` – Invalid filter address

---

## Examples

### Complex Multi-Filter Subscription

```typescript
const subscription = new SubscriptionBuilder('0x1234...')
  .onEvent('Swap(address,uint256,uint256,uint256,uint256,address)')
  .fromChain(1)
  .toChain(42161)
  .withAddress([
    '0xE592427A0AEce92De3Edee1F18E0157C05861564', // SwapRouter
    '0x68b3465833fb72B5A828cCEEA84B0bA361f38421', // SwapRouter02
  ])
  .build();
```

### Factory with Custom Handler

```typescript
const throttle = createEventFilterThrottleSubscription(
  '0x1234567890123456789012345678901234567890',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  {
    maxEventsPerWindow: 50,
    windowSizeBlocks: 1000,
  }
);

console.log('Subscription ID:', throttle.id);
```

### Validate Before Building

```typescript
import { validateSubscriptionConfig } from '@somnia-react/autonomous-sdk/subscriptions';

const config = {
  handlerAddress: '0x1234...',
  eventSignature: 'Transfer(indexed address,indexed address,uint256)',
  sourceChainId: 1,
  filters: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
};

const validation = validateSubscriptionConfig(config);
if (validation.valid) {
  console.log('Configuration ready to use');
}
```

---

## Testing

All subscription functions are tested with unit tests covering:
- Event signature parsing (simple, indexed, tuples, arrays)
- Address validation
- Chain ID validation
- Complete configuration validation
- Factory function behavior

```bash
pnpm test -- subscriptions.test.ts
```

Results: **31/31 tests passing** ✅
