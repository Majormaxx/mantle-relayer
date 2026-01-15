'use client';

import { Loader2, PenTool, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface SignMessageModalProps {
  open: boolean;
  onSuccess?: () => void;
}

export function SignMessageModal({ open, onSuccess }: SignMessageModalProps) {
  const { signIn, isSigning, error, clearError, address } = useAuth();

  const handleSign = async () => {
    const success = await signIn();
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleRetry = () => {
    clearError();
    handleSign();
  };

  // Format address for display
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
            {isSigning ? (
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            ) : error ? (
              <PenTool className="w-6 h-6 text-red-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {isSigning
              ? 'Waiting for Signature...'
              : error
              ? 'Signature Required'
              : 'Verify Ownership'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSigning
              ? 'Please check your wallet and sign the message'
              : error
              ? 'Please sign the message to continue'
              : 'Sign this message to verify you own this wallet'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Info */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <span className="text-sm text-zinc-400">Connected Wallet</span>
            <span className="text-sm font-mono text-zinc-200">
              {displayAddress}
            </span>
          </div>

          {/* Message Preview */}
          {!isSigning && !error && (
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <p className="text-xs font-medium text-zinc-500 mb-2">
                MESSAGE TO SIGN
              </p>
              <div className="text-sm text-zinc-300 space-y-1">
                <p className="font-medium">Mantle Gasless Relayer</p>
                <p className="text-zinc-400">Sign in to access your dashboard</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSigning && (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <p className="text-sm text-zinc-400">
                Check your wallet to sign the message
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Info Box */}
          {!isSigning && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30">
              <HelpCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-500">
                <p className="font-medium text-zinc-400 mb-1">
                  This is NOT a transaction
                </p>
                <p>
                  Signing this message is free and does not cost any gas. It simply
                  proves you own this wallet.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isSigning && (
            <div className="flex flex-col gap-2">
              {error ? (
                <Button onClick={handleRetry} className="w-full" size="lg">
                  Try Again
                </Button>
              ) : (
                <Button onClick={handleSign} className="w-full" size="lg">
                  Sign to Continue
                </Button>
              )}
            </div>
          )}

          {/* Help Link */}
          <div className="text-center pt-2">
            <a
              href="/docs"
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Having trouble? View documentation →
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
