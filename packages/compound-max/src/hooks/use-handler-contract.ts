/**
 * Hook: useHandlerContract
 * Contract interactions for reading state and executing transactions
 */

import { useState, useCallback } from "react";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { HANDLER_ABI } from "@/config/sdk";
import type { Address } from "viem";

export interface HandlerContractState {
  rewardBalance: string | null;
  shouldCompound: boolean | null;
  minCompoundAmount: string | null;
  owner: string | null;
  totalCompounds: string | null;
}

export interface UseHandlerContractReturn {
  state: HandlerContractState;
  isLoading: boolean;
  error: string | null;
  manualCompound: () => Promise<void>;
  updateConfig: (vaultAddress: string, minAmount: string) => Promise<void>;
  transferOwnership: (newOwner: string) => Promise<void>;
}

/**
 * Hook for handler contract interactions
 * Reads contract state and executes transactions
 */
export function useHandlerContract(handlerAddress?: Address | string) {
  const { isConnected } = useAccount();
  const [state, setState] = useState<HandlerContractState>({
    rewardBalance: null,
    shouldCompound: null,
    minCompoundAmount: null,
    owner: null,
    totalCompounds: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read reward balance
  const { data: rewardBalance, refetch: refetchBalance } = useContractRead({
    address: handlerAddress as Address,
    abi: HANDLER_ABI,
    functionName: "getRewardBalance",
    enabled: !!handlerAddress && isConnected,
  });

  // Read shouldCompound
  const { data: shouldCompound, refetch: refetchShouldCompound } = useContractRead({
    address: handlerAddress as Address,
    abi: HANDLER_ABI,
    functionName: "shouldCompound",
    enabled: !!handlerAddress && isConnected,
  });

  // Read minCompoundAmount
  const { data: minCompoundAmount, refetch: refetchMinAmount } = useContractRead({
    address: handlerAddress as Address,
    abi: HANDLER_ABI,
    functionName: "minCompoundAmount",
    enabled: !!handlerAddress && isConnected,
  });

  // Read owner
  const { data: owner, refetch: refetchOwner } = useContractRead({
    address: handlerAddress as Address,
    abi: HANDLER_ABI,
    functionName: "owner",
    enabled: !!handlerAddress && isConnected,
  });

  // Read compoundsExecuted
  const { data: totalCompounds, refetch: refetchTotalCompounds } = useContractRead({
    address: handlerAddress as Address,
    abi: HANDLER_ABI,
    functionName: "compoundsExecuted",
    enabled: !!handlerAddress && isConnected,
  });

  // Update state when data changes
  const updateState = useCallback(() => {
    setState({
      rewardBalance: rewardBalance ? rewardBalance.toString() : null,
      shouldCompound: shouldCompound ? (Boolean(shouldCompound) as boolean) : null,
      minCompoundAmount: minCompoundAmount ? minCompoundAmount.toString() : null,
      owner: owner ? (owner as string) : null,
      totalCompounds: totalCompounds ? totalCompounds.toString() : null,
    });
  }, [rewardBalance, shouldCompound, minCompoundAmount, owner, totalCompounds]);

  // Call updateState whenever data changes
  if (rewardBalance !== undefined || shouldCompound !== undefined) {
    updateState();
  }

  // Manual compound execution
  const manualCompound = useCallback(async () => {
    if (!handlerAddress || !isConnected) {
      setError("Not connected or invalid handler");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation with wagmi, use:
      // const { hash } = await writeContractAsync({
      //   address: handlerAddress,
      //   abi: HANDLER_ABI,
      //   functionName: 'manualCompound',
      // });

      // For now, simulate the transaction
      console.log("Manual compound executed for:", handlerAddress);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refetch all data after execution
      await Promise.all([
        refetchBalance?.(),
        refetchShouldCompound?.(),
        refetchMinAmount?.(),
      ]);

      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to execute manual compound";
      setError(message);
      setIsLoading(false);
    }
  }, [handlerAddress, isConnected, refetchBalance, refetchShouldCompound, refetchMinAmount]);

  // Update config (threshold, vault)
  const updateConfig = useCallback(
    async (vaultAddress: string, minAmount: string) => {
      if (!handlerAddress || !isConnected) {
        setError("Not connected or invalid handler");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation with wagmi:
        // const { hash } = await writeContractAsync({
        //   address: handlerAddress,
        //   abi: HANDLER_ABI,
        //   functionName: 'updateConfig',
        //   args: [vaultAddress, BigInt(minAmount)],
        // });

        console.log("Config updated for:", handlerAddress, { vaultAddress, minAmount });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refetch data
        await Promise.all([refetchMinAmount?.(), refetchShouldCompound?.()]);

        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update config";
        setError(message);
        setIsLoading(false);
      }
    },
    [handlerAddress, isConnected, refetchMinAmount, refetchShouldCompound]
  );

  // Transfer ownership
  const transferOwnership = useCallback(
    async (newOwner: string) => {
      if (!handlerAddress || !isConnected) {
        setError("Not connected or invalid handler");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation with wagmi:
        // const { hash } = await writeContractAsync({
        //   address: handlerAddress,
        //   abi: HANDLER_ABI,
        //   functionName: 'transferOwnership',
        //   args: [newOwner],
        // });

        console.log("Ownership transferred to:", newOwner);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refetch owner
        await refetchOwner?.();

        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to transfer ownership";
        setError(message);
        setIsLoading(false);
      }
    },
    [handlerAddress, isConnected, refetchOwner]
  );

  return {
    state,
    isLoading,
    error,
    manualCompound,
    updateConfig,
    transferOwnership,
  };
}
