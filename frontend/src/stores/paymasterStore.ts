'use client';

import { create } from 'zustand';

// Types for Paymaster with optimistic updates
export interface Paymaster {
  id: string;
  address: string;
  name: string;
  description?: string;
  balance: string;
  status: 'active' | 'paused' | 'low-balance';
  totalTransactions: number;
  uniqueUsers: number;
  createdAt: string;
}

export interface OptimisticPaymaster extends Paymaster {
  _isPending: boolean;
  _optimisticId?: string;
  _error?: string;
}

// Types for Whitelist entries with optimistic updates
export interface WhitelistEntry {
  id: string;
  paymasterId: string;
  contractAddress: string;
  contractName?: string;
  contractType?: 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Custom';
  functions: string[];
}

export interface OptimisticWhitelistEntry extends WhitelistEntry {
  _isPending: boolean;
  _optimisticId?: string;
  _error?: string;
}

interface PaymasterStoreState {
  // Confirmed state from blockchain/backend
  paymasters: Paymaster[];
  
  // Pending optimistic updates
  pendingPaymasters: OptimisticPaymaster[];
  pendingUpdates: Map<string, Partial<Paymaster>>;
  
  // Combined view for UI
  allPaymasters: OptimisticPaymaster[];
  
  // Actions
  setPaymasters: (paymasters: Paymaster[]) => void;
  
  // Optimistic create
  addOptimisticPaymaster: (paymaster: Omit<Paymaster, 'id'>) => string;
  confirmPaymaster: (optimisticId: string, confirmedPaymaster: Paymaster) => void;
  rejectPaymaster: (optimisticId: string, error: string) => void;
  
  // Optimistic update
  updateOptimistic: (id: string, updates: Partial<Paymaster>) => void;
  confirmUpdate: (id: string) => void;
  rejectUpdate: (id: string, error: string) => void;
  
  // Optimistic delete
  deleteOptimistic: (id: string) => void;
  confirmDelete: (id: string) => void;
  rejectDelete: (id: string, error: string) => void;
  
  // Balance updates
  updateBalance: (id: string, newBalance: string, isPending?: boolean) => void;
  
  // Clear pending state
  clearPending: () => void;
}

export const usePaymasterStore = create<PaymasterStoreState>((set, get) => ({
  paymasters: [],
  pendingPaymasters: [],
  pendingUpdates: new Map(),
  
  get allPaymasters() {
    const { paymasters, pendingPaymasters, pendingUpdates } = get();
    
    // Merge confirmed with pending updates
    const merged = paymasters.map((pm): OptimisticPaymaster => {
      const pending = pendingUpdates.get(pm.id);
      return {
        ...pm,
        ...(pending || {}),
        _isPending: !!pending,
      };
    });
    
    // Add new pending paymasters
    return [...merged, ...pendingPaymasters];
  },
  
  setPaymasters: (paymasters) => {
    set({ paymasters });
  },
  
  addOptimisticPaymaster: (paymaster) => {
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const optimistic: OptimisticPaymaster = {
      ...paymaster,
      id: optimisticId,
      _isPending: true,
      _optimisticId: optimisticId,
    };
    
    set((state) => ({
      pendingPaymasters: [...state.pendingPaymasters, optimistic],
    }));
    
    return optimisticId;
  },
  
  confirmPaymaster: (optimisticId, confirmedPaymaster) => {
    set((state) => ({
      // Remove from pending
      pendingPaymasters: state.pendingPaymasters.filter(
        (pm) => pm._optimisticId !== optimisticId
      ),
      // Add to confirmed
      paymasters: [...state.paymasters, confirmedPaymaster],
    }));
  },
  
  rejectPaymaster: (optimisticId, error) => {
    set((state) => ({
      pendingPaymasters: state.pendingPaymasters.map((pm) =>
        pm._optimisticId === optimisticId
          ? { ...pm, _isPending: false, _error: error }
          : pm
      ),
    }));
    
    // Remove after showing error
    setTimeout(() => {
      set((state) => ({
        pendingPaymasters: state.pendingPaymasters.filter(
          (pm) => pm._optimisticId !== optimisticId
        ),
      }));
    }, 5000);
  },
  
  updateOptimistic: (id, updates) => {
    set((state) => {
      const newUpdates = new Map(state.pendingUpdates);
      const existing = newUpdates.get(id) || {};
      newUpdates.set(id, { ...existing, ...updates });
      return { pendingUpdates: newUpdates };
    });
  },
  
  confirmUpdate: (id) => {
    const { pendingUpdates } = get();
    const updates = pendingUpdates.get(id);
    
    if (!updates) return;
    
    set((state) => {
      const newUpdates = new Map(state.pendingUpdates);
      newUpdates.delete(id);
      
      return {
        paymasters: state.paymasters.map((pm) =>
          pm.id === id ? { ...pm, ...updates } : pm
        ),
        pendingUpdates: newUpdates,
      };
    });
  },
  
  rejectUpdate: (id, error) => {
    console.error(`Update rejected for ${id}:`, error);
    
    set((state) => {
      const newUpdates = new Map(state.pendingUpdates);
      newUpdates.delete(id);
      return { pendingUpdates: newUpdates };
    });
  },
  
  deleteOptimistic: (id) => {
    set((state) => ({
      paymasters: state.paymasters.map((pm) =>
        pm.id === id ? { ...pm, status: 'paused' as const } : pm
      ),
    }));
  },
  
  confirmDelete: (id) => {
    set((state) => ({
      paymasters: state.paymasters.filter((pm) => pm.id !== id),
    }));
  },
  
  rejectDelete: (id, error) => {
    console.error(`Delete rejected for ${id}:`, error);
    // Restore status - would need to track original status
  },
  
  updateBalance: (id, newBalance, isPending = false) => {
    if (isPending) {
      get().updateOptimistic(id, { balance: newBalance });
    } else {
      set((state) => ({
        paymasters: state.paymasters.map((pm) =>
          pm.id === id ? { ...pm, balance: newBalance } : pm
        ),
      }));
    }
  },
  
  clearPending: () => {
    set({
      pendingPaymasters: [],
      pendingUpdates: new Map(),
    });
  },
}));

// Whitelist Store with optimistic updates
interface WhitelistStoreState {
  entries: WhitelistEntry[];
  pendingEntries: OptimisticWhitelistEntry[];
  pendingDeletes: Set<string>;
  
  // Combined view
  allEntries: OptimisticWhitelistEntry[];
  
  // Actions
  setEntries: (entries: WhitelistEntry[]) => void;
  addOptimisticEntry: (entry: Omit<WhitelistEntry, 'id'>) => string;
  confirmEntry: (optimisticId: string, confirmedEntry: WhitelistEntry) => void;
  rejectEntry: (optimisticId: string, error: string) => void;
  deleteOptimistic: (id: string) => void;
  confirmDelete: (id: string) => void;
  rejectDelete: (id: string, error: string) => void;
}

export const useWhitelistStore = create<WhitelistStoreState>((set, get) => ({
  entries: [],
  pendingEntries: [],
  pendingDeletes: new Set(),
  
  get allEntries() {
    const { entries, pendingEntries, pendingDeletes } = get();
    
    // Filter out pending deletes from confirmed entries
    const filtered = entries
      .filter((e) => !pendingDeletes.has(e.id))
      .map((e): OptimisticWhitelistEntry => ({ ...e, _isPending: false }));
    
    return [...filtered, ...pendingEntries];
  },
  
  setEntries: (entries) => set({ entries }),
  
  addOptimisticEntry: (entry) => {
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const optimistic: OptimisticWhitelistEntry = {
      ...entry,
      id: optimisticId,
      _isPending: true,
      _optimisticId: optimisticId,
    };
    
    set((state) => ({
      pendingEntries: [...state.pendingEntries, optimistic],
    }));
    
    return optimisticId;
  },
  
  confirmEntry: (optimisticId, confirmedEntry) => {
    set((state) => ({
      pendingEntries: state.pendingEntries.filter(
        (e) => e._optimisticId !== optimisticId
      ),
      entries: [...state.entries, confirmedEntry],
    }));
  },
  
  rejectEntry: (optimisticId, error) => {
    set((state) => ({
      pendingEntries: state.pendingEntries.map((e) =>
        e._optimisticId === optimisticId
          ? { ...e, _isPending: false, _error: error }
          : e
      ),
    }));
    
    setTimeout(() => {
      set((state) => ({
        pendingEntries: state.pendingEntries.filter(
          (e) => e._optimisticId !== optimisticId
        ),
      }));
    }, 5000);
  },
  
  deleteOptimistic: (id) => {
    set((state) => ({
      pendingDeletes: new Set([...state.pendingDeletes, id]),
    }));
  },
  
  confirmDelete: (id) => {
    set((state) => {
      const newDeletes = new Set(state.pendingDeletes);
      newDeletes.delete(id);
      return {
        entries: state.entries.filter((e) => e.id !== id),
        pendingDeletes: newDeletes,
      };
    });
  },
  
  rejectDelete: (id, error) => {
    console.error(`Delete rejected for ${id}:`, error);
    set((state) => {
      const newDeletes = new Set(state.pendingDeletes);
      newDeletes.delete(id);
      return { pendingDeletes: newDeletes };
    });
  },
}));

// Selector hooks
export const useAllPaymasters = () => {
  const paymasters = usePaymasterStore((state) => state.paymasters);
  const pendingPaymasters = usePaymasterStore((state) => state.pendingPaymasters);
  const pendingUpdates = usePaymasterStore((state) => state.pendingUpdates);
  
  // Merge confirmed with pending updates
  const merged = paymasters.map((pm): OptimisticPaymaster => {
    const pending = pendingUpdates.get(pm.id);
    return {
      ...pm,
      ...(pending || {}),
      _isPending: !!pending,
    };
  });
  
  return [...merged, ...pendingPaymasters];
};

export const usePaymasterById = (id: string) => {
  const allPaymasters = useAllPaymasters();
  return allPaymasters.find((pm) => pm.id === id);
};
