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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ClipboardPaste,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WhitelistedContract, ContractType, WhitelistedFunction } from './WhitelistTab';

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contract: WhitelistedContract) => void;
}

type Step = 1 | 2;

interface DetectedContract {
  name: string;
  type: ContractType;
  verified: boolean;
  functions: WhitelistedFunction[];
}

const COMMON_ERC20_FUNCTIONS: WhitelistedFunction[] = [
  { selector: '0xa9059cbb', signature: 'transfer(address,uint256)', name: 'transfer' },
  { selector: '0x095ea7b3', signature: 'approve(address,uint256)', name: 'approve' },
  { selector: '0x23b872dd', signature: 'transferFrom(address,address,uint256)', name: 'transferFrom' },
];

const COMMON_ERC721_FUNCTIONS: WhitelistedFunction[] = [
  { selector: '0x23b872dd', signature: 'transferFrom(address,address,uint256)', name: 'transferFrom' },
  { selector: '0x42842e0e', signature: 'safeTransferFrom(address,address,uint256)', name: 'safeTransferFrom' },
  { selector: '0x095ea7b3', signature: 'approve(address,uint256)', name: 'approve' },
  { selector: '0xa22cb465', signature: 'setApprovalForAll(address,bool)', name: 'setApprovalForAll' },
  { selector: '0x40c10f19', signature: 'mint(address,uint256)', name: 'mint' },
];

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Mock contract detection
async function detectContract(address: string): Promise<DetectedContract | null> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Simulate different contract types based on address
  const lastChar = address.slice(-1).toLowerCase();
  
  if (lastChar >= '0' && lastChar <= '5') {
    return {
      name: 'GameToken',
      type: 'ERC-20',
      verified: true,
      functions: COMMON_ERC20_FUNCTIONS,
    };
  } else if (lastChar >= '6' && lastChar <= 'a') {
    return {
      name: 'CoolNFT',
      type: 'ERC-721',
      verified: true,
      functions: COMMON_ERC721_FUNCTIONS,
    };
  } else {
    return {
      name: '',
      type: 'Custom',
      verified: false,
      functions: [
        { selector: '0x12345678', signature: 'customFunction()', name: 'customFunction' },
        { selector: '0x87654321', signature: 'anotherFunction(uint256)', name: 'anotherFunction' },
      ],
    };
  }
}

export function AddContractModal({ isOpen, onClose, onAdd }: AddContractModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedContract, setDetectedContract] = useState<DetectedContract | null>(null);
  const [allowAllFunctions, setAllowAllFunctions] = useState(false);
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAddress('');
      setDetectedContract(null);
      setAllowAllFunctions(false);
      setSelectedFunctions(new Set());
      setError(null);
      setIsDetecting(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Detect contract when valid address is entered
  useEffect(() => {
    if (isValidAddress(address) && !detectedContract && !isDetecting) {
      handleDetect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleDetect = async () => {
    if (!isValidAddress(address)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const result = await detectContract(address);
      setDetectedContract(result);
      
      // Pre-select recommended functions based on contract type
      if (result) {
        if (result.type === 'ERC-20') {
          setSelectedFunctions(new Set(['transfer', 'approve']));
        } else if (result.type === 'ERC-721') {
          setSelectedFunctions(new Set(['transferFrom', 'safeTransferFrom']));
        }
      }
    } catch {
      setError('Failed to detect contract. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
    } catch {
      // Clipboard API not available
    }
  };

  const handleFunctionToggle = (functionName: string, checked: boolean) => {
    const newSelected = new Set(selectedFunctions);
    if (checked) {
      newSelected.add(functionName);
    } else {
      newSelected.delete(functionName);
    }
    setSelectedFunctions(newSelected);
  };

  const handleNext = () => {
    if (step === 1 && detectedContract) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!detectedContract) return;

    setIsSubmitting(true);

    try {
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const selectedFunctionsList = allowAllFunctions
        ? []
        : detectedContract.functions.filter((fn) =>
            selectedFunctions.has(fn.name)
          );

      const newContract: WhitelistedContract = {
        address: address as `0x${string}`,
        name: detectedContract.name,
        type: detectedContract.type,
        functions: selectedFunctionsList,
        verified: detectedContract.verified,
        addedAt: new Date().toISOString(),
      };

      onAdd(newContract);
      onClose();
    } catch {
      setError('Failed to add contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = detectedContract !== null;
  const canProceedStep2 = allowAllFunctions || selectedFunctions.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Add Contract to Whitelist
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="pb-6">
          <div className="flex items-center gap-4 mb-2">
            <div
              className={cn(
                'flex items-center gap-2',
                step >= 1 ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  step > 1
                    ? 'bg-primary text-primary-foreground'
                    : step === 1
                    ? 'border-2 border-primary text-primary'
                    : 'border border-muted-foreground'
                )}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Enter Address</span>
            </div>
            <div className="flex-1 border-t border-border" />
            <div
              className={cn(
                'flex items-center gap-2',
                step >= 2 ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  step === 2
                    ? 'border-2 border-primary text-primary'
                    : 'border border-muted-foreground'
                )}
              >
                2
              </div>
              <span className="text-sm font-medium">Select Functions</span>
            </div>
          </div>
          <Progress value={(step / 2) * 100} className="h-1" />
        </div>

        {/* Step Content */}
        <div className="min-h-[320px]">
          {/* Step 1: Enter Address */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Contract Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setDetectedContract(null);
                      setError(null);
                    }}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePaste}
                    aria-label="Paste from clipboard"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-error flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                  </p>
                )}
              </div>

              {/* Detection Status */}
              {isDetecting && (
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Detecting contract type...
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              )}

              {/* Detected Contract Info */}
              {detectedContract && !isDetecting && (
                <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {detectedContract.name || 'Unknown Contract'}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            detectedContract.type === 'ERC-20'
                              ? 'bg-blue-500/10 text-blue-400'
                              : detectedContract.type === 'ERC-721'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-gray-500/10 text-gray-400'
                          )}
                        >
                          {detectedContract.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {detectedContract.verified ? (
                          <span className="text-success">✓ Verified on Explorer</span>
                        ) : (
                          <span className="text-warning">⚠ Not verified</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {detectedContract.functions.length} functions detected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Undetected warning */}
              {!detectedContract && !isDetecting && isValidAddress(address) && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Unknown Contract</p>
                      <p className="text-sm text-muted-foreground">
                        This contract could not be identified. You can still add it,
                        but please verify the address is correct.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Functions */}
          {step === 2 && detectedContract && (
            <div className="space-y-4">
              {/* Allow All Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="allow-all" className="text-base font-medium">
                    Allow all functions
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Less secure - any function can be called
                  </p>
                </div>
                <Switch
                  id="allow-all"
                  checked={allowAllFunctions}
                  onCheckedChange={setAllowAllFunctions}
                />
              </div>

              {allowAllFunctions && (
                <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-warning">
                    Allowing all functions means any transaction to this contract
                    will be sponsored. This may expose you to unexpected costs.
                  </p>
                </div>
              )}

              {/* Function List */}
              {!allowAllFunctions && (
                <div className="space-y-2">
                  <Label>Select functions to whitelist</Label>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {detectedContract.functions.map((fn) => (
                      <div
                        key={fn.selector}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={fn.selector}
                          checked={selectedFunctions.has(fn.name)}
                          onCheckedChange={(checked) =>
                            handleFunctionToggle(fn.name, checked === true)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={fn.selector}
                            className="font-mono text-sm cursor-pointer"
                          >
                            {fn.name}()
                          </Label>
                          <p className="text-xs text-muted-foreground font-mono">
                            {fn.signature}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedFunctions.size} of {detectedContract.functions.length} functions selected
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {!allowAllFunctions && detectedContract.type !== 'Custom' && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Tip:</span>{' '}
                    {detectedContract.type === 'ERC-20'
                      ? 'For ERC-20 tokens, we recommend whitelisting transfer() and approve().'
                      : 'For NFTs, we recommend whitelisting transferFrom() and safeTransferFrom().'}
                  </p>
                </div>
              )}

              {/* Summary & Gas Estimate */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h4 className="text-sm font-medium">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract</span>
                    <span className="font-mono text-xs">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{detectedContract.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Functions</span>
                    <span>
                      {allowAllFunctions ? 'All' : `${selectedFunctions.size} selected`}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Gas Fee</span>
                      <span className="text-primary">~0.002 MNT</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This requires an on-chain transaction and wallet signature.
                </p>
              </div>
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
            <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {step === 1 ? (
            <Button onClick={handleNext} disabled={!canProceedStep1 || isDetecting}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedStep2 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Contract'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
