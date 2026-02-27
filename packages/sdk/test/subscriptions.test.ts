/**
 * @file test/subscriptions.test.ts
 * @description Tests for subscription utilities
 */

import { describe, it, expect } from "vitest";
import {
  isValidEventSignature,
  isValidAddress,
  isValidChainId,
  parseEventSignature,
  validateSubscriptionConfig,
  generateSubscriptionId,
  isValidFilter,
} from "../src/subscriptions/validators";
import {
  SubscriptionBuilder,
  createEventFilterThrottleSubscription,
  createAutoCompoundSubscription,
  createCronSchedulerSubscription,
  createLiquidationGuardianSubscription,
  createCrossCallOrchestratorSubscription,
} from "../src/subscriptions/subscription-builder";
import type { SubscriptionConfig } from "../src/subscriptions/types";

describe("Subscription Validators", () => {
  describe("Event Signature Validation", () => {
    it("should validate valid event signatures", () => {
      expect(isValidEventSignature("Transfer(address,address,uint256)")).toBe(true);
      expect(isValidEventSignature("Approval(address,address,uint256)")).toBe(true);
      expect(isValidEventSignature("Swap(address,uint256,uint256,address)")).toBe(true);
    });

    it("should reject invalid signatures", () => {
      expect(isValidEventSignature("invalid")).toBe(false);
      expect(isValidEventSignature("Transfer()")).toBe(false);
      expect(isValidEventSignature("")).toBe(false);
    });

    it("should handle complex type signatures", () => {
      expect(isValidEventSignature("ComplexEvent(tuple,address[],bytes32)")).toBe(true);
      expect(isValidEventSignature("CustomEvent(CustomType)")).toBe(true);
    });
  });

  describe("Address Validation", () => {
    it("should validate correct addresses", () => {
      expect(isValidAddress("0x1234567890123456789012345678901234567890")).toBe(true);
      expect(isValidAddress("0xABCDEF1234567890ABCDEF1234567890ABCDEF12")).toBe(true);
    });

    it("should reject invalid addresses", () => {
      expect(isValidAddress("0xinvalid")).toBe(false);
      expect(isValidAddress("not-an-address")).toBe(false);
      expect(isValidAddress("0x123")).toBe(false);
      expect(isValidAddress("")).toBe(false);
    });

    it("should handle zero address", () => {
      expect(isValidAddress("0x0000000000000000000000000000000000000000")).toBe(true);
    });
  });

  describe("Chain ID Validation", () => {
    it("should validate common chain IDs", () => {
      expect(isValidChainId(1)).toBe(true); // Ethereum
      expect(isValidChainId(5)).toBe(true); // Goerli
      expect(isValidChainId(11155111)).toBe(true); // Sepolia
    });

    it("should validate custom chain IDs", () => {
      expect(isValidChainId(100)).toBe(true); // xDai
      expect(isValidChainId(42161)).toBe(true); // Arbitrum
      expect(isValidChainId(137)).toBe(true); // Polygon
    });

    it("should reject invalid chain IDs", () => {
      expect(isValidChainId(0)).toBe(false);
      expect(isValidChainId(-1)).toBe(false);
      expect(isValidChainId(999999999999)).toBe(false);
    });
  });

  describe("Event Signature Parsing", () => {
    it("should parse simple signatures", () => {
      const result = parseEventSignature("Transfer(address,address,uint256)");
      expect(result.name).toBe("Transfer");
      expect(result.parameters).toHaveLength(3);
    });

    it("should handle signatures with tuples", () => {
      const result = parseEventSignature("ComplexEvent(address,(uint256,bool),bytes32)");
      expect(result.name).toBe("ComplexEvent");
      expect(result.parameters).toHaveLength(3);
    });

    it("should throw on invalid signatures", () => {
      expect(() => parseEventSignature("invalid")).toThrow();
      expect(() => parseEventSignature("")).toThrow();
    });
  });

  describe("Subscription Configuration Validation", () => {
    it("should validate complete config", () => {
      const config: SubscriptionConfig = {
        id: "sub-1",
        sourceChainId: 1,
        targetChainId: 1,
        eventSignature: "Transfer(address,address,uint256)",
        handlerAddress: "0x1234567890123456789012345678901234567890",
      };

      const result = validateSubscriptionConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should validate cross-chain config", () => {
      const config: SubscriptionConfig = {
        id: "cross-chain-1",
        sourceChainId: 1,
        targetChainId: 137,
        eventSignature: "Swap(address,uint256,uint256,address)",
        handlerAddress: "0x1234567890123456789012345678901234567890",
      };

      const result = validateSubscriptionConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid event signature", () => {
      const config: any = {
        id: "bad-sig",
        sourceChainId: 1,
        targetChainId: 1,
        eventSignature: "invalid",
        handlerAddress: "0x1234567890123456789012345678901234567890",
      };

      const result = validateSubscriptionConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject invalid handler address", () => {
      const config: any = {
        id: "bad-addr",
        sourceChainId: 1,
        targetChainId: 1,
        eventSignature: "Transfer(address,address,uint256)",
        handlerAddress: "not-an-address",
      };

      const result = validateSubscriptionConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe("Subscription ID Generation", () => {
    it("should generate consistent IDs", () => {
      const id1 = generateSubscriptionId(
        "Transfer(address,address,uint256)",
        "0x1234567890123456789012345678901234567890"
      );
      const id2 = generateSubscriptionId(
        "Transfer(address,address,uint256)",
        "0x1234567890123456789012345678901234567890"
      );
      expect(id1).toBe(id2);
    });

    it("should generate different IDs for different inputs", () => {
      const id1 = generateSubscriptionId(
        "Transfer(address,address,uint256)",
        "0x1234567890123456789012345678901234567890"
      );
      const id2 = generateSubscriptionId(
        "Approval(address,address,uint256)",
        "0x1234567890123456789012345678901234567890"
      );
      expect(id1).not.toBe(id2);
    });
  });

  describe("Filter Validation", () => {
    it("should validate topic filters", () => {
      expect(
        isValidFilter({
          topics: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
        })
      ).toBe(true);
    });

    it("should validate address filters", () => {
      expect(
        isValidFilter({
          address: "0x1234567890123456789012345678901234567890",
        })
      ).toBe(true);
    });

    it("should validate combined filters", () => {
      expect(
        isValidFilter({
          address: "0x1234567890123456789012345678901234567890",
          topics: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
        })
      ).toBe(true);
    });

    it("should reject invalid filters", () => {
      expect(
        isValidFilter({
          address: "invalid",
        })
      ).toBe(false);

      expect(
        isValidFilter({
          topics: ["too-short"],
        })
      ).toBe(false);
    });
  });
});

describe("Subscription Builder", () => {
  describe("Fluent API", () => {
    it("should build subscription with all options", () => {
      const sub = new SubscriptionBuilder()
        .onEvent("Transfer(address,address,uint256)")
        .fromChain(1)
        .toChain(1)
        .withAddress("0x1234567890123456789012345678901234567890")
        .build();

      expect(sub).toBeDefined();
      expect(sub.eventSignature).toBe("Transfer(address,address,uint256)");
      expect(sub.sourceChainId).toBe(1);
      expect(sub.targetChainId).toBe(1);
    });

    it("should build with minimal config", () => {
      const sub = new SubscriptionBuilder().onEvent("Transfer(address,address,uint256)").build();

      expect(sub).toBeDefined();
      expect(sub.eventSignature).toBe("Transfer(address,address,uint256)");
    });

    it("should throw on invalid signature", () => {
      expect(() => {
        new SubscriptionBuilder().onEvent("invalid").build();
      }).toThrow();
    });

    it("should throw on invalid address filter", () => {
      expect(() => {
        new SubscriptionBuilder()
          .onEvent("Transfer(address,address,uint256)")
          .withAddress("not-an-address")
          .build();
      }).toThrow();
    });
  });

  describe("Factory Functions", () => {
    it("should create EventFilterThrottle subscription", () => {
      const sub = createEventFilterThrottleSubscription(
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        { maxEventsPerWindow: 100, windowSizeBlocks: 50 }
      );

      expect(sub).toBeDefined();
      expect(sub.handlerAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should create AutoCompound subscription", () => {
      const sub = createAutoCompoundSubscription("0x1234567890123456789012345678901234567890", {
        vaultAddress: "0x2345678901234567890123456789012345678901",
      });

      expect(sub).toBeDefined();
      expect(sub.handlerAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should create CronScheduler subscription", () => {
      const sub = createCronSchedulerSubscription("0x1234567890123456789012345678901234567890", {
        intervalBlocks: 100,
      });

      expect(sub).toBeDefined();
      expect(sub.handlerAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should create LiquidationGuardian subscription", () => {
      const sub = createLiquidationGuardianSubscription(
        "0x1234567890123456789012345678901234567890",
        { oracleAddress: "0x2345678901234567890123456789012345678901" }
      );

      expect(sub).toBeDefined();
      expect(sub.handlerAddress).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should create CrossCallOrchestrator subscription", () => {
      const sub = createCrossCallOrchestratorSubscription(
        "0x1234567890123456789012345678901234567890",
        { maxQueueSize: 50 }
      );

      expect(sub).toBeDefined();
      expect(sub.handlerAddress).toBe("0x1234567890123456789012345678901234567890");
    });
  });
});
