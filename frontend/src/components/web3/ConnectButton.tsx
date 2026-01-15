'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { ChevronDown, Wallet } from 'lucide-react';

interface ConnectButtonProps {
  showBalance?: boolean;
  chainStatus?: 'full' | 'icon' | 'name' | 'none';
  accountStatus?: 'full' | 'avatar' | 'address';
  label?: string;
}

export function ConnectButton({
  showBalance = true,
  chainStatus = 'icon',
  accountStatus: _accountStatus = 'full',
  label = 'Connect Wallet',
}: ConnectButtonProps) {
  // Note: _accountStatus reserved for future use with different display modes
  void _accountStatus;
  
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
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
          chain &&
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
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="default"
                    leftIcon={<Wallet className="h-4 w-4" />}
                  >
                    {label}
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong Network
                  </Button>
                );
              }

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
                      {chain.hasIcon && (
                        <div
                          className="h-5 w-5 overflow-hidden rounded-full"
                          style={{ background: chain.iconBackground }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="h-5 w-5"
                            />
                          )}
                        </div>
                      )}
                      {chainStatus === 'full' && (
                        <span className="ml-1">{chain.name}</span>
                      )}
                      {chainStatus === 'name' && <span>{chain.name}</span>}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  )}

                  {/* Account Button */}
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className="gap-2"
                  >
                    {showBalance && account.displayBalance && (
                      <span className="hidden sm:inline text-muted-foreground">
                        {account.displayBalance}
                      </span>
                    )}
                    <span className="font-mono">
                      {account.displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}

// Re-export the original for flexibility
export { RainbowConnectButton };
