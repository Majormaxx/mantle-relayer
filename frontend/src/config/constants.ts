// Constants
export const CONSTANTS = {
  // API
  API_BASE_URL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001',
  WS_URL: process.env['NEXT_PUBLIC_WS_URL'] ?? 'ws://localhost:3001',

  // Blockchain
  CHAIN_ID: parseInt(process.env['NEXT_PUBLIC_CHAIN_ID'] ?? '5003', 10),
  RPC_URL: process.env['NEXT_PUBLIC_RPC_URL'] ?? 'https://rpc.sepolia.mantle.xyz',
  EXPLORER_URL: process.env['NEXT_PUBLIC_EXPLORER_URL'] ?? 'https://sepolia.mantlescan.xyz',

  // Contract Addresses
  PAYMASTER_FACTORY_ADDRESS: process.env['NEXT_PUBLIC_PAYMASTER_FACTORY_ADDRESS'] ?? '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
  RELAYER_HUB_ADDRESS: process.env['NEXT_PUBLIC_RELAYER_HUB_ADDRESS'] ?? '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737',

  // Pagination
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,

  // Timeouts
  TOAST_DURATION: 4000,
  TOAST_ERROR_DURATION: 6000,
  REFETCH_INTERVAL: 30000, // 30 seconds
  BALANCE_REFETCH_INTERVAL: 60000, // 60 seconds

  // Thresholds
  LOW_BALANCE_THRESHOLD: 10, // MNT
  CRITICAL_BALANCE_THRESHOLD: 1, // MNT
  WARNING_LIMIT_PERCENTAGE: 80,

  // Display
  ADDRESS_TRUNCATE_LENGTH: 6,
  HASH_TRUNCATE_LENGTH: 10,
  MAX_TRANSACTIONS_DISPLAY: 50,
} as const;

export type Constants = typeof CONSTANTS;
