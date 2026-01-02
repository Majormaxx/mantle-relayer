import { env } from './env.js';

/**
 * Contract addresses configuration.
 */
export const contracts = {
  relayerHub: env.RELAYER_HUB_ADDRESS,
  paymasterFactory: env.PAYMASTER_FACTORY_ADDRESS,
} as const;

/**
 * Network configuration.
 */
export const network = {
  rpcUrl: env.MANTLE_RPC_URL,
  chainId: env.MANTLE_CHAIN_ID,
  name: env.MANTLE_CHAIN_ID === 5003 ? 'Mantle Sepolia' : 'Mantle',
} as const;

/**
 * Server configuration.
 */
export const server = {
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  isProduction: env.NODE_ENV === 'production',
} as const;

/**
 * Rate limiting configuration.
 */
export const rateLimit = {
  maxPerMinute: env.RATE_LIMIT_MAX_PER_MINUTE,
  maxPerUser: env.RATE_LIMIT_MAX_PER_USER,
} as const;

/**
 * Gas configuration.
 */
export const gas = {
  maxPriceGwei: env.MAX_GAS_PRICE_GWEI,
  priceMultiplier: env.GAS_PRICE_MULTIPLIER,
} as const;

/**
 * Complete configuration object.
 */
export const config = {
  contracts,
  network,
  server,
  rateLimit,
  gas,
} as const;

export type Config = typeof config;
