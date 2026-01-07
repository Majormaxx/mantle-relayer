/**
 * EIP-712 Signing Utilities
 * Security-critical module for signing meta-transactions.
 * Must match exactly with backend eip712.ts and smart contract MetaTxLib.sol.
 */

import {
  keccak256,
  AbiCoder,
  TypedDataDomain,
  TypedDataField,
  solidityPackedKeccak256,
  Signer,
} from 'ethers';
import type { MetaTransaction, SignedMetaTransaction } from './types/contracts.js';
import { META_TX_TYPES, META_TX_TYPE_STRING } from './utils/constants.js';
import { SigningError } from './errors/index.js';

/**
 * EIP-712 type hash for MetaTransaction.
 * Pre-computed for efficiency.
 */
export const META_TX_TYPEHASH = keccak256(
  new TextEncoder().encode(META_TX_TYPE_STRING)
);

/**
 * Build EIP-712 domain for a Paymaster contract.
 */
export function getEIP712Domain(
  paymasterAddress: string,
  chainId: number
): TypedDataDomain {
  return {
    name: 'Paymaster',
    version: '1',
    chainId: BigInt(chainId),
    verifyingContract: paymasterAddress,
  };
}

/**
 * Get EIP-712 types for signTypedData.
 */
export function getEIP712Types(): Record<string, TypedDataField[]> {
  return {
    MetaTransaction: [...META_TX_TYPES.MetaTransaction],
  };
}

/**
 * Convert MetaTransaction to value format for EIP-712 signing.
 * Converts bigints to their string representation for compatibility.
 */
export function metaTxToSigningValue(metaTx: MetaTransaction): Record<string, unknown> {
  return {
    user: metaTx.user,
    target: metaTx.target,
    data: metaTx.data,
    gasLimit: metaTx.gasLimit,
    nonce: metaTx.nonce,
    deadline: metaTx.deadline,
  };
}

/**
 * Hash a MetaTransaction struct (matching Solidity MetaTxLib.hashMetaTx).
 */
export function hashMetaTransaction(metaTx: MetaTransaction): string {
  const abiCoder = AbiCoder.defaultAbiCoder();

  return keccak256(
    abiCoder.encode(
      ['bytes32', 'address', 'address', 'bytes32', 'uint256', 'uint256', 'uint256'],
      [
        META_TX_TYPEHASH,
        metaTx.user,
        metaTx.target,
        keccak256(metaTx.data), // Hash dynamic data separately per EIP-712
        metaTx.gasLimit,
        metaTx.nonce,
        metaTx.deadline,
      ]
    )
  );
}

/**
 * Compute EIP-712 typed data hash.
 */
export function toTypedDataHash(
  domainSeparator: string,
  structHash: string
): string {
  return solidityPackedKeccak256(
    ['string', 'bytes32', 'bytes32'],
    ['\x19\x01', domainSeparator, structHash]
  );
}

/**
 * Compute domain separator for a Paymaster.
 */
export function computeDomainSeparator(
  paymasterAddress: string,
  chainId: number
): string {
  const abiCoder = AbiCoder.defaultAbiCoder();

  const DOMAIN_TYPEHASH = keccak256(
    new TextEncoder().encode(
      'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
    )
  );

  return keccak256(
    abiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        DOMAIN_TYPEHASH,
        keccak256(new TextEncoder().encode('Paymaster')),
        keccak256(new TextEncoder().encode('1')),
        chainId,
        paymasterAddress,
      ]
    )
  );
}

/**
 * Sign a MetaTransaction using EIP-712 typed data signing.
 * 
 * @param signer - ethers Signer (Wallet, BrowserProvider signer, etc.)
 * @param paymasterAddress - Address of the Paymaster contract
 * @param chainId - Chain ID for domain separation
 * @param metaTx - MetaTransaction to sign
 * @returns SignedMetaTransaction with signature
 * @throws SigningError if signing fails
 */
export async function signMetaTransaction(
  signer: Signer,
  paymasterAddress: string,
  chainId: number,
  metaTx: MetaTransaction
): Promise<SignedMetaTransaction> {
  try {
    // Verify signer address matches transaction user
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== metaTx.user.toLowerCase()) {
      throw new SigningError(
        `Signer address ${signerAddress} does not match transaction user ${metaTx.user}`,
        { signerAddress, txUser: metaTx.user }
      );
    }

    // Build EIP-712 domain and types
    const domain = getEIP712Domain(paymasterAddress, chainId);
    const types = getEIP712Types();
    const value = metaTxToSigningValue(metaTx);

    // Sign using ethers signTypedData
    const signature = await signer.signTypedData(domain, types, value);

    return {
      ...metaTx,
      signature,
    };
  } catch (error) {
    if (error instanceof SigningError) {
      throw error;
    }
    throw new SigningError(
      `Failed to sign meta-transaction: ${String(error)}`,
      { originalError: String(error) }
    );
  }
}

/**
 * Compute the full typed data hash for a MetaTransaction.
 * Useful for verifying signatures off-chain.
 */
export function computeTypedDataHash(
  paymasterAddress: string,
  chainId: number,
  metaTx: MetaTransaction
): string {
  const domainSeparator = computeDomainSeparator(paymasterAddress, chainId);
  const structHash = hashMetaTransaction(metaTx);
  return toTypedDataHash(domainSeparator, structHash);
}
