'use client';

import React from 'react';
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocketConnection } from '@/stores/websocketStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * WebSocket connection status indicator
 * Shows real-time connection state with visual feedback
 */
export function ConnectionStatus({
  className,
  showLabel = false,
  size = 'md',
}: ConnectionStatusProps) {
  const { isConnected, isConnecting, isPolling, error } = useWebSocketConnection();
  
  const sizes = {
    sm: { dot: 'h-1.5 w-1.5', icon: 'h-3 w-3', text: 'text-xs' },
    md: { dot: 'h-2 w-2', icon: 'h-4 w-4', text: 'text-sm' },
    lg: { dot: 'h-2.5 w-2.5', icon: 'h-5 w-5', text: 'text-base' },
  };
  
  const s = sizes[size];
  
  const getStatus = () => {
    if (isConnecting) return { label: 'Connecting...', color: 'bg-warning', icon: Loader2 };
    if (isConnected) return { label: 'Connected', color: 'bg-success', icon: Wifi };
    if (isPolling) return { label: 'Polling', color: 'bg-warning', icon: RefreshCw };
    if (error) return { label: 'Error', color: 'bg-destructive', icon: WifiOff };
    return { label: 'Disconnected', color: 'bg-muted-foreground', icon: WifiOff };
  };
  
  const status = getStatus();
  const Icon = status.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              'inline-flex items-center gap-1.5',
              className
            )}
            role="status"
            aria-label={`Connection status: ${status.label}`}
          >
            <div className="relative flex items-center justify-center">
              {/* Pulsing ring for connected state */}
              {isConnected && (
                <span 
                  className={cn(
                    'absolute rounded-full animate-ping opacity-75',
                    status.color,
                    s.dot
                  )} 
                />
              )}
              
              {/* Spinning for connecting/polling */}
              {(isConnecting || isPolling) ? (
                <Icon 
                  className={cn(
                    s.icon,
                    'text-warning animate-spin'
                  )} 
                />
              ) : (
                <span 
                  className={cn(
                    'relative rounded-full',
                    status.color,
                    s.dot
                  )} 
                />
              )}
            </div>
            
            {showLabel && (
              <span className={cn('text-muted-foreground', s.text)}>
                {status.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-medium">{status.label}</p>
          {isConnected && (
            <p className="text-muted-foreground">Real-time updates active</p>
          )}
          {isPolling && (
            <p className="text-muted-foreground">Checking for updates every 30s</p>
          )}
          {error && (
            <p className="text-destructive">{error}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact live indicator with pulsing dot
 */
export function LiveIndicator({ 
  isLive = true, 
  className 
}: { 
  isLive?: boolean;
  className?: string;
}) {
  return (
    <div 
      className={cn('inline-flex items-center gap-1.5', className)}
      role="status"
      aria-label={isLive ? 'Live updates active' : 'Updates paused'}
    >
      <div className="relative">
        {isLive && (
          <span className="absolute h-2 w-2 rounded-full bg-success animate-ping opacity-75" />
        )}
        <span 
          className={cn(
            'relative h-2 w-2 rounded-full',
            isLive ? 'bg-success' : 'bg-muted-foreground'
          )} 
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {isLive ? 'Live' : 'Paused'}
      </span>
    </div>
  );
}

/**
 * Full connection status bar for header/footer
 */
export function ConnectionStatusBar({ className }: { className?: string }) {
  const { isConnected, isConnecting, isPolling, error, connectionAttempts } = useWebSocketConnection();
  
  if (isConnected) return null;
  
  return (
    <div 
      className={cn(
        'flex items-center justify-center gap-2 py-2 px-4 text-sm',
        error ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning',
        className
      )}
      role="alert"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting{connectionAttempts > 0 ? ` (attempt ${connectionAttempts})` : ''}...</span>
        </>
      ) : isPolling ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Using polling fallback</span>
        </>
      ) : error ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Connection error. Retrying...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );
}

/**
 * Last updated timestamp with refresh button
 */
export function LastUpdated({ 
  timestamp, 
  onRefresh,
  isRefreshing = false,
  className,
}: { 
  timestamp: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = React.useState('');
  
  React.useEffect(() => {
    if (!timestamp) {
      setDisplay('Never');
      return;
    }
    
    const update = () => {
      const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
      
      if (seconds < 10) setDisplay('Just now');
      else if (seconds < 60) setDisplay(`${seconds}s ago`);
      else if (seconds < 3600) setDisplay(`${Math.floor(seconds / 60)}m ago`);
      else setDisplay(`${Math.floor(seconds / 3600)}h ago`);
    };
    
    update();
    const interval = setInterval(update, 10000);
    
    return () => clearInterval(interval);
  }, [timestamp]);
  
  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <span>Updated {display}</span>
      {onRefresh && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh"
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
        </Button>
      )}
    </div>
  );
}
