/**
 * API Request/Response Types
 * Types for relay backend API communication.
 */

import { z } from 'zod';

/**
 * API response wrapper schema.
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
    meta: z
      .object({
        requestId: z.string(),
        timestamp: z.string(),
      })
      .optional(),
  });

/**
 * Relay response schema.
 */
export const relayResponseDataSchema = z.object({
  txHash: z.string(),
  status: z.enum(['pending', 'submitted', 'confirmed', 'failed', 'reverted']),
  gasUsed: z.string(),
  effectiveGasPrice: z.string(),
});

export const relayResponseSchema = apiResponseSchema(relayResponseDataSchema);

/**
 * Validate response schema.
 */
export const validateResponseDataSchema = z.object({
  canExecute: z.boolean(),
  errorCode: z.number(),
  reason: z.string(),
  estimatedGas: z.string().optional(),
  estimatedCost: z.string().optional(),
});

export const validateResponseSchema = apiResponseSchema(validateResponseDataSchema);

/**
 * Paymaster info response schema.
 */
export const paymasterInfoResponseDataSchema = z.object({
  address: z.string(),
  owner: z.string(),
  balance: z.string(),
  isLowBalance: z.boolean(),
  isPaused: z.boolean(),
  whitelistedContracts: z.array(z.string()),
  spendingLimits: z.object({
    perTransactionLimit: z.string(),
    dailyLimit: z.string(),
    monthlyLimit: z.string(),
    globalLimit: z.string(),
    dailySpent: z.string(),
    monthlySpent: z.string(),
    globalSpent: z.string(),
  }),
  analytics: z.object({
    totalTransactions: z.string(),
    totalGasSpent: z.string(),
    uniqueUsers: z.string(),
  }),
});

export const paymasterInfoResponseSchema = apiResponseSchema(
  paymasterInfoResponseDataSchema
);

/**
 * Nonce response schema.
 */
export const nonceResponseDataSchema = z.object({
  nonce: z.string(),
});

export const nonceResponseSchema = apiResponseSchema(nonceResponseDataSchema);

/**
 * Cost estimate response schema.
 */
export const costEstimateResponseDataSchema = z.object({
  estimatedGas: z.string(),
  estimatedCostWei: z.string(),
});

export const costEstimateResponseSchema = apiResponseSchema(
  costEstimateResponseDataSchema
);

// Type exports
export type RelayResponseData = z.infer<typeof relayResponseDataSchema>;
export type ValidateResponseData = z.infer<typeof validateResponseDataSchema>;
export type PaymasterInfoResponseData = z.infer<typeof paymasterInfoResponseDataSchema>;
export type NonceResponseData = z.infer<typeof nonceResponseDataSchema>;
export type CostEstimateResponseData = z.infer<typeof costEstimateResponseDataSchema>;
