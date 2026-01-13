/**
 * Mantle Gas-Less Relayer SDK
 * 
 * TypeScript SDK for securely signing and submitting gasless meta-transactions.
 * 
 * @example
 * ```typescript
 * import { MantleRelayerClient } from '@mantle-relayer/sdk';
 * import { Wallet } from 'ethers';
 * 
 * // Initialize client
 * const client = MantleRelayerClient.forTestnet('https://relay.example.com');
 * 
 * // Build and sign a transaction
 * const signer = new Wallet(privateKey);
 * const signedTx = await client.buildTransaction()
 *   .setPaymaster(paymasterAddress)
 *   .setTarget(contractAddress)
 *   .setCallData(encodedFunctionCall)
 *   .setGasLimit(100000n)
 *   .sign(signer);
 * 
 * // Submit to relayer
 * const result = await client.relay(paymasterAddress, signedTx);
 * console.log('Transaction hash:', result.txHash);
 * ```
 * 
 * @packageDocumentation
 */

// Main client
export { MantleRelayerClient, type ClientConfig } from './client.js';

// Transaction builder
export { MetaTransactionBuilder, type BuilderConfig } from './builder.js';

// Signing utilities
export {
  signMetaTransaction,
  hashMetaTransaction,
  computeDomainSeparator,
  computeTypedDataHash,
  getEIP712Domain,
  getEIP712Types,
  META_TX_TYPEHASH,
} from './signer.js';

// Types
export type {
  MetaTransaction,
  SignedMetaTransaction,
  SpendingLimit,
  PaymasterAnalytics,
  PaymasterInfo,
  CanExecuteResult,
  ExecuteResult,
  CostEstimate,
  RelayResult,
  ValidateResult,
} from './types/contracts.js';
export { TransactionStatus } from './types/contracts.js';

// Errors
export {
  RelayerSDKError,
  ValidationError,
  SigningError,
  NetworkError,
  RelayError,
  TransactionExpiredError,
  InsufficientBalanceError,
  InvalidNonceError,
  NotWhitelistedError,
  ConfigurationError,
} from './errors/index.js';

// Validation utilities
export {
  isAddress,
  isHexString,
  isSignature,
  isMetaTransaction,
  isSignedMetaTransaction,
  isDeadlineValid,
  isTransactionHash,
} from './validation/guards.js';

// Constants
export {
  NETWORKS,
  ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULTS,
  type NetworkName,
} from './utils/constants.js';
