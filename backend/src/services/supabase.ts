import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { logger } from '../monitoring/logger.js';

/**
 * Transaction log entry for relay operations.
 */
export interface TransactionLog {
  tx_hash: string;
  user_address: string;
  paymaster_address: string;
  target_address: string;
  gas_used?: bigint;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
}

/**
 * Supabase service for transaction logging and analytics.
 * Optional - gracefully degrades if not configured.
 */
class SupabaseService {
  private client: SupabaseClient | null = null;
  private enabled = false;

  constructor() {
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
      this.enabled = true;
      logger.info('Supabase service initialized');
    } else {
      logger.info('Supabase not configured - transaction logging disabled');
    }
  }

  /**
   * Check if Supabase is enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log a relay transaction to Supabase.
   */
  async logTransaction(log: TransactionLog): Promise<void> {
    if (!this.client) return;

    try {
      const { error } = await this.client
        .from('relay_transactions')
        .insert({
          tx_hash: log.tx_hash,
          user_address: log.user_address.toLowerCase(),
          paymaster_address: log.paymaster_address.toLowerCase(),
          target_address: log.target_address.toLowerCase(),
          gas_used: log.gas_used ? Number(log.gas_used) : null,
          status: log.status,
          error_message: log.error_message || null,
        });

      if (error) {
        logger.warn({ error }, 'Failed to log transaction to Supabase');
      }
    } catch (err) {
      logger.warn({ err }, 'Supabase logging error');
    }
  }

  /**
   * Update transaction status after confirmation.
   */
  async updateTransactionStatus(
    txHash: string,
    status: 'success' | 'failed',
    gasUsed?: bigint,
    errorMessage?: string
  ): Promise<void> {
    if (!this.client) return;

    try {
      const { error } = await this.client
        .from('relay_transactions')
        .update({
          status,
          gas_used: gasUsed ? Number(gasUsed) : null,
          error_message: errorMessage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('tx_hash', txHash);

      if (error) {
        logger.warn({ error }, 'Failed to update transaction status');
      }
    } catch (err) {
      logger.warn({ err }, 'Supabase update error');
    }
  }

  /**
   * Get transaction history for a user address.
   */
  async getTransactionsByUser(
    userAddress: string,
    limit = 50
  ): Promise<TransactionLog[]> {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('relay_transactions')
        .select('*')
        .eq('user_address', userAddress.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.warn({ error }, 'Failed to fetch user transactions');
        return [];
      }

      return data || [];
    } catch (err) {
      logger.warn({ err }, 'Supabase query error');
      return [];
    }
  }

  /**
   * Get relayer statistics.
   */
  async getRelayerStats(): Promise<{
    totalTransactions: number;
    successRate: number;
    totalGasUsed: number;
  }> {
    if (!this.client) {
      return { totalTransactions: 0, successRate: 0, totalGasUsed: 0 };
    }

    try {
      const { data, error } = await this.client
        .from('relay_transactions')
        .select('status, gas_used');

      if (error || !data) {
        return { totalTransactions: 0, successRate: 0, totalGasUsed: 0 };
      }

      const total = data.length;
      const successful = data.filter((t) => t.status === 'success').length;
      const gasUsed = data.reduce((sum, t) => sum + (t.gas_used || 0), 0);

      return {
        totalTransactions: total,
        successRate: total > 0 ? (successful / total) * 100 : 0,
        totalGasUsed: gasUsed,
      };
    } catch (err) {
      logger.warn({ err }, 'Supabase stats error');
      return { totalTransactions: 0, successRate: 0, totalGasUsed: 0 };
    }
  }
}

export const supabaseService = new SupabaseService();
