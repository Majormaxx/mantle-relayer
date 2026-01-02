import { executeMetaTransaction, getEstimatedCost } from '../core/relayer/executor.js';
import { validateMetaTransaction } from '../core/relayer/validator.js';
import type {
  SignedMetaTransaction,
  ExecuteResult,
  CanExecuteResult,
  TransactionRecord,
} from '../types/contracts.js';
import { TransactionStatus } from '../types/contracts.js';
import { logger } from '../monitoring/logger.js';
import { randomUUID } from 'crypto';

/**
 * In-memory transaction store (would be Redis/DB in production).
 */
const transactionStore = new Map<string, TransactionRecord>();

/**
 * Service for managing transaction lifecycle.
 */
export class TransactionService {
  /**
   * Relay a signed meta-transaction.
   */
  async relay(
    paymasterAddress: string,
    signedMetaTx: SignedMetaTransaction
  ): Promise<ExecuteResult> {
    const txId = randomUUID();
    const log = logger.child({ txId, paymasterAddress, user: signedMetaTx.user });

    log.info('Relay request received');

    // Create transaction record
    const record: TransactionRecord = {
      id: txId,
      paymasterAddress,
      metaTx: signedMetaTx,
      status: TransactionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    transactionStore.set(txId, record);

    try {
      // Update status to submitted
      record.status = TransactionStatus.SUBMITTED;
      record.updatedAt = new Date();

      // Execute the transaction
      const result = await executeMetaTransaction(paymasterAddress, signedMetaTx);

      // Update record with result
      record.status = result.success ? TransactionStatus.CONFIRMED : TransactionStatus.REVERTED;
      record.txHash = result.txHash;
      record.gasUsed = result.gasUsed;
      record.updatedAt = new Date();

      log.info({ txHash: result.txHash, success: result.success }, 'Relay completed');

      return result;
    } catch (error) {
      // Update record with error
      record.status = TransactionStatus.FAILED;
      record.error = String(error);
      record.updatedAt = new Date();

      log.error({ error: String(error) }, 'Relay failed');
      throw error;
    }
  }

  /**
   * Validate a meta-transaction without executing.
   */
  async validate(
    paymasterAddress: string,
    signedMetaTx: SignedMetaTransaction
  ): Promise<CanExecuteResult> {
    return validateMetaTransaction(paymasterAddress, signedMetaTx);
  }

  /**
   * Get estimated cost for a transaction.
   */
  async estimateCost(
    paymasterAddress: string,
    target: string,
    data: string,
    gasLimit: bigint
  ): Promise<{ estimatedGas: bigint; estimatedCostWei: bigint }> {
    return getEstimatedCost(paymasterAddress, target, data, gasLimit);
  }

  /**
   * Get transaction by ID.
   */
  getTransaction(txId: string): TransactionRecord | undefined {
    return transactionStore.get(txId);
  }

  /**
   * Get transaction by hash.
   */
  getTransactionByHash(txHash: string): TransactionRecord | undefined {
    for (const record of transactionStore.values()) {
      if (record.txHash === txHash) {
        return record;
      }
    }
    return undefined;
  }

  /**
   * Get recent transactions.
   */
  getRecentTransactions(limit: number = 100): TransactionRecord[] {
    const records = Array.from(transactionStore.values());
    return records
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get transaction count by status.
   */
  getStats(): Record<TransactionStatus, number> {
    const stats: Record<TransactionStatus, number> = {
      [TransactionStatus.PENDING]: 0,
      [TransactionStatus.SUBMITTED]: 0,
      [TransactionStatus.CONFIRMED]: 0,
      [TransactionStatus.FAILED]: 0,
      [TransactionStatus.REVERTED]: 0,
    };

    for (const record of transactionStore.values()) {
      stats[record.status]++;
    }

    return stats;
  }
}

// Export singleton instance
export const transactionService = new TransactionService();
