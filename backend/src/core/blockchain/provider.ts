import { JsonRpcProvider, Network, FetchRequest } from 'ethers';
import { network as networkConfig } from '../../config/index.js';
import { logger } from '../../monitoring/logger.js';
import { BlockchainError } from '../../utils/errors.js';

/**
 * Custom provider with retry logic and connection management.
 */
class MantleProvider extends JsonRpcProvider {
  private static instance: MantleProvider | null = null;
  private connectionAttempts = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  private constructor(url: string, chainId: number) {
    // Create a custom network to avoid ENS lookups
    const network = new Network('mantle', BigInt(chainId));
    
    // Configure fetch request with timeout
    const fetchRequest = new FetchRequest(url);
    fetchRequest.timeout = 30000; // 30 second timeout
    
    super(fetchRequest, network, { staticNetwork: network });
  }

  /**
   * Get singleton provider instance.
   */
  static getInstance(): MantleProvider {
    if (!MantleProvider.instance) {
      MantleProvider.instance = new MantleProvider(
        networkConfig.rpcUrl,
        networkConfig.chainId
      );
      logger.info({ rpcUrl: networkConfig.rpcUrl, chainId: networkConfig.chainId }, 'Provider initialized');
    }
    return MantleProvider.instance;
  }

  /**
   * Send RPC request with retry logic.
   */
  async send(method: string, params: unknown[]): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await super.send(method, params);
        this.connectionAttempts = 0; // Reset on success
        return result;
      } catch (error) {
        lastError = error;
        this.connectionAttempts++;

        logger.warn(
          { method, attempt: attempt + 1, error: String(error) },
          'RPC request failed, retrying'
        );

        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    logger.error({ method, error: String(lastError) }, 'RPC request failed after all retries');
    throw new BlockchainError(`RPC request failed: ${method}`, lastError);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if provider is connected and responsive.
   */
  async isHealthy(): Promise<boolean> {
    try {
      const blockNumber = await this.getBlockNumber();
      return blockNumber > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get current block number (used for health checks).
   */
  async getCurrentBlock(): Promise<number> {
    try {
      return await this.getBlockNumber();
    } catch (error) {
      throw new BlockchainError('Failed to get current block', error);
    }
  }

  /**
   * Get gas price with safety checks.
   */
  async getSafeGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.getFeeData();
      
      // Prefer EIP-1559 pricing if available
      if (feeData.maxFeePerGas) {
        return feeData.maxFeePerGas;
      }
      
      // Fallback to legacy gas price
      if (feeData.gasPrice) {
        return feeData.gasPrice;
      }

      // Default to 1 gwei if nothing available
      return 1_000_000_000n;
    } catch (error) {
      throw new BlockchainError('Failed to get gas price', error);
    }
  }
}

/**
 * Get the provider singleton.
 */
export function getProvider(): MantleProvider {
  return MantleProvider.getInstance();
}

/**
 * Check if RPC is healthy.
 */
export async function isRpcHealthy(): Promise<boolean> {
  return getProvider().isHealthy();
}
