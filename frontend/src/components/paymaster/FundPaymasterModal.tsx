'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import confetti to avoid SSR issues
const triggerConfetti = () => {
  if (typeof window !== 'undefined') {
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9FE870', '#10B981', '#22C55E', '#86EFAC'],
      });
    }).catch(() => {
      // Confetti not available, silently ignore
    });
  }
};

interface FundPaymasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymasterName: string;
  paymasterAddress: string;
  currentBalance: number;
  isFirstFunding?: boolean;
  onFund: (amount: number) => Promise<void>;
}

type BalanceStatus = 'healthy' | 'low' | 'critical';

function getBalanceStatus(balance: number): BalanceStatus {
  if (balance < 1) return 'critical';
  if (balance < 10) return 'low';
  return 'healthy';
}

function getBalanceStatusColor(status: BalanceStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-success';
    case 'low':
      return 'text-warning';
    case 'critical':
      return 'text-error';
  }
}

function getBalanceStatusBg(status: BalanceStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-success/10 border-success/30';
    case 'low':
      return 'bg-warning/10 border-warning/30';
    case 'critical':
      return 'bg-error/10 border-error/30';
  }
}

export function FundPaymasterModal({
  isOpen,
  onClose,
  paymasterName,
  paymasterAddress,
  currentBalance,
  isFirstFunding = false,
  onFund,
}: FundPaymasterModalProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  // Mock wallet balance
  const walletBalance = 150.5;
  const networkFee = 0.001;
  
  // Average gas cost per transaction (mock)
  const avgGasCost = 0.002;
  
  const amountNum = parseFloat(amount) || 0;
  const totalCost = amountNum + networkFee;
  const estimatedTransactions = amountNum > 0 ? Math.floor(amountNum / avgGasCost) : 0;
  const hasInsufficientBalance = totalCost > walletBalance;

  const status = getBalanceStatus(currentBalance);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError(null);
      setSuccess(false);
      setNewBalance(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleQuickAmount = (quickAmount: number) => {
    const newAmount = amountNum + quickAmount;
    setAmount(newAmount.toString());
  };

  const handleMax = () => {
    const maxAmount = Math.max(0, walletBalance - networkFee);
    setAmount(maxAmount.toFixed(2));
  };

  const handleSubmit = async () => {
    if (amountNum <= 0) {
      setError('Please enter an amount');
      return;
    }

    if (hasInsufficientBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onFund(amountNum);
      setNewBalance(currentBalance + amountNum);
      setSuccess(true);
      
      // Trigger confetti on first funding
      if (isFirstFunding) {
        triggerConfetti();
      }
    } catch (err) {
      setError('Transaction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Fund Paymaster
          </DialogTitle>
          <DialogDescription>
            {paymasterName} ({paymasterAddress.slice(0, 6)}...{paymasterAddress.slice(-4)})
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <div className="space-y-6 pt-4">
            {/* Current Balance */}
            <div
              className={cn(
                'rounded-lg border p-4',
                getBalanceStatusBg(status)
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className={cn('text-2xl font-bold', getBalanceStatusColor(status))}>
                    {currentBalance.toFixed(4)} MNT
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium capitalize',
                    status === 'healthy' && 'bg-success/20 text-success',
                    status === 'low' && 'bg-warning/20 text-warning',
                    status === 'critical' && 'bg-error/20 text-error'
                  )}
                >
                  {status}
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <Label htmlFor="amount">Amount to Deposit</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className="pr-16 text-lg h-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  MNT
                </span>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {[1, 5, 10, 25].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="flex-1 min-w-[60px]"
                  >
                    +{quickAmount}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMax}
                  className="flex-1 min-w-[60px]"
                >
                  Max
                </Button>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Wallet balance: {walletBalance.toFixed(2)} MNT
              </p>
            </div>

            {/* Estimation */}
            {amountNum > 0 && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    This will enable approximately{' '}
                    <span className="font-medium text-foreground">
                      {estimatedTransactions.toLocaleString()} transactions
                    </span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Based on average gas cost of {avgGasCost} MNT per transaction
                </p>
              </div>
            )}

            {/* Cost Summary */}
            {amountNum > 0 && (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount to deposit</span>
                  <span>{amountNum.toFixed(4)} MNT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network fee (est.)</span>
                  <span>~{networkFee} MNT</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total from wallet</span>
                    <span className="text-primary">{totalCost.toFixed(4)} MNT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {hasInsufficientBalance && amountNum > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/20 p-3">
                <AlertCircle className="h-4 w-4 text-error mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-error">Insufficient Balance</p>
                  <p className="text-xs text-muted-foreground">
                    You need {(totalCost - walletBalance).toFixed(4)} more MNT to complete this deposit.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={amountNum <= 0 || hasInsufficientBalance || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Fund Paymaster'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Deposit Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your Paymaster has been funded.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">New Balance</p>
              <p className="text-2xl font-bold text-success">
                {newBalance?.toFixed(4)} MNT
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={onClose}>Close</Button>
              <Button variant="ghost" asChild>
                <a
                  href={`https://sepolia.mantlescan.xyz/address/${paymasterAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
