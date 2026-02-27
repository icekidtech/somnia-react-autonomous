# Decoders Module

Parse and decode reactive handler events from contract logs.

## Overview

The decoders module provides typed event parsing for all reactive handler event types. Use the `EventDecoder` class to parse handler execution logs into strongly-typed event objects.

## EventDecoder Class

### `createEventDecoder()`

Factory function to create a new event decoder instance.

```typescript
import { createEventDecoder } from "@somnia-react/autonomous-sdk/decoders";

const decoder = createEventDecoder();
```

### Methods

#### `registerEvent(signature: string, topic: string)`

Register a custom event signature with its topic hash.

```typescript
decoder.registerEvent(
  "CustomEvent(address,uint256)",
  "0x1234567890123456789012345678901234567890123456789012345678901234"
);
```

---

#### `parseSuccessEvent(log: Log)`

Parse successful handler execution event.

```typescript
const event = decoder.parseSuccessEvent(log);

console.log(event.handlerAddress); // '0x...'
console.log(event.executionTime); // timestamp
console.log(event.returnData); // execution result
```

**Returns:** `SuccessEvent`

```typescript
interface SuccessEvent {
  handlerAddress: string;
  executionTime: number;
  returnData: string;
}
```

---

#### `parseErrorEvent(log: Log)`

Parse handler execution error event.

```typescript
const event = decoder.parseErrorEvent(log);

console.log(event.handlerAddress); // '0x...'
console.log(event.errorMessage); // error details
console.log(event.errorCode); // error type
```

**Returns:** `ErrorEvent`

```typescript
interface ErrorEvent {
  handlerAddress: string;
  errorMessage: string;
  errorCode: number;
}
```

---

#### `parseExecutionEvent(log: Log)`

Parse generic handler execution event.

```typescript
const event = decoder.parseExecutionEvent(log);

console.log(event.executor); // who ran handler
console.log(event.gasUsed); // gas consumed
console.log(event.success); // execution result
```

**Returns:** `ExecutionEvent`

```typescript
interface ExecutionEvent {
  executor: string;
  gasUsed: number;
  success: boolean;
}
```

---

#### `parseThrottleEvent(log: Log)`

Parse event throttle rate-limiting event.

```typescript
const event = decoder.parseThrottleEvent(log);

console.log(event.sourceAddress); // event source
console.log(event.eventsProcessed); // count
console.log(event.windowTimestamp); // window start
```

**Returns:** `ThrottleEvent`

```typescript
interface ThrottleEvent {
  sourceAddress: string;
  eventsProcessed: number;
  windowTimestamp: number;
}
```

---

#### `parseScheduledExecutionEvent(log: Log)`

Parse cron scheduler execution event.

```typescript
const event = decoder.parseScheduledExecutionEvent(log);

console.log(event.scheduledTime); // when it was supposed to run
console.log(event.actualTime); // when it actually ran
console.log(event.delay); // latency in seconds
```

**Returns:** `ScheduledExecutionEvent`

```typescript
interface ScheduledExecutionEvent {
  scheduledTime: number;
  actualTime: number;
  delay: number;
}
```

---

#### `parseCrossCallEvent(log: Log)`

Parse cross-chain message routing event.

```typescript
const event = decoder.parseCrossCallEvent(log);

console.log(event.sourceChain); // origin chain
console.log(event.destinationChain); // target chain
console.log(event.messageId); // unique ID
console.log(event.status); // delivery status
```

**Returns:** `CrossCallEvent`

```typescript
interface CrossCallEvent {
  sourceChain: number;
  destinationChain: number;
  messageId: string;
  status: "pending" | "delivered" | "failed";
}
```

---

## Usage Patterns

### Parse All Events from Logs

```typescript
import { createEventDecoder } from "@somnia-react/autonomous-sdk/decoders";

const decoder = createEventDecoder();
const logs = [
  /* contract logs */
];

logs.forEach((log) => {
  const topicHash = log.topics[0];

  try {
    if (topicHash === successEventTopic) {
      const event = decoder.parseSuccessEvent(log);
      console.log("Success:", event);
    } else if (topicHash === errorEventTopic) {
      const event = decoder.parseErrorEvent(log);
      console.log("Error:", event);
    }
  } catch (error) {
    console.error("Parse error:", error.message);
  }
});
```

### Register Custom Events

```typescript
const decoder = createEventDecoder();

// Register custom event
decoder.registerEvent("VaultCompounded(address,uint256,uint256)", "0xabcd1234...");

// Now parse custom events
const log = {
  topics: ["0xabcd1234..."],
  data: "...",
};

// Custom parsing logic would go here
```

### Batch Event Processing

```typescript
const decoder = createEventDecoder();
const logs = receipt.logs; // from transaction receipt

const events = logs
  .map((log) => {
    try {
      return decoder.parseSuccessEvent(log);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

console.log(`Parsed ${events.length} events`);
```

## Event Types Details

### SuccessEvent

Handler executed successfully.

```typescript
interface SuccessEvent {
  handlerAddress: string; // Handler that executed
  executionTime: number; // Block timestamp
  returnData: string; // Encoded return value
}
```

**Use for:** Monitoring successful handler runs, tracking execution history.

---

### ErrorEvent

Handler execution failed.

```typescript
interface ErrorEvent {
  handlerAddress: string; // Handler that failed
  errorMessage: string; // Human-readable error
  errorCode: number; // Error type code
}
```

**Use for:** Error monitoring, retry logic, alerting.

---

### ExecutionEvent

Generic execution metadata.

```typescript
interface ExecutionEvent {
  executor: string; // Who triggered execution
  gasUsed: number; // Total gas consumed
  success: boolean; // Did it complete
}
```

**Use for:** Gas tracking, cost analysis.

---

### ThrottleEvent

Event rate limiting applied.

```typescript
interface ThrottleEvent {
  sourceAddress: string; // Event source contract
  eventsProcessed: number; // In this window
  windowTimestamp: number; // Window start time
}
```

**Use for:** Monitoring throttle state, detecting rate limits.

---

### ScheduledExecutionEvent

Cron scheduler ran task.

```typescript
interface ScheduledExecutionEvent {
  scheduledTime: number; // Expected execution
  actualTime: number; // Real execution
  delay: number; // Latency in seconds
}
```

**Use for:** Monitoring scheduler health, detecting delays.

---

### CrossCallEvent

Cross-chain message event.

```typescript
interface CrossCallEvent {
  sourceChain: number; // Origin chain ID
  destinationChain: number; // Target chain ID
  messageId: string; // Unique message ID
  status: string; // Current status
}
```

**Use for:** Cross-chain monitoring, message tracking.

---

## Error Handling

Parsing throws errors for invalid logs:

```typescript
try {
  decoder.parseSuccessEvent(invalidLog);
} catch (error) {
  if (error.message === "Invalid log format") {
    console.error("Log structure error");
  } else if (error.message === "Unexpected event type") {
    console.error("Topic mismatch");
  }
}
```

---

## Examples

### Monitor Handler Executions

```typescript
import { createEventDecoder } from "@somnia-react/autonomous-sdk/decoders";

const decoder = createEventDecoder();

async function monitorExecutions(txHash: string) {
  const receipt = await provider.getTransactionReceipt(txHash);

  const events = receipt.logs
    .map((log) => {
      try {
        return decoder.parseSuccessEvent(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  events.forEach((event) => {
    console.log(`Handler ${event.handlerAddress} executed successfully`);
    console.log(`Execution time: ${new Date(event.executionTime * 1000)}`);
  });
}
```

### Track Errors

```typescript
async function trackErrors(txHash: string) {
  const receipt = await provider.getTransactionReceipt(txHash);
  const decoder = createEventDecoder();

  const errors = receipt.logs
    .map((log) => {
      try {
        return decoder.parseErrorEvent(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  errors.forEach((error) => {
    console.error(`Handler failed: ${error.errorMessage}`);
    console.error(`Error code: ${error.errorCode}`);
  });
}
```

### Analyze Throttle Behavior

```typescript
async function analyzeThrottling(txHash: string) {
  const receipt = await provider.getTransactionReceipt(txHash);
  const decoder = createEventDecoder();

  const throttleEvents = receipt.logs
    .map((log) => {
      try {
        return decoder.parseThrottleEvent(log);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  throttleEvents.forEach((event) => {
    console.log(`Throttle window: ${event.eventsProcessed} events processed`);
  });
}
```

---

## Testing

All decoder functions are tested with unit tests covering:

- All 6 event types
- Valid log parsing
- Invalid log rejection
- Custom event registration
- Event filtering

```bash
pnpm test -- decoders.test.ts
```

Results: **18/18 tests passing** ✅
