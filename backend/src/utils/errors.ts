/**
 * Base class for all relayer service errors.
 * Provides structured error information for logging and API responses.
 */
export class RelayerError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation errors (400 Bad Request).
 */
export class ValidationError extends RelayerError {
  public readonly details: Record<string, string>[];

  constructor(message: string, details: Record<string, string>[] = []) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
}

/**
 * Invalid signature error.
 */
export class InvalidSignatureError extends RelayerError {
  constructor(message: string = 'Invalid signature') {
    super(message, 'INVALID_SIGNATURE', 400);
  }
}

/**
 * Transaction expired error.
 */
export class TransactionExpiredError extends RelayerError {
  constructor(deadline: number, currentTime: number) {
    super(
      `Transaction expired: deadline ${deadline}, current time ${currentTime}`,
      'TRANSACTION_EXPIRED',
      400
    );
  }
}

/**
 * Invalid nonce error.
 */
export class InvalidNonceError extends RelayerError {
  constructor(expected: bigint, provided: bigint) {
    super(
      `Invalid nonce: expected ${expected}, provided ${provided}`,
      'INVALID_NONCE',
      400
    );
  }
}

/**
 * Contract not whitelisted error.
 */
export class ContractNotWhitelistedError extends RelayerError {
  constructor(address: string) {
    super(`Contract not whitelisted: ${address}`, 'CONTRACT_NOT_WHITELISTED', 400);
  }
}

/**
 * Function not whitelisted error.
 */
export class FunctionNotWhitelistedError extends RelayerError {
  constructor(address: string, selector: string) {
    super(
      `Function not whitelisted: ${selector} on ${address}`,
      'FUNCTION_NOT_WHITELISTED',
      400
    );
  }
}

/**
 * Paymaster has insufficient balance.
 */
export class InsufficientBalanceError extends RelayerError {
  constructor(required: bigint, available: bigint) {
    super(
      `Insufficient Paymaster balance: required ${required}, available ${available}`,
      'INSUFFICIENT_BALANCE',
      400
    );
  }
}

/**
 * Spending limit exceeded error.
 */
export class SpendingLimitExceededError extends RelayerError {
  constructor(limitType: 'perTransaction' | 'daily' | 'monthly' | 'global') {
    super(`Exceeded ${limitType} spending limit`, `EXCEEDED_${limitType.toUpperCase()}_LIMIT`, 400);
  }
}

/**
 * Paymaster is paused.
 */
export class PaymasterPausedError extends RelayerError {
  constructor(address: string) {
    super(`Paymaster is paused: ${address}`, 'PAYMASTER_PAUSED', 400);
  }
}

/**
 * Paymaster not found.
 */
export class PaymasterNotFoundError extends RelayerError {
  constructor(address: string) {
    super(`Paymaster not found: ${address}`, 'PAYMASTER_NOT_FOUND', 404);
  }
}

/**
 * Rate limit exceeded error.
 */
export class RateLimitExceededError extends RelayerError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Blockchain RPC error.
 */
export class BlockchainError extends RelayerError {
  public readonly originalError: unknown;

  constructor(message: string, originalError: unknown) {
    super(message, 'BLOCKCHAIN_ERROR', 502);
    this.originalError = originalError;
  }
}

/**
 * Transaction execution failed on-chain.
 */
export class TransactionFailedError extends RelayerError {
  public readonly txHash: string | undefined;
  public readonly reason: string | undefined;

  constructor(message: string, txHash?: string, reason?: string) {
    super(message, 'TRANSACTION_FAILED', 500);
    this.txHash = txHash;
    this.reason = reason;
  }
}

/**
 * Relayer is not approved in RelayerHub.
 */
export class RelayerNotApprovedError extends RelayerError {
  constructor(relayerAddress: string) {
    super(
      `Relayer not approved in RelayerHub: ${relayerAddress}`,
      'RELAYER_NOT_APPROVED',
      500,
      false // Not operational - configuration issue
    );
  }
}

/**
 * Error codes matching smart contract ErrorCodes.sol.
 */
export enum ContractErrorCode {
  SUCCESS = 0,
  INSUFFICIENT_BALANCE = 1,
  CONTRACT_NOT_WHITELISTED = 2,
  FUNCTION_NOT_WHITELISTED = 3,
  INVALID_SIGNATURE = 4,
  INVALID_NONCE = 5,
  TRANSACTION_EXPIRED = 6,
  EXCEEDED_PER_TX_LIMIT = 7,
  EXCEEDED_DAILY_LIMIT = 8,
  EXCEEDED_MONTHLY_LIMIT = 9,
  EXCEEDED_GLOBAL_LIMIT = 10,
  PAUSED = 11,
}

/**
 * Map contract error code to RelayerError.
 */
export function errorFromContractCode(
  code: number,
  reason: string,
  context: { paymasterAddress?: string; target?: string; selector?: string } = {}
): RelayerError {
  switch (code) {
    case ContractErrorCode.INSUFFICIENT_BALANCE:
      return new InsufficientBalanceError(0n, 0n);
    case ContractErrorCode.CONTRACT_NOT_WHITELISTED:
      return new ContractNotWhitelistedError(context.target ?? 'unknown');
    case ContractErrorCode.FUNCTION_NOT_WHITELISTED:
      return new FunctionNotWhitelistedError(context.target ?? 'unknown', context.selector ?? 'unknown');
    case ContractErrorCode.INVALID_SIGNATURE:
      return new InvalidSignatureError(reason);
    case ContractErrorCode.INVALID_NONCE:
      return new InvalidNonceError(0n, 0n);
    case ContractErrorCode.TRANSACTION_EXPIRED:
      return new TransactionExpiredError(0, 0);
    case ContractErrorCode.EXCEEDED_PER_TX_LIMIT:
      return new SpendingLimitExceededError('perTransaction');
    case ContractErrorCode.EXCEEDED_DAILY_LIMIT:
      return new SpendingLimitExceededError('daily');
    case ContractErrorCode.EXCEEDED_MONTHLY_LIMIT:
      return new SpendingLimitExceededError('monthly');
    case ContractErrorCode.EXCEEDED_GLOBAL_LIMIT:
      return new SpendingLimitExceededError('global');
    case ContractErrorCode.PAUSED:
      return new PaymasterPausedError(context.paymasterAddress ?? 'unknown');
    default:
      return new RelayerError(reason || 'Unknown error', 'UNKNOWN_ERROR', 500);
  }
}
