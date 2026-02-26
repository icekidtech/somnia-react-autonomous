/**
 * @module deployment/types
 * @description Type definitions for deployment operations
 */

/**
 * Network configuration
 */
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl?: string;
  explorerApiKey?: string;
}

/**
 * Deployment options
 */
export interface DeploymentOptions {
  network: NetworkConfig;
  verifyOnExplorer?: boolean;
  confirmations?: number;
  gasPrice?: string;
  gasLimit?: string;
}

/**
 * Base deployment result
 */
export interface DeploymentResult {
  address: string;
  transactionHash: string;
  blockNumber: number;
  constructorArgs?: unknown[];
  deploymentTime: Date;
  network: string;
}

/**
 * Handler deployment result
 */
export interface HandlerDeploymentResult extends DeploymentResult {
  type: 'EventFilterThrottle' | 'AutoCompound' | 'CronScheduler' | 'LiquidationGuardian' | 'CrossCallOrchestrator' | 'UpgradeableProxy';
  initializationData?: Record<string, unknown>;
  verified?: boolean;
}

/**
 * Deployment configuration for specific handlers
 */
export interface EventFilterThrottleConfig {
  maxEventsPerWindow: number;
  windowSizeBlocks: number;
  initialOwner?: string;
}

export interface AutoCompoundConfig {
  vaultAddress: string;
  tokenAddress: string;
  compoundThreshold: string;
  initialOwner?: string;
}

export interface CronSchedulerConfig {
  intervalBlocks: number;
  initialOwner?: string;
}

export interface LiquidationGuardianConfig {
  oracleAddress: string;
  healthFactorThreshold: string;
  liquidationThreshold: string;
  initialOwner?: string;
}

export interface CrossCallOrchestratorConfig {
  maxQueueSize: number;
  maxCallDataSize?: number;
  initialOwner?: string;
}

/**
 * Contract verification options
 */
export interface VerificationOptions {
  address: string;
  constructorArgs?: unknown[];
  contractName?: string;
  sourcePath?: string;
  explorerApiUrl?: string;
  explorerApiKey?: string;
  chainId?: number;
}

/**
 * Verification result
 */
export interface VerificationResult {
  status: 'success' | 'failure' | 'pending';
  message: string;
  url?: string;
}
