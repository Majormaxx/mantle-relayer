'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, SlidersHorizontal, ArrowUpDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PaymasterCard,
  PaymasterCardSkeleton,
  PaymasterCardData,
  PaymasterStatus,
} from '@/components/paymaster/PaymasterCard';
import { CreatePaymasterModal } from '@/components/paymaster/CreatePaymasterModal';
import { FundPaymasterModal } from '@/components/paymaster/FundPaymasterModal';
import { cn } from '@/lib/utils';
import { usePaymastersWithData, useWalletMntBalance, usePaymasterPauseControl } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';

type FilterOption = 'all' | 'active' | 'paused' | 'low-balance';
type SortOption = 'recent' | 'name' | 'balance' | 'transactions';

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'low-balance', label: 'Low Balance' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name' },
  { value: 'balance', label: 'Balance' },
  { value: 'transactions', label: 'Transactions' },
];

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
          <Wallet className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No Paymasters Yet
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Create your first Paymaster to start sponsoring gas fees for your users.
        It only takes a few minutes to get started.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Create First Paymaster
      </Button>
    </div>
  );
}

function NoResults({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        No Results Found
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        No paymasters match &quot;{searchQuery}&quot;. Try adjusting your search or filters.
      </p>
    </div>
  );
}

export default function PaymastersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fundingPaymaster, setFundingPaymaster] = useState<PaymasterCardData | null>(null);
  const [pausingPaymaster, setPausingPaymaster] = useState<string | null>(null);

  // Real data from contracts
  const { paymasters, isLoading, refetch } = usePaymastersWithData();
  const { balance: walletBalance } = useWalletMntBalance();
  
  // Pause/unpause control - we'll use this dynamically
  const pauseControl = usePaymasterPauseControl(pausingPaymaster as `0x${string}` | undefined);

  // Filter and sort paymasters
  const filteredPaymasters = useMemo(() => {
    let result = [...paymasters];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter((p) => p.status === filter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sort) {
        case 'name':
          return (a.name || 'Unnamed').localeCompare(b.name || 'Unnamed');
        case 'balance':
          return parseFloat(b.balance) - parseFloat(a.balance);
        case 'transactions':
          return b.transactionCount - a.transactionCount;
        case 'recent':
        default:
          return 0; // Keep original order (would be by date in real app)
      }
    });

    return result;
  }, [paymasters, searchQuery, filter, sort]);

  const handleFund = (id: string) => {
    const paymaster = paymasters.find(p => p.id === id);
    if (paymaster) {
      setFundingPaymaster(paymaster);
    }
  };

  const handlePauseResume = async (id: string, currentStatus: PaymasterStatus) => {
    setPausingPaymaster(id);
    try {
      if (currentStatus === 'paused') {
        pauseControl.unpause();
        toast({ title: 'Resuming paymaster...', description: 'Please wait for the transaction to confirm' });
      } else {
        pauseControl.pause();
        toast({ title: 'Pausing paymaster...', description: 'Please wait for the transaction to confirm' });
      }
    } catch (error) {
      toast({ title: 'Failed to update paymaster status', variant: 'destructive' });
      console.error(error);
    } finally {
      setPausingPaymaster(null);
    }
  };

  const handleCreateSuccess = (paymasterAddress: string) => {
    toast({ title: 'Paymaster created successfully!' });
    refetch();
    router.push(`/paymasters/${paymasterAddress}`);
  };

  const handleFundSuccess = () => {
    toast({ title: 'Paymaster funded successfully!' });
    setFundingPaymaster(null);
    refetch();
  };

  const hasPaymasters = paymasters.length > 0;
  const hasResults = filteredPaymasters.length > 0;
  const activeFilter = FILTER_OPTIONS.find((f) => f.value === filter);
  const activeSort = SORT_OPTIONS.find((s) => s.value === sort);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paymasters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your gas-sponsoring contracts
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Paymaster
        </Button>
      </div>

      {hasPaymasters && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Input
                placeholder="Search paymasters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {activeFilter?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {FILTER_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={cn(filter === option.value && 'bg-accent')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {activeSort?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={cn(sort === option.value && 'bg-accent')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PaymasterCardSkeleton key={i} />
          ))}
        </div>
      ) : !hasPaymasters ? (
        <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : !hasResults ? (
        <NoResults searchQuery={searchQuery} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPaymasters.map((paymaster) => (
            <PaymasterCard
              key={paymaster.id}
              paymaster={paymaster}
              onFund={handleFund}
              onPauseResume={handlePauseResume}
            />
          ))}
        </div>
      )}

      {/* Create Paymaster Modal */}
      <CreatePaymasterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        walletBalance={walletBalance}
      />

      {/* Fund Paymaster Modal */}
      {fundingPaymaster && (
        <FundPaymasterModal
          isOpen={!!fundingPaymaster}
          onClose={() => setFundingPaymaster(null)}
          onSuccess={handleFundSuccess}
          paymasterAddress={fundingPaymaster.address as `0x${string}`}
          paymasterName={fundingPaymaster.name || 'Paymaster'}
          currentBalance={fundingPaymaster.balance}
        />
      )}
    </div>
  );
}
