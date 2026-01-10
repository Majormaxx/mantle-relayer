// Paymaster client for managing and interacting with Paymaster contracts
import { ethers, Contract } from 'ethers';
import { RelayerClient } from './RelayerClient.js';
import { signMetaTransaction, createDeadline, encodeFunctionCall } from '../utils/eip712.js';
// Minimal Paymaster ABI for SDK interactions
const PAYMASTER_ABI = [
    'function owner() view returns (address)',
    'function paused() view returns (bool)',
    'function nonces(address) view returns (uint256)',
    'function getBalance() view returns (uint256)',
    'function isContractWhitelisted(address) view returns (bool)',
    'function isFunctionWhitelisted(address, bytes4) view returns (bool)',
];
/**
 * Client for interacting with a specific Paymaster contract
 */
export class PaymasterClient {
    constructor(provider, address, chainId, relayerUrl, signer) {
        this.provider = provider;
        this.address = address;
        this.chainId = chainId;
        this.relayerClient = new RelayerClient(relayerUrl);
        this.contract = new Contract(address, PAYMASTER_ABI, provider);
        this.signer = signer;
    }
    /**
     * Get Paymaster address
     */
    getAddress() {
        return this.address;
    }
    /**
     * Execute a gasless transaction
     * This is the main function users will call!
     */
    async executeGasless(userSigner, targetContract, functionSignature, args, gasLimit = 300000n, deadlineSeconds = 3600) {
        // 1. Get user address
        const userAddress = await userSigner.getAddress();
        // 2. Encode the function call
        const iface = new ethers.Interface([`function ${functionSignature}`]);
        const functionName = functionSignature.split('(')[0];
        const data = encodeFunctionCall(iface, functionName, args);
        // 3. Get user's nonce
        const nonce = await this.getUserNonce(userAddress);
        // 4. Create deadline
        const deadline = createDeadline(deadlineSeconds);
        // 5. Create MetaTransaction
        const metaTx = {
            user: userAddress,
            target: targetContract,
            data,
            gasLimit,
            nonce,
            deadline,
        };
        // 6. Sign with EIP-712
        const signature = await signMetaTransaction(userSigner, this.address, this.chainId, metaTx);
        // 7. Submit to relayer
        return await this.relayerClient.relay(this.address, {
            ...metaTx,
            signature,
        });
    }
    /**
     * Validate a transaction before execution (dry run)
     */
    async validateGasless(userAddress, targetContract, functionSignature, args, gasLimit = 300000n) {
        // Encode function call
        const iface = new ethers.Interface([`function ${functionSignature}`]);
        const functionName = functionSignature.split('(')[0];
        const data = encodeFunctionCall(iface, functionName, args);
        // Get nonce
        const nonce = await this.getUserNonce(userAddress);
        // Create deadline
        const deadline = createDeadline();
        const metaTx = {
            user: userAddress,
            target: targetContract,
            data,
            gasLimit,
            nonce,
            deadline,
        };
        return await this.relayerClient.validate(this.address, metaTx);
    }
    /**
     * Get comprehensive Paymaster information
     */
    async getInfo() {
        return await this.relayerClient.getPaymasterInfo(this.address);
    }
    /**
     * Get user's current nonce
     */
    async getUserNonce(userAddress) {
        return await this.relayerClient.getUserNonce(this.address, userAddress);
    }
    /**
     * Get Paymaster balance
     */
    async getBalance() {
        return await this.contract.getBalance();
    }
    /**
     * Check if contract is whitelisted
     */
    async isContractWhitelisted(contractAddress) {
        return await this.contract.isContractWhitelisted(contractAddress);
    }
    /**
     * Check if function is whitelisted
     */
    async isFunctionWhitelisted(contractAddress, functionSelector) {
        return await this.contract.isFunctionWhitelisted(contractAddress, functionSelector);
    }
    /**
     * Get Paymaster owner
     */
    async getOwner() {
        return await this.contract.owner();
    }
    /**
     * Check if Paymaster is paused
     */
    async isPaused() {
        return await this.contract.paused();
    }
    /**
     * Get transaction status by hash
     */
    async getTransactionStatus(txHash) {
        return await this.relayerClient.getTransactionStatus(txHash);
    }
    // ============================================
    // ADMIN FUNCTIONS (require signer)
    // These call the contract directly, not the relayer
    // ============================================
    /**
     * Deposit MNT into the Paymaster
     */
    async deposit(amount) {
        if (!this.signer) {
            throw new Error('Signer required for deposit');
        }
        return await this.signer.sendTransaction({
            to: this.address,
            value: amount,
        });
    }
    /**
     * Add a contract to the whitelist (owner only)
     */
    async addWhitelistedContract(contractAddress) {
        if (!this.signer) {
            throw new Error('Signer required for admin functions');
        }
        const contract = this.contract.connect(this.signer);
        return await contract.addWhitelistedContract(contractAddress);
    }
    /**
     * Add a function to the whitelist (owner only)
     */
    async addWhitelistedFunction(contractAddress, functionSignature) {
        if (!this.signer) {
            throw new Error('Signer required for admin functions');
        }
        const selector = ethers.id(functionSignature).slice(0, 10);
        const contract = this.contract.connect(this.signer);
        return await contract.addWhitelistedFunction(contractAddress, selector);
    }
}
