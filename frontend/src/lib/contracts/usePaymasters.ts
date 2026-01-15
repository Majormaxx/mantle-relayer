'use client';

import { useReadContracts, useAccount, useBalance } from 'wagmi';
import { useMemo } from 'react';
import { formatEther } from 'viem';
import { paymasterAbi, paymasterFactoryAbi, CONTRACT_ADDRESSES } from './abis';
import { CONSTANTS } from '@/config/constants';
import type { PaymasterCardData, PaymasterStatus } from '@/components/paymaster/PaymasterCard';

/**
 * Hook to get full paymaster list with all data for the current user
 * This combines factory data with individual paymaster data
 */
export function usePaymastersWithData() {
  const { address } = useAccount();

  // 1. First get the list of paymaster addresses owned by the user
  const { data: paymasterAddresses, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useReadContracts({
    contracts: address ? [{
      address: CONTRACT_ADDRESSES.PAYMASTER_FACTORY,
      abi: paymasterFactoryAbi,
      functionName: 'getPaymasters',
      args: [address],
    }] : [],
    query: {
      enabled: !!address,
      staleTime: 60_000, // Data is fresh for 1 minute
      gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    },
  });

  const addresses = useMemo(() => {
    if (!paymasterAddresses?.[0]?.result) return [];
    return paymasterAddresses[0].result as `0x${string}`[];
  }, [paymasterAddresses]);

  // 2. For each paymaster, get balance, paused status, and analytics
  const paymasterContracts = useMemo(() => {
    if (!addresses.length) return [];
    
    return addresses.flatMap((addr) => [
      {
        address: addr,
        abi: paymasterAbi,
        functionName: 'getBalance' as const,
      },
      {
        address: addr,
        abi: paymasterAbi,
        functionName: 'paused' as const,
      },
      {
        address: addr,
        abi: paymasterAbi,
        functionName: 'getAnalytics' as const,
      },
    ]);
  }, [addresses]);

  const { data: paymasterData, isLoading: isLoadingData, refetch: refetchData } = useReadContracts({
    contracts: paymasterContracts,
    query: {
      enabled: paymasterContracts.length > 0,
      staleTime: 60_000, // Data is fresh for 1 minute
      gcTime: 5 * 60_000, // Keep in cache for 5 minutes
      // No refetchInterval - data updates on user actions
    },
  });

  // 3. Combine all data into PaymasterCardData format
  const paymasters = useMemo((): PaymasterCardData[] => {
    if (!addresses.length || !paymasterData) return [];

    return addresses.map((addr, index) => {
      const baseIndex = index * 3;
      const balanceResult = paymasterData[baseIndex];
      const pausedResult = paymasterData[baseIndex + 1];
      const analyticsResult = paymasterData[baseIndex + 2];

      const balance = balanceResult?.result 
        ? parseFloat(formatEther(balanceResult.result as bigint))
        : 0;
      
      const isPaused = pausedResult?.result as boolean ?? false;
      
      const analytics = analyticsResult?.result as [bigint, bigint, bigint] | undefined;
      const totalTransactions = analytics ? Number(analytics[0]) : 0;
      const uniqueUsers = analytics ? Number(analytics[2]) : 0;

      // Determine status
      let status: PaymasterStatus = 'active';
      if (isPaused) {
        status = 'paused';
      } else if (balance < CONSTANTS.CRITICAL_BALANCE_THRESHOLD) {
        status = 'paused'; // Effectively paused if no balance
      } else if (balance < CONSTANTS.LOW_BALANCE_THRESHOLD) {
        status = 'low-balance';
      }

      return {
        id: addr,
        address: addr,
        name: '', // Would need to fetch from backend or metadata
        status,
        balance: balance.toFixed(2),
        transactionCount: totalTransactions,
        uniqueUsers,
      };
    });
  }, [addresses, paymasterData]);

  const isLoading = isLoadingAddresses || (addresses.length > 0 && isLoadingData);

  const refetch = () => {
    refetchAddresses();
    refetchData();
  };

  return {
    paymasters,
    isLoading,
    isEmpty: !isLoading && paymasters.length === 0,
    refetch,
  };
}

/**
 * Hook to get the connected wallet's MNT balance
 */
export function useWalletMntBalance() {
  const { address } = useAccount();
  
  const { data, isLoading, refetch } = useBalance({
    address,
    query: {
      enabled: !!address,
      staleTime: 60_000, // Data is fresh for 1 minute
      gcTime: 5 * 60_000, // Keep in cache for 5 minutes
      // No refetchInterval - data updates on user actions
    },
  });

  return {
    balance: data?.formatted ?? '0',
    balanceWei: data?.value ?? BigInt(0),
    symbol: data?.symbol ?? 'MNT',
    isLoading,
    refetch,
  };
}

/**
 * Hook for combined paymaster stats across all user's paymasters
 */
export function useAggregatedPaymasterStats() {
  const { paymasters, isLoading } = usePaymastersWithData();

  const stats = useMemo(() => {
    if (!paymasters.length) {
      return {
        totalBalance: '0',
        activePaymasters: 0,
        totalPaymasters: 0,
        totalTransactions: 0,
        totalUniqueUsers: 0,
      };
    }

    const totalBalance = paymasters.reduce((sum, p) => sum + parseFloat(p.balance), 0);
    const activePaymasters = paymasters.filter(p => p.status === 'active').length;
    const totalTransactions = paymasters.reduce((sum, p) => sum + p.transactionCount, 0);
    const totalUniqueUsers = paymasters.reduce((sum, p) => sum + p.uniqueUsers, 0);

    return {
      totalBalance: totalBalance.toFixed(2),
      activePaymasters,
      totalPaymasters: paymasters.length,
      totalTransactions,
      totalUniqueUsers,
    };
  }, [paymasters]);

  return {
    ...stats,
    isLoading,
  };
}
