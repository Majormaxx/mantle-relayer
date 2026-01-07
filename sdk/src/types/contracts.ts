/**
 * Contract Types
 * TypeScript types matching Solidity struct definitions in smart contracts.
 */

/**
 * MetaTransaction structure matching IPaymaster.MetaTransaction.
 * Core gasless transaction format.
 */
export interface MetaTransaction {
  /** User address who signed the transaction */
  user: string;
  /** Target contract address to call */
  target: string;
  /** Encoded function call data */
  data: string;
  /** Maximum gas allowed for execution */
  gasLimit: bigint;
  /** User's nonce for replay protection */
  nonce: bigint;
  /** Expiration timestamp (unix seconds) */
  deadline: bigint;
}

/**
 * MetaTransaction with EIP-712 signature.
 */
export interface SignedMetaTransaction extends MetaTransaction {
  /** EIP-712 signature (65 bytes, hex-encoded with 0x prefix) */
  signature: string;
}

/**
 * SpendingLimit structure matching IPaymaster.SpendingLimit.
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
 * Analytics data from Paymaster.
 */
export interface PaymasterAnalytics {
  totalTransactions: bigint;
  totalGasSpent: bigint;
  uniqueUsers: bigint;
}

/**
 * Paymaster status and configuration.
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
 * Result from pre-flight validation (canExecuteMetaTransaction).
 */
export interface CanExecuteResult {
  canExecute: boolean;
  errorCode: number;
  reason: string;
}

/**
 * Result from transaction execution.
 */
export interface ExecuteResult {
  success: boolean;
  returnData: string;
  txHash: string;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
}

/**
 * Gas cost estimation.
 */
export interface CostEstimate {
  estimatedGas: bigint;
  estimatedCostWei: bigint;
}

/**
 * Transaction status tracking.
 */
export enum TransactionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REVERTED = 'reverted',
}

/**
 * Relay response from backend.
 */
export interface RelayResult {
  txHash: string;
  status: TransactionStatus;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
}

/**
 * Validation response from backend.
 */
export interface ValidateResult {
  canExecute: boolean;
  errorCode: number;
  reason: string;
  estimatedGas?: bigint | undefined;
  estimatedCost?: bigint | undefined;
}
