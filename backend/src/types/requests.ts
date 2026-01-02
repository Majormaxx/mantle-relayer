import { z } from 'zod';

/**
 * Ethereum address validation.
 */
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * Hex string validation.
 */
export const hexStringSchema = z.string().regex(/^0x[a-fA-F0-9]*$/, 'Invalid hex string');

/**
 * Signature validation (65 bytes = 130 hex chars + 0x prefix).
 */
export const signatureSchema = z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format');

/**
 * BigInt string validation (for JSON serialization).
 */
export const bigintStringSchema = z.string().regex(/^\d+$/, 'Must be a numeric string');

/**
 * Relay request body schema.
 */
export const relayRequestSchema = z.object({
  paymasterAddress: addressSchema,
  metaTx: z.object({
    user: addressSchema,
    target: addressSchema,
    data: hexStringSchema,
    gasLimit: bigintStringSchema,
    nonce: bigintStringSchema,
    deadline: bigintStringSchema,
    signature: signatureSchema,
  }),
});

export type RelayRequest = z.infer<typeof relayRequestSchema>;

/**
 * Validate request body schema.
 */
export const validateRequestSchema = z.object({
  paymasterAddress: addressSchema,
  metaTx: z.object({
    user: addressSchema,
    target: addressSchema,
    data: hexStringSchema,
    gasLimit: bigintStringSchema,
    nonce: bigintStringSchema,
    deadline: bigintStringSchema,
  }),
});

export type ValidateRequest = z.infer<typeof validateRequestSchema>;

/**
 * Paymaster address params schema.
 */
export const paymasterParamsSchema = z.object({
  address: addressSchema,
});

export type PaymasterParams = z.infer<typeof paymasterParamsSchema>;

/**
 * User nonce params schema.
 */
export const userNonceParamsSchema = z.object({
  address: addressSchema,
  user: addressSchema,
});

export type UserNonceParams = z.infer<typeof userNonceParamsSchema>;

/**
 * Transaction hash params schema.
 */
export const txHashParamsSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
});

export type TxHashParams = z.infer<typeof txHashParamsSchema>;
