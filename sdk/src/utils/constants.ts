/**
 * SDK Constants and Configuration
 * Chain-specific values and EIP-712 type definitions
 */

/**
 * Supported Mantle network configurations.
 */
export const NETWORKS = {
  mantleTestnet: {
    chainId: 5003,
    name: 'Mantle Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  },
  mantleMainnet: {
    chainId: 5000,
    name: 'Mantle Mainnet',
    rpcUrl: 'https://rpc.mantle.xyz',
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

/**
 * EIP-712 type hash for MetaTransaction.
 * Must match MetaTxLib.sol in smart contracts.
 */
export const META_TX_TYPE_STRING =
  'MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)';

/**
 * EIP-712 typed data types for MetaTransaction.
 */
export const META_TX_TYPES = {
  MetaTransaction: [
    { name: 'user', type: 'address' },
    { name: 'target', type: 'address' },
    { name: 'data', type: 'bytes' },
    { name: 'gasLimit', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

/**
 * Default configuration values.
 */
export const DEFAULTS = {
  /** Default deadline: 5 minutes from now */
  deadlineOffsetSeconds: 300,
  /** Default HTTP timeout in milliseconds */
  httpTimeoutMs: 30000,
  /** Default retry attempts for failed requests */
  retryAttempts: 3,
  /** Base delay for exponential backoff in milliseconds */
  retryBaseDelayMs: 1000,
  /** Maximum gas limit allowed by system */
  maxGasLimit: 10_000_000n,
} as const;

/**
 * Pre-flight validation error codes matching smart contract.
 */
export const ERROR_CODES = {
  SUCCESS: 0,
  INSUFFICIENT_BALANCE: 1,
  CONTRACT_NOT_WHITELISTED: 2,
  FUNCTION_NOT_WHITELISTED: 3,
  INVALID_SIGNATURE: 4,
  INVALID_NONCE: 5,
  TRANSACTION_EXPIRED: 6,
  EXCEEDED_PER_TX_LIMIT: 7,
  EXCEEDED_DAILY_LIMIT: 8,
  EXCEEDED_MONTHLY_LIMIT: 9,
  EXCEEDED_GLOBAL_LIMIT: 10,
  PAUSED: 11,
  GAS_LIMIT_TOO_HIGH: 12,
} as const;

/**
 * Human-readable error messages for error codes.
 */
export const ERROR_MESSAGES: Record<number, string> = {
  [ERROR_CODES.SUCCESS]: 'Success',
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Paymaster has insufficient balance',
  [ERROR_CODES.CONTRACT_NOT_WHITELISTED]: 'Target contract is not whitelisted',
  [ERROR_CODES.FUNCTION_NOT_WHITELISTED]: 'Target function is not whitelisted',
  [ERROR_CODES.INVALID_SIGNATURE]: 'Invalid signature',
  [ERROR_CODES.INVALID_NONCE]: 'Invalid nonce',
  [ERROR_CODES.TRANSACTION_EXPIRED]: 'Transaction deadline has expired',
  [ERROR_CODES.EXCEEDED_PER_TX_LIMIT]: 'Exceeded per-transaction spending limit',
  [ERROR_CODES.EXCEEDED_DAILY_LIMIT]: 'Exceeded daily spending limit',
  [ERROR_CODES.EXCEEDED_MONTHLY_LIMIT]: 'Exceeded monthly spending limit',
  [ERROR_CODES.EXCEEDED_GLOBAL_LIMIT]: 'Exceeded global spending limit',
  [ERROR_CODES.PAUSED]: 'Paymaster is paused',
  [ERROR_CODES.GAS_LIMIT_TOO_HIGH]: 'Gas limit exceeds maximum allowed',
};
