# API Reference

Complete type definitions and API documentation for the @somnia-react/autonomous-sdk.

## Deployment API

### Functions

#### `deployEventFilterThrottle(config)`

```typescript
async function deployEventFilterThrottle(config: {
  maxEventsPerWindow: number;
  windowSizeBlocks: number;
}): Promise<DeploymentResult>
```

---

#### `deployAutoCompoundHandler(config)`

```typescript
async function deployAutoCompoundHandler(config: {
  compoundToken: string;
  rewardToken: string;
  vaultAddress?: string;
}): Promise<DeploymentResult>
```

---

#### `deployCronScheduler(config)`

```typescript
async function deployCronScheduler(config: {
  interval: number;
  lastExecutionTime: number;
}): Promise<DeploymentResult>
```

---

#### `deployLiquidationGuardian(config)`

```typescript
async function deployLiquidationGuardian(config: {
  minHealthFactor: number;
  alertThreshold: number;
}): Promise<DeploymentResult>
```

---

#### `deployCrossCallOrchestrator(config)`

```typescript
async function deployCrossCallOrchestrator(config: {
  maxQueueSize: number;
  sourceChain: number;
  destinationChain: number;
}): Promise<DeploymentResult>
```

---

#### `deployUpgradeableReactiveProxy(config)`

```typescript
async function deployUpgradeableReactiveProxy(config: {
  implementation: string;
  admin: string;
}): Promise<DeploymentResult>
```

---

### Types

#### `DeploymentResult`

```typescript
interface DeploymentResult {
  address: string;
  transactionHash: string;
  blockNumber: number;
}
```

---

### Validators

#### `isValidAddress(address: string): boolean`

Check if string is valid Ethereum address (0x-prefixed hex, 40 characters).

---

#### `isValidHash(hash: string): boolean`

Check if string is valid transaction hash (0x-prefixed hex, 64 characters).

---

#### `generateMockAddress(): string`

Generate random valid Ethereum address.

---

#### `generateMockHash(): string`

Generate random valid transaction hash.

---

## Subscriptions API

### SubscriptionBuilder Class

```typescript
class SubscriptionBuilder {
  constructor(handlerAddress: string);
  
  onEvent(signature: string): this;
  fromChain(chainId: number): this;
  toChain(chainId: number): this;
  withAddress(address: string | string[]): this;
  withTopic(topic: string | string[]): this;
  build(): SubscriptionConfig;
}
```

---

### Factory Functions

#### `createAutoCompoundSubscription()`

```typescript
function createAutoCompoundSubscription(
  handlerAddress: string,
  targetUtilization: number
): AutoCompoundSubscription
```

---

#### `createEventFilterThrottleSubscription()`

```typescript
function createEventFilterThrottleSubscription(
  handlerAddress: string,
  sourceAddress: string,
  options: {
    maxEventsPerWindow: number;
    windowSizeBlocks: number;
  }
): EventFilterThrottleSubscription
```

---

#### `createCronSchedulerSubscription()`

```typescript
function createCronSchedulerSubscription(
  handlerAddress: string,
  interval: number,
  eventSignature?: string
): CronSchedulerSubscription
```

---

#### `createLiquidationGuardianSubscription()`

```typescript
function createLiquidationGuardianSubscription(
  handlerAddress: string,
  eventSignature: string
): LiquidationGuardianSubscription
```

---

#### `createCrossCallOrchestratorSubscription()`

```typescript
function createCrossCallOrchestratorSubscription(
  handlerAddress: string,
  maxQueueSize: number,
  eventSignature?: string
): CrossCallOrchestratorSubscription
```

---

### Validators

#### `isValidAddress(address: string): boolean`

Validate Ethereum address format.

---

#### `isValidEventSignature(signature: string): boolean`

Validate event signature format (e.g., `EventName(type1,type2)`).

```typescript
isValidEventSignature('Transfer(indexed address,indexed address,uint256)');  // true
isValidEventSignature('Invalid');  // false
```

---

#### `isValidChainId(chainId: number): boolean`

Validate chain ID is in valid range (1-9999).

---

#### `validateSubscriptionConfig(config: SubscriptionConfig): ValidationResult`

```typescript
function validateSubscriptionConfig(
  config: SubscriptionConfig
): { valid: boolean; message?: string }
```

Validates:
- Handler address format
- Event signature format
- Chain IDs if present
- Filter addresses if present

---

#### `generateSubscriptionId(handlerAddress: string, eventSignature: string): string`

Generate unique subscription ID from handler and event.

---

#### `parseEventSignature(signature: string): ParsedEventSignature`

Parse event signature into components.

```typescript
interface ParsedEventSignature {
  name: string;
  signature: string;
  parameters: Parameter[];
}

interface Parameter {
  name: string;
  type: string;
  indexed: boolean;
}
```

---

### Types

#### `SubscriptionConfig`

```typescript
interface SubscriptionConfig {
  handlerAddress: string;
  eventSignature: string;
  sourceChainId?: number;
  targetChainId?: number;
  filters?: SubscriptionFilter;
  id?: string;
}
```

---

#### `SubscriptionFilter`

```typescript
interface SubscriptionFilter {
  address?: string | string[];
  topics?: string[];
}
```

---

#### `AutoCompoundSubscription`

```typescript
interface AutoCompoundSubscription extends SubscriptionConfig {
  targetUtilization: number;
}
```

---

#### `EventFilterThrottleSubscription`

```typescript
interface EventFilterThrottleSubscription extends SubscriptionConfig {
  threshold: number;
  windowSize: number;
}
```

---

#### `CronSchedulerSubscription`

```typescript
interface CronSchedulerSubscription extends SubscriptionConfig {
  interval: number;
}
```

---

#### `LiquidationGuardianSubscription`

```typescript
interface LiquidationGuardianSubscription extends SubscriptionConfig {
  minHealthFactor: number;
}
```

---

#### `CrossCallOrchestratorSubscription`

```typescript
interface CrossCallOrchestratorSubscription extends SubscriptionConfig {
  maxQueueSize: number;
}
```

---

## Decoders API

### EventDecoder Class

```typescript
class EventDecoder {
  registerEvent(signature: string, topic: string): void;
  parseSuccessEvent(log: Log): SuccessEvent;
  parseErrorEvent(log: Log): ErrorEvent;
  parseExecutionEvent(log: Log): ExecutionEvent;
  parseThrottleEvent(log: Log): ThrottleEvent;
  parseScheduledExecutionEvent(log: Log): ScheduledExecutionEvent;
  parseCrossCallEvent(log: Log): CrossCallEvent;
}
```

---

### Factory Function

#### `createEventDecoder()`

```typescript
function createEventDecoder(): EventDecoder
```

Create new EventDecoder instance.

---

### Types

#### `SuccessEvent`

```typescript
interface SuccessEvent {
  handlerAddress: string;
  executionTime: number;
  returnData: string;
}
```

---

#### `ErrorEvent`

```typescript
interface ErrorEvent {
  handlerAddress: string;
  errorMessage: string;
  errorCode: number;
}
```

---

#### `ExecutionEvent`

```typescript
interface ExecutionEvent {
  executor: string;
  gasUsed: number;
  success: boolean;
}
```

---

#### `ThrottleEvent`

```typescript
interface ThrottleEvent {
  sourceAddress: string;
  eventsProcessed: number;
  windowTimestamp: number;
}
```

---

#### `ScheduledExecutionEvent`

```typescript
interface ScheduledExecutionEvent {
  scheduledTime: number;
  actualTime: number;
  delay: number;
}
```

---

#### `CrossCallEvent`

```typescript
interface CrossCallEvent {
  sourceChain: number;
  destinationChain: number;
  messageId: string;
  status: 'pending' | 'delivered' | 'failed';
}
```

---

## Common Types

### Log

Standard Ethereum transaction log.

```typescript
interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
}
```

---

## Error Types

All functions throw standard JavaScript `Error` with descriptive messages:

```typescript
new Error('Invalid address')
new Error('Invalid event signature format')
new Error('Invalid source chain ID')
new Error('Invalid target chain ID')
new Error('Invalid address in filter')
new Error('Unexpected event type')
new Error('Invalid log format')
```
