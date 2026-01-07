/**
 * Type Guards
 * Runtime type checking utilities.
 */

import type { MetaTransaction, SignedMetaTransaction } from '../types/contracts.js';

/**
 * Check if a value is a valid Ethereum address.
 */
export function isAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Check if a value is a valid hex string.
 */
export function isHexString(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]*$/.test(value);
}

/**
 * Check if a value is a valid 65-byte signature.
 */
export function isSignature(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{130}$/.test(value);
}

/**
 * Check if a value is a MetaTransaction.
 */
export function isMetaTransaction(value: unknown): value is MetaTransaction {
  if (typeof value !== 'object' || value === null) return false;
  const tx = value as unknown as Record<string, unknown>;
  return (
    isAddress(tx['user']) &&
    isAddress(tx['target']) &&
    isHexString(tx['data']) &&
    typeof tx['gasLimit'] === 'bigint' &&
    typeof tx['nonce'] === 'bigint' &&
    typeof tx['deadline'] === 'bigint'
  );
}

/**
 * Check if a value is a SignedMetaTransaction.
 */
export function isSignedMetaTransaction(
  value: unknown
): value is SignedMetaTransaction {
  if (!isMetaTransaction(value)) return false;
  const tx = value as unknown as Record<string, unknown>;
  return isSignature(tx['signature']);
}

/**
 * Check if a deadline is still valid (not expired).
 */
export function isDeadlineValid(deadline: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return deadline > now;
}

/**
 * Check if a transaction hash is valid format.
 */
export function isTransactionHash(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);
}
