import { verifyTypedData } from 'ethers';
import { getEIP712Domain, META_TX_TYPES, computeDomainSeparator, metaTxToValue } from './eip712.js';
import { getPaymasterContract, callContractMethod } from '../blockchain/contracts.js';
import type { SignedMetaTransaction } from '../../types/contracts.js';
import { InvalidSignatureError } from '../../utils/errors.js';
import { logger } from '../../monitoring/logger.js';

/**
 * Verify that a signed meta-transaction has a valid signature from the user.
 * Uses ethers verifyTypedData for EIP-712 signature verification.
 */
export async function verifyMetaTransactionSignature(
  paymasterAddress: string,
  signedMetaTx: SignedMetaTransaction
): Promise<boolean> {
  try {
    const domain = getEIP712Domain(paymasterAddress);
    const value = metaTxToValue(signedMetaTx);
    
    // Recover signer address from signature
    const recoveredAddress = verifyTypedData(domain, META_TX_TYPES, value, signedMetaTx.signature);
    
    // Check if recovered address matches the user
    const isValid = recoveredAddress.toLowerCase() === signedMetaTx.user.toLowerCase();
    
    if (!isValid) {
      logger.warn({
        paymasterAddress,
        user: signedMetaTx.user,
        recoveredAddress,
      }, 'Signature verification failed: address mismatch');
    }
    
    return isValid;
  } catch (error) {
    logger.error({ error: String(error), paymasterAddress }, 'Signature verification error');
    return false;
  }
}

/**
 * Verify signature and throw if invalid.
 */
export async function requireValidSignature(
  paymasterAddress: string,
  signedMetaTx: SignedMetaTransaction
): Promise<void> {
  const isValid = await verifyMetaTransactionSignature(paymasterAddress, signedMetaTx);
  
  if (!isValid) {
    throw new InvalidSignatureError(
      `Invalid signature for user ${signedMetaTx.user}`
    );
  }
}

/**
 * Recover the signer address from a signed meta-transaction.
 */
export function recoverMetaTxSigner(
  paymasterAddress: string,
  signedMetaTx: SignedMetaTransaction
): string {
  try {
    const domain = getEIP712Domain(paymasterAddress);
    const value = metaTxToValue(signedMetaTx);
    
    return verifyTypedData(domain, META_TX_TYPES, value, signedMetaTx.signature);
  } catch (error) {
    logger.error({ error: String(error) }, 'Failed to recover signer');
    throw new InvalidSignatureError('Failed to recover signer from signature');
  }
}

/**
 * Validate signature format.
 * Checks that the signature is a 65-byte hex string.
 */
export function isValidSignatureFormat(signature: string): boolean {
  // Must be 0x prefix + 130 hex chars (65 bytes)
  return /^0x[a-fA-F0-9]{130}$/.test(signature);
}

/**
 * Verify that the Paymaster's on-chain domain separator matches our computed one.
 * This ensures we're signing for the correct contract.
 */
export async function verifyDomainSeparator(paymasterAddress: string): Promise<boolean> {
  try {
    const paymaster = getPaymasterContract(paymasterAddress);
    const onChainSeparator = await callContractMethod<string>(paymaster, 'DOMAIN_SEPARATOR');
    const computedSeparator = computeDomainSeparator(paymasterAddress);
    
    const matches = onChainSeparator.toLowerCase() === computedSeparator.toLowerCase();
    
    if (!matches) {
      logger.warn({
        paymasterAddress,
        onChainSeparator,
        computedSeparator,
      }, 'Domain separator mismatch');
    }
    
    return matches;
  } catch (error) {
    logger.error({ error: String(error), paymasterAddress }, 'Failed to verify domain separator');
    return false;
  }
}
