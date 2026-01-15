'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Volume2,
  VolumeX,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocket, useWebSocketEvent } from '@/hooks/useWebSocket';
import type { WebSocketMessage, WebSocketTransaction } from '@/stores/websocketStore';
import { formatDistanceToNow } from 'date-fns';

interface LiveTransaction {
  id: string;
  hash: string;
  status: 'pending' | 'success' | 'failed';
  type: string;
  userAddress: string;
  gasUsed?: number;
  timestamp: Date;
  isNew: boolean;
}

interface LiveActivityFeedProps {
  paymasterId?: string;
  maxItems?: number;
  onTransactionClick?: (transaction: LiveTransaction) => void;
  className?: string;
}

// Generate mock transactions for demo
function generateMockTransaction(): LiveTransaction {
  const types = ['transfer', 'approve', 'mint', 'swap', 'stake'] as const;
  const statusWeights: [number, number, number] = [0.1, 0.85, 0.05]; // 10% pending, 85% success, 5% failed
  
  const random = Math.random();
  let status: LiveTransaction['status'] = 'success';
  if (random < statusWeights[0]) {
    status = 'pending';
  } else if (random > 1 - statusWeights[2]) {
    status = 'failed';
  }
  
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 66),
    status,
    type: types[Math.floor(Math.random() * types.length)] ?? 'transfer',
    userAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    gasUsed: 0.001 + Math.random() * 0.01,
    timestamp: new Date(),
    isNew: true,
  };
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function TransactionItem({ 
  transaction, 
  onClick 
}: { 
  transaction: LiveTransaction; 
  onClick?: () => void;
}) {
  const [isHighlighted, setIsHighlighted] = useState(transaction.isNew);
  
  useEffect(() => {
    if (transaction.isNew) {
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [transaction.isNew]);
  
  const statusConfig = {
    pending: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    success: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    failed: {
      icon: <XCircle className="h-4 w-4" />,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  };
  
  const config = statusConfig[transaction.status];
  
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300',
        'hover:bg-card/80 border border-transparent',
        isHighlighted && 'bg-primary/5 border-primary/20 animate-pulse-once'
      )}
      onClick={onClick}
    >
      {/* Status Icon */}
      <div className={cn('flex-shrink-0 p-2 rounded-lg', config.bg, config.color)}>
        {config.icon}
      </div>
      
      {/* Transaction Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">{transaction.type}</span>
          <span className="text-xs text-muted-foreground">
            {truncateHash(transaction.hash)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{truncateAddress(transaction.userAddress)}</span>
          {transaction.gasUsed && (
            <>
              <span>•</span>
              <span>{transaction.gasUsed.toFixed(4)} MNT</span>
            </>
          )}
        </div>
      </div>
      
      {/* Timestamp */}
      <div className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatDistanceToNow(transaction.timestamp, { addSuffix: false })}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 animate-ping">
          <Activity className="h-8 w-8 text-primary/30" />
        </div>
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-sm mb-1">Waiting for transactions...</h4>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        New transactions will appear here in real-time
      </p>
    </div>
  );
}

function ConnectionIndicator({ 
  isConnected, 
  isPolling 
}: { 
  isConnected: boolean; 
  isPolling: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center gap-1.5">
        <div 
          className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-success' : isPolling ? 'bg-warning' : 'bg-destructive',
            isConnected && 'animate-pulse'
          )}
        />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Live' : isPolling ? 'Polling' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

export function LiveActivityFeed({
  paymasterId,
  maxItems = 20,
  onTransactionClick,
  className,
}: LiveActivityFeedProps) {
  const { isConnected, isPolling } = useWebSocket();
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element for notification sound
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.3;
    return () => {
      audioRef.current = null;
    };
  }, []);
  
  // Play sound for new transactions
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio play failed (user hasn't interacted with page yet)
      });
    }
  }, [soundEnabled]);
  
  // Add new transaction
  const addTransaction = useCallback((tx: LiveTransaction) => {
    setTransactions((prev) => {
      // Mark all existing as not new
      const updated = prev.map((t) => ({ ...t, isNew: false }));
      // Add new transaction at the beginning
      return [tx, ...updated].slice(0, maxItems);
    });
    playNotificationSound();
  }, [maxItems, playNotificationSound]);
  
  // Handle WebSocket transaction events
  useWebSocketEvent('transaction_new', (message: WebSocketMessage) => {
    // Filter by paymasterId if provided
    if (paymasterId && message.paymasterId !== paymasterId) {
      return;
    }
    
    const payload = message.payload as WebSocketTransaction;
    const newTransaction: LiveTransaction = {
      id: `tx-${Date.now()}`,
      hash: payload.hash,
      status: payload.status,
      type: payload.type,
      userAddress: payload.userAddress,
      timestamp: new Date(payload.timestamp),
      isNew: true,
    };
    if (payload.gasUsed !== undefined) {
      newTransaction.gasUsed = payload.gasUsed;
    }
    addTransaction(newTransaction);
  }, [paymasterId, addTransaction]);
  
  // Demo mode: simulate transactions
  useEffect(() => {
    if (!isDemoMode) return;
    
    // Add initial transactions
    const initial = Array.from({ length: 5 }, () => ({
      ...generateMockTransaction(),
      isNew: false,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
    }));
    setTransactions(initial);
    
    // Simulate new transactions periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        addTransaction(generateMockTransaction());
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isDemoMode, addTransaction]);
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Live Activity</CardTitle>
            <ConnectionIndicator isConnected={isConnected} isPolling={isPolling} />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                title={soundEnabled ? 'Mute notifications' : 'Enable sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="demo-mode"
                checked={isDemoMode}
                onCheckedChange={setIsDemoMode}
                className="scale-75"
              />
              <Label htmlFor="demo-mode" className="text-xs text-muted-foreground cursor-pointer">
                Demo
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onClick={() => onTransactionClick?.(tx)}
                />
              ))}
            </div>
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                // Load more transactions
              }}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Load more
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { type LiveTransaction };
