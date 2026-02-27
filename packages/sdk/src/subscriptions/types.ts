/**
 * @module subscriptions/types
 * @description Type definitions for reactive event subscriptions
 */

/**
 * Subscription filter options
 */
export interface SubscriptionFilter {
  topics?: string[];
  address?: string | string[];
  fromBlock?: number | "latest";
  toBlock?: number | "latest";
}

/**
 * Event parameter
 */
export interface EventParameter {
  name: string;
  type: string;
  indexed?: boolean;
}

/**
 * Event signature definition
 */
export interface EventSignature {
  name: string;
  signature: string;
  parameters: EventParameter[];
}

/**
 * Reactive subscription configuration
 */
export interface ReactiveSubscription {
  id: string;
  handlerAddress: string;
  sourceChainId: number;
  targetChainId: number;
  eventSignature: string;
  filters?: SubscriptionFilter;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription builder result
 */
export interface SubscriptionConfig {
  id?: string;
  handlerAddress: string;
  eventSignature: string;
  sourceChainId?: number;
  targetChainId?: number;
  filters?: SubscriptionFilter;
}

/**
 * Handler subscription specific configs
 */
export interface EventFilterThrottleSubscription extends SubscriptionConfig {
  threshold: number;
  windowSize: number;
}

export interface AutoCompoundSubscription extends SubscriptionConfig {
  rewardToken: string;
  targetVault: string;
  minCompoundAmount: string;
}

export interface CronSchedulerSubscription extends SubscriptionConfig {
  executionInterval: number;
}

export interface LiquidationGuardianSubscription extends SubscriptionConfig {
  healthFactorThreshold: string;
  priceOracleAddress: string;
}

export interface CrossCallOrchestratorSubscription extends SubscriptionConfig {
  maxQueueSize: number;
}
