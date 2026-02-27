/**
 * @module decoders/types
 * @description Type definitions for event decoding
 */

/**
 * Decoded event log
 */
export interface DecodedEvent {
  name: string;
  signature: string;
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  decoded: Record<string, unknown>;
}

/**
 * Handler success event
 */
export interface SuccessEvent {
  type: "success";
  action: string;
  address: string;
  blockNumber: number;
  transactionHash: string;
}

/**
 * Handler error event
 */
export interface ErrorEvent {
  type: "error";
  reason: string;
  data: string;
  address: string;
  blockNumber: number;
  transactionHash: string;
}

/**
 * Execution event
 */
export interface ExecutionEvent {
  type: "execution";
  step: string;
  result: boolean;
  address: string;
  blockNumber: number;
  transactionHash: string;
}

/**
 * Throttle event
 */
export interface ThrottleEvent {
  type: "throttle";
  eventCount: number;
  threshold: number;
  address: string;
  blockNumber: number;
  transactionHash: string;
}

/**
 * Scheduled execution event
 */
export interface ScheduledExecutionEvent {
  type: "scheduled";
  executedAt: number;
  nextExecutedAt: number;
  address: string;
  blockNumber: number;
  transactionHash: string;
}

/**
 * Cross call event
 */
export interface CrossCallEvent {
  type: "crosscall";
  callIndex: number;
  target: string;
  data: string;
  address: string;
  blockNumber: number;
  transactionHash: string;
}

/**
 * ABI for event decoding
 */
export interface ABI {
  type: string;
  name?: string;
  inputs?: AbiInput[];
  outputs?: AbiInput[];
  stateMutability?: string;
  constant?: boolean;
  payable?: boolean;
}

/**
 * ABI input
 */
export interface AbiInput {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiInput[];
  internalType?: string;
}
