/**
 * Input Validation Schemas
 * Zod schemas for runtime validation of SDK inputs.
 * Must align with backend validation in requests.ts.
 */

import { z } from 'zod';

/**
 * Ethereum address validation.
 * Matches 0x-prefixed 40-character hex string.
 */
export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  .transform((addr) => addr.toLowerCase());

/**
 * Hex string validation.
 * Matches 0x-prefixed hex string of any length.
 */
export const hexStringSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]*$/, 'Invalid hex string');

/**
 * Signature validation.
 * Must be 65 bytes (130 hex chars) + 0x prefix.
 */
export const signatureSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format (must be 65 bytes)');

/**
 * BigInt from string or number or bigint.
 */
export const bigintSchema = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((val) => BigInt(val));

/**
 * Positive bigint (greater than 0).
 */
export const positiveBigintSchema = bigintSchema.refine(
  (val) => val > 0n,
  'Must be greater than 0'
);

/**
 * Non-negative bigint (greater than or equal to 0).
 */
export const nonNegativeBigintSchema = bigintSchema.refine(
  (val) => val >= 0n,
  'Must be non-negative'
);

/**
 * MetaTransaction validation schema.
 */
export const metaTransactionSchema = z.object({
  user: addressSchema,
  target: addressSchema,
  data: hexStringSchema,
  gasLimit: positiveBigintSchema,
  nonce: nonNegativeBigintSchema,
  deadline: positiveBigintSchema,
});

/**
 * SignedMetaTransaction validation schema.
 */
export const signedMetaTransactionSchema = metaTransactionSchema.extend({
  signature: signatureSchema,
});

/**
 * Client configuration validation schema.
 */
export const clientConfigSchema = z.object({
  relayerUrl: z.string().url('Invalid relayer URL'),
  chainId: z.number().int().positive('Chain ID must be positive'),
  rpcUrl: z.string().url('Invalid RPC URL').optional(),
  timeout: z.number().int().positive().optional(),
  retryAttempts: z.number().int().nonnegative().optional(),
});

export type ClientConfigInput = z.input<typeof clientConfigSchema>;
export type ClientConfig = z.output<typeof clientConfigSchema>;
