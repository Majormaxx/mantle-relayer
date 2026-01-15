'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ExternalLink, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary that catches unhandled errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // In production, send to error tracking service
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <GlobalErrorFallback 
          error={this.state.error} 
          onRetry={this.handleRetry} 
        />
      );
    }

    return this.props.children;
  }
}

interface GlobalErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
}

/**
 * Full-page error fallback for unrecoverable errors
 */
export function GlobalErrorFallback({ error, onRetry }: GlobalErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </p>
        </div>

        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <Card className="bg-muted/50 text-left">
            <CardContent className="p-4">
              <p className="font-mono text-xs text-destructive break-all">
                {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry || handleReload} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleGoHome} className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Help Link */}
        <p className="text-sm text-muted-foreground">
          If this keeps happening,{' '}
          <a 
            href="https://discord.gg/mantle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            contact support <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
}

interface SectionErrorBoundaryProps {
  children: ReactNode;
  name?: string;
  className?: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section-level error boundary that doesn't crash the whole page
 */
export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary:${this.props.name}] Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <SectionErrorFallback
          name={this.props.name ?? 'Section'}
          error={this.state.error}
          onRetry={this.handleRetry}
          {...(this.props.className ? { className: this.props.className } : {})}
        />
      );
    }

    return this.props.children;
  }
}

interface SectionErrorFallbackProps {
  name?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error fallback for section-level errors
 */
export function SectionErrorFallback({ 
  name, 
  error, 
  onRetry, 
  className 
}: SectionErrorFallbackProps) {
  return (
    <Card className={cn('border-destructive/30', className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        
        <h3 className="font-medium mb-1">
          Failed to load {name || 'this section'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          {error?.message || 'An unexpected error occurred'}
        </p>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => {
              // Open issue reporting or feedback
              window.open('https://github.com/mantle-relayer/issues', '_blank');
            }}
          >
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface OfflineBannerProps {
  className?: string;
}

/**
 * Banner shown when user is offline
 */
export function OfflineBanner({ className }: OfflineBannerProps) {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Check initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        'bg-warning text-warning-foreground shadow-lg',
        'animate-slide-up',
        className
      )}
    >
      <WifiOff className="h-5 w-5" />
      <div>
        <p className="font-medium text-sm">You&apos;re offline</p>
        <p className="text-xs opacity-80">Some features may not work</p>
      </div>
    </div>
  );
}

interface NetworkErrorProps {
  error?: Error;
  onRetry?: () => void;
  className?: string;
}

/**
 * Component for network-specific errors
 */
export function NetworkError({ error, onRetry, className }: NetworkErrorProps) {
  const isTimeout = error?.message?.includes('timeout');
  const isNotFound = error?.message?.includes('404');

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="font-medium text-lg mb-2">
        {isTimeout ? 'Request Timed Out' : isNotFound ? 'Not Found' : 'Network Error'}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {isTimeout 
          ? 'The request took too long. Please check your connection and try again.'
          : isNotFound
          ? 'The resource you\'re looking for doesn\'t exist or has been moved.'
          : 'Unable to connect to the server. Please check your internet connection.'}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * HOC to wrap components with section error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name?: string
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <SectionErrorBoundary name={name || displayName}>
      <WrappedComponent {...props} />
    </SectionErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}
