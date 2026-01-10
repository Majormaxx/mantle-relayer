import type { SignedMetaTransaction, MetaTransaction, GaslessTransactionResult, ValidationResult, PaymasterInfo } from '../types/index.js';
/**
 * Client for communicating with the relayer backend API
 */
export declare class RelayerClient {
    private baseUrl;
    private timeout;
    constructor(baseUrl: string, timeout?: number);
    /**
     * Check if relayer backend is healthy
     */
    health(): Promise<boolean>;
    /**
     * Submit a signed meta-transaction for execution
     */
    relay(paymasterAddress: string, signedMetaTx: SignedMetaTransaction): Promise<GaslessTransactionResult>;
    /**
     * Validate a meta-transaction without executing (dry run)
     */
    validate(paymasterAddress: string, metaTx: MetaTransaction): Promise<ValidationResult>;
    /**
     * Get Paymaster information
     */
    getPaymasterInfo(address: string): Promise<PaymasterInfo>;
    /**
     * Get user's nonce for a Paymaster
     */
    getUserNonce(paymasterAddress: string, userAddress: string): Promise<bigint>;
    /**
     * Get transaction status
     */
    getTransactionStatus(txHash: string): Promise<GaslessTransactionResult>;
    /**
     * Internal fetch wrapper with timeout and error handling
     */
    private fetch;
    /**
     * Serialize meta-transaction for API (convert bigints to strings)
     */
    private serializeMetaTx;
    /**
     * Deserialize Paymaster info from API response
     */
    private deserializePaymasterInfo;
    /**
     * Parse limit value (handle "unlimited" string)
     */
    private parseLimitValue;
}
//# sourceMappingURL=RelayerClient.d.ts.map