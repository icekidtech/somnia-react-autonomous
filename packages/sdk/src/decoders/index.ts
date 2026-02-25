/**
 * Event decoders for Somnia reactive handler logs
 */

export interface DecodedEvent {
  eventName: string;
  data: Record<string, unknown>;
}

/**
 * Decode event logs from handler execution
 */
export function decodeEvent(log: string): DecodedEvent {
  // Implementation coming in Phase 3
  throw new Error("Not yet implemented");
}

export { DecodedEvent };
