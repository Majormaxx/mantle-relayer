import { defineChain } from 'viem';

// Mantle Sepolia Testnet Configuration
export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
  testnet: true,
});

// Contract Addresses
export const contracts = {
  relayerHub: '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737' as const,
  paymasterFactory: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4' as const,
  paymasterImplementation:
    '0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5' as const,
} as const;

export type Contracts = typeof contracts;
