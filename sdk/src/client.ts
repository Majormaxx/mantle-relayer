/**
 * MantleRelayerClient
 * Main SDK entry point for interacting with the Mantle Gas-Less Relayer.
 */

import { Contract, JsonRpcProvider, Signer } from 'ethers';
import type {
  MetaTransaction,
  SignedMetaTransaction,
  RelayResult,
  ValidateResult,
  CostEstimate,
  PaymasterInfo,
  TransactionStatus,
} from './types/contracts.js';
import {
  relayResponseSchema,
  validateResponseSchema,
  nonceResponseSchema,
  paymasterInfoResponseSchema,
  costEstimateResponseSchema,
} from './types/api.js';
import { HttpClient } from './http/client.js';
import { MetaTransactionBuilder } from './builder.js';
import { signMetaTransaction } from './signer.js';
import {
  ConfigurationError,
  NetworkError,
  RelayError,
  TransactionExpiredError,
} from './errors/index.js';
import { isDeadlineValid } from './validation/guards.js';
import { clientConfigSchema, type ClientConfigInput } from './validation/schemas.js';
import { DEFAULTS, NETWORKS } from './utils/constants.js';

/**
 * Client configuration options.
 */
export interface ClientConfig {
  /** Relayer backend URL */
  relayerUrl: string;
  /** Chain ID (default: Mantle Sepolia Testnet) */
  chainId: number;
  /** RPC URL for direct queries (optional) */
  rpcUrl?: string | undefined;
  /** HTTP timeout in milliseconds */
  timeout?: number | undefined;
  /** Number of retry attempts */
  retryAttempts?: number | undefined;
}

/**
 * Paymaster contract ABI (for read and admin operations).
 */
const PAYMASTER_ABI = [
  // Read functions
  'function nonces(address user) view returns (uint256)',
  'function getBalance() view returns (uint256)',
  'function owner() view returns (address)',
  'function paused() view returns (bool)',
  'function isLowBalance() view returns (bool)',
  'function getWhitelistedContracts() view returns (address[])',
  'function getSpendingLimitStatus() view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)',
  'function getAnalytics() view returns (uint256,uint256,uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function isContractWhitelisted(address) view returns (bool)',
  'function isFunctionWhitelisted(address, bytes4) view returns (bool)',
  // Admin write functions
  'function addWhitelistedContract(address contractAddress) external',
  'function removeWhitelistedContract(address contractAddress) external',
  'function addWhitelistedFunction(address contractAddress, bytes4 selector) external',
  'function removeWhitelistedFunction(address contractAddress, bytes4 selector) external',
  'function pause() external',
  'function unpause() external',
  'function withdraw(uint256 amount) external',
  'function setSpendingLimits(uint256 perTx, uint256 daily, uint256 monthly, uint256 global) external',
];

/**
 * Main SDK client for the Mantle Gas-Less Relayer.
 */
export class MantleRelayerClient {
  private readonly config: {
    relayerUrl: string;
    chainId: number;
    rpcUrl: string | undefined;
    timeout: number;
    retryAttempts: number;
  };
  private readonly http: HttpClient;
  private readonly provider: JsonRpcProvider | undefined;

  constructor(config: ClientConfigInput) {
    // Validate configuration
    const result = clientConfigSchema.safeParse(config);
    if (!result.success) {
      throw new ConfigurationError('Invalid client configuration', {
        errors: result.error.issues,
      });
    }

    this.config = {
      relayerUrl: result.data.relayerUrl,
      chainId: result.data.chainId,
      rpcUrl: result.data.rpcUrl as string | undefined,
      timeout: result.data.timeout ?? DEFAULTS.httpTimeoutMs,
      retryAttempts: result.data.retryAttempts ?? DEFAULTS.retryAttempts,
    };

    // Initialize HTTP client
    this.http = new HttpClient({
      baseUrl: this.config.relayerUrl,
      timeout: this.config.timeout,
      retryAttempts: this.config.retryAttempts,
    });

    // Initialize RPC provider if URL provided
    if (this.config.rpcUrl) {
      this.provider = new JsonRpcProvider(this.config.rpcUrl);
    }
  }

  /**
   * Create client for Mantle Sepolia Testnet.
   */
  static forTestnet(relayerUrl: string, rpcUrl?: string): MantleRelayerClient {
    return new MantleRelayerClient({
      relayerUrl,
      chainId: NETWORKS.mantleTestnet.chainId,
      rpcUrl: rpcUrl ?? NETWORKS.mantleTestnet.rpcUrl,
    });
  }

  /**
   * Create client for Mantle Mainnet.
   */
  static forMainnet(relayerUrl: string, rpcUrl?: string): MantleRelayerClient {
    return new MantleRelayerClient({
      relayerUrl,
      chainId: NETWORKS.mantleMainnet.chainId,
      rpcUrl: rpcUrl ?? NETWORKS.mantleMainnet.rpcUrl,
    });
  }

  /**
   * Get the chain ID.
   */
  get chainId(): number {
    return this.config.chainId;
  }

  // ============================================
  // Transaction Operations
  // ============================================

  /**
   * Submit a signed meta-transaction for relay.
   */
  async relay(
    paymasterAddress: string,
    signedTx: SignedMetaTransaction
  ): Promise<RelayResult> {
    // Validate deadline before sending
    if (!isDeadlineValid(signedTx.deadline)) {
      throw new TransactionExpiredError(
        signedTx.deadline,
        BigInt(Math.floor(Date.now() / 1000))
      );
    }

    const response = await this.http.post(
      '/api/v1/relay',
      {
        paymasterAddress,
        metaTx: {
          user: signedTx.user,
          target: signedTx.target,
          data: signedTx.data,
          gasLimit: signedTx.gasLimit.toString(),
          nonce: signedTx.nonce.toString(),
          deadline: signedTx.deadline.toString(),
          signature: signedTx.signature,
        },
      },
      relayResponseSchema
    );

    if (!response.success || !response.data) {
      throw new RelayError(
        -1,
        response.error?.message ?? 'Relay failed'
      );
    }

    return {
      txHash: response.data.txHash,
      status: response.data.status as TransactionStatus,
      gasUsed: BigInt(response.data.gasUsed),
      effectiveGasPrice: BigInt(response.data.effectiveGasPrice),
    };
  }

  /**
   * Validate a meta-transaction without executing (dry run).
   */
  async validate(
    paymasterAddress: string,
    metaTx: MetaTransaction
  ): Promise<ValidateResult> {
    const response = await this.http.post(
      '/api/v1/validate',
      {
        paymasterAddress,
        metaTx: {
          user: metaTx.user,
          target: metaTx.target,
          data: metaTx.data,
          gasLimit: metaTx.gasLimit.toString(),
          nonce: metaTx.nonce.toString(),
          deadline: metaTx.deadline.toString(),
        },
      },
      validateResponseSchema
    );

    if (!response.success || !response.data) {
      throw new NetworkError(response.error?.message ?? 'Validation failed');
    }

    return {
      canExecute: response.data.canExecute,
      errorCode: response.data.errorCode,
      reason: response.data.reason,
      estimatedGas: response.data.estimatedGas 
        ? BigInt(response.data.estimatedGas)
        : undefined,
      estimatedCost: response.data.estimatedCost
        ? BigInt(response.data.estimatedCost)
        : undefined,
    };
  }

  /**
   * Estimate cost for a transaction.
   */
  async estimateCost(
    paymasterAddress: string,
    target: string,
    data: string,
    gasLimit: bigint
  ): Promise<CostEstimate> {
    const response = await this.http.post(
      '/api/v1/estimate',
      {
        paymasterAddress,
        target,
        data,
        gasLimit: gasLimit.toString(),
      },
      costEstimateResponseSchema
    );

    if (!response.success || !response.data) {
      throw new NetworkError(response.error?.message ?? 'Estimation failed');
    }

    return {
      estimatedGas: BigInt(response.data.estimatedGas),
      estimatedCostWei: BigInt(response.data.estimatedCostWei),
    };
  }

  /**
   * Sign a meta-transaction.
   * Convenience wrapper around signMetaTransaction.
   */
  async sign(
    signer: Signer,
    paymasterAddress: string,
    metaTx: MetaTransaction
  ): Promise<SignedMetaTransaction> {
    return signMetaTransaction(signer, paymasterAddress, this.config.chainId, metaTx);
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get user nonce from Paymaster.
   * Uses direct RPC if available, otherwise backend API.
   */
  async getNonce(paymasterAddress: string, userAddress: string): Promise<bigint> {
    // Prefer direct RPC for faster queries
    if (this.provider) {
      try {
        const contract = new Contract(paymasterAddress, PAYMASTER_ABI, this.provider);
        const nonce = await contract.getFunction('nonces')(userAddress) as bigint;
        return BigInt(nonce);
      } catch {
        // Fall back to API if RPC fails
      }
    }

    // Use backend API
    const response = await this.http.get(
      `/api/v1/paymaster/${paymasterAddress}/nonce/${userAddress}`,
      nonceResponseSchema
    );

    if (!response.success || !response.data) {
      throw new NetworkError(response.error?.message ?? 'Failed to get nonce');
    }

    return BigInt(response.data.nonce);
  }

  /**
   * Get Paymaster information and status.
   */
  async getPaymasterInfo(paymasterAddress: string): Promise<PaymasterInfo> {
    const response = await this.http.get(
      `/api/v1/paymaster/${paymasterAddress}`,
      paymasterInfoResponseSchema
    );

    if (!response.success || !response.data) {
      throw new NetworkError(response.error?.message ?? 'Failed to get Paymaster info');
    }

    const data = response.data;
    return {
      address: data.address,
      owner: data.owner,
      balance: BigInt(data.balance),
      isLowBalance: data.isLowBalance,
      isPaused: data.isPaused,
      whitelistedContracts: data.whitelistedContracts,
      spendingLimits: {
        perTransactionLimit: BigInt(data.spendingLimits.perTransactionLimit),
        dailyLimit: BigInt(data.spendingLimits.dailyLimit),
        monthlyLimit: BigInt(data.spendingLimits.monthlyLimit),
        globalLimit: BigInt(data.spendingLimits.globalLimit),
        dailySpent: BigInt(data.spendingLimits.dailySpent),
        monthlySpent: BigInt(data.spendingLimits.monthlySpent),
        globalSpent: BigInt(data.spendingLimits.globalSpent),
        lastResetDay: 0n,
        lastResetMonth: 0n,
      },
      analytics: {
        totalTransactions: BigInt(data.analytics.totalTransactions),
        totalGasSpent: BigInt(data.analytics.totalGasSpent),
        uniqueUsers: BigInt(data.analytics.uniqueUsers),
      },
    };
  }

  // ============================================
  // Builder Factory
  // ============================================

  /**
   * Create a new MetaTransactionBuilder.
   */
  buildTransaction(): MetaTransactionBuilder {
    return new MetaTransactionBuilder({
      chainId: this.config.chainId,
      getNonce: (paymaster, user) => this.getNonce(paymaster, user),
      maxGasLimit: DEFAULTS.maxGasLimit,
    });
  }

  // ============================================
  // Health Check
  // ============================================

  /**
   * Check if the relayer service is healthy.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.http.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // Admin Functions (require signer with owner privileges)
  // ============================================

  /**
   * Deposit MNT into the Paymaster to fund gas sponsorship.
   * @param signer - Signer with funds to deposit
   * @param paymasterAddress - Paymaster contract address
   * @param amount - Amount in wei to deposit
   */
  async deposit(
    signer: Signer,
    paymasterAddress: string,
    amount: bigint
  ): Promise<{ txHash: string }> {
    const tx = await signer.sendTransaction({
      to: paymasterAddress,
      value: amount,
    });
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Add a contract to the whitelist (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   * @param contractAddress - Contract to whitelist
   */
  async addWhitelistedContract(
    signer: Signer,
    paymasterAddress: string,
    contractAddress: string
  ): Promise<{ txHash: string }> {
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('addWhitelistedContract')(contractAddress);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Remove a contract from the whitelist (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   * @param contractAddress - Contract to remove
   */
  async removeWhitelistedContract(
    signer: Signer,
    paymasterAddress: string,
    contractAddress: string
  ): Promise<{ txHash: string }> {
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('removeWhitelistedContract')(contractAddress);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Add a function to the whitelist (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   * @param contractAddress - Target contract
   * @param functionSignature - Function signature (e.g., "transfer(address,uint256)")
   */
  async addWhitelistedFunction(
    signer: Signer,
    paymasterAddress: string,
    contractAddress: string,
    functionSignature: string
  ): Promise<{ txHash: string }> {
    // Compute function selector from signature
    const { id } = await import('ethers');
    const selector = id(functionSignature).slice(0, 10);
    
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('addWhitelistedFunction')(contractAddress, selector);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Remove a function from the whitelist (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   * @param contractAddress - Target contract
   * @param functionSignature - Function signature to remove
   */
  async removeWhitelistedFunction(
    signer: Signer,
    paymasterAddress: string,
    contractAddress: string,
    functionSignature: string
  ): Promise<{ txHash: string }> {
    const { id } = await import('ethers');
    const selector = id(functionSignature).slice(0, 10);
    
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('removeWhitelistedFunction')(contractAddress, selector);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Check if a contract is whitelisted.
   * @param paymasterAddress - Paymaster contract address
   * @param contractAddress - Contract to check
   */
  async isContractWhitelisted(
    paymasterAddress: string,
    contractAddress: string
  ): Promise<boolean> {
    if (!this.provider) {
      throw new ConfigurationError('RPC URL required for direct contract queries');
    }
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, this.provider);
    return await contract.getFunction('isContractWhitelisted')(contractAddress);
  }

  /**
   * Check if a function is whitelisted.
   * @param paymasterAddress - Paymaster contract address
   * @param contractAddress - Target contract
   * @param functionSelector - 4-byte function selector (e.g., "0xa9059cbb")
   */
  async isFunctionWhitelisted(
    paymasterAddress: string,
    contractAddress: string,
    functionSelector: string
  ): Promise<boolean> {
    if (!this.provider) {
      throw new ConfigurationError('RPC URL required for direct contract queries');
    }
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, this.provider);
    return await contract.getFunction('isFunctionWhitelisted')(contractAddress, functionSelector);
  }

  /**
   * Pause the Paymaster (owner only, emergency stop).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   */
  async pause(
    signer: Signer,
    paymasterAddress: string
  ): Promise<{ txHash: string }> {
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('pause')();
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Unpause the Paymaster (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   */
  async unpause(
    signer: Signer,
    paymasterAddress: string
  ): Promise<{ txHash: string }> {
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('unpause')();
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Withdraw MNT from the Paymaster (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   * @param amount - Amount in wei to withdraw
   */
  async withdraw(
    signer: Signer,
    paymasterAddress: string,
    amount: bigint
  ): Promise<{ txHash: string }> {
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('withdraw')(amount);
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }

  /**
   * Set spending limits (owner only).
   * @param signer - Owner signer
   * @param paymasterAddress - Paymaster contract address
   * @param limits - Spending limit configuration
   */
  async setSpendingLimits(
    signer: Signer,
    paymasterAddress: string,
    limits: {
      perTransaction: bigint;
      daily: bigint;
      monthly: bigint;
      global: bigint;
    }
  ): Promise<{ txHash: string }> {
    const contract = new Contract(paymasterAddress, PAYMASTER_ABI, signer);
    const tx = await contract.getFunction('setSpendingLimits')(
      limits.perTransaction,
      limits.daily,
      limits.monthly,
      limits.global
    );
    const receipt = await tx.wait();
    return { txHash: receipt?.hash ?? tx.hash };
  }
}
