// Paymaster Types
export interface Paymaster {
  id: string;
  address: `0x${string}`;
  owner: `0x${string}`;
  name: string;
  description?: string;
  balance: bigint;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymasterStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalGasSpent: bigint;
  uniqueUsers: number;
}

export interface PaymasterWithStats extends Paymaster {
  stats: PaymasterStats;
}

// Whitelist Types
export interface WhitelistedContract {
  address: `0x${string}`;
  name?: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155' | 'Custom';
  functions: WhitelistedFunction[];
  addedAt: Date;
}

export interface WhitelistedFunction {
  selector: `0x${string}`;
  signature: string;
  name: string;
}

// Spending Limit Types
export interface SpendingLimits {
  perTransaction?: bigint;
  daily?: bigint;
  dailyUsed?: bigint;
  monthly?: bigint;
  monthlyUsed?: bigint;
  global?: bigint;
  globalUsed?: bigint;
}
