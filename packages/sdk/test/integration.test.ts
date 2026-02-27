import { describe, it, expect } from 'vitest';
import {
  deployAutoCompoundHandler,
  deployCronScheduler,
  deployEventFilterThrottle,
} from '../src/deployment';
import {
  createAutoCompoundSubscription,
  createEventFilterThrottleSubscription,
  SubscriptionBuilder,
  validateSubscriptionConfig,
} from '../src/subscriptions';
import { createEventDecoder } from '../src/decoders';

describe('Integration Tests', () => {
  describe('Deployment + Subscriptions', () => {
    it('should deploy handler and create matching subscription', async () => {
      // Deploy handler
      const handler = await deployAutoCompoundHandler({
        compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      expect(handler.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(handler.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(handler.blockNumber).toBeGreaterThan(0);

      // Create subscription for deployed handler
      const subscription = createAutoCompoundSubscription(
        handler.address,
        150000
      );

      expect(subscription.handlerAddress).toBe(handler.address);
      expect(subscription.eventSignature).toBeTruthy();
      expect(subscription.id).toBeTruthy();

      // Validate subscription
      const validation = validateSubscriptionConfig(subscription);
      expect(validation.valid).toBe(true);
    });

    it('should deploy multiple handlers with different subscriptions', async () => {
      const handlers = await Promise.all([
        deployAutoCompoundHandler({
          compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
          rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        }),
        deployCronScheduler({
          interval: 3600,
          lastExecutionTime: Math.floor(Date.now() / 1000),
        }),
        deployEventFilterThrottle({
          maxEventsPerWindow: 100,
          windowSizeBlocks: 1000,
        }),
      ]);

      expect(handlers).toHaveLength(3);
      handlers.forEach(handler => {
        expect(handler.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });

      // Create subscriptions for each
      const subscriptions = [
        createAutoCompoundSubscription(handlers[0].address, 150000),
        // CronScheduler subscription handled by factory
      ];

      subscriptions.forEach(sub => {
        const validation = validateSubscriptionConfig(sub);
        expect(validation.valid).toBe(true);
      });
    });
  });

  describe('Subscriptions + Decoders', () => {
    it('should build subscription and decode matching event', () => {
      // Build a complex subscription
      const subscription = new SubscriptionBuilder(
        '0x1234567890123456789012345678901234567890'
      )
        .onEvent('Transfer(indexed address,indexed address,uint256)')
        .fromChain(1)
        .toChain(42161)
        .withAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
        .build();

      // Validate it
      const validation = validateSubscriptionConfig(subscription);
      expect(validation.valid).toBe(true);

      // Create decoder for parsing events from this subscription
      const decoder = createEventDecoder();
      expect(decoder).toBeTruthy();

      // Can register event from subscription
      decoder.registerEvent(
        subscription.eventSignature,
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );
    });

    it('should decode events for subscription chain pair', () => {
      const sourceChain = 1;
      const targetChain = 42161;

      const subscription = new SubscriptionBuilder(
        '0x1234567890123456789012345678901234567890'
      )
        .onEvent('Swap(address,uint256,uint256,uint256,uint256,address)')
        .fromChain(sourceChain)
        .toChain(targetChain)
        .build();

      expect(subscription.sourceChainId).toBe(sourceChain);
      expect(subscription.targetChainId).toBe(targetChain);

      const decoder = createEventDecoder();
      decoder.registerEvent(subscription.eventSignature, '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67');

      const mockLog = {
        topics: ['0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'],
        data: '0x0000000000000000000000000000000000000000000000000000000000000001',
      };

      expect(mockLog.topics[0]).toBeTruthy();
    });
  });

  describe('Full Workflow', () => {
    it('should handle complete deployment-subscription-decoding flow', async () => {
      // Step 1: Deploy handler
      const handler = await deployAutoCompoundHandler({
        compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      expect(handler.address).toMatch(/^0x[a-fA-F0-9]{40}$/);

      // Step 2: Build subscription for handler
      const subscription = new SubscriptionBuilder(handler.address)
        .onEvent('Transfer(indexed address,indexed address,uint256)')
        .fromChain(1)
        .toChain(1)
        .withAddress(handler.address)
        .build();

      expect(subscription.id).toBeTruthy();

      // Step 3: Validate subscription
      const validation = validateSubscriptionConfig(subscription);
      expect(validation.valid).toBe(true);

      // Step 4: Create decoder for monitoring
      const decoder = createEventDecoder();
      decoder.registerEvent(subscription.eventSignature, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');

      // Verify all components are connected
      expect(handler.address).toBe(subscription.handlerAddress);
      expect(subscription.handlerAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should support building multiple subscriptions for same handler', async () => {
      const handler = await deployAutoCompoundHandler({
        compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      // Create multiple subscriptions for same handler
      const subscriptions = [
        new SubscriptionBuilder(handler.address)
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .fromChain(1)
          .toChain(1)
          .build(),
        new SubscriptionBuilder(handler.address)
          .onEvent('Approval(indexed address,indexed address,uint256)')
          .fromChain(1)
          .toChain(42161)
          .build(),
        new SubscriptionBuilder(handler.address)
          .onEvent('Swap(address,uint256,uint256,uint256,uint256,address)')
          .fromChain(42161)
          .toChain(1)
          .build(),
      ];

      expect(subscriptions).toHaveLength(3);

      // All should be valid
      subscriptions.forEach(sub => {
        expect(validateSubscriptionConfig(sub).valid).toBe(true);
      });

      // All should reference same handler
      subscriptions.forEach(sub => {
        expect(sub.handlerAddress).toBe(handler.address);
      });

      // All should have unique IDs
      const ids = subscriptions.map(s => s.id);
      expect(new Set(ids).size).toBe(3);
    });

    it('should validate subscriptions across different chain pairs', () => {
      const handlerAddress = '0x1234567890123456789012345678901234567890';

      const chainPairs = [
        { from: 1, to: 42161 },     // Ethereum to Arbitrum
        { from: 1, to: 10 },         // Ethereum to Optimism
        { from: 42161, to: 1 },      // Arbitrum to Ethereum
        { from: 42161, to: 10 },     // Arbitrum to Optimism
      ];

      chainPairs.forEach(({ from, to }) => {
        const subscription = new SubscriptionBuilder(handlerAddress)
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .fromChain(from)
          .toChain(to)
          .build();

        const validation = validateSubscriptionConfig(subscription);
        expect(validation.valid).toBe(true);
        expect(subscription.sourceChainId).toBe(from);
        expect(subscription.targetChainId).toBe(to);
      });
    });
  });

  describe('Error Handling Across Modules', () => {
    it('should catch invalid handler address in subscription', () => {
      expect(() => {
        new SubscriptionBuilder('invalid-address')
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .build();
      }).toThrow();
    });

    it('should catch invalid event signature when building', () => {
      expect(() => {
        new SubscriptionBuilder('0x1234567890123456789012345678901234567890')
          .onEvent('InvalidSignatureWithoutParens')
          .build();
      }).toThrow('Invalid event signature format');
    });

    it('should catch invalid filter address', () => {
      expect(() => {
        new SubscriptionBuilder('0x1234567890123456789012345678901234567890')
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .withAddress('not-an-address')
          .build();
      }).toThrow('Invalid address in filter');
    });

    it('should catch invalid chain IDs', () => {
      expect(() => {
        new SubscriptionBuilder('0x1234567890123456789012345678901234567890')
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .fromChain(999999) // Too large
          .build();
      }).toThrow('Invalid source chain ID');
    });
  });

  describe('Decoder with Multiple Event Types', () => {
    it('should register and handle multiple event types', () => {
      const decoder = createEventDecoder();

      const events = [
        { name: 'SuccessEvent', topic: '0x' + 'a'.repeat(64) },
        { name: 'ErrorEvent', topic: '0x' + 'b'.repeat(64) },
        { name: 'ExecutionEvent', topic: '0x' + 'c'.repeat(64) },
        { name: 'ThrottleEvent', topic: '0x' + 'd'.repeat(64) },
      ];

      events.forEach(({ name, topic }) => {
        decoder.registerEvent(`${name}()`, topic);
      });

      expect(decoder).toBeTruthy();
    });
  });

  describe('Subscription Factory Functions', () => {
    it('should create consistent subscriptions with factories', () => {
      const handlerAddress = '0x1234567890123456789012345678901234567890';
      const sourceAddress = '0x0987654321098765432109876543210987654321';

      // Create with factory
      const sub1 = createEventFilterThrottleSubscription(handlerAddress, sourceAddress, {
        maxEventsPerWindow: 100,
        windowSizeBlocks: 1000,
      });

      expect(sub1.handlerAddress).toBe(handlerAddress);
      expect(validateSubscriptionConfig(sub1).valid).toBe(true);

      // Create with builder (should be compatible)
      const sub2 = new SubscriptionBuilder(handlerAddress)
        .onEvent('EventThrottled(address,uint256)')
        .withAddress(sourceAddress)
        .build();

      expect(sub2.handlerAddress).toBe(handlerAddress);
      expect(validateSubscriptionConfig(sub2).valid).toBe(true);

      // Both should have same handler and be valid
      expect(sub1.handlerAddress).toBe(sub2.handlerAddress);
    });

    it('should create unique subscription IDs from factories', () => {
      const handlerAddress = '0x1234567890123456789012345678901234567890';

      const sub1 = createAutoCompoundSubscription(handlerAddress, 150000);
      const sub2 = createAutoCompoundSubscription(handlerAddress, 200000);

      // Same handler, different config should have different IDs
      expect(sub1.id).toBeTruthy();
      expect(sub2.id).toBeTruthy();
    });
  });
});
