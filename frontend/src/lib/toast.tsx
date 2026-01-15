'use client';

import { toast as sonnerToast, ExternalToast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, ExternalLink } from 'lucide-react';
import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions extends ExternalToast {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TransactionToastOptions {
  hash: string;
  explorerUrl?: string;
}

const EXPLORER_BASE_URL = 'https://sepolia.mantlescan.xyz/tx/';

// Default durations
const DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: Infinity,
};

// Icons for each toast type
const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-primary" />,
  loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
};

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

/**
 * Custom toast functions with consistent styling
 */
export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: DURATIONS.success,
      icon: ICONS.success,
      ...options,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: DURATIONS.error,
      icon: ICONS.error,
      ...options,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: DURATIONS.warning,
      icon: ICONS.warning,
      ...options,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: DURATIONS.info,
      icon: ICONS.info,
      ...options,
    });
  },

  /**
   * Show a loading toast that can be updated
   */
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      icon: ICONS.loading,
      ...options,
    });
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },

  /**
   * Update an existing toast
   */
  update: (id: string | number, message: string, type: ToastType = 'info') => {
    sonnerToast.dismiss(id);
    
    switch (type) {
      case 'success':
        return toast.success(message, { id });
      case 'error':
        return toast.error(message, { id });
      case 'warning':
        return toast.warning(message, { id });
      case 'loading':
        return toast.loading(message, { id });
      default:
        return toast.info(message, { id });
    }
  },

  /**
   * Show a toast for a promise (loading → success/error)
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  },

  /**
   * Copy to clipboard with feedback
   */
  copy: (text: string, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    return toast.success(label, {
      duration: 2000,
    });
  },

  /**
   * Transaction-specific toasts
   */
  transaction: {
    /**
     * Show loading toast when transaction is submitted
     */
    submitted: (txHash: string, options?: TransactionToastOptions) => {
      const explorerUrl = options?.explorerUrl || `${EXPLORER_BASE_URL}${txHash}`;
      
      return sonnerToast.loading(
        <div className="flex flex-col gap-1">
          <span>Transaction Submitted</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{truncateHash(txHash)}</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>,
        {
          id: `tx-${txHash}`,
        }
      );
    },

    /**
     * Update toast to show transaction confirmed
     */
    confirmed: (txHash: string, message = 'Transaction Confirmed', options?: TransactionToastOptions) => {
      const explorerUrl = options?.explorerUrl || `${EXPLORER_BASE_URL}${txHash}`;
      const toastId = `tx-${txHash}`;
      
      sonnerToast.dismiss(toastId);
      
      return sonnerToast.success(
        <div className="flex flex-col gap-1">
          <span>{message}</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{truncateHash(txHash)}</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>,
        {
          id: toastId,
          icon: ICONS.success,
          duration: DURATIONS.success,
        }
      );
    },

    /**
     * Update toast to show transaction failed
     */
    failed: (txHash: string, error?: string, options?: TransactionToastOptions) => {
      const explorerUrl = options?.explorerUrl || `${EXPLORER_BASE_URL}${txHash}`;
      const toastId = `tx-${txHash}`;
      
      sonnerToast.dismiss(toastId);
      
      return sonnerToast.error(
        <div className="flex flex-col gap-1">
          <span>Transaction Failed</span>
          {error && (
            <span className="text-sm text-muted-foreground">{error}</span>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{truncateHash(txHash)}</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>,
        {
          id: toastId,
          icon: ICONS.error,
          duration: DURATIONS.error,
        }
      );
    },
  },

  /**
   * Balance alerts
   */
  balance: {
    low: (paymasterName: string, balance: string) => {
      return toast.warning(
        `Low balance on ${paymasterName}`,
        {
          description: `Current balance: ${balance} MNT`,
          action: {
            label: 'Fund Now',
            onClick: () => {
              // Navigate to funding
              window.location.href = `/paymasters`;
            },
          },
        }
      );
    },

    critical: (paymasterName: string, balance: string) => {
      return toast.error(
        `Critical balance on ${paymasterName}`,
        {
          description: `Balance: ${balance} MNT. Transactions may fail.`,
          action: {
            label: 'Fund Now',
            onClick: () => {
              window.location.href = `/paymasters`;
            },
          },
        }
      );
    },
  },

  /**
   * Network notifications
   */
  network: {
    wrongNetwork: () => {
      return toast.warning(
        'Wrong Network',
        {
          description: 'Please switch to Mantle Sepolia',
          duration: Infinity,
        }
      );
    },

    disconnected: () => {
      return toast.error(
        'Wallet Disconnected',
        {
          description: 'Please reconnect your wallet',
        }
      );
    },

    connected: (address: string) => {
      return toast.success(
        'Wallet Connected',
        {
          description: `${address.slice(0, 6)}...${address.slice(-4)}`,
          duration: 3000,
        }
      );
    },
  },
};

/**
 * Hook for using toast in components
 * 
 * @example
 * ```tsx
 * const { showToast } = useToast();
 * showToast.success('Action completed!');
 * ```
 */
export function useToast() {
  return {
    showToast: toast,
    dismiss: toast.dismiss,
  };
}
