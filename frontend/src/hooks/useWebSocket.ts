'use client';

import { useEffect, useCallback, useRef } from 'react';
import { 
  useWebSocketStore, 
  type WebSocketEventType, 
  type WebSocketMessage 
} from '@/stores/websocketStore';

interface UseWebSocketOptions {
  // Automatically connect on mount
  autoConnect?: boolean;
  // Authentication token
  token?: string;
  // Disconnect on unmount
  disconnectOnUnmount?: boolean;
}

/**
 * Hook for using WebSocket in components
 * 
 * @example
 * ```tsx
 * const { isConnected, subscribe } = useWebSocket();
 * 
 * useEffect(() => {
 *   return subscribe('transaction_new', (message) => {
 *     console.log('New transaction:', message.payload);
 *   });
 * }, [subscribe]);
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { 
    autoConnect = true, 
    token,
    disconnectOnUnmount = false,
  } = options;
  
  const {
    isConnected,
    isConnecting,
    isPolling,
    error,
    connectionAttempts,
    lastMessage,
    connect,
    disconnect,
    subscribe: storeSubscribe,
    sendMessage,
  } = useWebSocketStore();
  
  const hasConnectedRef = useRef(false);
  
  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      connect(token);
    }
    
    return () => {
      if (disconnectOnUnmount) {
        disconnect();
      }
    };
  }, [autoConnect, token, connect, disconnect, disconnectOnUnmount]);
  
  // Memoized subscribe function
  const subscribe = useCallback(
    (eventType: WebSocketEventType, handler: (message: WebSocketMessage) => void) => {
      return storeSubscribe(eventType, handler);
    },
    [storeSubscribe]
  );
  
  return {
    // Connection state
    isConnected,
    isConnecting,
    isPolling,
    error,
    connectionAttempts,
    
    // Last message
    lastMessage,
    
    // Actions
    connect: useCallback(() => connect(token), [connect, token]),
    disconnect,
    subscribe,
    sendMessage,
  };
}

/**
 * Hook for subscribing to specific WebSocket events
 * 
 * @example
 * ```tsx
 * useWebSocketEvent('balance_changed', (message) => {
 *   const { paymasterId, newBalance } = message.payload as BalanceChange;
 *   updateBalance(paymasterId, newBalance);
 * });
 * ```
 */
export function useWebSocketEvent(
  eventType: WebSocketEventType,
  handler: (message: WebSocketMessage) => void,
  deps: React.DependencyList = []
) {
  const { subscribe } = useWebSocket({ autoConnect: false });
  
  useEffect(() => {
    const unsubscribe = subscribe(eventType, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, subscribe, ...deps]);
}

/**
 * Hook for subscribing to multiple WebSocket events
 * 
 * @example
 * ```tsx
 * useWebSocketEvents({
 *   transaction_new: (msg) => addTransaction(msg.payload),
 *   balance_changed: (msg) => updateBalance(msg.payload),
 * });
 * ```
 */
export function useWebSocketEvents(
  handlers: Partial<Record<WebSocketEventType, (message: WebSocketMessage) => void>>,
  deps: React.DependencyList = []
) {
  const { subscribe } = useWebSocket({ autoConnect: false });
  
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    
    Object.entries(handlers).forEach(([eventType, handler]) => {
      if (handler) {
        unsubscribers.push(subscribe(eventType as WebSocketEventType, handler));
      }
    });
    
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, ...deps]);
}

/**
 * Hook for transaction-specific events
 * 
 * @example
 * ```tsx
 * const { transactions, isConnected } = useTransactionFeed('paymaster-id');
 * ```
 */
export function useTransactionFeed(paymasterId?: string) {
  const { isConnected, subscribe } = useWebSocket();
  const transactionsRef = useRef<WebSocketMessage[]>([]);
  
  useEffect(() => {
    const handleTransaction = (message: WebSocketMessage) => {
      // Filter by paymasterId if provided
      if (paymasterId && message.paymasterId !== paymasterId) {
        return;
      }
      
      // Keep only last 50 transactions
      transactionsRef.current = [message, ...transactionsRef.current].slice(0, 50);
    };
    
    const unsub1 = subscribe('transaction_new', handleTransaction);
    const unsub2 = subscribe('transaction_confirmed', handleTransaction);
    const unsub3 = subscribe('transaction_failed', handleTransaction);
    
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [subscribe, paymasterId]);
  
  return {
    transactions: transactionsRef.current,
    isConnected,
  };
}
