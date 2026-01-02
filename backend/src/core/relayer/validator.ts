import { getPaymasterContract, getRelayerHubContract, getPaymasterFactoryContract, callContractMethod } from '../blockchain/contracts.js';
import { requireValidSignature, isValidSignatureFormat } from '../signature/verifier.js';
import { getRelayerAddress } from '../blockchain/wallet.js';
import type { SignedMetaTransaction, CanExecuteResult } from '../../types/contracts.js';
import {
  ValidationError,
  TransactionExpiredError,
  InvalidSignatureError,
  InvalidNonceError,
  ContractNotWhitelistedError,
  FunctionNotWhitelistedError,
  InsufficientBalanceError,
  PaymasterPausedError,
  PaymasterNotFoundError,
  RelayerNotApprovedError,
  errorFromContractCode,
  ContractErrorCode,
} from '../../utils/errors.js';
import { logger } from '../../monitoring/logger.js';

/**
 * Pre-flight validation for a meta-transaction.
 * Performs all checks before submitting to the blockchain.
 */
export async function validateMetaTransaction(
  paymasterAddress: string,
  signedMetaTx: SignedMetaTransaction
): Promise<CanExecuteResult> {
  const log = logger.child({ paymasterAddress, user: signedMetaTx.user });

  // 1. Validate signature format
  if (!isValidSignatureFormat(signedMetaTx.signature)) {
    throw new InvalidSignatureError('Invalid signature format');
  }

  // 2. Check deadline hasn't expired
  const currentTime = Math.floor(Date.now() / 1000);
  if (Number(signedMetaTx.deadline) <= currentTime) {
    throw new TransactionExpiredError(Number(signedMetaTx.deadline), currentTime);
  }

  // 3. Verify relayer is approved
  const isRelayerApproved = await checkRelayerApproved();
  if (!isRelayerApproved) {
    throw new RelayerNotApprovedError(getRelayerAddress());
  }

  // 4. Check Paymaster exists (is registered in factory)
  const isValidPaymaster = await checkPaymasterExists(paymasterAddress);
  if (!isValidPaymaster) {
    throw new PaymasterNotFoundError(paymasterAddress);
  }

  // 5. Verify EIP-712 signature
  await requireValidSignature(paymasterAddress, signedMetaTx);

  // 6. Call canExecuteMetaTransaction on the Paymaster contract
  const paymaster = getPaymasterContract(paymasterAddress);
  
  try {
    const result = await callContractMethod<[boolean, number, string]>(
      paymaster,
      'canExecuteMetaTransaction',
      signedMetaTx.user,
      signedMetaTx.target,
      signedMetaTx.data,
      signedMetaTx.gasLimit,
      signedMetaTx.nonce,
      signedMetaTx.deadline
    );

    const [canExecute, errorCode, reason] = result;

    log.debug({ canExecute, errorCode, reason }, 'canExecuteMetaTransaction result');

    if (!canExecute) {
      // Map error code to specific error
      throw errorFromContractCode(Number(errorCode), reason, {
        paymasterAddress,
        target: signedMetaTx.target,
        selector: signedMetaTx.data.slice(0, 10),
      });
    }

    return {
      canExecute: true,
      errorCode: ContractErrorCode.SUCCESS,
      reason: 'Transaction can be executed',
    };
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof ValidationError || 
        error instanceof TransactionExpiredError ||
        error instanceof InvalidSignatureError ||
        error instanceof InvalidNonceError ||
        error instanceof ContractNotWhitelistedError ||
        error instanceof FunctionNotWhitelistedError ||
        error instanceof InsufficientBalanceError ||
        error instanceof PaymasterPausedError) {
      throw error;
    }

    // Log and wrap unexpected errors
    log.error({ error: String(error) }, 'Unexpected validation error');
    throw new ValidationError(`Validation failed: ${String(error)}`);
  }
}

/**
 * Check if relayer wallet is approved in RelayerHub.
 */
export async function checkRelayerApproved(): Promise<boolean> {
  try {
    const relayerHub = getRelayerHubContract();
    const relayerAddress = getRelayerAddress();
    return await callContractMethod<boolean>(relayerHub, 'isApprovedRelayer', relayerAddress);
  } catch (error) {
    logger.error({ error: String(error) }, 'Failed to check relayer approval');
    return false;
  }
}

/**
 * Check if Paymaster address is registered in the factory.
 */
export async function checkPaymasterExists(paymasterAddress: string): Promise<boolean> {
  try {
    const factory = getPaymasterFactoryContract();
    return await callContractMethod<boolean>(factory, 'isPaymaster', paymasterAddress);
  } catch (error) {
    logger.error({ error: String(error), paymasterAddress }, 'Failed to check Paymaster exists');
    return false;
  }
}

/**
 * Get the user's current nonce from a Paymaster.
 */
export async function getUserNonce(paymasterAddress: string, userAddress: string): Promise<bigint> {
  const paymaster = getPaymasterContract(paymasterAddress);
  return await callContractMethod<bigint>(paymaster, 'nonces', userAddress);
}

/**
 * Validate nonce matches expected value.
 */
export async function validateNonce(
  paymasterAddress: string,
  userAddress: string,
  providedNonce: bigint
): Promise<void> {
  const expectedNonce = await getUserNonce(paymasterAddress, userAddress);
  
  if (providedNonce !== expectedNonce) {
    throw new InvalidNonceError(expectedNonce, providedNonce);
  }
}

/**
 * Extract function selector from calldata.
 */
export function extractFunctionSelector(data: string): string {
  if (data.length < 10) {
    throw new ValidationError('Calldata too short to extract function selector');
  }
  return data.slice(0, 10).toLowerCase();
}
