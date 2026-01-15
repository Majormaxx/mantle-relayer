'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Activity,
  Shield,
  BarChart3,
  Search,
  FileText,
  AlertCircle,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  helpLink?: {
    label: string;
    href: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable empty state component
 */
export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  action,
  helpLink,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      iconWrapper: 'h-12 w-12',
      icon: 'h-6 w-6',
      title: 'text-base',
      description: 'text-sm max-w-xs',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'h-16 w-16',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm max-w-sm',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'h-20 w-20',
      icon: 'h-10 w-10',
      title: 'text-xl',
      description: 'max-w-md',
    },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', s.container, className)}>
      {/* Icon */}
      <div className={cn(
        'rounded-full bg-muted flex items-center justify-center mb-4',
        s.iconWrapper
      )}>
        <Icon className={cn('text-muted-foreground', s.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn('font-medium mb-2', s.title)}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn('text-muted-foreground mb-6', s.description)}>
        {description}
      </p>

      {/* Action */}
      {action && (
        action.href ? (
          <Button asChild>
            <Link href={action.href}>
              {action.label}
            </Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}

      {/* Help Link */}
      {helpLink && (
        <a
          href={helpLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          {helpLink.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases

interface PresetEmptyStateProps {
  className?: string;
  onAction?: () => void;
}

/**
 * Empty state for no paymasters
 */
export function EmptyPaymasters({ className, onAction }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Wallet}
      title="No Paymasters Yet"
      description="Create your first Paymaster to start sponsoring gas for your users"
      {...(onAction ? { action: { label: 'Create Paymaster', onClick: onAction } } : {})}
      helpLink={{
        label: 'Learn about Paymasters',
        href: 'https://docs.mantle.xyz/paymasters',
      }}
      {...(className ? { className } : {})}
      size="lg"
    />
  );
}

/**
 * Empty state for no transactions
 */
export function EmptyTransactions({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Activity}
      title="No Transactions Yet"
      description="Transactions will appear here after integrating the SDK into your dApp"
      action={{
        label: 'View Integration Guide',
        href: '/docs/sdk-integration',
      }}
      {...(className ? { className } : {})}
    />
  );
}

/**
 * Empty state for no whitelisted contracts
 */
export function EmptyWhitelist({ className, onAction }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Shield}
      title="No Contracts Whitelisted"
      description="Add contracts to control which transactions are sponsored by this Paymaster"
      {...(onAction ? { action: { label: 'Add Contract', onClick: onAction } } : {})}
      helpLink={{
        label: 'Learn about whitelisting',
        href: 'https://docs.mantle.xyz/whitelisting',
      }}
      {...(className ? { className } : {})}
    />
  );
}

/**
 * Empty state for no analytics data
 */
export function EmptyAnalytics({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title="No Data Yet"
      description="Analytics will populate as transactions are processed through your Paymasters"
      helpLink={{
        label: 'Make sure your SDK is integrated correctly',
        href: 'https://docs.mantle.xyz/troubleshooting',
      }}
      {...(className ? { className } : {})}
    />
  );
}

/**
 * Empty state for empty search results
 */
export function EmptySearchResults({ 
  className, 
  onAction,
  query,
}: PresetEmptyStateProps & { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={query 
        ? `No results found for "${query}". Try adjusting your search or filters.`
        : 'Try adjusting your search or filters'
      }
      {...(onAction ? { action: { label: 'Clear Filters', onClick: onAction } } : {})}
      {...(className ? { className } : {})}
      size="sm"
    />
  );
}

/**
 * Empty state for no notifications
 */
export function EmptyNotifications({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={FileText}
      title="No Notifications"
      description="You're all caught up! New notifications will appear here"
      {...(className ? { className } : {})}
      size="sm"
    />
  );
}

/**
 * Animated waiting state for live feeds
 */
export function WaitingForTransactions({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {/* Animated icon */}
      <div className="relative mb-4">
        <div className="absolute inset-0 animate-ping">
          <div className="h-12 w-12 rounded-full bg-primary/20" />
        </div>
        <div className="relative h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Activity className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      <h4 className="font-medium text-sm mb-1">Waiting for transactions...</h4>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        Transactions will appear here in real-time
      </p>
    </div>
  );
}

/**
 * Empty state specifically for cards/lists that are inline
 */
export function InlineEmptyState({ 
  message, 
  action,
  className,
}: { 
  message: string; 
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn(
      'flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground',
      className
    )}>
      <span>{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-primary hover:underline font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
