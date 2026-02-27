import { describe, it, expect, beforeEach } from 'vitest';
import {
  deployAutoCompoundHandler,
  deployEventFilterThrottle,
  deployCronScheduler,
} from '../src/deployment/deployer';
import {
  SubscriptionBuilder,
  createAutoCompoundSubscription,
  createEventFilterThrottleSubscription,
} from '../src/subscriptions/subscription-builder';
import { createEventDecoder } from '../src/decoders/event-decoder';
import {
  validateSubscriptionConfig,
  isValidAddress,
} from '../src/subscriptions/validators';

describe('SDK Integration Tests', () => {
  let deploymentAddresses: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset for each test
    deploymentAddresses = {};
  });

  describe('Deploy & Subscribe Workflow', () => {
    it('should deploy handler and create subscription in sequence', async () => {
      // Deploy handler
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      expect(handler.address).toBeDefined();
      expect(handler.transactionHash).toBeDefined();
      expect(handler.blockNumber).toBeGreaterThan(0);

      // Create subscription using deployed handler
      const subscription = createAutoCompoundSubscription(
        handler.address,
        150000
      );

      expect(subscription.handlerAddress).toBe(handler.address);
      expect(subscription.eventSignature).toBeDefined();
      expect(subscription.id).toBeDefined();
    });

    it('should deploy multiple handlers and create subscriptions', async () => {
      // Deploy multiple handlers
      const [autoCompound, eventThrottle, cron] = await Promise.all([
        deployAutoCompoundHandler({
          vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
          tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          compoundThreshold: '1000000000000000000',
        }),
        deployEventFilterThrottle({
          maxEventsPerWindow: 100,
          windowSizeBlocks: 1000,
        }),
        deployCronScheduler({
          intervalBlocks: 3600,
        }),
      ]);

      expect(autoCompound.address).toBeDefined();
      expect(eventThrottle.address).toBeDefined();
      expect(cron.address).toBeDefined();

      // Create subscriptions for each
      const subscriptions = [
        createAutoCompoundSubscription(autoCompound.address, 150000),
        createEventFilterThrottleSubscription(eventThrottle.address, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', {
          maxEventsPerWindow: 100,
          windowSizeBlocks: 1000,
        }),
      ];

      subscriptions.forEach(sub => {
        expect(sub.id).toBeDefined();
        expect(sub.eventSignature).toBeDefined();
      });
    });
  });

  describe('Builder with Deployment', () => {
    it('should build subscription matching deployed handler requirements', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      const subscription = new SubscriptionBuilder(handler.address)
        .onEvent('Approval(indexed address,indexed address,uint256)')
        .fromChain(1)
        .toChain(1)
        .withAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
        .build();

      expect(subscription.handlerAddress).toBe(handler.address);
      expect(subscription.eventSignature).toBe(
        'Approval(indexed address,indexed address,uint256)'
      );
      expect(subscription.sourceChainId).toBe(1);
      expect(subscription.targetChainId).toBe(1);
    });

    it('should validate subscription config before building', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      const config = {
        handlerAddress: handler.address,
        eventSignature: 'Transfer(indexed address,indexed address,uint256)',
        sourceChainId: 1,
        targetChainId: 42161,
        filters: {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
      };

      const validation = validateSubscriptionConfig(config);
      expect(validation.valid).toBe(true);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should deploy, subscribe, and prepare for event decoding', async () => {
      const decoder = createEventDecoder();

      // Deploy
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      // Subscribe
      const subscription = createAutoCompoundSubscription(
        handler.address,
        150000
      );

      // Prepare decoder (would decode events in production)
      expect(decoder).toBeDefined();
      expect(subscription.handlerAddress).toBe(handler.address);

      // Verify decoder has required methods
      expect(typeof decoder.parseSuccessEvent).toBe('function');
      expect(typeof decoder.parseErrorEvent).toBe('function');
      expect(typeof decoder.parseExecutionEvent).toBe('function');
    });

    it('should handle complex subscription with all builder methods', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      const subscription = new SubscriptionBuilder(handler.address)
        .onEvent(
          'SwapExactTokensForTokens(uint256,uint256,address[],address,uint256)'
        )
        .fromChain(1)
        .toChain(42161)
        .withAddress([
          '0xE592427A0AEce92De3Edee1F18E0157C05861564',
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        ])
        .withTopic(
          '0xd78ad95fa46c994b6551d0da85fc275fe1d5d37e674fc1cbff7b8d88d3969b'
        )
        .build();

      expect(subscription.eventSignature).toBe(
        'SwapExactTokensForTokens(uint256,uint256,address[],address,uint256)'
      );
      expect(subscription.sourceChainId).toBe(1);
      expect(subscription.targetChainId).toBe(42161);
    });
  });

  describe('Cross-Module Error Handling', () => {
    it('should reject deployment with invalid address', async () => {
      try {
        await deployAutoCompoundHandler({
          vaultAddress: 'invalid-address',
          tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          compoundThreshold: '1000000000000000000',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid');
      }
    });

    it('should reject subscription with invalid handler address', () => {
      const err = expect(() => {
        new SubscriptionBuilder('not-an-address')
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .build();
      });
      err.toThrow();
    });

    it('should reject subscription with invalid event signature', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      expect(() => {
        new SubscriptionBuilder(handler.address)
          .onEvent('InvalidSignature') // Missing parentheses
          .build();
      }).toThrow();
    });

    it('should reject subscription with invalid chain IDs', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      expect(() => {
        new SubscriptionBuilder(handler.address)
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .fromChain(99999) // Out of range
          .build();
      }).toThrow();
    });

    it('should reject subscription with invalid filter address', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      expect(() => {
        new SubscriptionBuilder(handler.address)
          .onEvent('Transfer(indexed address,indexed address,uint256)')
          .withAddress('not-an-address')
          .build();
      }).toThrow();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should support monitoring multiple DEX pairs', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      // Monitor multiple DEX routers
      const dexRouters = [
        '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3
        '0x68b3465833fb72B5A828cCEEA84B0bA361f38421', // Uniswap V3 02
        '0xd9e1cE17f2641f24aE83637ab915310313e10a55', // Sushi
      ];

      const subscriptions = dexRouters.map(router =>
        new SubscriptionBuilder(handler.address)
          .onEvent(
            'SwapExactTokensForTokens(uint256,uint256,address[],address,uint256)'
          )
          .fromChain(1)
          .toChain(1)
          .withAddress(router)
          .build()
      );

      expect(subscriptions).toHaveLength(3);
      subscriptions.forEach(sub => {
        expect(sub.id).toBeDefined();
        expect(sub.filters?.address).toBeDefined();
      });
    });

    it('should support cross-chain deployment strategy', async () => {
      const mainnetHandler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      const arbitrumHandler = await deployAutoCompoundHandler({
        vaultAddress: '0x2f2a2440d4a5b6a3d6a5b6a3d6a5b6a3d6a5b6a', // Arb WBTC
        tokenAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5f86', // Arb USDC
        compoundThreshold: '1000000000000000000',
      });

      // Create cross-chain subscription
      const subscription = new SubscriptionBuilder(mainnetHandler.address)
        .onEvent('Compound(uint256,uint256)')
        .fromChain(1) // Ethereum
        .toChain(42161) // Arbitrum
        .build();

      expect(subscription.sourceChainId).toBe(1);
      expect(subscription.targetChainId).toBe(42161);
    });

    it('should create rate-limited subscription for high-frequency events', async () => {
      const throttleHandler = await deployEventFilterThrottle({
        maxEventsPerWindow: 50,
        windowSizeBlocks: 100,
      });

      // Create rate-limited subscription
      const subscription = createEventFilterThrottleSubscription(
        throttleHandler.address,
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        {
          maxEventsPerWindow: 50,
          windowSizeBlocks: 100,
        }
      );

      expect(subscription.threshold).toBe(50);
      expect(subscription.windowSize).toBe(100);
    });
  });

  describe('Data Flow Integrity', () => {
    it('should preserve all metadata through deployment pipeline', async () => {
      const handler = await deployAutoCompoundHandler({
        compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      expect(handler.address).toMatch(/^0x[a-f0-9]{40}$/i);
      expect(handler.transactionHash).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(handler.blockNumber).toBeGreaterThan(0);
    });

    it('should generate consistent subscription IDs', async () => {
      const handler = await deployAutoCompoundHandler({
        compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      const sub1 = createAutoCompoundSubscription(handler.address, 150000);
      const sub2 = createAutoCompoundSubscription(handler.address, 150000);

      // Same inputs should produce same ID
      expect(sub1.id).toBe(sub2.id);
    });

    it('should validate data through all transformation layers', async () => {
      const handler = await deployAutoCompoundHandler({
        compoundToken: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        rewardToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      // Build with various methods
      const directSubscription = createAutoCompoundSubscription(
        handler.address,
        150000
      );

      const builtSubscription = new SubscriptionBuilder(handler.address)
        .onEvent(directSubscription.eventSignature)
        .build();

      // Both should be valid
      expect(validateSubscriptionConfig(directSubscription).valid).toBe(true);
      expect(validateSubscriptionConfig(builtSubscription).valid).toBe(true);
    });
  });

  describe('Module Composition', () => {
    it('should compose all three modules in realistic workflow', async () => {
      // 1. Deployment
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      // 2. Subscriptions
      const subscription = new SubscriptionBuilder(handler.address)
        .onEvent('Swap(address,uint256,uint256,uint256,uint256,address)')
        .fromChain(1)
        .toChain(42161)
        .withAddress('0xE592427A0AEce92De3Edee1F18E0157C05861564')
        .build();

      // 3. Decoders
      const decoder = createEventDecoder();

      // All components work together
      expect(handler.address).toBe(subscription.handlerAddress);
      expect(decoder).toBeDefined();
      expect(isValidAddress(handler.address)).toBe(true);
      expect(validateSubscriptionConfig(subscription).valid).toBe(true);
    });

    it('should handle module errors gracefully in composition', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      // Invalid subscription details but valid handler
      expect(() => {
        new SubscriptionBuilder(handler.address)
          .onEvent('Bad(') // Invalid signature
          .build();
      }).toThrow();

      // But handler itself is still valid
      expect(isValidAddress(handler.address)).toBe(true);
    });
  });

  describe('Scalability Tests', () => {
    it('should handle building multiple subscriptions efficiently', async () => {
      const handler = await deployAutoCompoundHandler({
        vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        compoundThreshold: '1000000000000000000',
      });

      const subscriptions = Array.from({ length: 100 }, (_, i) =>
        new SubscriptionBuilder(handler.address)
          .onEvent('Event(uint256)')
          .fromChain(1)
          .toChain(1)
          .build()
      );

      expect(subscriptions).toHaveLength(100);
      expect(new Set(subscriptions.map(s => s.id)).size).toBe(1); // All same signature = same ID
    });

    it('should handle multiple handlers without interference', async () => {
      const handlers = await Promise.all(
        Array.from({ length: 5 }, () =>
          deployAutoCompoundHandler({
            vaultAddress: '0x2260fac5e5542a773aa44fbcff9ffc5ed186a000',
            tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            compoundThreshold: '1000000000000000000',
          })
        )
      );

      const uniqueAddresses = new Set(handlers.map(h => h.address));
      expect(uniqueAddresses.size).toBe(5);
    });
  });
});
