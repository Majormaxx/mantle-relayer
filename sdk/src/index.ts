// Main SDK entry point
import { Provider } from 'ethers';
import { PaymasterClient } from './clients/PaymasterClient.js';
import { RelayerClient } from './clients/RelayerClient.js';
import type { SDKConfig } from './types/index.js';

// Re-export types for convenience
export * from './types/index.js';
export { PaymasterClient } from './clients/PaymasterClient.js';
export { RelayerClient } from './clients/RelayerClient.js';

/**
 * Main SDK class for Mantle Gas-Less Relayer
 * 
 * @example
 * ```typescript
 * import { MantleGaslessSDK } from '@mantle-relayer/sdk';
 * import { ethers } from 'ethers';
 * 
 * const provider = new ethers.BrowserProvider(window.ethereum);
 * const sdk = new MantleGaslessSDK({
 *   relayerUrl: 'https://relayer.mantle-gasless.xyz',
 *   factoryAddress: '0x4F5f7aBa739cB54BEdc6b7a6B9615DAeDc3A26A4',
 *   chainId: 5003
 * });
 * 
 * // Get a Paymaster client
 * const paymaster = sdk.getPaymaster('0xPaymasterAddress');
 * 
 * // Execute gasless transaction
 * const result = await paymaster.executeGasless(
 *   userSigner,
 *   '0xTokenAddress',
 *   'transfer(address,uint256)',
 *   [recipient, amount]
 * );
 * ```
 */
export class MantleGaslessSDK {
  private provider: Provider;
  private config: Required<SDKConfig>;
  private relayerClient: RelayerClient;

  /**
   * Create a new SDK instance
   * 
   * @param provider - Ethers provider instance
   * @param config - SDK configuration
   */
  constructor(provider: Provider, config: SDKConfig) {
    this.provider = provider;
    this.config = {
      ...config,
      chainId: config.chainId || 5003, // Default to Mantle Sepolia
      timeout: config.timeout || 30000, // 30 seconds default
    };
    this.relayerClient = new RelayerClient(config.relayerUrl, this.config.timeout);
  }

  /**
   * Get a Paymaster client for a specific address
   * 
   * @param paymasterAddress - Address of the Paymaster contract
   * @param signer - Optional signer for admin functions
   * @returns PaymasterClient instance
   */
  getPaymaster(paymasterAddress: string, signer?: any): PaymasterClient {
    return new PaymasterClient(
      this.provider,
      paymasterAddress,
      this.config.chainId,
      this.config.relayerUrl,
      signer
    );
  }

  /**
   * Check if relayer backend is healthy
   * 
   * @returns Promise<boolean> true if healthy
   */
  async isRelayerHealthy(): Promise<boolean> {
    return await this.relayerClient.health();
  }

  /**
   * Get the relayer URL
   */
  getRelayerUrl(): string {
    return this.config.relayerUrl;
  }

  /**
   * Get the factory address
   */
  getFactoryAddress(): string {
    return this.config.factoryAddress;
  }

  /**
   * Get the chain ID
   */
  getChainId(): number {
    return this.config.chainId;
  }
}
