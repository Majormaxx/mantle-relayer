'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useWebSocketEvent } from './useWebSocket';
import type { BalanceChange } from '@/stores/websocketStore';

interface UseBalanceRefreshOptions {
  // Refresh interval in milliseconds (default: 60000 = 60 seconds)
  interval?: number;
  // Whether to refresh when page becomes visible
  refreshOnFocus?: boolean;
  // Whether to refresh on WebSocket balance change events
  refreshOnWebSocket?: boolean;
  // Callback when balance is refreshed
  onRefresh?: () => Promise<void>;
  // Optional paymaster ID to filter balance changes
  paymasterId?: string;
}

interface BalanceRefreshState {
  isRefreshing: boolean;
  lastRefreshedAt: Date | null;
  timeSinceRefresh: string;
}

/**
 * Hook for automatic balance refresh across the application
 * 
 * @example
 * ```tsx
 * const { refresh, isRefreshing, lastRefreshedAt, timeSinceRefresh } = useBalanceRefresh({
 *   onRefresh: async () => {
 *     await fetchPaymasterBalances();
 *   },
 * });
 * ```
 */
export function useBalanceRefresh(options: UseBalanceRefreshOptions = {}) {
  const {
    interval = 60000,
    refreshOnFocus = true,
    refreshOnWebSocket = true,
    onRefresh,
    paymasterId,
  } = options;
  
  const [state, setState] = useState<BalanceRefreshState>({
    isRefreshing: false,
    lastRefreshedAt: null,
    timeSinceRefresh: 'Never',
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTabVisibleRef = useRef(true);
  
  // Format time since last refresh
  const formatTimeSinceRefresh = useCallback((lastRefreshed: Date | null) => {
    if (!lastRefreshed) return 'Never';
    
    const seconds = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
    
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }, []);
  
  // Update time since refresh display
  useEffect(() => {
    timeUpdateRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeSinceRefresh: formatTimeSinceRefresh(prev.lastRefreshedAt),
      }));
    }, 10000); // Update every 10 seconds
    
    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, [formatTimeSinceRefresh]);
  
  // Core refresh function
  const refresh = useCallback(async () => {
    // Don't refresh if tab is not visible
    if (!isTabVisibleRef.current) {
      return;
    }
    
    setState((prev) => ({ ...prev, isRefreshing: true }));
    
    try {
      await onRefresh?.();
      const now = new Date();
      setState({
        isRefreshing: false,
        lastRefreshedAt: now,
        timeSinceRefresh: formatTimeSinceRefresh(now),
      });
    } catch (error) {
      console.error('[BalanceRefresh] Refresh failed:', error);
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  }, [onRefresh, formatTimeSinceRefresh]);
  
  // Set up interval refresh
  useEffect(() => {
    // Initial refresh
    refresh();
    
    // Set up interval
    intervalRef.current = setInterval(refresh, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, interval]);
  
  // Page visibility handling
  useEffect(() => {
    if (!refreshOnFocus) return;
    
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      isTabVisibleRef.current = isVisible;
      
      if (isVisible) {
        // Refresh when tab becomes visible
        refresh();
      }
    };
    
    const handleFocus = () => {
      isTabVisibleRef.current = true;
      refresh();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshOnFocus, refresh]);
  
  // WebSocket balance change handling
  useWebSocketEvent(
    'balance_changed',
    (message) => {
      if (!refreshOnWebSocket) return;
      
      const payload = message.payload as BalanceChange;
      
      // Filter by paymasterId if provided
      if (paymasterId && payload.paymasterId !== paymasterId) {
        return;
      }
      
      // Trigger refresh on balance change
      refresh();
    },
    [refreshOnWebSocket, paymasterId, refresh]
  );
  
  return {
    ...state,
    refresh,
  };
}

/**
 * Hook for wallet balance with auto-refresh
 */
export function useWalletBalance() {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, this would call the actual balance API
      // For now, simulate a balance fetch
      await new Promise((r) => setTimeout(r, 500));
      setBalance((Math.random() * 100).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const { refresh, isRefreshing, lastRefreshedAt, timeSinceRefresh } = useBalanceRefresh({
    onRefresh: fetchBalance,
    interval: 60000,
  });
  
  return {
    balance,
    isLoading: isLoading || isRefreshing,
    lastRefreshedAt,
    timeSinceRefresh,
    refresh,
  };
}

/**
 * Hook for all paymaster balances with auto-refresh
 */
export function usePaymasterBalances() {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchBalances = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, this would call the actual balances API
      await new Promise((r) => setTimeout(r, 500));
      // Mock balances for demo
      setBalances({
        'pm-1': (Math.random() * 50).toFixed(4),
        'pm-2': (Math.random() * 100).toFixed(4),
        'pm-3': (Math.random() * 25).toFixed(4),
      });
    } catch (error) {
      console.error('Failed to fetch paymaster balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const { refresh, isRefreshing, lastRefreshedAt, timeSinceRefresh } = useBalanceRefresh({
    onRefresh: fetchBalances,
    interval: 60000,
    refreshOnWebSocket: true,
  });
  
  return {
    balances,
    isLoading: isLoading || isRefreshing,
    lastRefreshedAt,
    timeSinceRefresh,
    refresh,
  };
}
