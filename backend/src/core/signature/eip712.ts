import { keccak256, AbiCoder, TypedDataDomain, TypedDataField, solidityPackedKeccak256 } from 'ethers';
import type { MetaTransaction } from '../../types/contracts.js';
import { network as networkConfig } from '../../config/index.js';

/**
 * EIP-712 type hash for MetaTransaction.
 * Must match MetaTxLib.sol: keccak256("MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)")
 */
export const META_TX_TYPEHASH = keccak256(
  new TextEncoder().encode(
    'MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)'
  )
);

/**
 * EIP-712 domain for a Paymaster contract.
 */
export function getEIP712Domain(paymasterAddress: string): TypedDataDomain {
  return {
    name: 'Paymaster',
    version: '1',
    chainId: BigInt(networkConfig.chainId),
    verifyingContract: paymasterAddress,
  };
}

/**
 * EIP-712 types for MetaTransaction.
 */
export const META_TX_TYPES: Record<string, TypedDataField[]> = {
  MetaTransaction: [
    { name: 'user', type: 'address' },
    { name: 'target', type: 'address' },
    { name: 'data', type: 'bytes' },
    { name: 'gasLimit', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * EIP-712 value object for MetaTransaction.
 */
export interface MetaTxValue {
  user: string;
  target: string;
  data: string;
  gasLimit: bigint;
  nonce: bigint;
  deadline: bigint;
}

/**
 * Convert MetaTransaction to EIP-712 value format.
 */
export function metaTxToValue(metaTx: MetaTransaction): MetaTxValue {
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
export function hashMetaTx(metaTx: MetaTransaction): string {
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
export function toTypedDataHash(domainSeparator: string, structHash: string): string {
  return solidityPackedKeccak256(
    ['string', 'bytes32', 'bytes32'],
    ['\x19\x01', domainSeparator, structHash]
  );
}

/**
 * Compute domain separator for a Paymaster.
 */
export function computeDomainSeparator(paymasterAddress: string): string {
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
        networkConfig.chainId,
        paymasterAddress,
      ]
    )
  );
}
