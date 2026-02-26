/**
 * @module subscriptions/subscription-builder
 * @description Fluent API for building reactive subscriptions
 */

import {
  SubscriptionConfig,
  SubscriptionFilter,
  AutoCompoundSubscription,
  EventFilterThrottleSubscription,
  CronSchedulerSubscription,
  LiquidationGuardianSubscription,
  CrossCallOrchestratorSubscription,
} from './types';
import { validateSubscriptionConfig, generateSubscriptionId } from './validators';

/**
 * Subscription builder with fluent API
 */
export class SubscriptionBuilder {
  private config: SubscriptionConfig;

  constructor(handlerAddress?: string) {
    this.config = {
      handlerAddress: handlerAddress || '0x0000000000000000000000000000000000000000',
      eventSignature: '',
    };
  }

  /**
   * Set event signature
   */
  onEvent(signature: string): this {
    this.config.eventSignature = signature;
    return this;
  }

  /**
   * Set source chain
   */
  fromChain(chainId: number): this {
    this.config.sourceChainId = chainId;
    return this;
  }

  /**
   * Set target chain
   */
  toChain(chainId: number): this {
    this.config.targetChainId = chainId;
    return this;
  }

  /**
   * Set filter options
   */
  withFilter(filter: SubscriptionFilter): this {
    this.config.filters = filter;
    return this;
  }

  /**
   * Add topic filter
   */
  withTopic(topic: string): this {
    if (!this.config.filters) {
      this.config.filters = {};
    }
    if (!this.config.filters.topics) {
      this.config.filters.topics = [];
    }
    this.config.filters.topics.push(topic);
    return this;
  }

  /**
   * Add address filter
   */
  withAddress(address: string | string[]): this {
    if (!this.config.filters) {
      this.config.filters = {};
    }
    this.config.filters.address = address;
    return this;
  }

  /**
   * Build and validate
   */
  build(): SubscriptionConfig {
    validateSubscriptionConfig(this.config);
    return {
      ...this.config,
      id: generateSubscriptionId(this.config.handlerAddress, this.config.eventSignature),
    };
  }
}

/**
 * Create AutoCompound subscription
 */
export function createAutoCompoundSubscription(
  handlerAddress: string,
  rewardToken: string,
  targetVault: string,
  minCompoundAmount: string,
  eventSignature = 'Transfer(indexed address,indexed address,uint256)'
): AutoCompoundSubscription {
  const config = new SubscriptionBuilder(handlerAddress)
    .onEvent(eventSignature)
    .build();

  return {
    ...config,
    rewardToken,
    targetVault,
    minCompoundAmount,
  };
}

/**
 * Create EventFilterThrottle subscription
 */
export function createEventFilterThrottleSubscription(
  handlerAddress: string,
  eventSignature: string,
  threshold: number,
  windowSize: number
): EventFilterThrottleSubscription {
  const config = new SubscriptionBuilder(handlerAddress)
    .onEvent(eventSignature)
    .build();

  return {
    ...config,
    threshold,
    windowSize,
  };
}

/**
 * Create CronScheduler subscription
 */
export function createCronSchedulerSubscription(
  handlerAddress: string,
  executionInterval: number,
  eventSignature = 'ExecutionTick()'
): CronSchedulerSubscription {
  const config = new SubscriptionBuilder(handlerAddress)
    .onEvent(eventSignature)
    .build();

  return {
    ...config,
    executionInterval,
  };
}

/**
 * Create LiquidationGuardian subscription
 */
export function createLiquidationGuardianSubscription(
  handlerAddress: string,
  healthFactorThreshold: string,
  priceOracleAddress: string,
  eventSignature = 'PriceUpdated(indexed address,uint256)'
): LiquidationGuardianSubscription {
  const config = new SubscriptionBuilder(handlerAddress)
    .onEvent(eventSignature)
    .build();

  return {
    ...config,
    healthFactorThreshold,
    priceOracleAddress,
  };
}

/**
 * Create CrossCallOrchestrator subscription
 */
export function createCrossCallOrchestratorSubscription(
  handlerAddress: string,
  maxQueueSize: number,
  eventSignature = 'TriggerExecution()'
): CrossCallOrchestratorSubscription {
  const config = new SubscriptionBuilder(handlerAddress)
    .onEvent(eventSignature)
    .build();

  return {
    ...config,
    maxQueueSize,
  };
}
