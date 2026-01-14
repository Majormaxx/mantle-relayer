// Transaction Types
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  hash: `0x${string}`;
  paymasterId: string;
  userAddress: `0x${string}`;
  targetContract: `0x${string}`;
  functionName: string;
  functionSelector: `0x${string}`;
  gasUsed: bigint;
  gasCost: bigint;
  status: TransactionStatus;
  errorMessage?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  paymasterId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface TransactionsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: TransactionsPagination;
}
