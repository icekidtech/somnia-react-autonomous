/**
 * @file test/decoders.test.ts
 * @description Tests for event decoder utilities
 */

import { describe, it, expect, beforeEach } from "vitest";
import { EventDecoder, createEventDecoder } from "../src/decoders/event-decoder";
import type { DecodedEvent } from "../src/decoders/types";

describe("EventDecoder", () => {
  let decoder: EventDecoder;

  beforeEach(() => {
    decoder = new EventDecoder();
  });

  describe("Initialization", () => {
    it("should initialize with default signatures", () => {
      expect(decoder).toBeDefined();
      expect(
        decoder.getSignature("0x1234567890123456789012345678901234567890123456789012345678901234")
      ).toBeDefined();
    });

    it("should support custom ABI", () => {
      const customDecoder = new EventDecoder([
        {
          type: "event",
          name: "CustomEvent",
          inputs: [{ name: "value", type: "uint256" }],
        },
      ]);

      expect(customDecoder).toBeDefined();
    });
  });

  describe("Log Decoding", () => {
    it("should decode valid logs", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
        data: "0x68656c6c6f", // "hello" in hex
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        logIndex: 0,
      };

      const result = decoder.decode(log);

      expect(result).toBeDefined();
      expect(result?.address).toBe(log.address);
      expect(result?.blockNumber).toBe(log.blockNumber);
      expect(result?.transactionHash).toBe(log.transactionHash);
    });

    it("should handle unknown events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"],
        data: "0x",
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        logIndex: 0,
      };

      const result = decoder.decode(log);

      expect(result?.name).toBe("UnknownEvent");
    });
  });

  describe("Success Event Parsing", () => {
    it("should parse success events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x1234567890123456789012345678901234567890123456789012345678901234"],
        data: "0x48616e646c657220657865637574656420",
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseSuccessEvent(log);

      expect(result).toBeDefined();
      expect(result?.type).toBe("success");
      expect(result?.address).toBe(log.address);
    });
  });

  describe("Error Event Parsing", () => {
    it("should parse error events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x2345678901234567890123456789012345678901234567890123456789012345"],
        data: "0x496e76616c696420616464726573",
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseErrorEvent(log);

      expect(result).toBeDefined();
      expect(result?.type).toBe("error");
      expect(result?.address).toBe(log.address);
    });
  });

  describe("Execution Event Parsing", () => {
    it("should parse execution events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x3456789012345678901234567890123456789012345678901234567890123456"],
        data: "0x1",
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseExecutionEvent(log);

      expect(result).toBeDefined();
      expect(result?.type).toBe("execution");
      expect(result?.result).toBe(true);
    });

    it("should handle execution failure", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x3456789012345678901234567890123456789012345678901234567890123456"],
        data: "0x0",
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseExecutionEvent(log);

      expect(result?.result).toBe(false);
    });
  });

  describe("Throttle Event Parsing", () => {
    it("should parse throttle events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x4567890123456789012345678901234567890123456789012345678901234567"],
        data: "0x0000000000000000000000000000000000000000000000000000000000000064", // 100 in hex
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseThrottleEvent(log);

      expect(result).toBeDefined();
      expect(result?.type).toBe("throttle");
      expect(result?.threshold).toBe(100);
    });
  });

  describe("Scheduled Execution Event Parsing", () => {
    it("should parse scheduled execution events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x5678901234567890123456789012345678901234567890123456789012345678"],
        data: "0x0000000000000000000000000000000000000000000000000000000065a90000", // timestamp
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseScheduledExecutionEvent(log);

      expect(result).toBeDefined();
      expect(result?.type).toBe("scheduled");
      expect(result?.nextExecutedAt).toBeGreaterThan(0);
    });
  });

  describe("Cross Call Event Parsing", () => {
    it("should parse cross call events", () => {
      const log = {
        address: "0x1234567890123456789012345678901234567890",
        topics: ["0x6789012345678901234567890123456789012345678901234567890123456789"],
        data: "0x",
        blockNumber: 12345,
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      };

      const result = decoder.parseCrossCallEvent(log);

      expect(result).toBeDefined();
      expect(result?.type).toBe("crosscall");
      expect(result?.callIndex).toBeDefined();
    });
  });

  describe("Signature Registration", () => {
    it("should register custom signatures", () => {
      const customSig = "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
      decoder.registerSignature(customSig, "CustomEvent(address,uint256)");

      expect(decoder.getSignature(customSig)).toBe("CustomEvent(address,uint256)");
    });

    it("should override existing signatures", () => {
      const hash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const newSig = "OverriddenEvent(bytes32)";

      decoder.registerSignature(hash, newSig);

      expect(decoder.getSignature(hash)).toBe(newSig);
    });
  });
});

describe("Event Decoder Factory", () => {
  it("should create decoder for specific handler type", () => {
    const decoder = createEventDecoder("EventFilterThrottle");
    expect(decoder).toBeDefined();
    expect(decoder).toBeInstanceOf(EventDecoder);
  });

  it("should create decoder for AutoCompound handler", () => {
    const decoder = createEventDecoder("AutoCompound");
    expect(decoder).toBeDefined();
  });

  it("should create decoder for CronScheduler handler", () => {
    const decoder = createEventDecoder("CronScheduler");
    expect(decoder).toBeDefined();
  });

  it("should create decoder for LiquidationGuardian handler", () => {
    const decoder = createEventDecoder("LiquidationGuardian");
    expect(decoder).toBeDefined();
  });

  it("should create decoder for CrossCallOrchestrator handler", () => {
    const decoder = createEventDecoder("CrossCallOrchestrator");
    expect(decoder).toBeDefined();
  });
});
