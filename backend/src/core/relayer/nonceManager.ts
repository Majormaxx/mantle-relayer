import { getProvider } from '../blockchain/provider.js';
import { getRelayerAddress } from '../blockchain/wallet.js';
import { logger } from '../../monitoring/logger.js';
import { BlockchainError } from '../../utils/errors.js';

/**
 * Manages nonces for the relayer wallet to prevent transaction collisions.
 * Critical for high-throughput relaying where multiple transactions may be pending.
 */
class NonceManager {
  private static instance: NonceManager | null = null;
  
  private currentNonce: bigint | null = null;
  private pendingNonces: Set<bigint> = new Set();
  private lock: Promise<void> = Promise.resolve();

  private constructor() {}

  static getInstance(): NonceManager {
    if (!NonceManager.instance) {
      NonceManager.instance = new NonceManager();
    }
    return NonceManager.instance;
  }

  /**
   * Acquire a nonce for a new transaction.
   * Uses locking to prevent race conditions.
   */
  async acquireNonce(): Promise<bigint> {
    // Create a new lock that waits for previous operations
    const previousLock = this.lock;
    let releaseLock: () => void;
    this.lock = new Promise((resolve) => {
      releaseLock = resolve;
    });

    await previousLock;

    try {
      // If we don't have a cached nonce, fetch from chain
      if (this.currentNonce === null) {
        await this.syncNonceFromChain();
      }

      // Find the next available nonce
      let nonce = this.currentNonce!;
      while (this.pendingNonces.has(nonce)) {
        nonce++;
      }

      // Mark as pending
      this.pendingNonces.add(nonce);
      this.currentNonce = nonce + 1n;

      logger.debug({ nonce: nonce.toString(), pending: this.pendingNonces.size }, 'Nonce acquired');
      
      return nonce;
    } finally {
      releaseLock!();
    }
  }

  /**
   * Release a nonce after transaction confirms or fails.
   */
  releaseNonce(nonce: bigint, success: boolean): void {
    this.pendingNonces.delete(nonce);
    
    if (!success) {
      // If transaction failed, we may need to resync
      // But don't reset if there are other pending transactions
      if (this.pendingNonces.size === 0) {
        this.currentNonce = null; // Force resync on next acquire
      }
    }

    logger.debug({ nonce: nonce.toString(), success, pending: this.pendingNonces.size }, 'Nonce released');
  }

  /**
   * Sync nonce from blockchain.
   */
  async syncNonceFromChain(): Promise<void> {
    try {
      const provider = getProvider();
      const address = getRelayerAddress();
      const chainNonce = await provider.getTransactionCount(address, 'pending');
      
      this.currentNonce = BigInt(chainNonce);
      logger.info({ nonce: this.currentNonce.toString() }, 'Nonce synced from chain');
    } catch (error) {
      throw new BlockchainError('Failed to sync nonce from chain', error);
    }
  }

  /**
   * Force resync nonce (e.g., after stuck transaction recovery).
   */
  async forceResync(): Promise<void> {
    this.pendingNonces.clear();
    this.currentNonce = null;
    await this.syncNonceFromChain();
    logger.info('Nonce force resynced');
  }

  /**
   * Get current nonce state for debugging.
   */
  getState(): { currentNonce: string | null; pendingCount: number } {
    return {
      currentNonce: this.currentNonce?.toString() ?? null,
      pendingCount: this.pendingNonces.size,
    };
  }
}

/**
 * Get nonce manager singleton.
 */
export function getNonceManager(): NonceManager {
  return NonceManager.getInstance();
}

/**
 * Acquire a nonce for a new transaction.
 */
export async function acquireNonce(): Promise<bigint> {
  return getNonceManager().acquireNonce();
}

/**
 * Release a nonce after transaction completes.
 */
export function releaseNonce(nonce: bigint, success: boolean): void {
  getNonceManager().releaseNonce(nonce, success);
}

/**
 * Force resync nonce from chain.
 */
export async function resyncNonce(): Promise<void> {
  return getNonceManager().forceResync();
}
