'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/lib/wagmi';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Create a query client for React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute - data is fresh
      gcTime: 5 * 60_000, // 5 minutes - keep in cache
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
      refetchOnReconnect: false, // Don't refetch on network reconnect
      retry: 1, // Only retry once on failure
    },
  },
});

// Custom RainbowKit theme matching our design system
const customTheme: Theme = {
  ...darkTheme({
    accentColor: '#6366F1', // Primary Indigo
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  }),
  colors: {
    ...darkTheme().colors,
    modalBackground: '#18181B', // Card background
    modalBorder: '#27272A', // Border color
    profileForeground: '#18181B',
    closeButton: '#A1A1AA',
    closeButtonBackground: '#27272A',
    actionButtonBorder: '#27272A',
    actionButtonBorderMobile: '#27272A',
    actionButtonSecondaryBackground: '#27272A',
    generalBorder: '#27272A',
    menuItemBackground: '#27272A',
    connectButtonBackground: '#18181B',
    connectButtonBackgroundError: '#EF4444',
    connectButtonInnerBackground: '#27272A',
    connectButtonText: '#FAFAFA',
    connectButtonTextError: '#FAFAFA',
    error: '#EF4444',
    standby: '#F59E0B',
  },
  shadows: {
    ...darkTheme().shadows,
    dialog: '0 25px 50px -12px rgb(0 0 0 / 0.75)',
    connectButton: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
    profileDetailsAction: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
    selectedOption: '0 0 0 2px #6366F1',
    selectedWallet: '0 0 0 2px #6366F1',
    walletLogo: 'none',
  },
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Only render on client side to avoid hydration issues
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={customTheme}
          modalSize="compact"
          coolMode
        >
          {mounted ? children : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
