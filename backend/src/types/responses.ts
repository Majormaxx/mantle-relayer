import type {
  PaymasterAnalytics,
  SpendingLimit,
  TransactionStatus,
} from './contracts.js';

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>[];
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

/**
 * Health check response.
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: {
    rpc: boolean;
    redis: boolean;
    relayerBalance: string;
    relayerApproved: boolean;
  };
}

/**
 * Relay transaction response.
 */
export interface RelayResponse {
  txHash: string;
  status: TransactionStatus;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

/**
 * Validate transaction response.
 */
export interface ValidateResponse {
  canExecute: boolean;
  errorCode: number;
  reason: string;
  estimatedGas?: string;
  estimatedCost?: string;
}

/**
 * Paymaster info response.
 */
export interface PaymasterInfoResponse {
  address: string;
  owner: string;
  balance: string;
  isLowBalance: boolean;
  isPaused: boolean;
  whitelistedContracts: string[];
  spendingLimits: {
    perTransactionLimit: string;
    dailyLimit: string;
    monthlyLimit: string;
    globalLimit: string;
    dailySpent: string;
    monthlySpent: string;
    globalSpent: string;
    remainingDaily: string;
    remainingMonthly: string;
    remainingGlobal: string;
  };
  analytics: {
    totalTransactions: string;
    totalGasSpent: string;
    uniqueUsers: string;
  };
}

/**
 * User nonce response.
 */
export interface NonceResponse {
  nonce: string;
  user: string;
  paymaster: string;
}

/**
 * Transaction status response.
 */
export interface TransactionStatusResponse {
  txHash: string;
  status: TransactionStatus;
  blockNumber?: number;
  blockHash?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  success?: boolean;
  error?: string;
}

/**
 * Metrics response (Prometheus format).
 */
export interface MetricsData {
  relaysTotal: number;
  relaysSuccessful: number;
  relaysFailed: number;
  gasSpentTotal: string;
  averageGasPerRelay: string;
  activePaymasters: number;
  relayerBalance: string;
  uptimeSeconds: number;
}

/**
 * Convert bigint values to strings for JSON serialization.
 */
export function serializeSpendingLimit(limit: SpendingLimit): PaymasterInfoResponse['spendingLimits'] {
  const remaining = (spent: bigint, limitValue: bigint): string => {
    if (limitValue === 0n) return 'unlimited';
    return (limitValue - spent).toString();
  };

  return {
    perTransactionLimit: limit.perTransactionLimit === 0n ? 'unlimited' : limit.perTransactionLimit.toString(),
    dailyLimit: limit.dailyLimit === 0n ? 'unlimited' : limit.dailyLimit.toString(),
    monthlyLimit: limit.monthlyLimit === 0n ? 'unlimited' : limit.monthlyLimit.toString(),
    globalLimit: limit.globalLimit === 0n ? 'unlimited' : limit.globalLimit.toString(),
    dailySpent: limit.dailySpent.toString(),
    monthlySpent: limit.monthlySpent.toString(),
    globalSpent: limit.globalSpent.toString(),
    remainingDaily: remaining(limit.dailySpent, limit.dailyLimit),
    remainingMonthly: remaining(limit.monthlySpent, limit.monthlyLimit),
    remainingGlobal: remaining(limit.globalSpent, limit.globalLimit),
  };
}

/**
 * Convert analytics to response format.
 */
export function serializeAnalytics(analytics: PaymasterAnalytics): PaymasterInfoResponse['analytics'] {
  return {
    totalTransactions: analytics.totalTransactions.toString(),
    totalGasSpent: analytics.totalGasSpent.toString(),
    uniqueUsers: analytics.uniqueUsers.toString(),
  };
}
