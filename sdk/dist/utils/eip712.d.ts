import { ethers, TypedDataDomain, TypedDataField, Signer } from 'ethers';
import type { MetaTransaction } from '../types/index.js';
/**
 * EIP-712 domain for Paymaster contracts
 */
export declare function getEIP712Domain(paymasterAddress: string, chainId: number): TypedDataDomain;
/**
 * EIP-712 types for MetaTransaction
 */
export declare const META_TX_TYPES: Record<string, TypedDataField[]>;
/**
 * Sign a meta-transaction with EIP-712
 */
export declare function signMetaTransaction(signer: Signer, paymasterAddress: string, chainId: number, metaTx: MetaTransaction): Promise<string>;
/**
 * Create a deadline timestamp (current time + duration in seconds)
 */
export declare function createDeadline(durationSeconds?: number): bigint;
/**
 * Encode a function call for meta-transaction data
 */
export declare function encodeFunctionCall(contractInterface: ethers.Interface, functionName: string, args: any[]): string;
//# sourceMappingURL=eip712.d.ts.map