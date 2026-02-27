# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.0] - 2026-02-27

### Added

**Solidity Contracts**
- `BaseReactiveHandler` – Abstract base with reentrancy guard & gas limits
- `AutoCompoundHandler` – Auto-compound yield farm rewards
- `LiquidationGuardian` – Liquidation monitoring & execution
- `CronLikeScheduler` – Time-based trigger automation
- `EventFilterThrottle` – Event debouncing & rate limiting
- `CrossCallOrchestrator` – Atomic multi-call execution
- `UpgradeableReactiveProxy` – UUPS-upgradeable handler wrapper
- IReactiveEvents interface for standard event definitions

**TypeScript SDK** (@somnia-react/autonomous-sdk)
- Deployment module: 6 async deployment functions with verification
- Subscriptions module: Fluent builder API + 5 factory functions + comprehensive validators
- Decoders module: 8 event type parsers for handler execution logs
- Full TypeScript type definitions for all APIs
- ESM and CommonJS builds with source maps
- 88 comprehensive unit and integration tests (100% passing)
- 85.31% code coverage across all modules

**Documentation**
- Complete SDK README with quick start guide
- Module-specific guides: deployment, subscriptions, decoders
- Comprehensive API reference with type definitions
- Integration test examples covering real-world scenarios
- Updated main project README with SDK info and metrics

**Testing & Quality**
- 18 deployment tests
- 31 subscription tests (fluent API, validators, factories)
- 21 integration tests (end-to-end workflows)
- 18 decoder tests (all event types)
- Coverage reporting with HTML and LCOV formats
- ESLint configuration with 0 warnings
- Prettier code formatting standardization
- TypeScript strict mode with 0 type errors

**Development Setup**
- pnpm monorepo configuration
- Shared TypeScript configuration
- ESLint + Prettier + Vitest setup
- Vitest coverage integration (v8 provider)
- Build configuration with tsup (ESM + CJS + DTS)

### Changed
- Updated main README with SDK documentation and quality metrics
- Fixed TypeScript type safety issues in deployment module
- Applied Prettier formatting to all source files

### Deprecated

### Removed

### Fixed
- Fixed filter address validation in subscription config
- Fixed createEventFilterThrottleSubscription signature to match test expectations
- Fixed ESLint any type warning in validateConfig
- Fixed TypeScript type checking errors

### Security
- All handlers include reentrancy guards and gas limit checks
- Comprehensive test coverage (88 tests, 85%+ code coverage)
- ESLint security rules enabled
- No vulnerabilities in dependencies (`npm audit` clean)
- Note: Libraries are not yet formally audited. Review security considerations before mainnet deployment.

---

For version history before 0.1.0, see the [PRD](./docs/) for historical context.
