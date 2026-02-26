/**
 * @module decoders/event-decoder
 * @description Event decoding utilities for reactive handlers
 */

import {
  DecodedEvent,
  SuccessEvent,
  ErrorEvent,
  ExecutionEvent,
  ThrottleEvent,
  ScheduledExecutionEvent,
  CrossCallEvent,
  ABI,
} from './types';

/**
 * Event decoder for reactive handler events
 */
export class EventDecoder {
  private eventSignatures: Map<string, string> = new Map();
  private abi?: ABI[];

  constructor(abi?: ABI[]) {
    this.abi = abi;
    this.initializeSignatures();
  }

  /**
   * Initialize common event signatures
   */
  private initializeSignatures(): void {
    // Standard reactive handler events
    this.eventSignatures.set(
      '0x1234567890123456789012345678901234567890123456789012345678901234',
      'ReactiveSuccess(string)'
    );
    this.eventSignatures.set(
      '0x2345678901234567890123456789012345678901234567890123456789012345',
      'ReactiveError(bytes)'
    );
    this.eventSignatures.set(
      '0x3456789012345678901234567890123456789012345678901234567890123456',
      'ReactiveExecution(string,bool)'
    );
    this.eventSignatures.set(
      '0x4567890123456789012345678901234567890123456789012345678901234567',
      'ThrottleTriggered(uint256,uint256)'
    );
    this.eventSignatures.set(
      '0x5678901234567890123456789012345678901234567890123456789012345678',
      'ScheduledExecution(uint256,uint256)'
    );
    this.eventSignatures.set(
      '0x6789012345678901234567890123456789012345678901234567890123456789',
      'CrossCallEnqueued(uint256,address,bytes)'
    );
    this.eventSignatures.set(
      '0x7890123456789012345678901234567890123456789012345678901234567890',
      'CrossCallsExecuted(uint256,uint256)'
    );
  }

  /**
   * Decode a log entry
   */
  decode(
    log: {
      address: string;
      topics: string[];
      data: string;
      blockNumber: number;
      transactionHash: string;
      logIndex: number;
    }
  ): DecodedEvent | null {
    const signature = log.topics[0];
    const eventName = this.eventSignatures.get(signature) || 'UnknownEvent';

    return {
      name: eventName,
      signature: signature,
      address: log.address,
      topics: log.topics,
      data: log.data,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      logIndex: log.logIndex,
      decoded: this.decodeData(eventName, log.data),
    };
  }

  /**
   * Decode event data
   */
  private decodeData(eventName: string, data: string): Record<string, unknown> {
    // Simplified decoding - in production would use ethers.js Interface
    const result: Record<string, unknown> = {};

    if (eventName.includes('Success')) {
      result.action = data;
    } else if (eventName.includes('Error')) {
      result.reason = data;
    } else if (eventName.includes('Execution')) {
      const parts = data.split('|');
      result.step = parts[0];
      result.result = parts[1] === 'true';
    }

    return result;
  }

  /**
   * Parse success event
   */
  parseSuccessEvent(log: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
  }): SuccessEvent | null {
    if (log.topics[0] === this.eventSignatures.get('0x1234567890123456789012345678901234567890123456789012345678901234')) {
      return {
        type: 'success',
        action: log.data || 'unknown',
        address: log.address,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    }
    return null;
  }

  /**
   * Parse error event
   */
  parseErrorEvent(log: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
  }): ErrorEvent | null {
    if (log.topics[0] === this.eventSignatures.get('0x2345678901234567890123456789012345678901234567890123456789012345')) {
      return {
        type: 'error',
        reason: log.topics[1] || 'unknown',
        data: log.data || '',
        address: log.address,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    }
    return null;
  }

  /**
   * Parse execution event
   */
  parseExecutionEvent(log: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
  }): ExecutionEvent | null {
    if (log.topics[0] === this.eventSignatures.get('0x3456789012345678901234567890123456789012345678901234567890123456')) {
      return {
        type: 'execution',
        step: log.topics[1] || 'unknown',
        result: log.data !== '0x0',
        address: log.address,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    }
    return null;
  }

  /**
   * Parse throttle event
   */
  parseThrottleEvent(log: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
  }): ThrottleEvent | null {
    if (log.topics[0] === this.eventSignatures.get('0x4567890123456789012345678901234567890123456789012345678901234567')) {
      return {
        type: 'throttle',
        eventCount: parseInt(log.topics[1] || '0', 16),
        threshold: parseInt(log.data.slice(0, 66), 16),
        address: log.address,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    }
    return null;
  }

  /**
   * Parse scheduled execution event
   */
  parseScheduledExecutionEvent(log: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
  }): ScheduledExecutionEvent | null {
    if (log.topics[0] === this.eventSignatures.get('0x5678901234567890123456789012345678901234567890123456789012345678')) {
      return {
        type: 'scheduled',
        executedAt: parseInt(log.topics[1] || '0', 16),
        nextExecutedAt: parseInt(log.data.slice(0, 66), 16),
        address: log.address,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    }
    return null;
  }

  /**
   * Parse cross call event
   */
  parseCrossCallEvent(log: {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
  }): CrossCallEvent | null {
    if (log.topics[0] === this.eventSignatures.get('0x6789012345678901234567890123456789012345678901234567890123456789')) {
      return {
        type: 'crosscall',
        callIndex: parseInt(log.topics[1] || '0', 16),
        target: '0x' + (log.topics[2] || '').slice(-40),
        data: log.data || '',
        address: log.address,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      };
    }
    return null;
  }

  /**
   * Get event signature from hash
   */
  getSignature(hash: string): string | undefined {
    return this.eventSignatures.get(hash);
  }

  /**
   * Register custom event signature
   */
  registerSignature(hash: string, signature: string): void {
    this.eventSignatures.set(hash, signature);
  }
}

/**
 * Create event decoder for a handler type
 */
export function createEventDecoder(handlerType: string): EventDecoder {
  // Return decoder for specific handler type
  return new EventDecoder();
}
