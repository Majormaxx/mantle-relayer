'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  Wallet,
  PauseCircle,
  Trash2,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function DangerZoneSettingsPage() {
  const [withdrawAddress, setWithdrawAddress] = useState('0x1234567890abcdef1234567890abcdef12345678');
  const [withdrawConfirmation, setWithdrawConfirmation] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const totalBalance = 156.78;

  const handleWithdrawAll = async () => {
    setIsProcessing(true);
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setActionSuccess('withdraw');
    setWithdrawConfirmation('');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handlePauseAll = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setActionSuccess('pause');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setActionSuccess('delete');
    setDeleteConfirmation('');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-error">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Irreversible and destructive actions. Please proceed with caution.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg bg-error/10 border border-error/30 p-4">
        <AlertTriangle className="h-5 w-5 text-error mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-error">Caution Required</p>
          <p className="text-sm text-muted-foreground mt-1">
            Actions in this section can have significant consequences. Some operations
            require on-chain transactions and cannot be undone.
          </p>
        </div>
      </div>

      {/* Withdraw All Funds */}
      <Card className="border-error/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-error" />
            Withdraw All Paymaster Funds
          </CardTitle>
          <CardDescription>
            Transfer all MNT from all Paymasters back to your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Balance</span>
              <span className="text-lg font-bold">{totalBalance.toFixed(2)} MNT</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-warning">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Your Paymasters will no longer be able to sponsor transactions after
              funds are withdrawn.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Wallet className="h-4 w-4" />
                Withdraw All Funds
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Withdraw All Funds</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      This will transfer {totalBalance.toFixed(2)} MNT from all your
                      Paymasters to the destination address.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAddress">Destination Address</Label>
                      <Input
                        id="withdrawAddress"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawConfirm">
                        Type <span className="font-mono font-bold">WITHDRAW ALL</span> to confirm
                      </Label>
                      <Input
                        id="withdrawConfirm"
                        value={withdrawConfirmation}
                        onChange={(e) => setWithdrawConfirmation(e.target.value)}
                        placeholder="WITHDRAW ALL"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleWithdrawAll}
                  disabled={withdrawConfirmation !== 'WITHDRAW ALL' || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Withdraw All Funds'
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {actionSuccess === 'withdraw' && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Funds withdrawn successfully
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pause All Paymasters */}
      <Card className="border-error/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PauseCircle className="h-5 w-5 text-error" />
            Pause All Paymasters
          </CardTitle>
          <CardDescription>
            Immediately stop all Paymasters from sponsoring transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use this if you suspect abuse or need to immediately stop all sponsored
            transactions. You can resume Paymasters individually later.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-error text-error hover:bg-error/10">
                <PauseCircle className="h-4 w-4" />
                Pause All Paymasters
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Pause All Paymasters?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately pause all your Paymasters. No transactions
                  will be sponsored until you manually resume them.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handlePauseAll}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Pausing...
                    </>
                  ) : (
                    'Pause All'
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {actionSuccess === 'pause' && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              All Paymasters paused
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-error/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trash2 className="h-5 w-5 text-error" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Remove all data associated with this wallet from our servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">What happens when you delete:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                All settings and preferences are removed
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Transaction history is deleted from our servers
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                On-chain Paymasters are NOT affected
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-2 text-sm text-warning">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              You must withdraw all funds before deleting your account.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-error text-error hover:bg-error/10"
                disabled={totalBalance > 0}
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      This action cannot be undone. All your data will be permanently
                      removed from our servers.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirm">
                        Type your wallet address to confirm
                      </Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={walletAddress}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation.toLowerCase() !== walletAddress.toLowerCase() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {totalBalance > 0 && (
            <p className="text-xs text-muted-foreground">
              You have {totalBalance.toFixed(2)} MNT in your Paymasters. Withdraw all funds first.
            </p>
          )}

          {actionSuccess === 'delete' && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Account deleted successfully
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
