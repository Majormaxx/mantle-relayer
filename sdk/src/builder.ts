/**
 * MetaTransaction Builder
 * Fluent builder for constructing and signing meta-transactions.
 */

import { Signer } from 'ethers';
import type { MetaTransaction, SignedMetaTransaction } from './types/contracts.js';
import { signMetaTransaction } from './signer.js';
import { ValidationError, ConfigurationError } from './errors/index.js';
import { isDeadlineValid } from './validation/guards.js';
import { addressSchema, hexStringSchema } from './validation/schemas.js';
import { DEFAULTS } from './utils/constants.js';

/**
 * Builder configuration from client.
 */
export interface BuilderConfig {
  chainId: number;
  getNonce: (paymasterAddress: string, userAddress: string) => Promise<bigint>;
  maxGasLimit?: bigint | undefined;
}

/**
 * Fluent builder for creating meta-transactions.
 * Provides validation and sensible defaults.
 */
export class MetaTransactionBuilder {
  private target: string | undefined;
  private data: string | undefined;
  private gasLimit: bigint | undefined;
  private deadline: bigint | 'auto' | undefined;
  private userAddress: string | undefined;
  private paymasterAddress: string | undefined;
  private nonce: bigint | undefined;

  private readonly config: BuilderConfig;

  constructor(config: BuilderConfig) {
    this.config = config;
    this.deadline = 'auto'; // Default to auto-deadline
  }

  /**
   * Set the target contract address.
   */
  setTarget(target: string): this {
    const result = addressSchema.safeParse(target);
    if (!result.success) {
      throw new ValidationError('Invalid target address', [
        { field: 'target', message: result.error.issues[0]?.message ?? 'Invalid' },
      ]);
    }
    this.target = result.data;
    return this;
  }

  /**
   * Set the encoded function call data.
   */
  setCallData(data: string): this {
    const result = hexStringSchema.safeParse(data);
    if (!result.success) {
      throw new ValidationError('Invalid call data', [
        { field: 'data', message: result.error.issues[0]?.message ?? 'Invalid' },
      ]);
    }
    this.data = result.data;
    return this;
  }

  /**
   * Set the gas limit for the transaction.
   */
  setGasLimit(limit: bigint): this {
    if (limit <= 0n) {
      throw new ValidationError('Gas limit must be positive', [
        { field: 'gasLimit', message: 'Must be greater than 0' },
      ]);
    }
    const maxLimit = this.config.maxGasLimit ?? DEFAULTS.maxGasLimit;
    if (limit > maxLimit) {
      throw new ValidationError(`Gas limit exceeds maximum (${maxLimit})`, [
        { field: 'gasLimit', message: `Must be <= ${maxLimit}` },
      ]);
    }
    this.gasLimit = limit;
    return this;
  }

  /**
   * Set the transaction deadline.
   * Use 'auto' for automatic deadline (5 minutes from now).
   */
  setDeadline(deadline: bigint | 'auto'): this {
    if (deadline !== 'auto' && deadline <= 0n) {
      throw new ValidationError('Deadline must be positive', [
        { field: 'deadline', message: 'Must be greater than 0' },
      ]);
    }
    this.deadline = deadline;
    return this;
  }

  /**
   * Set the user address (usually from signer).
   */
  setUser(user: string): this {
    const result = addressSchema.safeParse(user);
    if (!result.success) {
      throw new ValidationError('Invalid user address', [
        { field: 'user', message: result.error.issues[0]?.message ?? 'Invalid' },
      ]);
    }
    this.userAddress = result.data;
    return this;
  }

  /**
   * Set the Paymaster address for this transaction.
   */
  setPaymaster(paymaster: string): this {
    const result = addressSchema.safeParse(paymaster);
    if (!result.success) {
      throw new ValidationError('Invalid paymaster address', [
        { field: 'paymaster', message: result.error.issues[0]?.message ?? 'Invalid' },
      ]);
    }
    this.paymasterAddress = result.data;
    return this;
  }

  /**
   * Manually set nonce (optional - auto-fetched if not set).
   */
  setNonce(nonce: bigint): this {
    if (nonce < 0n) {
      throw new ValidationError('Nonce must be non-negative', [
        { field: 'nonce', message: 'Must be >= 0' },
      ]);
    }
    this.nonce = nonce;
    return this;
  }

  /**
   * Build the unsigned MetaTransaction.
   * Fetches nonce if not manually set.
   */
  async build(): Promise<MetaTransaction> {
    // Validate required fields
    if (!this.target) {
      throw new ConfigurationError('Target address is required');
    }
    if (!this.data) {
      throw new ConfigurationError('Call data is required');
    }
    if (!this.gasLimit) {
      throw new ConfigurationError('Gas limit is required');
    }
    if (!this.userAddress) {
      throw new ConfigurationError('User address is required');
    }
    if (!this.paymasterAddress) {
      throw new ConfigurationError('Paymaster address is required');
    }

    // Fetch nonce if not set
    const nonce = this.nonce ?? await this.config.getNonce(
      this.paymasterAddress,
      this.userAddress
    );

    // Calculate deadline
    let deadline: bigint;
    if (this.deadline === 'auto' || this.deadline === undefined) {
      const now = Math.floor(Date.now() / 1000);
      deadline = BigInt(now + DEFAULTS.deadlineOffsetSeconds);
    } else {
      deadline = this.deadline;
      // Validate deadline is in the future
      if (!isDeadlineValid(deadline)) {
        throw new ValidationError('Deadline must be in the future', [
          { field: 'deadline', message: 'Already expired' },
        ]);
      }
    }

    return {
      user: this.userAddress,
      target: this.target,
      data: this.data,
      gasLimit: this.gasLimit,
      nonce,
      deadline,
    };
  }

  /**
   * Build and sign the MetaTransaction.
   */
  async sign(signer: Signer): Promise<SignedMetaTransaction> {
    // Get user address from signer if not set
    if (!this.userAddress) {
      const address = await signer.getAddress();
      this.setUser(address);
    }

    if (!this.paymasterAddress) {
      throw new ConfigurationError('Paymaster address is required for signing');
    }

    const metaTx = await this.build();
    return signMetaTransaction(
      signer,
      this.paymasterAddress,
      this.config.chainId,
      metaTx
    );
  }

  /**
   * Reset the builder for reuse.
   */
  reset(): this {
    this.target = undefined;
    this.data = undefined;
    this.gasLimit = undefined;
    this.deadline = 'auto';
    this.userAddress = undefined;
    this.paymasterAddress = undefined;
    this.nonce = undefined;
    return this;
  }
}
