'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Wallet,
  Activity,
  Users,
  DollarSign,
  Pause,
  Play,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionVolumeChart } from '@/components/dashboard/TransactionVolumeChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { WhitelistTab } from './WhitelistTab';
import { SpendingLimitsTab } from './SpendingLimitsTab';
import { TransactionsTab } from './TransactionsTab';
import { FundPaymasterModal } from './FundPaymasterModal';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  usePaymasterBalance, 
  usePaymasterAnalytics, 
  usePaymasterPaused,
  usePaymasterPauseControl 
} from '@/lib/contracts';
import { useTransactions, useAnalyticsChart } from '@/lib/api';

export type PaymasterStatus = 'active' | 'paused' | 'low-balance';

interface PaymasterDetailClientProps {
  paymasterId: string;
}

const statusConfig: Record<
  PaymasterStatus,
  { color: string; bgColor: string; label: string }
> = {
  active: {
    color: 'bg-success',
    bgColor: 'bg-success/10 text-success',
    label: 'Active',
  },
  paused: {
    color: 'bg-muted-foreground',
    bgColor: 'bg-muted-foreground/10 text-muted-foreground',
    label: 'Paused',
  },
  'low-balance': {
    color: 'bg-warning',
    bgColor: 'bg-warning/10 text-warning',
    label: 'Low Balance',
  },
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

// Low balance threshold in MNT
const LOW_BALANCE_THRESHOLD = 0.1;

export function PaymasterDetailClient({ paymasterId }: PaymasterDetailClientProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  
  // Ensure paymasterId is a valid address
  const paymasterAddress = paymasterId as `0x${string}`;

  // Contract data hooks
  const { balance, isLoading: balanceLoading, refetch: refetchBalance } = usePaymasterBalance(paymasterAddress);
  const { analytics, isLoading: analyticsLoading } = usePaymasterAnalytics(paymasterAddress);
  const { isPaused, isLoading: pausedLoading } = usePaymasterPaused(paymasterAddress);
  const { pause, unpause, isPending: pausePending, isConfirming: pauseConfirming } = usePaymasterPauseControl(paymasterAddress);
  
  // API data hooks
  const { data: transactionsData, isLoading: txLoading } = useTransactions({ paymasterId, limit: 5 });
  const { data: chartData = [], isLoading: chartLoading } = useAnalyticsChart({ paymasterId, timeRange: '7d' });

  const isLoading = balanceLoading || analyticsLoading || pausedLoading;
  const isPauseLoading = pausePending || pauseConfirming;

  // Determine status
  const getStatus = (): PaymasterStatus => {
    if (isPaused) return 'paused';
    const balanceNum = parseFloat(balance || '0');
    if (balanceNum < LOW_BALANCE_THRESHOLD) return 'low-balance';
    return 'active';
  };

  const currentStatus = getStatus();
  const statusInfo = statusConfig[currentStatus];

  // Parse analytics data
  const totalTransactions = Number(analytics?.totalTransactions || 0);
  const uniqueUsers = Number(analytics?.uniqueUsers || 0);
  const totalGasSpent = analytics?.totalGasSpent 
    ? (parseFloat(analytics.totalGasSpent) / 1e18).toFixed(4) 
    : '0';

  // Format transactions for the feed
  const transactions = (transactionsData?.transactions || []).map((tx: { 
    id: string; 
    hash: string; 
    status: string; 
    functionName?: string; 
    gasUsed?: string; 
    userAddress: string; 
    createdAt: string 
  }) => ({
    id: tx.id,
    txHash: tx.hash,
    status: tx.status === 'success' ? 'success' as const : 'failed' as const,
    type: (tx.functionName || 'Other') as 'Transfer' | 'Approve' | 'Mint' | 'Swap' | 'Other',
    gasCost: tx.gasUsed ? parseFloat(tx.gasUsed) / 1e18 : 0,
    userAddress: tx.userAddress,
    timestamp: new Date(tx.createdAt),
  }));

  // Format chart data
  const formattedChartData = (chartData || []).map((item) => ({
    date: item.date,
    count: item.transactions,
    gasUsed: parseFloat(item.gasUsed),
  }));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymasterAddress);
    setCopied(true);
    toast({ title: 'Address copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = () => {
    setIsFundModalOpen(true);
  };

  const handleFundSuccess = () => {
    refetchBalance();
    toast({ title: 'Paymaster funded successfully!' });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      unpause();
      toast({ title: 'Resuming paymaster...' });
    } else {
      pause();
      toast({ title: 'Pausing paymaster...' });
    }
  };

  const explorerUrl = `https://sepolia.mantlescan.xyz/address/${paymasterAddress}`;

  if (isLoading) {
    return <PaymasterDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/paymasters"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Paymasters
      </Link>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Paymaster
            </h1>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                statusInfo.bgColor
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', statusInfo.color)} />
              {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {truncateAddress(paymasterAddress)}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View on explorer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleFund}>
            <DollarSign className="h-4 w-4 mr-2" />
            Fund
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePauseResume}
            disabled={isPauseLoading}
          >
            {isPaused ? (
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
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance"
          value={`${balance || '0'} MNT`}
          icon={<Wallet className="h-5 w-5" />}
          iconColor="primary"
          onClick={handleFund}
        />
        <StatCard
          title="Transactions"
          value={totalTransactions.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          iconColor="secondary"
        />
        <StatCard
          title="Unique Users"
          value={uniqueUsers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          iconColor="success"
        />
        <StatCard
          title="Gas Spent"
          value={`${totalGasSpent} MNT`}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="warning"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="whitelist"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Whitelist
          </TabsTrigger>
          <TabsTrigger
            value="limits"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Spending Limits
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionVolumeChart
                data={formattedChartData}
                timeRange="7d"
                onTimeRangeChange={() => {}}
                loading={chartLoading}
              />
            </div>
            <div>
              <RecentActivityFeed
                transactions={transactions}
                onLoadMore={() => {}}
                hasMore={false}
                loading={txLoading}
              />
            </div>
          </div>
        </TabsContent>

        {/* Whitelist Tab */}
        <TabsContent value="whitelist">
          <WhitelistTab paymasterId={paymasterId} />
        </TabsContent>

        {/* Spending Limits Tab */}
        <TabsContent value="limits">
          <SpendingLimitsTab paymasterId={paymasterId} />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <TransactionsTab paymasterId={paymasterId} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="text-center py-16 text-muted-foreground">
            Paymaster settings coming soon...
          </div>
        </TabsContent>
      </Tabs>

      {/* Fund Paymaster Modal */}
      <FundPaymasterModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        paymasterName="Paymaster"
        paymasterAddress={paymasterAddress}
        currentBalance={balance || '0'}
        onSuccess={handleFundSuccess}
      />
    </div>
  );
}

function PaymasterDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
