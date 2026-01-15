'use client';

import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit2,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddContractModal } from './AddContractModal';
import { cn } from '@/lib/utils';

export type ContractType = 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Custom';

export interface WhitelistedFunction {
  selector: string;
  signature: string;
  name: string;
}

export interface WhitelistedContract {
  address: `0x${string}`;
  name: string;
  type: ContractType;
  functions: WhitelistedFunction[];
  verified: boolean;
  addedAt: string;
}

interface WhitelistTabProps {
  paymasterId: string;
}

const CONTRACT_TYPE_COLORS: Record<ContractType, string> = {
  'ERC-20': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'ERC-721': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'ERC-1155': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Custom': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

// Mock data for demonstration
const MOCK_CONTRACTS: WhitelistedContract[] = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'GameToken',
    type: 'ERC-20',
    functions: [
      { selector: '0xa9059cbb', signature: 'transfer(address,uint256)', name: 'transfer' },
      { selector: '0x095ea7b3', signature: 'approve(address,uint256)', name: 'approve' },
    ],
    verified: true,
    addedAt: '2026-01-10T10:00:00Z',
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    name: 'GameNFT',
    type: 'ERC-721',
    functions: [
      { selector: '0x23b872dd', signature: 'transferFrom(address,address,uint256)', name: 'transferFrom' },
      { selector: '0x42842e0e', signature: 'safeTransferFrom(address,address,uint256)', name: 'safeTransferFrom' },
      { selector: '0x40c10f19', signature: 'mint(address,uint256)', name: 'mint' },
    ],
    verified: true,
    addedAt: '2026-01-12T14:30:00Z',
  },
  {
    address: '0x9876543210fedcba9876543210fedcba98765432',
    name: '',
    type: 'Custom',
    functions: [],
    verified: false,
    addedAt: '2026-01-14T08:00:00Z',
  },
];

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ContractCard({
  contract,
  onEdit,
  onRemove,
}: {
  contract: WhitelistedContract;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contract.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `https://sepolia.mantlescan.xyz/address/${contract.address}`;
  const hasAllFunctions = contract.functions.length === 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-border/80">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {contract.name || 'Unknown Contract'}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                  CONTRACT_TYPE_COLORS[contract.type]
                )}
              >
                {contract.type}
              </span>
              {contract.verified && (
                <span className="text-success text-xs">✓ Verified</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-mono text-xs text-muted-foreground">
                {truncateAddress(contract.address)}
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
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-error" />
          </Button>
        </div>
      </div>

      {/* Functions */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Whitelisted Functions</span>
          {contract.functions.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show all ({contract.functions.length}) <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {hasAllFunctions ? (
            <span className="inline-flex items-center rounded-full bg-success/10 border border-success/20 px-3 py-1 text-xs font-medium text-success">
              All Functions
            </span>
          ) : (
            (expanded ? contract.functions : contract.functions.slice(0, 3)).map(
              (fn) => (
                <span
                  key={fn.selector}
                  className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground font-mono"
                  title={fn.signature}
                >
                  {fn.name}()
                </span>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-warning/20 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-border">
          <Shield className="h-10 w-10 text-muted-foreground" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-warning-foreground">
            <span className="text-xs font-bold">?</span>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No Contracts Whitelisted
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Add contracts to control which transactions are sponsored by this Paymaster.
      </p>
      <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3 mb-6 max-w-md">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-warning text-left">
          Without whitelisted contracts, all transactions will be rejected.
          Add at least one contract to start sponsoring transactions.
        </p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Contract
      </Button>
    </div>
  );
}

export function WhitelistTab({ paymasterId }: WhitelistTabProps) {
  const [contracts, setContracts] = useState<WhitelistedContract[]>(MOCK_CONTRACTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contractToRemove, setContractToRemove] = useState<WhitelistedContract | null>(null);
  const [isLoading] = useState(false);

  const handleAddContract = (contract: WhitelistedContract) => {
    setContracts([...contracts, contract]);
    console.log('Add contract to paymaster:', paymasterId, contract);
  };

  const handleRemoveContract = () => {
    if (contractToRemove) {
      setContracts(contracts.filter((c) => c.address !== contractToRemove.address));
      setContractToRemove(null);
    }
  };

  const handleEditContract = (contract: WhitelistedContract) => {
    console.log('Edit contract:', contract.address);
    // TODO: Open edit modal
  };

  if (isLoading) {
    return <WhitelistTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            Whitelisted Contracts
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Whitelisted contracts are the only contracts your Paymaster will
                  sponsor gas for. Add contracts and select which functions to allow.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {contracts.length > 0 && (
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contract
          </Button>
        )}
      </div>

      {/* Content */}
      {contracts.length === 0 ? (
        <EmptyState onAddClick={() => setIsAddModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.address}
              contract={contract}
              onEdit={() => handleEditContract(contract)}
              onRemove={() => setContractToRemove(contract)}
            />
          ))}
        </div>
      )}

      {/* Add Contract Modal */}
      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContract}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!contractToRemove}
        onOpenChange={(open: boolean) => !open && setContractToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contract?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to remove{' '}
                <span className="font-medium text-foreground">
                  {contractToRemove?.name || 'this contract'}
                </span>{' '}
                from the whitelist?
              </p>
              <p className="text-warning">
                Transactions to this contract will no longer be sponsored and will be rejected.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveContract}
              className="bg-error text-error-foreground hover:bg-error/90"
            >
              Remove Contract
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WhitelistTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
