# @somnia-react/autonomous-contracts

Solidity smart contracts for Somnia on-chain reactive logic.

## Install

```bash
npm install @somnia-react/autonomous-contracts
```

## Build

```bash
pnpm build
```

## Test

```bash
# Foundry (primary)
pnpm test

# With coverage
pnpm test:coverage

# With fuzzing
pnpm test:fuzz

# Hardhat (integration)
pnpm test:hardhat
```

## Contracts

- `BaseReactiveHandler` – Foundation with safety features
- `AutoCompoundHandler` – Auto-compound rewards
- `LiquidationGuardian` – Monitor & liquidate
- `CronLikeScheduler` – Time-based triggers
- `EventFilterThrottle` – Event debouncing
- `CrossCallOrchestrator` – Atomic multi-calls
- `UpgradeableReactiveProxy` – UUPS upgradeable base

## Documentation

See [../../README.md](../../README.md) for full documentation.
