'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  DollarSign,
  FileCheck,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreatePaymaster, useDeploymentFee } from '@/lib/contracts';

interface CreatePaymasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymasterId: string) => void;
  walletBalance?: string;
}

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  description: string;
  fundingAmount: string;
  confirmed: boolean;
}

const STEP_CONFIG = [
  { step: 1, title: 'Basic Information', icon: Wallet },
  { step: 2, title: 'Initial Funding', icon: DollarSign },
  { step: 3, title: 'Review & Confirm', icon: FileCheck },
] as const;

const QUICK_AMOUNTS = ['1', '5', '10', '25'];

// Estimate: ~0.001 MNT per transaction on Mantle
const ESTIMATED_GAS_PER_TX = 0.001;
const DEPLOYMENT_GAS_ESTIMATE = '0.05';

export function CreatePaymasterModal({
  isOpen,
  onClose,
  onSuccess,
  walletBalance = '100.00',
}: CreatePaymasterModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    fundingAmount: '',
    confirmed: false,
  });

  // Contract hooks
  const { fee: deploymentFee } = useDeploymentFee();
  const { 
    createPaymaster, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error: txError,
    receipt,
    reset 
  } = useCreatePaymaster();

  const isLoading = isPending || isConfirming;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        name: '',
        description: '',
        fundingAmount: '',
        confirmed: false,
      });
      setError(null);
      reset();
    }
  }, [isOpen, reset]);

  // Handle successful creation
  useEffect(() => {
    if (isSuccess && receipt) {
      // Extract paymaster address from receipt logs
      const paymasterCreatedLog = receipt.logs.find(log => 
        log.topics[0] // Check for PaymasterCreated event
      );
      
      if (paymasterCreatedLog?.topics[1]) {
        const createdAddress = `0x${paymasterCreatedLog.topics[1].slice(-40)}` as `0x${string}`;
        onSuccess?.(createdAddress);
        onClose();
      } else {
        // Fallback - just close and let parent refetch
        onSuccess?.('');
        onClose();
      }
    }
  }, [isSuccess, receipt, onSuccess, onClose]);

  // Handle errors
  useEffect(() => {
    if (txError) {
      setError(txError.message || 'Transaction failed. Please try again.');
    }
  }, [txError]);

  const estimatedTransactions = formData.fundingAmount
    ? Math.floor(parseFloat(formData.fundingAmount) / ESTIMATED_GAS_PER_TX)
    : 0;

  const actualDeploymentFee = deploymentFee || DEPLOYMENT_GAS_ESTIMATE;
  const totalCost = formData.fundingAmount
    ? (parseFloat(formData.fundingAmount) + parseFloat(actualDeploymentFee)).toFixed(4)
    : '0';

  const exceedsBalance =
    formData.fundingAmount &&
    parseFloat(totalCost) > parseFloat(walletBalance);

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      setError(null);
    }
  };

  const handleCreate = () => {
    if (!formData.confirmed) return;
    setError(null);
    
    // Call the contract to create paymaster with initial funding
    createPaymaster(formData.fundingAmount || undefined);
  };

  const canProceedStep1 = true; // Name and description are optional
  const canProceedStep2 = formData.fundingAmount && parseFloat(formData.fundingAmount) > 0;
  const canProceedStep3 = formData.confirmed && !exceedsBalance;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Paymaster
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="pb-6">
          <div className="flex items-center justify-between mb-2">
            {STEP_CONFIG.map(({ step: s, title, icon: Icon }) => (
              <div
                key={s}
                className={cn(
                  'flex items-center gap-2',
                  step >= s ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    step > s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : step === s
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground'
                  )}
                >
                  {step > s ? (
                    <span className="text-sm font-semibold">✓</span>
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">{title}</span>
              </div>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-1" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Step {step} of 3
          </p>
        </div>

        {/* Step Content */}
        <div className="min-h-[280px]">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Paymaster Name</Label>
                <Input
                  id="name"
                  placeholder="My Paymaster"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional - give your Paymaster a memorable name
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What will this Paymaster be used for?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - describe the purpose of this Paymaster
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 mt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  What is a Paymaster?
                </h4>
                <p className="text-xs text-muted-foreground">
                  A Paymaster is a smart contract that sponsors gas fees for your users.
                  You fund it with MNT, and it pays transaction fees on behalf of your users,
                  allowing them to interact with your dApp without needing native tokens.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Initial Funding */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount in MNT</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.fundingAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, fundingAmount: e.target.value })
                  }
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={formData.fundingAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, fundingAmount: amount })}
                  >
                    {amount} MNT
                  </Button>
                ))}
              </div>

              {/* Transaction Estimate */}
              {formData.fundingAmount && parseFloat(formData.fundingAmount) > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{formData.fundingAmount} MNT</span>
                    {' ≈ ~'}
                    <span className="text-primary font-semibold">
                      {estimatedTransactions.toLocaleString()}
                    </span>
                    {' transactions'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on average gas cost of {ESTIMATED_GAS_PER_TX} MNT per transaction
                  </p>
                </div>
              )}

              {/* Wallet Balance */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Your wallet balance:</span>
                <span className="text-sm font-medium text-foreground">
                  {walletBalance} MNT
                </span>
              </div>

              {/* Balance Warning */}
              {exceedsBalance && (
                <div className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-error mt-0.5" />
                  <p className="text-sm text-error">
                    Insufficient balance. Total required: {totalCost} MNT
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border divide-y divide-border">
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {formData.name || 'Unnamed Paymaster'}
                  </p>
                </div>
                {formData.description && (
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{formData.description}</p>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Initial Funding</p>
                  <p className="text-sm font-medium text-foreground">
                    {formData.fundingAmount} MNT
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Estimated Deployment Gas
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    ~{DEPLOYMENT_GAS_ESTIMATE} MNT
                  </p>
                </div>
                <div className="p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                  <p className="text-lg font-semibold text-primary">{totalCost} MNT</p>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="confirm"
                  checked={formData.confirmed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmed: checked === true })
                  }
                />
                <Label
                  htmlFor="confirm"
                  className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                >
                  I understand this will require a wallet transaction and the funds
                  will be transferred to the Paymaster contract.
                </Label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-error mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-error">Transaction Failed</p>
                    <p className="text-xs text-error/80 mt-0.5">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {step === 1 ? (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canProceedStep3 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {error ? 'Retrying...' : 'Deploying...'}
                </>
              ) : (
                'Create Paymaster'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
