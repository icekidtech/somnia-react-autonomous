# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial MVP setup and scaffolding

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.0] - 2026-Q2

### Added
- `BaseReactiveHandler` abstract contract with reentrancy guard & gas limits
- `AutoCompoundHandler` for auto-compounding yield farms
- `LiquidationGuardian` for liquidation monitoring & execution
- `CronLikeScheduler` for time-based trigger automation
- `EventFilterThrottle` for event debouncing & throttling
- `CrossCallOrchestrator` for atomic multi-call execution
- `UpgradeableReactiveProxy` for UUPS-upgradeable handlers
- TypeScript SDK with deployment helpers, subscription builders, event decoders
- Foundry + Hardhat test suites with 85%+ coverage
- VitePress documentation site with guides & examples
- GitHub Actions CI/CD (lint, test, coverage, publish)

### Security
- All handlers include reentrancy guards and gas limit checks
- Comprehensive test coverage with fuzz testing
- Solhint security rules enabled by default
- Please note: Libraries are not yet formally audited. Review security considerations before mainnet deployment.

---

For version history before 0.1.0, see the [PRD](./docs/) for historical context.
