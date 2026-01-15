import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // Connection state
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  
  // Authentication state (signed message)
  isAuthenticated: boolean;
  sessionToken: string | null;
  sessionExpiry: number | null;
  
  // Network state
  isCorrectNetwork: boolean;
  
  // Loading states
  isConnecting: boolean;
  isSigning: boolean;
  isSwitchingNetwork: boolean;
  
  // Error state
  error: string | null;
}

interface AuthActions {
  // Connection actions
  setConnected: (address: string, chainId: number) => void;
  setDisconnected: () => void;
  
  // Authentication actions
  setAuthenticated: (token: string, expiry: number) => void;
  clearAuthentication: () => void;
  
  // Network actions
  setChainId: (chainId: number) => void;
  setCorrectNetwork: (isCorrect: boolean) => void;
  
  // Loading actions
  setConnecting: (isConnecting: boolean) => void;
  setSigning: (isSigning: boolean) => void;
  setSwitchingNetwork: (isSwitching: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  reset: () => void;
}

const MANTLE_SEPOLIA_CHAIN_ID = 5003;

const initialState: AuthState = {
  isConnected: false,
  address: null,
  chainId: null,
  isAuthenticated: false,
  sessionToken: null,
  sessionExpiry: null,
  isCorrectNetwork: false,
  isConnecting: false,
  isSigning: false,
  isSwitchingNetwork: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Connection actions
      setConnected: (address, chainId) => {
        const isCorrectNetwork = chainId === MANTLE_SEPOLIA_CHAIN_ID;
        set({
          isConnected: true,
          address,
          chainId,
          isCorrectNetwork,
          isConnecting: false,
          error: null,
        });
      },

      setDisconnected: () => {
        set({
          ...initialState,
        });
      },

      // Authentication actions
      setAuthenticated: (token, expiry) => {
        set({
          isAuthenticated: true,
          sessionToken: token,
          sessionExpiry: expiry,
          isSigning: false,
          error: null,
        });
      },

      clearAuthentication: () => {
        set({
          isAuthenticated: false,
          sessionToken: null,
          sessionExpiry: null,
        });
      },

      // Network actions
      setChainId: (chainId) => {
        const isCorrectNetwork = chainId === MANTLE_SEPOLIA_CHAIN_ID;
        set({
          chainId,
          isCorrectNetwork,
        });
      },

      setCorrectNetwork: (isCorrect) => {
        set({ isCorrectNetwork: isCorrect });
      },

      // Loading actions
      setConnecting: (isConnecting) => {
        set({ isConnecting });
      },

      setSigning: (isSigning) => {
        set({ isSigning });
      },

      setSwitchingNetwork: (isSwitching) => {
        set({ isSwitchingNetwork: isSwitching });
      },

      // Error actions
      setError: (error) => {
        set({ error, isConnecting: false, isSigning: false, isSwitchingNetwork: false });
      },

      clearError: () => {
        set({ error: null });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        address: state.address,
        sessionToken: state.sessionToken,
        sessionExpiry: state.sessionExpiry,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector helpers
export const selectIsReady = (state: AuthState) =>
  state.isConnected && state.isCorrectNetwork && state.isAuthenticated;

export const selectIsLoading = (state: AuthState) =>
  state.isConnecting || state.isSigning || state.isSwitchingNetwork;

export const selectNeedsNetworkSwitch = (state: AuthState) =>
  state.isConnected && !state.isCorrectNetwork;

export const selectNeedsAuthentication = (state: AuthState) =>
  state.isConnected && state.isCorrectNetwork && !state.isAuthenticated;

// Constants export
export const REQUIRED_CHAIN_ID = MANTLE_SEPOLIA_CHAIN_ID;
