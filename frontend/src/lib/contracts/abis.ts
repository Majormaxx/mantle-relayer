/**
 * Contract ABIs for Mantle Gasless Relayer
 * These are used by wagmi hooks for type-safe contract interactions
 */

// PaymasterFactory ABI - key functions only
export const paymasterFactoryAbi = [
  {
    type: 'function',
    name: 'createPaymaster',
    inputs: [],
    outputs: [{ name: 'paymaster', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createPaymasterWithConfig',
    inputs: [
      { name: 'initialDeposit', type: 'uint256' },
      { name: 'whitelistedContracts', type: 'address[]' },
      { name: 'dailyLimit', type: 'uint256' },
      { name: 'monthlyLimit', type: 'uint256' },
    ],
    outputs: [{ name: 'paymaster', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getPaymasters',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllPaymasters',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalPaymasters',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPaymaster',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deploymentFee',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'PaymasterCreated',
    inputs: [
      { name: 'paymaster', type: 'address', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'versionIndex', type: 'uint256', indexed: false },
    ],
  },
] as const;

// Paymaster ABI - key functions only
export const paymasterAbi = [
  // Read functions
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAnalytics',
    inputs: [],
    outputs: [
      { name: 'totalTransactions', type: 'uint256' },
      { name: 'totalGasSpent', type: 'uint256' },
      { name: 'uniqueUsers', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSpendingLimitStatus',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'perTransactionLimit', type: 'uint256' },
          { name: 'dailyLimit', type: 'uint256' },
          { name: 'monthlyLimit', type: 'uint256' },
          { name: 'globalLimit', type: 'uint256' },
          { name: 'dailySpent', type: 'uint256' },
          { name: 'monthlySpent', type: 'uint256' },
          { name: 'globalSpent', type: 'uint256' },
          { name: 'lastDailyReset', type: 'uint256' },
          { name: 'lastMonthlyReset', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWhitelistedContracts',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isContractWhitelisted',
    inputs: [{ name: 'contractAddress', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWhitelistedFunctions',
    inputs: [{ name: 'contractAddress', type: 'address' }],
    outputs: [{ name: '', type: 'bytes4[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRemainingDailyLimit',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRemainingMonthlyLimit',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawAll',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addWhitelistedContract',
    inputs: [{ name: 'contractAddress', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeWhitelistedContract',
    inputs: [{ name: 'contractAddress', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addWhitelistedFunction',
    inputs: [
      { name: 'contractAddress', type: 'address' },
      { name: 'selector', type: 'bytes4' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchAddWhitelistedFunctions',
    inputs: [
      { name: 'contractAddress', type: 'address' },
      { name: 'selectors', type: 'bytes4[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchRemoveWhitelistedFunctions',
    inputs: [
      { name: 'contractAddress', type: 'address' },
      { name: 'selectors', type: 'bytes4[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSpendingLimits',
    inputs: [
      { name: 'perTransaction', type: 'uint256' },
      { name: 'daily', type: 'uint256' },
      { name: 'monthly', type: 'uint256' },
      { name: 'global', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'sender', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ContractWhitelisted',
    inputs: [{ name: 'contractAddress', type: 'address', indexed: true }],
  },
  {
    type: 'event',
    name: 'ContractRemoved',
    inputs: [{ name: 'contractAddress', type: 'address', indexed: true }],
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [{ name: 'account', type: 'address', indexed: false }],
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [{ name: 'account', type: 'address', indexed: false }],
  },
] as const;

// Contract addresses on Mantle Sepolia (configurable via env vars)
export const CONTRACT_ADDRESSES = {
  PAYMASTER_FACTORY: (process.env['NEXT_PUBLIC_PAYMASTER_FACTORY_ADDRESS'] ?? '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4') as `0x${string}`,
  RELAYER_HUB: (process.env['NEXT_PUBLIC_RELAYER_HUB_ADDRESS'] ?? '0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737') as `0x${string}`,
} as const;
