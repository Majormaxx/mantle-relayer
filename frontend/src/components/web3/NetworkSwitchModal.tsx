'use client';

import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

const FAUCET_URL = 'https://faucet.sepolia.mantle.xyz';

interface NetworkSwitchModalProps {
  open: boolean;
  currentChainName?: string;
}

export function NetworkSwitchModal({ open, currentChainName = 'Unknown Network' }: NetworkSwitchModalProps) {
  const { switchNetwork, isSwitchingNetwork, error } = useAuth();

  const handleSwitch = async () => {
    await switchNetwork();
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            Wrong Network Detected
          </DialogTitle>
          <DialogDescription className="text-center">
            Please switch to Mantle Sepolia to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Network */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-zinc-400">Current Network</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {currentChainName}
            </span>
          </div>

          {/* Required Network */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-zinc-400">Required Network</span>
            </div>
            <span className="text-sm font-medium text-green-400">
              Mantle Sepolia
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Switch Button */}
          <Button
            onClick={handleSwitch}
            disabled={isSwitchingNetwork}
            className="w-full"
            size="lg"
          >
            {isSwitchingNetwork ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching Network...
              </>
            ) : (
              'Switch to Mantle Sepolia'
            )}
          </Button>

          {/* Faucet Link */}
          <div className="text-center">
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Need MNT? Get testnet tokens
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Network Details */}
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">
              Chain ID: 5003 • RPC: rpc.sepolia.mantle.xyz
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
