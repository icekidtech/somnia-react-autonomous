/**
 * Subscription creation and management
 */

export interface SubscriptionConfig {
  handlerAddress: string;
  eventSignature: string;
}

/**
 * Create a subscription for a reactive handler
 */
export function createSubscription(config: SubscriptionConfig) {
  // Implementation coming in Phase 3
  throw new Error("Not yet implemented");
}

export { SubscriptionConfig };
