import { Provider } from 'ethers';
import { PaymasterClient } from './clients/PaymasterClient.js';
import type { SDKConfig } from './types/index.js';
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
export declare class MantleGaslessSDK {
    private provider;
    private config;
    private relayerClient;
    /**
     * Create a new SDK instance
     *
     * @param provider - Ethers provider instance
     * @param config - SDK configuration
     */
    constructor(provider: Provider, config: SDKConfig);
    /**
     * Get a Paymaster client for a specific address
     *
     * @param paymasterAddress - Address of the Paymaster contract
     * @param signer - Optional signer for admin functions
     * @returns PaymasterClient instance
     */
    getPaymaster(paymasterAddress: string, signer?: any): PaymasterClient;
    /**
     * Check if relayer backend is healthy
     *
     * @returns Promise<boolean> true if healthy
     */
    isRelayerHealthy(): Promise<boolean>;
    /**
     * Get the relayer URL
     */
    getRelayerUrl(): string;
    /**
     * Get the factory address
     */
    getFactoryAddress(): string;
    /**
     * Get the chain ID
     */
    getChainId(): number;
}
//# sourceMappingURL=index.d.ts.map