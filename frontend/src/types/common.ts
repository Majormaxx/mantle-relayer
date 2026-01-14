// Common/Shared Types
export type Address = `0x${string}`;

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface Trend {
  value: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}
