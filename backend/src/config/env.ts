import { z } from 'zod';
import { config } from 'dotenv';

// Load .env file
config();

/**
 * Environment configuration schema with strict validation.
 * All required values must be present and valid.
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Mantle Network
  MANTLE_RPC_URL: z.string().url('Invalid RPC URL'),
  MANTLE_CHAIN_ID: z.string().transform(Number).default('5003'),

  // Contract Addresses
  RELAYER_HUB_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid RelayerHub address'),
  PAYMASTER_FACTORY_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid PaymasterFactory address'),

  // Relayer Wallet
  RELAYER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid private key format'),

  // Redis (optional for development)
  REDIS_URL: z.string().url().optional(),

  // Supabase (optional for transaction logging)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_MAX_PER_MINUTE: z.string().transform(Number).default('100'),
  RATE_LIMIT_MAX_PER_USER: z.string().transform(Number).default('20'),

  // Gas Configuration
  MAX_GAS_PRICE_GWEI: z.string().transform(Number).default('100'),
  GAS_PRICE_MULTIPLIER: z.string().transform(Number).default('1.2'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment configuration.
 * Throws on startup if required values are missing or invalid.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Environment validation failed:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();

/**
 * Check if running in production mode.
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development mode.
 */
export const isDevelopment = env.NODE_ENV === 'development';
