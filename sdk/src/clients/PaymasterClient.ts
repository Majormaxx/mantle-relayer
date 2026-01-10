// Paymaster client for managing and interacting with Paymaster contracts
import { ethers, Signer, Provider, Contract } from 'ethers';
import { RelayerClient } from './RelayerClient.js';
import { signMetaTransaction, createDeadline, encodeFunctionCall } from '../utils/eip712.js';
import type {
  MetaTransaction,
  GaslessTransactionResult,
  ValidationResult,
  PaymasterInfo,
} from '../types/index.js';

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
  private provider: Provider;
  private address: string;
  private chainId: number;
  private relayerClient: RelayerClient;
  private contract: Contract;
  private signer?: Signer;

  constructor(
    provider: Provider,
    address: string,
    chainId: number,
    relayerUrl: string,
    signer?: Signer
  ) {
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
  getAddress(): string {
    return this.address;
  }

  /**
   * Execute a gasless transaction
   * This is the main function users will call!
   */
  async executeGasless(
    userSigner: Signer,
    targetContract: string,
    functionSignature: string,
    args: any[],
    gasLimit: bigint = 300000n,
    deadlineSeconds: number = 3600
  ): Promise<GaslessTransactionResult> {
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
    const metaTx: MetaTransaction = {
      user: userAddress,
      target: targetContract,
      data,
      gasLimit,
      nonce,
      deadline,
    };

    // 6. Sign with EIP-712
    const signature = await signMetaTransaction(
      userSigner,
      this.address,
      this.chainId,
      metaTx
    );

    // 7. Submit to relayer
    return await this.relayerClient.relay(this.address, {
      ...metaTx,
      signature,
    });
  }

  /**
   * Validate a transaction before execution (dry run)
   */
  async validateGasless(
    userAddress: string,
    targetContract: string,
    functionSignature: string,
    args: any[],
    gasLimit: bigint = 300000n
  ): Promise<ValidationResult> {
    // Encode function call
    const iface = new ethers.Interface([`function ${functionSignature}`]);
    const functionName = functionSignature.split('(')[0];
    const data = encodeFunctionCall(iface, functionName, args);

    // Get nonce
    const nonce = await this.getUserNonce(userAddress);

    // Create deadline
    const deadline = createDeadline();

    const metaTx: MetaTransaction = {
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
  async getInfo(): Promise<PaymasterInfo> {
    return await this.relayerClient.getPaymasterInfo(this.address);
  }

  /**
   * Get user's current nonce
   */
  async getUserNonce(userAddress: string): Promise<bigint> {
    return await this.relayerClient.getUserNonce(this.address, userAddress);
  }

  /**
   * Get Paymaster balance
   */
  async getBalance(): Promise<bigint> {
    return await this.contract.getBalance();
  }

  /**
   * Check if contract is whitelisted
   */
  async isContractWhitelisted(contractAddress: string): Promise<boolean> {
    return await this.contract.isContractWhitelisted(contractAddress);
  }

  /**
   * Check if function is whitelisted
   */
  async isFunctionWhitelisted(
    contractAddress: string,
    functionSelector: string
  ): Promise<boolean> {
    return await this.contract.isFunctionWhitelisted(contractAddress, functionSelector);
  }

  /**
   * Get Paymaster owner
   */
  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }

  /**
   * Check if Paymaster is paused
   */
  async isPaused(): Promise<boolean> {
    return await this.contract.paused();
  }

  /**
   * Get transaction status by hash
   */
  async getTransactionStatus(txHash: string): Promise<GaslessTransactionResult> {
    return await this.relayerClient.getTransactionStatus(txHash);
  }

  // ============================================
  // ADMIN FUNCTIONS (require signer)
  // These call the contract directly, not the relayer
  // ============================================

  /**
   * Deposit MNT into the Paymaster
   */
  async deposit(amount: bigint): Promise<ethers.TransactionResponse> {
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
  async addWhitelistedContract(contractAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for admin functions');
    }
    const contract = this.contract.connect(this.signer) as any;
    return await contract.addWhitelistedContract(contractAddress);
  }

  /**
   * Add a function to the whitelist (owner only)
   */
  async addWhitelistedFunction(
    contractAddress: string,
    functionSignature: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for admin functions');
    }
    const selector = ethers.id(functionSignature).slice(0, 10);
    const contract = this.contract.connect(this.signer) as any;
    return await contract.addWhitelistedFunction(contractAddress, selector);
  }
}
