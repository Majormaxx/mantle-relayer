'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Copy,
  Check,
  MoreVertical,
  ExternalLink,
  DollarSign,
  Pause,
  Play,
  Activity,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type PaymasterStatus = 'active' | 'paused' | 'low-balance';

export interface PaymasterCardData {
  id: string;
  address: `0x${string}`;
  name: string;
  status: PaymasterStatus;
  balance: string;
  transactionCount: number;
  uniqueUsers: number;
}

interface PaymasterCardProps {
  paymaster: PaymasterCardData;
  onFund?: (id: string) => void;
  onPauseResume?: (id: string, currentStatus: PaymasterStatus) => void;
  className?: string;
}

const statusConfig: Record<
  PaymasterStatus,
  { color: string; bgColor: string; label: string }
> = {
  active: {
    color: 'bg-success',
    bgColor: 'bg-success/10',
    label: 'Active',
  },
  paused: {
    color: 'bg-muted-foreground',
    bgColor: 'bg-muted-foreground/10',
    label: 'Paused',
  },
  'low-balance': {
    color: 'bg-warning',
    bgColor: 'bg-warning/10',
    label: 'Low Balance',
  },
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PaymasterCard({
  paymaster,
  onFund,
  onPauseResume,
  className,
}: PaymasterCardProps) {
  const [copied, setCopied] = useState(false);
  const status = statusConfig[paymaster.status];

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await navigator.clipboard.writeText(paymaster.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFund?.(paymaster.id);
  };

  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPauseResume?.(paymaster.id, paymaster.status);
  };

  const explorerUrl = `https://sepolia.mantlescan.xyz/address/${paymaster.address}`;

  return (
    <Link
      href={`/paymasters/${paymaster.id}`}
      className={cn(
        'block rounded-xl border border-border bg-card p-5 transition-all duration-200',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
    >
      {/* Header with status and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {paymaster.name || 'Unnamed Paymaster'}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  status.bgColor
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', status.color)} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-mono text-xs text-muted-foreground">
                {truncateAddress(paymaster.address)}
              </span>
              <button
                onClick={handleCopy}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy address"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleFund}>
              <DollarSign className="h-4 w-4 mr-2" />
              Fund
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePauseResume}>
              {paymaster.status === 'paused' ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className="font-semibold text-foreground">{paymaster.balance} MNT</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Transactions
          </p>
          <p className="font-semibold text-foreground">
            {paymaster.transactionCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Users className="h-3 w-3" />
            Users
          </p>
          <p className="font-semibold text-foreground">
            {paymaster.uniqueUsers.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function PaymasterCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
