'use client';

import { create } from 'zustand';

// WebSocket event types
export type WebSocketEventType = 
  | 'transaction_new'
  | 'transaction_confirmed'
  | 'transaction_failed'
  | 'balance_changed'
  | 'spending_limit_alert'
  | 'system_notification'
  | 'paymaster_paused'
  | 'paymaster_resumed';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: string;
  paymasterId?: string;
}

export interface WebSocketTransaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  userAddress: string;
  paymasterId: string;
  gasUsed?: number;
  timestamp: string;
  type: string;
}

export interface BalanceChange {
  paymasterId: string;
  oldBalance: string;
  newBalance: string;
  change: string;
  reason: 'funding' | 'transaction' | 'withdrawal';
}

export interface SpendingLimitAlert {
  paymasterId: string;
  limitType: 'daily' | 'monthly' | 'global';
  currentUsage: number;
  limit: number;
  percentage: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  actionUrl?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
  
  // Message state
  lastMessage: WebSocketMessage | null;
  messageQueue: WebSocketMessage[];
  
  // Error state
  error: string | null;
  
  // Subscription handlers
  handlers: Map<WebSocketEventType, Set<MessageHandler>>;
  
  // WebSocket instance
  socket: WebSocket | null;
  
  // Polling fallback
  isPolling: boolean;
  pollIntervalId: ReturnType<typeof setInterval> | null;
  
  // Actions
  connect: (token?: string) => void;
  disconnect: () => void;
  subscribe: (eventType: WebSocketEventType, handler: MessageHandler) => () => void;
  unsubscribe: (eventType: WebSocketEventType, handler: MessageHandler) => void;
  sendMessage: (message: Record<string, unknown>) => void;
  
  // Internal actions
  _handleOpen: () => void;
  _handleClose: (event: CloseEvent) => void;
  _handleError: (error: Event) => void;
  _handleMessage: (event: MessageEvent) => void;
  _scheduleReconnect: () => void;
  _startPolling: () => void;
  _stopPolling: () => void;
  _processMessageQueue: () => void;
}

const WS_URL = process.env['NEXT_PUBLIC_WS_URL'] || 'wss://api.mantle-relayer.com/ws';
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const POLL_INTERVAL = 30000; // 30 seconds

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  connectionAttempts: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  lastMessage: null,
  messageQueue: [],
  error: null,
  handlers: new Map(),
  socket: null,
  isPolling: false,
  pollIntervalId: null,
  
  connect: (token?: string) => {
    const state = get();
    
    // Don't connect if already connected or connecting
    if (state.isConnected || state.isConnecting) {
      return;
    }
    
    set({ isConnecting: true, error: null });
    
    try {
      const url = token ? `${WS_URL}?token=${token}` : WS_URL;
      const socket = new WebSocket(url);
      
      socket.onopen = () => get()._handleOpen();
      socket.onclose = (event) => get()._handleClose(event);
      socket.onerror = (error) => get()._handleError(error);
      socket.onmessage = (event) => get()._handleMessage(event);
      
      set({ socket });
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      set({ 
        isConnecting: false, 
        error: 'Failed to create WebSocket connection' 
      });
      get()._startPolling();
    }
  },
  
  disconnect: () => {
    const { socket, pollIntervalId } = get();
    
    if (socket) {
      socket.close(1000, 'Client disconnect');
    }
    
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
    }
    
    set({
      isConnected: false,
      isConnecting: false,
      socket: null,
      pollIntervalId: null,
      isPolling: false,
      connectionAttempts: 0,
    });
  },
  
  subscribe: (eventType: WebSocketEventType, handler: MessageHandler) => {
    const { handlers } = get();
    
    if (!handlers.has(eventType)) {
      handlers.set(eventType, new Set());
    }
    
    handlers.get(eventType)!.add(handler);
    set({ handlers: new Map(handlers) });
    
    // Return unsubscribe function
    return () => get().unsubscribe(eventType, handler);
  },
  
  unsubscribe: (eventType: WebSocketEventType, handler: MessageHandler) => {
    const { handlers } = get();
    const eventHandlers = handlers.get(eventType);
    
    if (eventHandlers) {
      eventHandlers.delete(handler);
      set({ handlers: new Map(handlers) });
    }
  },
  
  sendMessage: (message: Record<string, unknown>) => {
    const { socket, isConnected, messageQueue } = get();
    
    const wsMessage: WebSocketMessage = {
      type: message['type'] as WebSocketEventType,
      payload: message['payload'] as Record<string, unknown>,
      timestamp: new Date().toISOString(),
    };
    
    if (isConnected && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(wsMessage));
    } else {
      // Queue message for later
      set({ messageQueue: [...messageQueue, wsMessage] });
    }
  },
  
  _handleOpen: () => {
    console.log('[WebSocket] Connected');
    
    set({
      isConnected: true,
      isConnecting: false,
      connectionAttempts: 0,
      lastConnectedAt: new Date(),
      error: null,
    });
    
    // Stop polling if active
    get()._stopPolling();
    
    // Process any queued messages
    get()._processMessageQueue();
  },
  
  _handleClose: (event: CloseEvent) => {
    console.log('[WebSocket] Disconnected:', event.code, event.reason);
    
    set({
      isConnected: false,
      isConnecting: false,
      socket: null,
      lastDisconnectedAt: new Date(),
    });
    
    // Don't reconnect if closed intentionally
    if (event.code === 1000) {
      return;
    }
    
    // Schedule reconnection
    get()._scheduleReconnect();
  },
  
  _handleError: (error: Event) => {
    console.error('[WebSocket] Error:', error);
    set({ error: 'WebSocket connection error' });
  },
  
  _handleMessage: (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      console.log('[WebSocket] Message received:', message.type);
      
      set({ lastMessage: message });
      
      // Notify all handlers for this event type
      const { handlers } = get();
      const eventHandlers = handlers.get(message.type);
      
      if (eventHandlers) {
        eventHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('[WebSocket] Handler error:', error);
          }
        });
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  },
  
  _scheduleReconnect: () => {
    const { connectionAttempts } = get();
    
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('[WebSocket] Max reconnect attempts reached, falling back to polling');
      get()._startPolling();
      return;
    }
    
    // Exponential backoff with jitter
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, connectionAttempts) + Math.random() * 1000,
      MAX_RECONNECT_DELAY
    );
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${connectionAttempts + 1})`);
    
    set({ connectionAttempts: connectionAttempts + 1 });
    
    setTimeout(() => {
      get().connect();
    }, delay);
  },
  
  _startPolling: () => {
    const { isPolling, pollIntervalId } = get();
    
    if (isPolling || pollIntervalId) {
      return;
    }
    
    console.log('[WebSocket] Starting polling fallback');
    
    const intervalId = setInterval(async () => {
      try {
        // Poll for updates - this would call your REST API
        const response = await fetch('/api/poll-updates');
        if (response.ok) {
          const updates = await response.json();
          
          // Process each update as if it came from WebSocket
          updates.forEach((update: WebSocketMessage) => {
            get()._handleMessage({ data: JSON.stringify(update) } as MessageEvent);
          });
        }
      } catch (error) {
        console.error('[WebSocket] Polling error:', error);
      }
    }, POLL_INTERVAL);
    
    set({ isPolling: true, pollIntervalId: intervalId });
  },
  
  _stopPolling: () => {
    const { pollIntervalId } = get();
    
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      set({ isPolling: false, pollIntervalId: null });
    }
  },
  
  _processMessageQueue: () => {
    const { messageQueue, socket, isConnected } = get();
    
    if (!isConnected || !socket || messageQueue.length === 0) {
      return;
    }
    
    console.log(`[WebSocket] Processing ${messageQueue.length} queued messages`);
    
    messageQueue.forEach((message) => {
      socket.send(JSON.stringify(message));
    });
    
    set({ messageQueue: [] });
  },
}));

// Selector hooks for common state
export const useWebSocketConnection = () => 
  useWebSocketStore((state) => ({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isPolling: state.isPolling,
    error: state.error,
    connectionAttempts: state.connectionAttempts,
  }));

export const useLastWebSocketMessage = () =>
  useWebSocketStore((state) => state.lastMessage);
