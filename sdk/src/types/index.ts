// Core type definitions for the SDK
import type { BytesLike } from 'ethers';

/**
 * Meta-transaction structure matching the smart contract
 */
export interface MetaTransaction {
  user: string;
  target: string;
  data: BytesLike;
  gasLimit: bigint;
  nonce: bigint;
  deadline: bigint;
}

/**
 * Signed meta-transaction with signature
 */
export interface SignedMetaTransaction extends MetaTransaction {
  signature: string;
}

/**
 * Spending limit configuration
 */
export interface SpendingLimit {
  perTransactionLimit: bigint;
  dailyLimit: bigint;
  monthlyLimit: bigint;
  globalLimit: bigint;
  dailySpent: bigint;
  monthlySpent: bigint;
  globalSpent: bigint;
  lastResetDay: bigint;
  lastResetMonth: bigint;
}

/**
 * Paymaster analytics data
 */
export interface PaymasterAnalytics {
  totalTransactions: bigint;
  totalGasSpent: bigint;
  uniqueUsers: bigint;
}

/**
 * Complete Paymaster information
 */
export interface PaymasterInfo {
  address: string;
  owner: string;
  balance: bigint;
  isLowBalance: boolean;
  isPaused: boolean;
  whitelistedContracts: string[];
  spendingLimits: SpendingLimit;
  analytics: PaymasterAnalytics;
}

/**
 * Transaction execution result
 */
export interface GaslessTransactionResult {
  txHash: string;
  status: 'confirmed' | 'reverted' | 'pending';
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  blockNumber?: number;
}

/**
 * Validation result from backend
 */
export interface ValidationResult {
  canExecute: boolean;
  errorCode?: number;
  reason?: string;
  estimatedGas?: bigint;
  estimatedCost?: bigint;
}

/**
 * SDK configuration options
 */
export interface SDKConfig {
  relayerUrl: string;
  factoryAddress: string;
  chainId?: number;
  timeout?: number;
}

/**
 * Paymaster creation options
 */
export interface PaymasterCreateOptions {
  initialDeposit?: bigint;
  whitelistedContracts?: string[];
  dailyLimit?: bigint;
  monthlyLimit?: bigint;
}
