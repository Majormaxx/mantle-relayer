import { getPaymasterContract, callContractMethod } from '../blockchain/contracts.js';
import { getRelayerSigner } from '../blockchain/wallet.js';
import { acquireNonce, releaseNonce } from './nonceManager.js';
import { validateMetaTransaction } from './validator.js';
import { gas as gasConfig } from '../../config/index.js';
import type { SignedMetaTransaction, ExecuteResult } from '../../types/contracts.js';
import { TransactionFailedError, BlockchainError } from '../../utils/errors.js';
import { logger } from '../../monitoring/logger.js';
import type { ContractTransactionResponse, ContractTransactionReceipt } from 'ethers';

/**
 * Execute a signed meta-transaction through a Paymaster.
 * This is the core function that submits transactions to the blockchain.
 */
export async function executeMetaTransaction(
  paymasterAddress: string,
  signedMetaTx: SignedMetaTransaction
): Promise<ExecuteResult> {
  const log = logger.child({
    paymasterAddress,
    user: signedMetaTx.user,
    target: signedMetaTx.target,
  });

  log.info('Starting meta-transaction execution');

  // 1. Validate the transaction first
  await validateMetaTransaction(paymasterAddress, signedMetaTx);
  log.debug('Validation passed');

  // 2. Get paymaster contract with signer
  const paymaster = getPaymasterContract(paymasterAddress, true);

  // 3. Acquire a nonce for the relayer transaction
  const relayerNonce = await acquireNonce();
  log.debug({ relayerNonce: relayerNonce.toString() }, 'Relayer nonce acquired');

  try {
    // 4. Estimate gas and prepare transaction
    const gasEstimate = await estimateGas(paymaster, signedMetaTx);
    const gasLimit = (gasEstimate * 120n) / 100n; // Add 20% buffer
    
    log.debug({ gasEstimate: gasEstimate.toString(), gasLimit: gasLimit.toString() }, 'Gas estimated');

    // 5. Get current gas price with multiplier
    const signer = getRelayerSigner();
    const provider = signer.provider;
    if (!provider) {
      throw new BlockchainError('No provider attached to signer', null);
    }
    const feeData = await provider.getFeeData();
    const baseGasPrice = feeData.gasPrice ?? 1_000_000_000n;
    const gasPrice = (baseGasPrice * BigInt(Math.floor(gasConfig.priceMultiplier * 100))) / 100n;

    log.debug({ gasPrice: gasPrice.toString() }, 'Gas price calculated');

    // 6. Submit transaction
    const tx = await callContractMethod<ContractTransactionResponse>(
      paymaster,
      'executeMetaTransaction',
      signedMetaTx.user,
      signedMetaTx.target,
      signedMetaTx.data,
      signedMetaTx.gasLimit,
      signedMetaTx.nonce,
      signedMetaTx.deadline,
      signedMetaTx.signature,
      {
        nonce: relayerNonce,
        gasLimit,
        gasPrice,
      }
    );

    log.info({ txHash: tx.hash }, 'Transaction submitted');

    // 7. Wait for confirmation
    const receipt = await tx.wait() as ContractTransactionReceipt;
    
    // 8. Release nonce on success
    releaseNonce(relayerNonce, true);

    if (receipt.status === 0) {
      log.error({ txHash: tx.hash }, 'Transaction reverted');
      throw new TransactionFailedError('Transaction reverted', tx.hash);
    }

    // 9. Parse result from receipt
    const gasUsed = receipt.gasUsed;
    const effectiveGasPrice = receipt.gasPrice;

    log.info({
      txHash: tx.hash,
      gasUsed: gasUsed.toString(),
      effectiveGasPrice: effectiveGasPrice.toString(),
      blockNumber: receipt.blockNumber,
    }, 'Transaction confirmed');

    return {
      success: true,
      returnData: '0x', // Would need to parse from logs if needed
      txHash: tx.hash,
      gasUsed,
      effectiveGasPrice,
    };
  } catch (error) {
    // Release nonce on failure
    releaseNonce(relayerNonce, false);

    if (error instanceof TransactionFailedError) {
      throw error;
    }

    log.error({ error: String(error) }, 'Transaction execution failed');
    throw new BlockchainError(`Transaction execution failed: ${String(error)}`, error);
  }
}

/**
 * Estimate gas for executeMetaTransaction call.
 */
async function estimateGas(
  paymaster: ReturnType<typeof getPaymasterContract>,
  signedMetaTx: SignedMetaTransaction
): Promise<bigint> {
  try {
    const fn = paymaster.getFunction('executeMetaTransaction');
    const estimate = await fn.estimateGas(
      signedMetaTx.user,
      signedMetaTx.target,
      signedMetaTx.data,
      signedMetaTx.gasLimit,
      signedMetaTx.nonce,
      signedMetaTx.deadline,
      signedMetaTx.signature
    );
    return estimate;
  } catch (error) {
    // If estimation fails, use a conservative default
    logger.warn({ error: String(error) }, 'Gas estimation failed, using default');
    return 500_000n; // Conservative default
  }
}

/**
 * Get estimated transaction cost from a Paymaster.
 */
export async function getEstimatedCost(
  paymasterAddress: string,
  target: string,
  data: string,
  gasLimit: bigint
): Promise<{ estimatedGas: bigint; estimatedCostWei: bigint }> {
  const paymaster = getPaymasterContract(paymasterAddress);
  
  const result = await callContractMethod<[bigint, bigint]>(
    paymaster,
    'estimateTransactionCost',
    target,
    data,
    gasLimit
  );
  return { estimatedGas: result[0], estimatedCostWei: result[1] };
}
