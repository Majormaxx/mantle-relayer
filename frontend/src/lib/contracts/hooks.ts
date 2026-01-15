'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useMemo, useCallback } from 'react';
import { paymasterFactoryAbi, paymasterAbi, CONTRACT_ADDRESSES } from './abis';

// ============================================================================
// PaymasterFactory Hooks
// ============================================================================

/**
 * Get all paymasters owned by the connected user
 */
export function useUserPaymasters() {
  const { address } = useAccount();
  
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMASTER_FACTORY,
    abi: paymasterFactoryAbi,
    functionName: 'getPaymasters',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30_000, // 30 seconds
    },
  });

  return {
    ...result,
    paymasters: result.data ?? [],
  };
}

/**
 * Get deployment fee for creating a new paymaster
 */
export function useDeploymentFee() {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMASTER_FACTORY,
    abi: paymasterFactoryAbi,
    functionName: 'deploymentFee',
    query: {
      staleTime: 60_000, // 1 minute
    },
  });

  return {
    ...result,
    fee: result.data ? formatEther(result.data) : '0',
    feeWei: result.data ?? BigInt(0),
  };
}

/**
 * Create a new paymaster
 */
export function useCreatePaymaster() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const createPaymaster = useCallback((initialFundingMNT?: string) => {
    const value = initialFundingMNT ? parseEther(initialFundingMNT) : BigInt(0);
    
    writeContract({
      address: CONTRACT_ADDRESSES.PAYMASTER_FACTORY,
      abi: paymasterFactoryAbi,
      functionName: 'createPaymaster',
      value,
    });
  }, [writeContract]);

  const createPaymasterWithConfig = useCallback((
    initialDeposit: string,
    whitelistedContracts: `0x${string}`[],
    dailyLimitMNT: string,
    monthlyLimitMNT: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.PAYMASTER_FACTORY,
      abi: paymasterFactoryAbi,
      functionName: 'createPaymasterWithConfig',
      args: [
        parseEther(initialDeposit),
        whitelistedContracts,
        parseEther(dailyLimitMNT),
        parseEther(monthlyLimitMNT),
      ],
      value: parseEther(initialDeposit),
    });
  }, [writeContract]);

  // Extract the created paymaster address from the receipt logs
  const createdPaymasterAddress = useMemo(() => {
    if (!receipt?.logs) return null;
    // PaymasterCreated event topic
    const eventLog = receipt.logs.find(log => 
      log.topics[0] === '0x' // Would need actual event signature hash
    );
    if (eventLog?.topics[1]) {
      return `0x${eventLog.topics[1].slice(-40)}` as `0x${string}`;
    }
    return null;
  }, [receipt]);

  return {
    createPaymaster,
    createPaymasterWithConfig,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
    createdPaymasterAddress,
    receipt,
  };
}

// ============================================================================
// Paymaster Read Hooks
// ============================================================================

/**
 * Get paymaster balance
 */
export function usePaymasterBalance(paymasterAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: 'getBalance',
    query: {
      enabled: !!paymasterAddress,
      refetchInterval: 30_000, // Refresh every 30 seconds
    },
  });

  return {
    ...result,
    balance: result.data ? formatEther(result.data) : '0',
    balanceWei: result.data ?? BigInt(0),
  };
}

/**
 * Get paymaster analytics
 */
export function usePaymasterAnalytics(paymasterAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: 'getAnalytics',
    query: {
      enabled: !!paymasterAddress,
      staleTime: 60_000,
    },
  });

  return {
    ...result,
    analytics: result.data ? {
      totalTransactions: Number(result.data[0]),
      totalGasSpent: formatEther(result.data[1]),
      uniqueUsers: Number(result.data[2]),
    } : null,
  };
}

/**
 * Get paymaster paused status
 */
export function usePaymasterPaused(paymasterAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: 'paused',
    query: {
      enabled: !!paymasterAddress,
    },
  });
}

/**
 * Get paymaster spending limits
 */
export function usePaymasterSpendingLimits(paymasterAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: 'getSpendingLimitStatus',
    query: {
      enabled: !!paymasterAddress,
      staleTime: 60_000,
    },
  });

  return {
    ...result,
    limits: result.data ? {
      perTransactionLimit: formatEther(result.data.perTransactionLimit),
      dailyLimit: formatEther(result.data.dailyLimit),
      monthlyLimit: formatEther(result.data.monthlyLimit),
      globalLimit: formatEther(result.data.globalLimit),
      dailySpent: formatEther(result.data.dailySpent),
      monthlySpent: formatEther(result.data.monthlySpent),
      globalSpent: formatEther(result.data.globalSpent),
      lastDailyReset: new Date(Number(result.data.lastDailyReset) * 1000),
      lastMonthlyReset: new Date(Number(result.data.lastMonthlyReset) * 1000),
    } : null,
  };
}

/**
 * Get whitelisted contracts for a paymaster
 */
export function useWhitelistedContracts(paymasterAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: 'getWhitelistedContracts',
    query: {
      enabled: !!paymasterAddress,
      staleTime: 30_000,
    },
  });

  return {
    ...result,
    contracts: result.data ?? [],
  };
}

/**
 * Get whitelisted functions for a specific contract
 */
export function useWhitelistedFunctions(
  paymasterAddress: `0x${string}` | undefined,
  contractAddress: `0x${string}` | undefined
) {
  const result = useReadContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: 'getWhitelistedFunctions',
    args: contractAddress ? [contractAddress] : undefined,
    query: {
      enabled: !!paymasterAddress && !!contractAddress,
    },
  });

  return {
    ...result,
    functions: result.data ?? [],
  };
}

// ============================================================================
// Paymaster Write Hooks
// ============================================================================

/**
 * Fund a paymaster
 */
export function useFundPaymaster(paymasterAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const fund = useCallback((amountMNT: string) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'deposit',
      value: parseEther(amountMNT),
    });
  }, [paymasterAddress, writeContract]);

  return { fund, hash, isPending, isConfirming, isSuccess, error, reset };
}

/**
 * Withdraw from paymaster
 */
export function useWithdrawPaymaster(paymasterAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = useCallback((amountMNT: string) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'withdraw',
      args: [parseEther(amountMNT)],
    });
  }, [paymasterAddress, writeContract]);

  const withdrawAll = useCallback(() => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'withdrawAll',
    });
  }, [paymasterAddress, writeContract]);

  return { withdraw, withdrawAll, hash, isPending, isConfirming, isSuccess, error, reset };
}

/**
 * Pause/Unpause a paymaster
 */
export function usePaymasterPauseControl(paymasterAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const pause = useCallback(() => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'pause',
    });
  }, [paymasterAddress, writeContract]);

  const unpause = useCallback(() => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'unpause',
    });
  }, [paymasterAddress, writeContract]);

  return { pause, unpause, hash, isPending, isConfirming, isSuccess, error, reset };
}

/**
 * Add/Remove whitelisted contracts
 */
export function useWhitelistControl(paymasterAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addContract = useCallback((contractAddress: `0x${string}`) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'addWhitelistedContract',
      args: [contractAddress],
    });
  }, [paymasterAddress, writeContract]);

  const removeContract = useCallback((contractAddress: `0x${string}`) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'removeWhitelistedContract',
      args: [contractAddress],
    });
  }, [paymasterAddress, writeContract]);

  const addFunctions = useCallback((contractAddress: `0x${string}`, selectors: `0x${string}`[]) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'batchAddWhitelistedFunctions',
      args: [contractAddress, selectors as readonly `0x${string}`[]],
    });
  }, [paymasterAddress, writeContract]);

  const removeFunctions = useCallback((contractAddress: `0x${string}`, selectors: `0x${string}`[]) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'batchRemoveWhitelistedFunctions',
      args: [contractAddress, selectors as readonly `0x${string}`[]],
    });
  }, [paymasterAddress, writeContract]);

  return { 
    addContract, 
    removeContract, 
    addFunctions, 
    removeFunctions,
    hash, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error, 
    reset 
  };
}

/**
 * Set spending limits
 */
export function useSetSpendingLimits(paymasterAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setLimits = useCallback((
    perTransactionMNT: string,
    dailyMNT: string,
    monthlyMNT: string,
    globalMNT: string
  ) => {
    if (!paymasterAddress) return;
    
    writeContract({
      address: paymasterAddress,
      abi: paymasterAbi,
      functionName: 'setSpendingLimits',
      args: [
        parseEther(perTransactionMNT),
        parseEther(dailyMNT),
        parseEther(monthlyMNT),
        parseEther(globalMNT),
      ],
    });
  }, [paymasterAddress, writeContract]);

  return { setLimits, hash, isPending, isConfirming, isSuccess, error, reset };
}

// ============================================================================
// Combined Paymaster Data Hook
// ============================================================================

/**
 * Get all data for a single paymaster
 */
export function usePaymasterData(paymasterAddress: `0x${string}` | undefined) {
  const balance = usePaymasterBalance(paymasterAddress);
  const analytics = usePaymasterAnalytics(paymasterAddress);
  const paused = usePaymasterPaused(paymasterAddress);
  const limits = usePaymasterSpendingLimits(paymasterAddress);
  const contracts = useWhitelistedContracts(paymasterAddress);

  const isLoading = balance.isLoading || analytics.isLoading || paused.isLoading;
  const error = balance.error || analytics.error || paused.error;

  const refetch = useCallback(() => {
    balance.refetch();
    analytics.refetch();
    paused.refetch();
    limits.refetch();
    contracts.refetch();
  }, [balance, analytics, paused, limits, contracts]);

  return {
    balance: balance.balance,
    balanceWei: balance.balanceWei,
    analytics: analytics.analytics,
    isPaused: paused.data ?? false,
    limits: limits.limits,
    whitelistedContracts: contracts.contracts,
    isLoading,
    error,
    refetch,
  };
}
