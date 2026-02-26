/**
 * @module subscriptions/validators
 * @description Validation utilities for subscriptions
 */

import { isValidAddress } from '../deployment/verify';
import { EventSignature, SubscriptionConfig } from './types';

/**
 * Validate event signature format
 * @param signature Event signature to validate
 * @returns True if valid
 */
export function isValidEventSignature(signature: string): boolean {
  // Check format: EventName(type1,type2,...)
  return /^[A-Za-z_][A-Za-z0-9_]*\([^)]*\)$/.test(signature);
}

/**
 * Validate chain ID
 * @param chainId Chain ID to validate
 * @returns True if valid positive number
 */
export function isValidChainId(chainId: number): boolean {
  return chainId > 0 && Number.isInteger(chainId);
}

/**
 * Parse event signature
 * @param signature Event signature string
 * @returns Parsed event information
 */
export function parseEventSignature(signature: string): EventSignature {
  if (!isValidEventSignature(signature)) {
    throw new Error(`Invalid event signature format: ${signature}`);
  }

  const match = signature.match(/^([A-Za-z_][A-Za-z0-9_]*)\((.*)\)$/);
  if (!match) {
    throw new Error(`Cannot parse event signature: ${signature}`);
  }

  const [, name, inputsStr] = match;
  const parameters = inputsStr
    .split(',')
    .filter((s) => s.trim())
    .map((input) => {
      const trimmed = input.trim();
      const parts = trimmed.split(' ');
      const isIndexed = parts.includes('indexed');
      const type = parts.find((p) => !['indexed'].includes(p))!;
      const paramName = parts.filter((p) => !['indexed', type].includes(p))[0] || '';

      return {
        name: paramName,
        type,
        indexed: isIndexed,
      };
    });

  return {
    name,
    signature,
    parameters,
  };
}

/**
 * Validate subscription configuration
 * @param config Configuration to validate
 * @returns Validation result with validity and optional message
 */
export function validateSubscriptionConfig(config: SubscriptionConfig): { valid: boolean; message?: string } {
  if (!config || typeof config !== 'object') {
    return { valid: false, message: 'Configuration must be a non-null object' };
  }

  if (!config.handlerAddress || !isValidAddress(config.handlerAddress)) {
    return { valid: false, message: 'Invalid handler address' };
  }

  if (!config.eventSignature || !isValidEventSignature(config.eventSignature)) {
    return { valid: false, message: 'Invalid event signature format' };
  }

  if (config.sourceChainId !== undefined && !isValidChainId(config.sourceChainId)) {
    return { valid: false, message: 'Invalid source chain ID' };
  }

  if (config.targetChainId !== undefined && !isValidChainId(config.targetChainId)) {
    return { valid: false, message: 'Invalid target chain ID' };
  }

  return { valid: true };
}

/**
 * Generate subscription ID
 * @param eventSignature Event signature
 * @param handlerAddress Handler address
 * @returns Unique subscription ID
 */
export function generateSubscriptionId(eventSignature: string, handlerAddress: string): string {
  return `${handlerAddress.toLowerCase()}_${eventSignature.replace(/[(),\s]/g, '')}`;
}

/**
 * Validate event filter
 * @param filter Filter object to validate
 * @returns True if valid
 */
export function isValidFilter(filter: Record<string, unknown>): boolean {
  if (!filter || typeof filter !== 'object') {
    return false;
  }

  // Check address if present
  if (filter.address) {
    if (typeof filter.address === 'string') {
      if (!isValidAddress(filter.address)) {
        return false;
      }
    } else if (Array.isArray(filter.address)) {
      if (!filter.address.every((addr) => isValidAddress(addr))) {
        return false;
      }
    }
  }

  return true;
}
