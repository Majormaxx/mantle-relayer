'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CONSTANTS } from '@/config/constants';

// ============================================================================
// API Client
// ============================================================================

const API_BASE_URL = CONSTANTS.API_BASE_URL;

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  authToken?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options?.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: 'An error occurred',
      status: response.status,
    };
    
    try {
      const data = await response.json();
      error.message = data.message ?? data.error ?? error.message;
      error.code = data.code;
    } catch {
      // Response wasn't JSON
    }
    
    throw error;
  }

  return response.json();
}

// ============================================================================
// Types
// ============================================================================

export interface Transaction {
  id: string;
  hash: string;
  paymasterId: string;
  userAddress: string;
  targetContract: string;
  targetContractName?: string;
  functionName?: string;
  functionSelector: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface PaymasterStats {
  paymasterId: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalGasSpent: string;
  uniqueUsers: number;
  trend: {
    transactions: number;
    gasSpent: number;
  };
}

export interface DashboardStats {
  totalBalance: string;
  activePaymasters: number;
  totalPaymasters: number;
  totalTransactions: number;
  transactionsTrend: number;
  monthlySpending: string;
  monthlySpendingTrend: number;
}

export interface ChartDataPoint {
  date: string;
  transactions: number;
  gasUsed: string;
}

export interface OnboardingStatus {
  walletConnected: boolean;
  paymasterCreated: boolean;
  paymasterFunded: boolean;
  contractWhitelisted: boolean;
  sdkIntegrated: boolean;
}

export interface TransactionListParams {
  paymasterId?: string;
  page?: number;
  limit?: number;
  status?: 'all' | 'success' | 'failed' | 'pending';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsParams {
  paymasterId?: string;
  timeRange: '7d' | '30d' | '90d';
}

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    chart: (timeRange: string) => ['dashboard', 'chart', timeRange] as const,
    onboarding: ['dashboard', 'onboarding'] as const,
  },
  transactions: {
    list: (params: TransactionListParams) => ['transactions', params] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
    recent: (paymasterId?: string) => ['transactions', 'recent', paymasterId] as const,
  },
  analytics: {
    overview: (params: AnalyticsParams) => ['analytics', 'overview', params] as const,
    chart: (params: AnalyticsParams) => ['analytics', 'chart', params] as const,
    topContracts: (params: AnalyticsParams) => ['analytics', 'topContracts', params] as const,
  },
  paymaster: {
    stats: (id: string) => ['paymaster', 'stats', id] as const,
    chart: (id: string, timeRange: string) => ['paymaster', 'chart', id, timeRange] as const,
  },
};

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Get dashboard overview stats
 */
export function useDashboardStats(address: string | undefined) {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => fetchApi<DashboardStats>(`/api/dashboard/stats?address=${address}`),
    enabled: !!address,
    staleTime: 30_000,
  });
}

/**
 * Get dashboard chart data
 */
export function useDashboardChart(address: string | undefined, timeRange: '7d' | '30d' | '90d' = '30d') {
  return useQuery<ChartDataPoint[]>({
    queryKey: queryKeys.dashboard.chart(timeRange),
    queryFn: () => fetchApi<ChartDataPoint[]>(`/api/dashboard/chart?address=${address}&range=${timeRange}`),
    enabled: !!address,
    staleTime: 60_000,
  });
}

/**
 * Get onboarding status
 */
export function useOnboardingStatus(address: string | undefined) {
  return useQuery<OnboardingStatus>({
    queryKey: queryKeys.dashboard.onboarding,
    queryFn: () => fetchApi<OnboardingStatus>(`/api/user/onboarding?address=${address}`),
    enabled: !!address,
    staleTime: 60_000,
  });
}

// ============================================================================
// Transaction Hooks
// ============================================================================

/**
 * Get paginated transaction list
 */
export function useTransactions(params: TransactionListParams) {
  return useQuery<TransactionListResponse>({
    queryKey: queryKeys.transactions.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.paymasterId) searchParams.set('paymasterId', params.paymasterId);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status && params.status !== 'all') searchParams.set('status', params.status);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.search) searchParams.set('search', params.search);
      
      return fetchApi<TransactionListResponse>(`/api/transactions?${searchParams.toString()}`);
    },
    staleTime: 60_000, // Data is fresh for 1 minute
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
  });
}

/**
 * Get recent transactions (for dashboard/activity feed)
 */
export function useRecentTransactions(paymasterId?: string, limit: number = 10) {
  return useQuery<Transaction[]>({
    queryKey: queryKeys.transactions.recent(paymasterId),
    queryFn: () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (paymasterId) params.set('paymasterId', paymasterId);
      return fetchApi<Transaction[]>(`/api/transactions/recent?${params.toString()}`);
    },
    staleTime: 60_000, // Data is fresh for 1 minute
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    // No refetchInterval - data updates on user actions
  });
}

/**
 * Get single transaction detail
 */
export function useTransaction(id: string | undefined) {
  return useQuery<Transaction>({
    queryKey: queryKeys.transactions.detail(id ?? ''),
    queryFn: () => fetchApi<Transaction>(`/api/transactions/${id}`),
    enabled: !!id,
  });
}

// ============================================================================
// Analytics Hooks
// ============================================================================

/**
 * Get analytics overview
 */
export function useAnalyticsOverview(params: AnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(params),
    queryFn: () => {
      const searchParams = new URLSearchParams({ range: params.timeRange });
      if (params.paymasterId) searchParams.set('paymasterId', params.paymasterId);
      return fetchApi<{
        totalTransactions: number;
        successRate: number;
        failedTransactions: number;
        avgGasPerTx: string;
        trends: {
          transactions: number;
          successRate: number;
          gasSpent: number;
        };
      }>(`/api/analytics/overview?${searchParams.toString()}`);
    },
    staleTime: 60_000,
  });
}

/**
 * Get analytics chart data
 */
export function useAnalyticsChart(params: AnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.chart(params),
    queryFn: () => {
      const searchParams = new URLSearchParams({ range: params.timeRange });
      if (params.paymasterId) searchParams.set('paymasterId', params.paymasterId);
      return fetchApi<ChartDataPoint[]>(`/api/analytics/chart?${searchParams.toString()}`);
    },
    staleTime: 60_000,
  });
}

/**
 * Get top contracts by transaction volume
 */
export function useTopContracts(params: AnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.analytics.topContracts(params),
    queryFn: () => {
      const searchParams = new URLSearchParams({ range: params.timeRange });
      if (params.paymasterId) searchParams.set('paymasterId', params.paymasterId);
      return fetchApi<{
        address: string;
        name?: string;
        transactions: number;
        gasUsed: string;
      }[]>(`/api/analytics/top-contracts?${searchParams.toString()}`);
    },
    staleTime: 60_000,
  });
}

// ============================================================================
// Paymaster-specific Stats Hooks
// ============================================================================

/**
 * Get stats for a specific paymaster
 */
export function usePaymasterApiStats(paymasterId: string | undefined) {
  return useQuery<PaymasterStats>({
    queryKey: queryKeys.paymaster.stats(paymasterId ?? ''),
    queryFn: () => fetchApi<PaymasterStats>(`/api/paymasters/${paymasterId}/stats`),
    enabled: !!paymasterId,
    staleTime: 30_000,
  });
}

/**
 * Get chart data for a specific paymaster
 */
export function usePaymasterChart(paymasterId: string | undefined, timeRange: '7d' | '30d' | '90d' = '7d') {
  return useQuery<ChartDataPoint[]>({
    queryKey: queryKeys.paymaster.chart(paymasterId ?? '', timeRange),
    queryFn: () => fetchApi<ChartDataPoint[]>(`/api/paymasters/${paymasterId}/chart?range=${timeRange}`),
    enabled: !!paymasterId,
    staleTime: 60_000,
  });
}

// ============================================================================
// Contract Verification (External API)
// ============================================================================

interface ContractVerification {
  address: string;
  name?: string;
  type: 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Custom';
  verified: boolean;
  abi?: unknown[];
}

/**
 * Verify a contract address via Mantlescan API
 */
export function useContractVerification(contractAddress: string | undefined) {
  return useQuery<ContractVerification>({
    queryKey: ['contract', 'verification', contractAddress],
    queryFn: async () => {
      if (!contractAddress) throw new Error('No address');
      
      // Try to fetch from Mantlescan API
      const mantlescanApiUrl = `https://api-sepolia.mantlescan.xyz/api?module=contract&action=getsourcecode&address=${contractAddress}`;
      
      try {
        const response = await fetch(mantlescanApiUrl);
        const data = await response.json();
        
        if (data.status === '1' && data.result?.[0]) {
          const result = data.result[0];
          const isVerified = result.ABI !== 'Contract source code not verified';
          
          // Detect contract type based on interface
          let contractType: ContractVerification['type'] = 'Custom';
          if (result.ContractName?.includes('ERC20') || result.ABI?.includes('transfer(address,uint256)')) {
            contractType = 'ERC-20';
          } else if (result.ContractName?.includes('ERC721') || result.ABI?.includes('safeTransferFrom')) {
            contractType = 'ERC-721';
          } else if (result.ContractName?.includes('ERC1155')) {
            contractType = 'ERC-1155';
          }
          
          return {
            address: contractAddress,
            name: result.ContractName || undefined,
            type: contractType,
            verified: isVerified,
            abi: isVerified ? JSON.parse(result.ABI) : undefined,
          };
        }
        
        return {
          address: contractAddress,
          type: 'Custom',
          verified: false,
        };
      } catch {
        return {
          address: contractAddress,
          type: 'Custom',
          verified: false,
        };
      }
    },
    enabled: !!contractAddress,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Mark SDK integrated (onboarding)
 */
export function useMarkSdkIntegrated() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (address: string) => 
      fetchApi('/api/user/onboarding/sdk-integrated', {
        method: 'POST',
        body: JSON.stringify({ address }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.onboarding });
    },
  });
}

/**
 * Export transactions to CSV
 */
export function useExportTransactions() {
  return useMutation({
    mutationFn: async (params: TransactionListParams): Promise<Blob> => {
      const searchParams = new URLSearchParams();
      if (params.paymasterId) searchParams.set('paymasterId', params.paymasterId);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);
      if (params.status && params.status !== 'all') searchParams.set('status', params.status);
      
      const response = await fetch(`${API_BASE_URL}/api/transactions/export?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return response.blob();
    },
  });
}
