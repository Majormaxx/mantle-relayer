'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { ChevronDown, Wallet, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NetworkSwitchModal } from './NetworkSwitchModal';
import { SignMessageModal } from './SignMessageModal';
import { toast } from '@/hooks/use-toast';

interface ConnectWalletButtonProps {
  showBalance?: boolean;
  chainStatus?: 'full' | 'icon' | 'name' | 'none';
  label?: string;
  redirectOnConnect?: boolean;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function ConnectWalletButton({
  showBalance = true,
  chainStatus = 'icon',
  label = 'Connect Wallet',
  redirectOnConnect = true,
  size = 'default',
  variant = 'default',
}: ConnectWalletButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { chain } = useAccount();
  
  const {
    isConnected,
    isAuthenticated,
    isCorrectNetwork,
    needsNetworkSwitch,
    needsAuthentication,
    isConnecting,
  } = useAuth();

  // Track if we just connected (for redirect logic)
  const [justConnected, setJustConnected] = useState(false);

  // Show modals based on auth state
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // Handle connection success
  useEffect(() => {
    if (isConnected && !justConnected) {
      setJustConnected(true);
      toast({
        title: 'Wallet connected!',
        description: 'Welcome to Mantle Gasless Relayer',
      });
    } else if (!isConnected && justConnected) {
      setJustConnected(false);
    }
  }, [isConnected, justConnected]);

  // Show network modal when on wrong network
  useEffect(() => {
    if (needsNetworkSwitch && isConnected) {
      setShowNetworkModal(true);
    } else {
      setShowNetworkModal(false);
    }
  }, [needsNetworkSwitch, isConnected]);

  // Show sign modal when needs authentication
  useEffect(() => {
    if (needsAuthentication && isCorrectNetwork) {
      setShowSignModal(true);
    } else {
      setShowSignModal(false);
    }
  }, [needsAuthentication, isCorrectNetwork]);

  // Redirect to dashboard after full authentication
  useEffect(() => {
    if (
      isConnected &&
      isAuthenticated &&
      isCorrectNetwork &&
      redirectOnConnect &&
      justConnected
    ) {
      const isMarketingPage =
        pathname === '/' ||
        pathname === '/pricing' ||
        pathname === '/features' ||
        pathname === '/about';

      if (isMarketingPage) {
        router.push('/dashboard');
      }
    }
  }, [
    isConnected,
    isAuthenticated,
    isCorrectNetwork,
    redirectOnConnect,
    justConnected,
    pathname,
    router,
  ]);

  // Handle successful sign
  const handleSignSuccess = () => {
    setShowSignModal(false);
  };

  // Get current chain name for modal
  const currentChainName = chain?.name ?? 'Unknown Network';

  return (
    <>
      <RainbowConnectButton.Custom>
        {({
          account,
          chain: connectedChain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            connectedChain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                // Not connected - show connect button
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      variant={variant}
                      size={size}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          {label}
                        </>
                      )}
                    </Button>
                  );
                }

                // Wrong network - show warning button
                if (connectedChain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive" size={size}>
                      Wrong Network
                    </Button>
                  );
                }

                // Connected - show account info
                return (
                  <div className="flex items-center gap-2">
                    {/* Chain Button */}
                    {chainStatus !== 'none' && (
                      <Button
                        onClick={openChainModal}
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex"
                      >
                        {connectedChain.hasIcon && (
                          <div
                            className="h-5 w-5 overflow-hidden rounded-full"
                            style={{ background: connectedChain.iconBackground }}
                          >
                            {connectedChain.iconUrl && (
                              <img
                                alt={connectedChain.name ?? 'Chain icon'}
                                src={connectedChain.iconUrl}
                                className="h-5 w-5"
                              />
                            )}
                          </div>
                        )}
                        {chainStatus === 'full' && (
                          <span className="ml-1">{connectedChain.name}</span>
                        )}
                        {chainStatus === 'name' && <span>{connectedChain.name}</span>}
                        <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                      </Button>
                    )}

                    {/* Account Button */}
                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      size={size}
                      className="gap-2"
                    >
                      {showBalance && account.displayBalance && (
                        <span className="hidden sm:inline text-muted-foreground">
                          {account.displayBalance}
                        </span>
                      )}
                      <span className="font-mono">{account.displayName}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </RainbowConnectButton.Custom>

      {/* Network Switch Modal */}
      <NetworkSwitchModal
        open={showNetworkModal}
        currentChainName={currentChainName}
      />

      {/* Sign Message Modal */}
      <SignMessageModal open={showSignModal} onSuccess={handleSignSuccess} />
    </>
  );
}

// Re-export original for flexibility
export { RainbowConnectButton };
