/**
 * Hook: useHandlerDeploy
 * Manages handler deployment via SDK with error handling and wallet integration
 */

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { deployHandlerWithErrorHandling, parseTokenAmount } from "@/config/sdk";
import type { HandlerDeploymentResult } from "@somnia-react/autonomous-sdk";

export interface DeploymentState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  txHash?: string;
  handlerAddress?: string;
}

export interface UseHandlerDeployReturn {
  deploy: (params: DeploymentParams) => Promise<HandlerDeploymentResult | null>;
  state: DeploymentState;
  reset: () => void;
}

export interface DeploymentParams {
  handlerName: string;
  vaultAddress: string;
  rewardTokenAddress: string;
  compoundTokenAddress: string;
  thresholdUsd: number;
  decimals?: number;
}

/**
 * Hook to handle handler deployment
 * Wraps SDK's deployAutoCompoundHandler with state management and error handling
 */
export function useHandlerDeploy(): UseHandlerDeployReturn {
  const { address: walletAddress, isConnected } = useAccount();
  const [state, setState] = useState<DeploymentState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const deploy = useCallback(
    async (params: DeploymentParams): Promise<HandlerDeploymentResult | null> => {
      // Validate wallet connection
      if (!isConnected || !walletAddress) {
        const error = "Wallet not connected";
        setState({ isLoading: false, error, success: false });
        return null;
      }

      // Validate required parameters
      if (
        !params.vaultAddress ||
        !params.rewardTokenAddress ||
        !params.compoundTokenAddress ||
        !params.handlerName ||
        params.thresholdUsd <= 0
      ) {
        const error = "Missing or invalid deployment parameters";
        setState({ isLoading: false, error, success: false });
        return null;
      }

      // Validate Ethereum addresses
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (
        !addressRegex.test(params.vaultAddress) ||
        !addressRegex.test(params.rewardTokenAddress) ||
        !addressRegex.test(params.compoundTokenAddress)
      ) {
        const error = "Invalid Ethereum address format";
        setState({ isLoading: false, error, success: false });
        return null;
      }

      setState({ isLoading: true, error: null, success: false });

      try {
        // Convert USD threshold to wei (assuming 18 decimals)
        const decimals = params.decimals || 18;
        const thresholdInWei = parseTokenAmount(params.thresholdUsd.toString(), decimals);

        // Call SDK deployment function
        const result = await deployHandlerWithErrorHandling(
          params.vaultAddress,
          params.rewardTokenAddress,
          thresholdInWei,
          walletAddress
        );

        if (!result.success) {
          setState({
            isLoading: false,
            error: result.error || "Deployment failed",
            success: false,
          });
          return null;
        }

        if (result.data) {
          setState({
            isLoading: false,
            error: null,
            success: true,
            txHash: result.data.transactionHash,
            handlerAddress: result.data.address,
          });
          return result.data;
        }

        setState({
          isLoading: false,
          error: "Deployment returned no data",
          success: false,
        });
        return null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown deployment error";
        setState({
          isLoading: false,
          error: errorMessage,
          success: false,
        });
        return null;
      }
    },
    [isConnected, walletAddress]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    deploy,
    state,
    reset,
  };
}
