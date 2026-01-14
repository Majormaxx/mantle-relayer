'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NetworkSwitchModal } from './NetworkSwitchModal';
import { SignMessageModal } from './SignMessageModal';
import { useAccount } from 'wagmi';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const router = useRouter();
  const { chain } = useAccount();
  
  const {
    isConnected,
    isAuthenticated,
    isCorrectNetwork,
    isConnecting,
    isSigning,
    isSwitchingNetwork,
    needsNetworkSwitch,
    needsAuthentication,
  } = useAuth();

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      router.push(redirectTo);
    }
  }, [isConnected, isConnecting, router, redirectTo]);

  // Loading states
  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-zinc-400">Connecting wallet...</p>
        </div>
      </div>
    );
  }

  // Not connected - will redirect
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
          <p className="text-zinc-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Get current chain name
  const currentChainName = chain?.name ?? 'Unknown Network';

  // Show modals if needed
  if (needsNetworkSwitch) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-400">Please switch to Mantle Sepolia</p>
          </div>
        </div>
        <NetworkSwitchModal open={true} currentChainName={currentChainName} />
      </>
    );
  }

  if (needsAuthentication) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            {isSigning ? (
              <>
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-zinc-400">Waiting for signature...</p>
              </>
            ) : (
              <p className="text-zinc-400">Please sign in to continue</p>
            )}
          </div>
        </div>
        <SignMessageModal open={true} />
      </>
    );
  }

  // Switching network
  if (isSwitchingNetwork) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-zinc-400">Switching network...</p>
        </div>
      </div>
    );
  }

  // All good - render children
  if (isConnected && isAuthenticated && isCorrectNetwork) {
    return <>{children}</>;
  }

  // Fallback loading
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
    </div>
  );
}
