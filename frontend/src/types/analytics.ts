// Analytics Types
export interface DailyStats {
  date: string;
  transactions: number;
  gasUsed: bigint;
  uniqueUsers: number;
}

export interface AnalyticsOverview {
  totalTransactions: number;
  totalTransactionsTrend: number;
  successRate: number;
  successRateTrend: number;
  failedTransactions: number;
  averageGasPerTransaction: bigint;
}

export interface GasUsageByPaymaster {
  paymasterId: string;
  paymasterName: string;
  gasUsed: bigint;
  percentage: number;
}

export interface TopContract {
  address: `0x${string}`;
  name?: string;
  transactionCount: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  dailyStats: DailyStats[];
  gasUsageByPaymaster: GasUsageByPaymaster[];
  topContracts: TopContract[];
}

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}
