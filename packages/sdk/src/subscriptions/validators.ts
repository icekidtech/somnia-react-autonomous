/**
 * @module subscriptions/validators
 * @description Validation utilities for subscriptions
 */

import { isValidAddress as isValidAddressImpl } from '../deployment/verify';
import { EventSignature, SubscriptionConfig } from './types';

/**
 * Validate Ethereum address format
 * @param address Address to validate
 * @returns True if valid
 */
export function isValidAddress(address: string): boolean {
  return isValidAddressImpl(address);
}

/**
 * Validate event signature format
 * @param signature Event signature to validate
 * @returns True if valid
 */
export function isValidEventSignature(signature: string): boolean {
  // Check format: EventName(type1,type2,...) 
  // Supports tuples like (uint256,bool) and arrays like uint256[]
  return /^[A-Za-z_][A-Za-z0-9_]*\([a-zA-Z0-9_\s,[\]()]+\)$/.test(signature);
}

/**
 * Validate chain ID
 * @param chainId Chain ID to validate
 * @returns True if valid positive number and within reasonable range
 */
export function isValidChainId(chainId: number): boolean {
  return chainId > 0 && chainId <= 0xffffffff && Number.isInteger(chainId);
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
  
  // Parse parameters respecting parenthesis nesting for tuples
  const parameters: Array<{ name: string; type: string; indexed: boolean }> = [];
  let current = '';
  let depth = 0;
  
  for (let i = 0; i < inputsStr.length; i++) {
    const char = inputsStr[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      if (current.trim()) {
        parameters.push(parseParameter(current.trim()));
      }
      current = '';
      continue;
    }
    current += char;
  }
  
  if (current.trim()) {
    parameters.push(parseParameter(current.trim()));
  }

  return {
    name,
    signature,
    parameters,
  };
}

/**
 * Parse a single parameter
 */
function parseParameter(param: string): { name: string; type: string; indexed: boolean } {
  const trimmed = param.trim();
  const parts = trimmed.split(/\s+/);
  const isIndexed = parts.includes('indexed');
  
  // Find the type (starts from the beginning, before any parameter name)
  let typeEnd = 0;
  let parenDepth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') parenDepth++;
    else if (trimmed[i] === ')') parenDepth--;
    else if (trimmed[i] === ' ' && parenDepth === 0) {
      typeEnd = i;
      break;
    }
  }
  
  if (typeEnd === 0) {
    // No space found, entire thing is the type
    return { name: '', type: trimmed, indexed: false };
  }
  
  const type = trimmed.substring(0, typeEnd).trim();
  const paramName = trimmed.substring(typeEnd).trim().replace('indexed', '').trim();

  return {
    name: paramName,
    type,
    indexed: isIndexed,
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

  // Check topics if present - topics should be valid hash strings (0x prefix + 64 hex chars for signature hash)
  if (filter.topics) {
    if (Array.isArray(filter.topics)) {
      if (!filter.topics.every((topic) => {
        if (typeof topic === 'string') {
          return /^0x[a-fA-F0-9]{64}$/.test(topic);
        }
        return false;
      })) {
        return false;
      }
    }
  }

  return true;
}
