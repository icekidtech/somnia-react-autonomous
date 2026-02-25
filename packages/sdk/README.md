# @somnia-react/autonomous-sdk

TypeScript SDK for deploying and managing Somnia reactive handlers.

## Install

```bash
npm install @somnia-react/autonomous-sdk
```

## Usage

```typescript
import {
  deployAutoCompoundHandler,
  createAutoCompoundSubscription,
} from "@somnia-react/autonomous-sdk/deployment";

const handler = await deployAutoCompoundHandler({
  compoundToken: "0x...",
  rewardToken: "0x...",
});

const subscription = createAutoCompoundSubscription({
  handlerAddress: handler.address,
  targetVault: "0x...",
  eventSignature: "RewardAdded(indexed address,uint256)",
});
```

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test
pnpm test:coverage
```

## Modules

- `deployment/` – Deploy handlers with verification
- `subscriptions/` – Create and manage subscriptions
- `decoders/` – Parse events from handler logs

## Documentation

See [../../README.md](../../README.md) for full documentation.
