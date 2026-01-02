/**
 * MetaTransaction structure matching IPaymaster.MetaTransaction in Solidity.
 */
export interface MetaTransaction {
  user: string;
  target: string;
  data: string;
  gasLimit: bigint;
  nonce: bigint;
  deadline: bigint;
}

/**
 * MetaTransaction with signature for relay submission.
 */
export interface SignedMetaTransaction extends MetaTransaction {
  signature: string;
}

/**
 * SpendingLimit structure matching IPaymaster.SpendingLimit in Solidity.
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
 * PlatformFee structure matching IRelayerHub.PlatformFee in Solidity.
 */
export interface PlatformFee {
  feePercentage: bigint;
  feeRecipient: string;
  enabled: boolean;
}

/**
 * Implementation version info from PaymasterFactory.
 */
export interface ImplementationVersion {
  implementation: string;
  timestamp: bigint;
  version: string;
  description: string;
  deprecated: boolean;
}

/**
 * Result from canExecuteMetaTransaction call.
 */
export interface CanExecuteResult {
  canExecute: boolean;
  errorCode: number;
  reason: string;
}

/**
 * Result from executeMetaTransaction call.
 */
export interface ExecuteResult {
  success: boolean;
  returnData: string;
  txHash: string;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
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
 * Transaction record for tracking.
 */
export interface TransactionRecord {
  id: string;
  paymasterAddress: string;
  metaTx: SignedMetaTransaction;
  status: TransactionStatus;
  txHash?: string;
  gasUsed?: bigint;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
