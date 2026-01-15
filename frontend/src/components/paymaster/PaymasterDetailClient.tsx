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

export type PaymasterStatus = 'active' | 'paused' | 'low-balance';

interface PaymasterDetailData {
  id: string;
  address: `0x${string}`;
  name: string;
  description?: string;
  status: PaymasterStatus;
  balance: string;
  totalTransactions: number;
  transactionsTrend: number;
  uniqueUsers: number;
  totalGasSpent: string;
}

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

// Mock data for demonstration
const MOCK_PAYMASTER: PaymasterDetailData = {
  id: '1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Main Paymaster',
  description: 'Primary paymaster for sponsoring game transactions',
  status: 'active',
  balance: '45.50',
  totalTransactions: 1234,
  transactionsTrend: 12.5,
  uniqueUsers: 89,
  totalGasSpent: '23.45',
};

// Generate mock chart data
function generateMockChartData(): Array<{ date: string; count: number; gasUsed: number }> {
  const data: Array<{ date: string; count: number; gasUsed: number }> = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0] as string,
      count: Math.floor(Math.random() * 100) + 20,
      gasUsed: Math.random() * 2 + 0.5,
    });
  }
  return data;
}

type TransactionType = 'Transfer' | 'Approve' | 'Mint' | 'Swap' | 'Other';
type TransactionStatus = 'success' | 'failed' | 'pending';

interface MockTransaction {
  id: string;
  txHash: string;
  status: TransactionStatus;
  type: TransactionType;
  gasCost: number;
  userAddress: string;
  timestamp: Date;
}

// Generate mock transactions
function generateMockTransactions(): MockTransaction[] {
  const types: TransactionType[] = ['Transfer', 'Approve', 'Mint', 'Swap', 'Other'];
  const statuses: TransactionStatus[] = ['success', 'success', 'success', 'failed'];
  const transactions: MockTransaction[] = [];
  
  for (let i = 0; i < 5; i++) {
    const typeIndex = Math.floor(Math.random() * types.length);
    const statusIndex = Math.floor(Math.random() * statuses.length);
    transactions.push({
      id: `tx-${i}`,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      type: types[typeIndex] ?? 'Transfer',
      status: statuses[statusIndex] ?? 'success',
      gasCost: parseFloat((Math.random() * 0.01).toFixed(4)),
      userAddress: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000 * 24),
    });
  }
  return transactions;
}

export function PaymasterDetailClient({ paymasterId }: PaymasterDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  
  // In production, fetch this from API using paymasterId
  const paymaster = MOCK_PAYMASTER;
  const chartData = generateMockChartData();
  const transactions = generateMockTransactions();
  const status = statusConfig[paymaster.status];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymaster.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = () => {
    setIsFundModalOpen(true);
  };

  const handleFundPaymaster = async (amount: number) => {
    console.log('Funding paymaster with:', amount, 'MNT');
    // TODO: Implement actual funding transaction
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In production, this would call the SDK to fund the paymaster
  };

  const handlePauseResume = () => {
    console.log('Toggle pause for:', paymasterId);
    // TODO: Implement pause/resume
  };

  const explorerUrl = `https://sepolia.mantlescan.xyz/address/${paymaster.address}`;

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
              {paymaster.name || 'Unnamed Paymaster'}
            </h1>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                status.bgColor
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.color)} />
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {truncateAddress(paymaster.address)}
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
          <Button variant="outline" onClick={handlePauseResume}>
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
          value={`${paymaster.balance} MNT`}
          icon={<Wallet className="h-5 w-5" />}
          iconColor="primary"
          onClick={handleFund}
        />
        <StatCard
          title="Transactions"
          value={paymaster.totalTransactions.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          iconColor="secondary"
          trend={{ value: paymaster.transactionsTrend, direction: 'up' }}
        />
        <StatCard
          title="Unique Users"
          value={paymaster.uniqueUsers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          iconColor="success"
        />
        <StatCard
          title="Gas Spent"
          value={`${paymaster.totalGasSpent} MNT`}
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
                data={chartData}
                timeRange="7d"
                onTimeRangeChange={() => {}}
              />
            </div>
            <div>
              <RecentActivityFeed
                transactions={transactions}
                onLoadMore={() => {}}
                hasMore={false}
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
        paymasterName={paymaster.name}
        paymasterAddress={paymaster.address}
        currentBalance={parseFloat(paymaster.balance)}
        onFund={handleFundPaymaster}
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
