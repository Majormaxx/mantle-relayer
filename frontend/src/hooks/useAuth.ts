'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAccount, useChainId, useDisconnect, useSignMessage, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  useAuthStore,
  selectIsReady,
  selectIsLoading,
  selectNeedsNetworkSwitch,
  selectNeedsAuthentication,
  REQUIRED_CHAIN_ID,
} from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

// Generate a nonce for signing
function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create the sign-in message
function createSignInMessage(address: string, nonce: string): string {
  const timestamp = new Date().toISOString();
  return `Mantle Gasless Relayer

Sign in to access your dashboard

Wallet: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This signature is free and does not cost any gas.`;
}

export function useAuth() {
  // Wagmi hooks
  const { address, isConnected, isConnecting: wagmiConnecting } = useAccount();
  const chainId = useChainId();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();

  // Auth store
  const store = useAuthStore();
  const {
    isAuthenticated,
    sessionToken,
    sessionExpiry,
    isConnecting: storeConnecting,
    isSigning,
    isSwitchingNetwork,
    error,
    setConnected,
    setDisconnected,
    setAuthenticated,
    clearAuthentication,
    setChainId,
    setConnecting,
    setSigning,
    setSwitchingNetwork,
    setError,
    clearError,
    reset,
  } = store;

  // Derived state
  const isReady = selectIsReady(store);
  const isLoading = selectIsLoading(store);
  const needsNetworkSwitch = selectNeedsNetworkSwitch(store);
  const needsAuthentication = selectNeedsAuthentication(store);
  const isCorrectNetwork = chainId === REQUIRED_CHAIN_ID;

  // Sync wagmi state with store
  useEffect(() => {
    if (isConnected && address) {
      setConnected(address, chainId);
    } else if (!isConnected && store.isConnected) {
      setDisconnected();
    }
  }, [isConnected, address, chainId, setConnected, setDisconnected, store.isConnected]);

  // Update chain ID when it changes
  useEffect(() => {
    if (chainId) {
      setChainId(chainId);
    }
  }, [chainId, setChainId]);

  // Check session validity on mount
  useEffect(() => {
    if (sessionToken && sessionExpiry) {
      const now = Date.now();
      if (now > sessionExpiry) {
        clearAuthentication();
      }
    }
  }, [sessionToken, sessionExpiry, clearAuthentication]);

  // Connect wallet
  const connect = useCallback(() => {
    setConnecting(true);
    clearError();
    openConnectModal?.();
  }, [openConnectModal, setConnecting, clearError]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    wagmiDisconnect();
    reset();
    toast({
      title: 'Wallet disconnected',
    });
  }, [wagmiDisconnect, reset]);

  // Switch network
  const switchToCorrectNetwork = useCallback(async () => {
    if (!switchChain) {
      setError('Network switching not supported');
      return false;
    }

    setSwitchingNetwork(true);
    clearError();

    try {
      await switchChain({ chainId: REQUIRED_CHAIN_ID });
      toast({
        title: 'Network switched',
        description: 'Connected to Mantle Sepolia',
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to switch network';
      setError(message);
      toast({
        title: 'Network switch failed',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSwitchingNetwork(false);
    }
  }, [switchChain, setSwitchingNetwork, setError, clearError]);

  // Sign in with message
  const signIn = useCallback(async () => {
    if (!address) {
      setError('No wallet connected');
      return false;
    }

    setSigning(true);
    clearError();

    try {
      const nonce = generateNonce();
      const message = createSignInMessage(address, nonce);

      const signature = await signMessageAsync({ message });

      // In a real app, you would verify this signature on the backend
      // and receive a JWT token. For now, we'll create a mock token.
      const mockToken = `session_${signature.slice(0, 20)}`;
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      setAuthenticated(mockToken, expiry);
      
      toast({
        title: 'Successfully signed in!',
        description: 'Welcome to Mantle Gasless Relayer',
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signature failed';
      
      // Handle user rejection specifically
      if (message.includes('rejected') || message.includes('denied')) {
        setError('Signature required to continue');
        toast({
          title: 'Signature required',
          description: 'Please sign the message to access your dashboard',
          variant: 'destructive',
        });
      } else {
        setError(message);
        toast({
          title: 'Sign in failed',
          description: message,
          variant: 'destructive',
        });
      }
      
      return false;
    } finally {
      setSigning(false);
    }
  }, [address, signMessageAsync, setSigning, setAuthenticated, setError, clearError]);

  // Sign out (keep wallet connected)
  const signOut = useCallback(() => {
    clearAuthentication();
    toast({
      title: 'Signed out',
      description: 'You can sign in again anytime',
    });
  }, [clearAuthentication]);

  return useMemo(
    () => ({
      // State
      isConnected: store.isConnected,
      isAuthenticated,
      address: store.address,
      chainId: store.chainId,
      isCorrectNetwork,
      isReady,
      isLoading,
      isConnecting: storeConnecting || wagmiConnecting,
      isSigning,
      isSwitchingNetwork,
      needsNetworkSwitch,
      needsAuthentication,
      error,
      sessionToken,

      // Actions
      connect,
      disconnect,
      switchNetwork: switchToCorrectNetwork,
      signIn,
      signOut,
      clearError,
    }),
    [
      store.isConnected,
      store.address,
      store.chainId,
      isAuthenticated,
      isCorrectNetwork,
      isReady,
      isLoading,
      storeConnecting,
      wagmiConnecting,
      isSigning,
      isSwitchingNetwork,
      needsNetworkSwitch,
      needsAuthentication,
      error,
      sessionToken,
      connect,
      disconnect,
      switchToCorrectNetwork,
      signIn,
      signOut,
      clearError,
    ]
  );
}

// Re-export constants
export { REQUIRED_CHAIN_ID };
