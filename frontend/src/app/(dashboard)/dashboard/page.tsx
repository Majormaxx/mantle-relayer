'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, Activity, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  StatCard,
  TransactionVolumeChart,
  RecentActivityFeed,
  OnboardingChecklist,
  type ChartDataPoint,
  type Transaction,
  type TimeRange,
} from '@/components/dashboard';
import Link from 'next/link';
import { useAggregatedPaymasterStats } from '@/lib/contracts';
import { useDashboardChart, useRecentTransactions, useOnboardingStatus } from '@/lib/api';

// Truncate address helper
function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Real data hooks
  const { 
    totalBalance, 
    activePaymasters, 
    totalTransactions: contractTxCount,
    isLoading: statsLoading 
  } = useAggregatedPaymasterStats(address);

  const { 
    data: chartData = [], 
    isLoading: chartLoading 
  } = useDashboardChart(timeRange);

  const { 
    data: transactions = [], 
    isLoading: txLoading,
    fetchNextPage,
    hasNextPage 
  } = useRecentTransactions(10);

  const { 
    data: onboardingState,
    isLoading: onboardingLoading 
  } = useOnboardingStatus(address);

  const loading = statsLoading || chartLoading || txLoading || onboardingLoading;

  // Transform chart data to expected format
  const formattedChartData: ChartDataPoint[] = (chartData as Array<{date: string; count: number; gasUsed: number}>).map((item) => ({
    date: item.date,
    count: item.count,
    gasUsed: item.gasUsed,
  }));

  // Transform transactions to expected format
  const formattedTransactions: Transaction[] = (transactions as Array<{
    id: string;
    hash: string;
    status: string;
    type: string;
    userAddress: string;
    gasCost: number;
    createdAt: string;
  }>).map((tx) => ({
    id: tx.id,
    txHash: tx.hash,
    status: tx.status === 'success' ? 'success' : 'failed',
    type: tx.type as Transaction['type'],
    userAddress: tx.userAddress,
    gasCost: tx.gasCost,
    timestamp: new Date(tx.createdAt),
  }));

  // Default onboarding state if not loaded
  const defaultOnboardingState = {
    hasPaymaster: false,
    hasFundedPaymaster: false,
    hasWhitelistedContract: false,
  };

  const currentOnboardingState = onboardingState || defaultOnboardingState;

  // Check if user needs onboarding (not all steps complete)
  const needsOnboarding = !currentOnboardingState.hasPaymaster || 
    !currentOnboardingState.hasFundedPaymaster || 
    !currentOnboardingState.hasWhitelistedContract;

  // Stats - use real data from contract
  const stats = {
    totalBalance: totalBalance || '0',
    activePaymasters: activePaymasters || 0,
    totalTransactions: contractTxCount || 0,
    transactionsTrend: 0, // Would need historical data to calculate
    monthlySpending: 0, // Would need to calculate from transactions
    spendingTrend: 0,
  };

  return (
    <div className="space-y-8">
      {/* Onboarding Checklist - only show if not all steps complete */}
      {needsOnboarding && (
        <OnboardingChecklist state={currentOnboardingState} />
      )}

      {/* Welcome message */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
          {isConnected && address && (
            <p className="mt-1 text-muted-foreground">
              Welcome back, {truncateAddress(address)}
            </p>
          )}
        </div>
        <Link href="/paymasters/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Paymaster
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={`${stats.totalBalance} MNT`}
          icon={<Wallet className="h-5 w-5" />}
          iconColor="primary"
          loading={loading}
        />
        <StatCard
          title="Active Paymasters"
          value={stats.activePaymasters}
          icon={<Activity className="h-5 w-5" />}
          iconColor="success"
          loading={loading}
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="secondary"
          trend={stats.transactionsTrend ? { value: stats.transactionsTrend, direction: 'up' } : undefined}
          loading={loading}
        />
        <StatCard
          title="This Month Spending"
          value={`${stats.monthlySpending.toFixed(4)} MNT`}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="warning"
          trend={stats.spendingTrend ? { 
            value: Math.abs(stats.spendingTrend), 
            direction: stats.spendingTrend > 0 ? 'up' : 'down' 
          } : undefined}
          loading={loading}
        />
      </div>

      {/* Chart Section */}
      <TransactionVolumeChart
        data={formattedChartData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        loading={loading}
      />

      {/* Recent Activity */}
      <RecentActivityFeed
        transactions={formattedTransactions}
        loading={loading}
        hasMore={hasNextPage || false}
        onLoadMore={() => fetchNextPage()}
        onTransactionClick={(tx) => console.log('Transaction clicked:', tx)}
      />
    </div>
  );
}
