'use client';

import { useState, useEffect } from 'react';
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
  type OnboardingState,
} from '@/components/dashboard';
import Link from 'next/link';

// Mock data generator for demo purposes
function generateMockChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 100) + 10,
      gasUsed: Math.random() * 0.5 + 0.01,
    });
  }
  return data;
}

function generateMockTransactions(): Transaction[] {
  const types: Transaction['type'][] = ['Transfer', 'Approve', 'Mint', 'Swap'];
  const statuses: Transaction['status'][] = ['success', 'success', 'success', 'failed'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `tx-${i}`,
    txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    type: types[Math.floor(Math.random() * types.length)],
    userAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    gasCost: Math.random() * 0.01 + 0.001,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
  }));
}

// Truncate address helper
function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartData(generateMockChartData());
      setTransactions(generateMockTransactions());
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Mock stats - in production these would come from API
  const stats = {
    totalBalance: '12.5',
    activePaymasters: 3,
    totalTransactions: 1247,
    transactionsTrend: 12.5,
    monthlySpending: 156.42,
    spendingTrend: -3.2,
  };

  // Mock onboarding state - in production this would come from API
  // Set to false to show the onboarding checklist for demo
  const onboardingState: OnboardingState = {
    hasPaymaster: false,
    hasFundedPaymaster: false,
    hasWhitelistedContract: false,
  };

  // Check if user needs onboarding (not all steps complete)
  const needsOnboarding = !onboardingState.hasPaymaster || 
    !onboardingState.hasFundedPaymaster || 
    !onboardingState.hasWhitelistedContract;

  return (
    <div className="space-y-8">
      {/* Onboarding Checklist - only show if not all steps complete */}
      {needsOnboarding && (
        <OnboardingChecklist state={onboardingState} />
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
          trend={{ value: stats.transactionsTrend, direction: 'up' }}
          loading={loading}
        />
        <StatCard
          title="This Month Spending"
          value={`$${stats.monthlySpending.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="warning"
          trend={{ 
            value: Math.abs(stats.spendingTrend), 
            direction: stats.spendingTrend > 0 ? 'up' : 'down' 
          }}
          loading={loading}
        />
      </div>

      {/* Chart Section */}
      <TransactionVolumeChart
        data={chartData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        loading={loading}
      />

      {/* Recent Activity */}
      <RecentActivityFeed
        transactions={transactions}
        loading={loading}
        hasMore={true}
        onLoadMore={() => console.log('Load more clicked')}
        onTransactionClick={(tx) => console.log('Transaction clicked:', tx)}
      />
    </div>
  );
}
