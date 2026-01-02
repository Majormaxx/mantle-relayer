import { Wallet } from 'ethers';
import { env } from '../../config/env.js';
import { getProvider } from './provider.js';
import { logger } from '../../monitoring/logger.js';
import { BlockchainError } from '../../utils/errors.js';

/**
 * Relayer wallet management with secure key handling.
 * The relayer wallet is used to submit transactions to the blockchain.
 */
class RelayerWallet {
  private static instance: RelayerWallet | null = null;
  private wallet: Wallet;
  private readonly address: string;

  private constructor() {
    const provider = getProvider();
    this.wallet = new Wallet(env.RELAYER_PRIVATE_KEY, provider);
    this.address = this.wallet.address;
    
    // Log initialization without exposing private key
    logger.info(
      { address: this.address },
      'Relayer wallet initialized'
    );
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): RelayerWallet {
    if (!RelayerWallet.instance) {
      RelayerWallet.instance = new RelayerWallet();
    }
    return RelayerWallet.instance;
  }

  /**
   * Get the relayer wallet address.
   */
  getAddress(): string {
    return this.address;
  }

  /**
   * Get the ethers Wallet instance for signing transactions.
   */
  getSigner(): Wallet {
    return this.wallet;
  }

  /**
   * Get the relayer's current MNT balance.
   */
  async getBalance(): Promise<bigint> {
    try {
      return await this.wallet.provider!.getBalance(this.address);
    } catch (error) {
      throw new BlockchainError('Failed to get relayer balance', error);
    }
  }

  /**
   * Check if relayer has sufficient balance for gas.
   * @param minimumBalance Minimum required balance in wei
   */
  async hasSufficientBalance(minimumBalance: bigint = 10_000_000_000_000_000n): Promise<boolean> {
    const balance = await this.getBalance();
    return balance >= minimumBalance;
  }

  /**
   * Get formatted balance for display.
   */
  async getFormattedBalance(): Promise<string> {
    const balance = await this.getBalance();
    // Convert wei to MNT (18 decimals)
    const mnt = Number(balance) / 1e18;
    return `${mnt.toFixed(4)} MNT`;
  }
}

/**
 * Get the relayer wallet singleton.
 */
export function getRelayerWallet(): RelayerWallet {
  return RelayerWallet.getInstance();
}

/**
 * Get the relayer address.
 */
export function getRelayerAddress(): string {
  return getRelayerWallet().getAddress();
}

/**
 * Get the relayer signer for transactions.
 */
export function getRelayerSigner(): Wallet {
  return getRelayerWallet().getSigner();
}

/**
 * Check if relayer has sufficient balance.
 */
export async function hasRelayerSufficientBalance(): Promise<boolean> {
  return getRelayerWallet().hasSufficientBalance();
}

/**
 * Get relayer balance as string.
 */
export async function getRelayerBalance(): Promise<bigint> {
  return getRelayerWallet().getBalance();
}
