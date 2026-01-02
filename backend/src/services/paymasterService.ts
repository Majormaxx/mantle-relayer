import { getPaymasterContract, getPaymasterFactoryContract, callContractMethod } from '../core/blockchain/contracts.js';
import { getUserNonce } from '../core/relayer/validator.js';
import type {
  PaymasterInfo,
  PaymasterAnalytics,
  SpendingLimit,
} from '../types/contracts.js';
import { PaymasterNotFoundError, BlockchainError } from '../utils/errors.js';
import { logger } from '../monitoring/logger.js';

/**
 * Service for interacting with Paymaster contracts.
 */
export class PaymasterService {
  /**
   * Get comprehensive info about a Paymaster.
   */
  async getPaymasterInfo(address: string): Promise<PaymasterInfo> {
    // First verify it's a valid Paymaster
    const isValid = await this.isValidPaymaster(address);
    if (!isValid) {
      throw new PaymasterNotFoundError(address);
    }

    const paymaster = getPaymasterContract(address);

    try {
      // Fetch all data in parallel for efficiency
      const [
        owner,
        balance,
        isLowBalance,
        isPaused,
        whitelistedContracts,
        spendingLimits,
        analyticsRaw,
      ] = await Promise.all([
        callContractMethod<string>(paymaster, 'owner'),
        callContractMethod<bigint>(paymaster, 'getBalance'),
        callContractMethod<boolean>(paymaster, 'isLowBalance'),
        callContractMethod<boolean>(paymaster, 'paused'),
        callContractMethod<string[]>(paymaster, 'getWhitelistedContracts'),
        callContractMethod<SpendingLimit>(paymaster, 'getSpendingLimitStatus'),
        callContractMethod<[bigint, bigint, bigint]>(paymaster, 'getAnalytics'),
      ]);

      // Transform spending limits
      const limits: SpendingLimit = {
        perTransactionLimit: spendingLimits.perTransactionLimit,
        dailyLimit: spendingLimits.dailyLimit,
        monthlyLimit: spendingLimits.monthlyLimit,
        globalLimit: spendingLimits.globalLimit,
        dailySpent: spendingLimits.dailySpent,
        monthlySpent: spendingLimits.monthlySpent,
        globalSpent: spendingLimits.globalSpent,
        lastResetDay: spendingLimits.lastResetDay,
        lastResetMonth: spendingLimits.lastResetMonth,
      };

      // Transform analytics
      const analytics: PaymasterAnalytics = {
        totalTransactions: analyticsRaw[0],
        totalGasSpent: analyticsRaw[1],
        uniqueUsers: analyticsRaw[2],
      };

      return {
        address,
        owner,
        balance,
        isLowBalance,
        isPaused,
        whitelistedContracts,
        spendingLimits: limits,
        analytics,
      };
    } catch (error) {
      logger.error({ error: String(error), address }, 'Failed to get Paymaster info');
      throw new BlockchainError('Failed to get Paymaster info', error);
    }
  }

  /**
   * Check if address is a valid Paymaster.
   */
  async isValidPaymaster(address: string): Promise<boolean> {
    try {
      const factory = getPaymasterFactoryContract();
      return await callContractMethod<boolean>(factory, 'isPaymaster', address);
    } catch (error) {
      logger.error({ error: String(error), address }, 'Failed to check Paymaster validity');
      return false;
    }
  }

  /**
   * Get user's current nonce for a Paymaster.
   */
  async getUserNonce(paymasterAddress: string, userAddress: string): Promise<bigint> {
    return getUserNonce(paymasterAddress, userAddress);
  }

  /**
   * Get Paymaster balance.
   */
  async getBalance(address: string): Promise<bigint> {
    const paymaster = getPaymasterContract(address);
    return await callContractMethod<bigint>(paymaster, 'getBalance');
  }

  /**
   * Check if a contract is whitelisted.
   */
  async isContractWhitelisted(paymasterAddress: string, contractAddress: string): Promise<boolean> {
    const paymaster = getPaymasterContract(paymasterAddress);
    return await callContractMethod<boolean>(paymaster, 'isContractWhitelisted', contractAddress);
  }

  /**
   * Check if a function is whitelisted.
   */
  async isFunctionWhitelisted(
    paymasterAddress: string,
    contractAddress: string,
    selector: string
  ): Promise<boolean> {
    const paymaster = getPaymasterContract(paymasterAddress);
    return await callContractMethod<boolean>(paymaster, 'isFunctionWhitelisted', contractAddress, selector);
  }

  /**
   * Get estimated transaction cost.
   */
  async estimateTransactionCost(
    paymasterAddress: string,
    target: string,
    data: string,
    gasLimit: bigint
  ): Promise<{ estimatedGas: bigint; estimatedCostWei: bigint }> {
    const paymaster = getPaymasterContract(paymasterAddress);
    const result = await callContractMethod<[bigint, bigint]>(paymaster, 'estimateTransactionCost', target, data, gasLimit);
    return { estimatedGas: result[0], estimatedCostWei: result[1] };
  }

  /**
   * Get list of all Paymasters for an owner.
   */
  async getPaymastersForOwner(ownerAddress: string): Promise<string[]> {
    const factory = getPaymasterFactoryContract();
    return await callContractMethod<string[]>(factory, 'getPaymasters', ownerAddress);
  }

  /**
   * Get total number of Paymasters.
   */
  async getTotalPaymasters(): Promise<bigint> {
    const factory = getPaymasterFactoryContract();
    return await callContractMethod<bigint>(factory, 'getTotalPaymasters');
  }
}

// Export singleton instance
export const paymasterService = new PaymasterService();
