import { ethers, Signer, Provider } from 'ethers';
import type { GaslessTransactionResult, ValidationResult, PaymasterInfo } from '../types/index.js';
/**
 * Client for interacting with a specific Paymaster contract
 */
export declare class PaymasterClient {
    private provider;
    private address;
    private chainId;
    private relayerClient;
    private contract;
    private signer?;
    constructor(provider: Provider, address: string, chainId: number, relayerUrl: string, signer?: Signer);
    /**
     * Get Paymaster address
     */
    getAddress(): string;
    /**
     * Execute a gasless transaction
     * This is the main function users will call!
     */
    executeGasless(userSigner: Signer, targetContract: string, functionSignature: string, args: any[], gasLimit?: bigint, deadlineSeconds?: number): Promise<GaslessTransactionResult>;
    /**
     * Validate a transaction before execution (dry run)
     */
    validateGasless(userAddress: string, targetContract: string, functionSignature: string, args: any[], gasLimit?: bigint): Promise<ValidationResult>;
    /**
     * Get comprehensive Paymaster information
     */
    getInfo(): Promise<PaymasterInfo>;
    /**
     * Get user's current nonce
     */
    getUserNonce(userAddress: string): Promise<bigint>;
    /**
     * Get Paymaster balance
     */
    getBalance(): Promise<bigint>;
    /**
     * Check if contract is whitelisted
     */
    isContractWhitelisted(contractAddress: string): Promise<boolean>;
    /**
     * Check if function is whitelisted
     */
    isFunctionWhitelisted(contractAddress: string, functionSelector: string): Promise<boolean>;
    /**
     * Get Paymaster owner
     */
    getOwner(): Promise<string>;
    /**
     * Check if Paymaster is paused
     */
    isPaused(): Promise<boolean>;
    /**
     * Get transaction status by hash
     */
    getTransactionStatus(txHash: string): Promise<GaslessTransactionResult>;
    /**
     * Deposit MNT into the Paymaster
     */
    deposit(amount: bigint): Promise<ethers.TransactionResponse>;
    /**
     * Add a contract to the whitelist (owner only)
     */
    addWhitelistedContract(contractAddress: string): Promise<ethers.ContractTransactionResponse>;
    /**
     * Add a function to the whitelist (owner only)
     */
    addWhitelistedFunction(contractAddress: string, functionSignature: string): Promise<ethers.ContractTransactionResponse>;
}
//# sourceMappingURL=PaymasterClient.d.ts.map