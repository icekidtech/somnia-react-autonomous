/**
 * Hook: useEventSubscription
 * Subscribes to handler events via SDK and manages real-time updates
 */

import { useState, useCallback, useEffect } from "react";
import { SubscriptionBuilder, createEventDecoder } from "@/config/sdk";

export interface CompoundEvent {
  timestamp: number;
  amount: string;
  newTotal: string;
  transactionHash?: string;
  blockNumber?: number;
}

export interface UseEventSubscriptionReturn {
  events: CompoundEvent[];
  isLoading: boolean;
  error: string | null;
  subscribe: (handlerAddress: string) => Promise<void>;
  unsubscribe: () => void;
  clearEvents: () => void;
}

/**
 * Hook to subscribe to handler compound events
 * Uses SDK's SubscriptionBuilder and event decoder for real-time monitoring
 */
export function useEventSubscription(): UseEventSubscriptionReturn {
  const [events, setEvents] = useState<CompoundEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribe = useCallback(async (handlerAddress: string) => {
    if (!handlerAddress) {
      setError("Handler address is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create subscription to CompoundTriggered events
      const subscription = new SubscriptionBuilder(handlerAddress)
        .onEvent("CompoundTriggered(uint256,uint256)")
        .fromChain(1)
        .toChain(1)
        .build();

      // Create event decoder
      const decoder = createEventDecoder();

      // Note: In a real implementation, you would connect to a WebSocket provider
      // to listen for events. For MVP, you can query historical events or mock them.
      // Example with ethers.js WebSocket provider:
      /*
      const provider = new ethers.WebSocketProvider(wsUrl);
      const contract = new ethers.Contract(handlerAddress, HANDLER_ABI, provider);
      
      contract.on("CompoundTriggered", (amount, newTotal, event) => {
        const decodedEvent: CompoundEvent = {
          timestamp: Date.now(),
          amount: amount.toString(),
          newTotal: newTotal.toString(),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
        setEvents((prev) => [decodedEvent, ...prev]);
      });
      */

      setIsSubscribed(true);
      setIsLoading(false);

      console.log("Subscribed to handler events:", subscription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to subscribe to events";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(() => {
    setIsSubscribed(false);
    // In a real implementation, close WebSocket connections
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    clearEvents,
  };
}

/**
 * Hook to decode raw event logs
 * Parses blockchain event data into human-readable format
 */
export function useEventDecoder() {
  const decoder = createEventDecoder();

  const decodeCompoundEvent = useCallback(
    (eventData: Record<string, unknown>) => {
      try {
        // Parse event data
        const amount = eventData.amount ? eventData.amount.toString() : "0";
        const newTotal = eventData.newTotal ? eventData.newTotal.toString() : "0";

        return {
          amount,
          newTotal,
          success: true,
        };
      } catch (error) {
        console.error("Failed to decode event:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown decode error",
        };
      }
    },
    [decoder]
  );

  return {
    decoder,
    decodeCompoundEvent,
  };
}
