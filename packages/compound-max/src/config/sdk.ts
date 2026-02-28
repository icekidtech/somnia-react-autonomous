/**
 * SDK Configuration & Utilities
 * Initializes @somnia-react/autonomous-sdk for CompoundMax dApp
 */

import {
  deployAutoCompoundHandler,
  SubscriptionBuilder,
  createEventDecoder,
  type HandlerDeploymentResult,
} from "@somnia-react/autonomous-sdk";
import AutoCompoundHandlerABI from "../abis/AutoCompoundHandler.json";

/**
 * Re-export SDK functions for convenient access
 */
export { deployAutoCompoundHandler, SubscriptionBuilder, createEventDecoder };

/**
 * Handler ABI for contract interactions via wagmi/viem
 */
export const HANDLER_ABI = AutoCompoundHandlerABI as const;

/**
 * Supported networks for deployment
 */
export const SUPPORTED_NETWORKS = {
  ethereum: { id: 1, name: "Ethereum", rpcUrl: "https://eth.rpc.blxrbdn.com" },
  sepolia: { id: 11155111, name: "Sepolia", rpcUrl: "https://sepolia.infura.io/v3" },
  arbitrum: { id: 42161, name: "Arbitrum", rpcUrl: "https://arb1.arbitrum.io/rpc" },
  polygonMumbai: { id: 80001, name: "Polygon Mumbai", rpcUrl: "https://rpc-mumbai.maticvigil.com" },
} as const;

/**
 * Handler deployment helper with error handling
 */
export async function deployHandlerWithErrorHandling(
  vaultAddress: string,
  rewardTokenAddress: string,
  compoundThreshold: bigint,
  ownerAddress: string
): Promise<{
  success: boolean;
  data?: HandlerDeploymentResult;
  error?: string;
}> {
  try {
    if (!vaultAddress || !rewardTokenAddress || !ownerAddress) {
      return {
        success: false,
        error: "Missing required deployment parameters",
      };
    }

    const result = await deployAutoCompoundHandler({
      vaultAddress,
      tokenAddress: rewardTokenAddress,
      compoundThreshold: compoundThreshold.toString(),
      initialOwner: ownerAddress,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown deployment error";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Event subscription helper for monitoring compounds
 */
export function createHandlerSubscription(
  handlerAddress: string,
  rewardTokenAddress: string,
  vaultAddress: string
) {
  try {
    const subscription = new SubscriptionBuilder(handlerAddress)
      .onEvent("CompoundTriggered(uint256,uint256)")
      .fromChain(1) // Default to mainnet, can be overridden
      .toChain(1)
      .withAddress(rewardTokenAddress)
      .build();

    return subscription;
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return null;
  }
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: string | bigint, decimals: number = 18): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;

  if (remainder === 0n) {
    return whole.toString();
  }

  const pad = remainder.toString().padStart(decimals, "0");
  const trimmed = pad.replace(/0+$/, "");
  return `${whole}.${trimmed}`;
}

/**
 * Parse hex string to decimal with decimals
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const parts = amount.toString().split(".");
  const whole = BigInt(parts[0]) * BigInt(10 ** decimals);

  if (!parts[1]) {
    return whole;
  }

  const fraction = BigInt(parts[1].padEnd(decimals, "0"));
  return whole + fraction;
}

export default {
  deployAutoCompoundHandler,
  SubscriptionBuilder,
  createEventDecoder,
  HANDLER_ABI,
  SUPPORTED_NETWORKS,
  deployHandlerWithErrorHandling,
  createHandlerSubscription,
  formatTokenAmount,
  parseTokenAmount,
};
