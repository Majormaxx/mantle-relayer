'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity,
  Send,
  FileCheck,
  Sparkles,
  Repeat,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export type TransactionStatus = 'success' | 'failed' | 'pending';
export type TransactionType = 'Transfer' | 'Approve' | 'Mint' | 'Swap' | 'Other';

export interface Transaction {
  id: string;
  txHash: string;
  status: TransactionStatus;
  type: TransactionType;
  userAddress: string;
  gasCost: number;
  timestamp: Date;
  paymasterId?: string;
}

export interface RecentActivityFeedProps {
  transactions: Transaction[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
  className?: string;
}

const transactionTypeIcons: Record<TransactionType, typeof Send> = {
  Transfer: Send,
  Approve: FileCheck,
  Mint: Sparkles,
  Swap: Repeat,
  Other: Activity,
};

export function RecentActivityFeed({
  transactions,
  loading = false,
  hasMore = false,
  onLoadMore,
  onTransactionClick,
  className,
}: RecentActivityFeedProps) {
  const isEmpty = !loading && transactions.length === 0;

  if (loading) {
    return <ActivityFeedSkeleton className={className ?? ''} />;
  }

  if (isEmpty) {
    return <EmptyActivityState className={className ?? ''} />;
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Link
          href="/paymasters"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-border">
        {transactions.map((transaction, index) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onClick={() => onTransactionClick?.(transaction)}
            isNew={index === 0}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onLoadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual transaction row
function TransactionRow({
  transaction,
  onClick,
  isNew,
}: {
  transaction: Transaction;
  onClick?: () => void;
  isNew?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const TypeIcon = transactionTypeIcons[transaction.type];

  const StatusIcon = transaction.status === 'success' ? CheckCircle2 : XCircle;
  const statusColor = transaction.status === 'success' ? 'text-success' : 'text-error';

  // Truncate address: 0x1234...5678
  const truncatedAddress = `${transaction.userAddress.slice(0, 6)}...${transaction.userAddress.slice(-4)}`;

  // Format relative time
  const timeAgo = formatDistanceToNow(transaction.timestamp, { addSuffix: true });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer',
        'hover:bg-muted/50',
        'focus-visible:outline-none focus-visible:bg-muted/50',
        isNew && 'animate-pulse-once'
      )}
    >
      {/* Status Icon */}
      <div className={cn('flex-shrink-0', statusColor)}>
        <StatusIcon className="h-5 w-5" />
      </div>

      {/* Type and Address */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{transaction.type}</p>
          <p className="truncate text-sm text-muted-foreground">
            by {truncatedAddress}
          </p>
        </div>
      </div>

      {/* Gas Cost */}
      <div className="flex-shrink-0 text-right">
        <p className="font-medium text-foreground">
          {transaction.gasCost.toFixed(4)} MNT
        </p>
        <p className="text-sm text-muted-foreground">{timeAgo}</p>
      </div>

      {/* Hover indicator */}
      <ArrowRight
        className={cn(
          'h-4 w-4 flex-shrink-0 text-muted-foreground transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}

// Empty state
function EmptyActivityState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No transactions yet</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
        Transactions will appear here once users start using your Paymaster.
      </p>
      <Link href="/docs/integration">
        <Button variant="outline" className="gap-2">
          <BookOpen className="h-4 w-4" />
          View Integration Guide
        </Button>
      </Link>
    </div>
  );
}

// Skeleton loading state
function ActivityFeedSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Skeleton rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="mb-1 h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export skeleton for use elsewhere
export { ActivityFeedSkeleton as RecentActivityFeedSkeleton };
