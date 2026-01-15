// User/Auth Types
export interface User {
  address: `0x${string}`;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthState {
  isConnected: boolean;
  isAuthenticated: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  isLoading: boolean;
}

export interface Session {
  token: string;
  expiresAt: Date;
}
