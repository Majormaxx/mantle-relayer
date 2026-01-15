'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  ArrowUpDown,
  Calendar,
  Code,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Transaction {
  hash: string;
  status: 'success' | 'failed';
  userAddress: string;
  targetContract: string;
  contractName?: string;
  functionCalled: string;
  gasUsed: number;
  timestamp: string;
  callData?: string;
}

interface TransactionsTabProps {
  paymasterId: string;
}

type SortField = 'timestamp' | 'gasUsed' | 'status';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 25;

// Mock transaction data
function generateMockTransactions(count: number): Transaction[] {
  const functions = ['transfer', 'approve', 'mint', 'transferFrom', 'swap', 'stake'];
  const contracts = [
    { address: '0x1234567890abcdef1234567890abcdef12345678', name: 'GameToken' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'CoolNFT' },
    { address: '0x9876543210fedcba9876543210fedcba98765432', name: null },
  ];

  return Array.from({ length: count }, (_, i) => {
    const contract = contracts[i % contracts.length] ?? contracts[0]!;
    const fn = functions[i % functions.length] ?? 'transfer';
    const isSuccess = Math.random() > 0.1;
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 5);

    const tx: Transaction = {
      hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 66),
      status: isSuccess ? 'success' : 'failed',
      userAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      targetContract: contract.address,
      functionCalled: fn,
      gasUsed: 0.001 + Math.random() * 0.01,
      timestamp: date.toISOString(),
      callData: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 130),
    };
    
    if (contract.name) {
      tx.contractName = contract.name;
    }
    
    return tx;
  });
}

function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [showCallData, setShowCallData] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            {transaction.status === 'success' ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Success</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-error">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Failed</span>
              </div>
            )}
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <code className="text-sm font-mono flex-1 break-all">
                {transaction.hash}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(transaction.hash)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={`https://sepolia.mantlescan.xyz/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">User Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">
                  {transaction.userAddress.slice(0, 10)}...{transaction.userAddress.slice(-8)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(transaction.userAddress)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Target Contract</p>
              <div className="flex items-center gap-2">
                {transaction.contractName && (
                  <span className="text-sm">{transaction.contractName}</span>
                )}
                <code className="text-sm font-mono text-muted-foreground">
                  {transaction.targetContract.slice(0, 6)}...{transaction.targetContract.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(transaction.targetContract)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Function Called</p>
              <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                {transaction.functionCalled}()
              </code>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gas Used</p>
              <p className="text-sm font-medium">{transaction.gasUsed.toFixed(6)} MNT</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(transaction.timestamp), 'PPpp')}</span>
                <span className="text-muted-foreground">
                  ({formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })})
                </span>
              </div>
            </div>
          </div>

          {/* Call Data */}
          {transaction.callData && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCallData(!showCallData)}
                className="gap-2"
              >
                <Code className="h-4 w-4" />
                Raw Call Data
                {showCallData ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showCallData && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <code className="text-xs font-mono break-all text-muted-foreground">
                    {transaction.callData}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TransactionsTab({ paymasterId: _paymasterId }: TransactionsTabProps) {
  // Note: paymasterId will be used for API calls in production
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading] = useState(false);

  // Mock data
  const allTransactions = useMemo(() => generateMockTransactions(100), []);

  // Filter and sort
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(query) ||
          tx.userAddress.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((tx) => tx.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'gasUsed':
          comparison = a.gasUsed - b.gasUsed;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allTransactions, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedTransactions.map((tx) => tx.hash)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (hash: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(hash);
    } else {
      newSelected.delete(hash);
    }
    setSelectedRows(newSelected);
  };

  const handleExportCSV = () => {
    const dataToExport = selectedRows.size > 0
      ? filteredTransactions.filter((tx) => selectedRows.has(tx.hash))
      : filteredTransactions;

    const headers = ['Status', 'Transaction Hash', 'User Address', 'Contract', 'Function', 'Gas (MNT)', 'Timestamp'];
    const rows = dataToExport.map((tx) => [
      tx.status,
      tx.hash,
      tx.userAddress,
      tx.contractName || tx.targetContract,
      tx.functionCalled,
      tx.gasUsed.toFixed(6),
      tx.timestamp,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const allSelected = paginatedTransactions.length > 0 &&
    paginatedTransactions.every((tx) => selectedRows.has(tx.hash));

  // Empty state
  if (!isLoading && allTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No Transactions Yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Transactions will appear here once users start interacting with your Paymaster through the SDK.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <a href="/docs/integration" target="_blank" rel="noopener noreferrer">
            View Integration Guide
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hash or address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter === 'all' ? 'All Status' : statusFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('success'); setCurrentPage(1); }}>
                Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter('failed'); setCurrentPage(1); }}>
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>

        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
          {selectedRows.size > 0 && (
            <span className="text-xs text-muted-foreground">({selectedRows.size})</span>
          )}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="font-medium">No Results Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Function</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('gasUsed')}
                >
                  <div className="flex items-center gap-1">
                    Gas Used
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-1">
                    Time
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((tx) => (
                <TableRow
                  key={tx.hash}
                  className="cursor-pointer"
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(tx.hash)}
                      onCheckedChange={(checked) => handleSelectRow(tx.hash, checked === true)}
                    />
                  </TableCell>
                  <TableCell>
                    {tx.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-error" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(tx.hash);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm font-mono text-muted-foreground">
                      {tx.userAddress.slice(0, 6)}...{tx.userAddress.slice(-4)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {tx.contractName || `${tx.targetContract.slice(0, 6)}...${tx.targetContract.slice(-4)}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {tx.functionCalled}()
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{tx.gasUsed.toFixed(4)}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm text-muted-foreground"
                      title={format(new Date(tx.timestamp), 'PPpp')}
                    >
                      {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
