/**
 * SDK Error Classes
 * Typed, structured errors for SDK operations with error codes and context.
 */

/**
 * Base error class for all SDK errors.
 */
export class RelayerSDKError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'RelayerSDKError';
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Validation errors for invalid inputs.
 */
export class ValidationError extends RelayerSDKError {
  readonly details: Array<{ field: string; message: string }> | undefined;

  constructor(
    message: string,
    details?: Array<{ field: string; message: string }> | undefined
  ) {
    super(message, 'VALIDATION_ERROR', { details });
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Signing errors for EIP-712 signature failures.
 */
export class SigningError extends RelayerSDKError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SIGNING_ERROR', context);
    this.name = 'SigningError';
  }
}

/**
 * Network errors for HTTP and RPC failures.
 */
export class NetworkError extends RelayerSDKError {
  readonly statusCode: number | undefined;
  readonly retryable: boolean;

  constructor(
    message: string,
    statusCode?: number | undefined,
    retryable = false,
    context?: Record<string, unknown> | undefined
  ) {
    super(message, 'NETWORK_ERROR', { ...context, statusCode, retryable });
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Relay errors returned by the relayer service.
 */
export class RelayError extends RelayerSDKError {
  readonly errorCode: number;
  readonly reason: string;

  constructor(errorCode: number, reason: string) {
    super(`Relay failed: ${reason}`, 'RELAY_ERROR', { errorCode, reason });
    this.name = 'RelayError';
    this.errorCode = errorCode;
    this.reason = reason;
  }
}

/**
 * Transaction expired before submission.
 */
export class TransactionExpiredError extends RelayerSDKError {
  readonly deadline: bigint;
  readonly currentTime: bigint;

  constructor(deadline: bigint, currentTime: bigint) {
    super(
      `Transaction expired: deadline ${deadline} < current time ${currentTime}`,
      'TRANSACTION_EXPIRED',
      {
        deadline: deadline.toString(),
        currentTime: currentTime.toString(),
      }
    );
    this.name = 'TransactionExpiredError';
    this.deadline = deadline;
    this.currentTime = currentTime;
  }
}

/**
 * Paymaster has insufficient balance.
 */
export class InsufficientBalanceError extends RelayerSDKError {
  readonly paymasterAddress: string;
  readonly balance: bigint;
  readonly required: bigint;

  constructor(paymasterAddress: string, balance: bigint, required: bigint) {
    super(
      `Insufficient paymaster balance: has ${balance}, needs ${required}`,
      'INSUFFICIENT_BALANCE',
      {
        paymasterAddress,
        balance: balance.toString(),
        required: required.toString(),
      }
    );
    this.name = 'InsufficientBalanceError';
    this.paymasterAddress = paymasterAddress;
    this.balance = balance;
    this.required = required;
  }
}

/**
 * Invalid nonce error.
 */
export class InvalidNonceError extends RelayerSDKError {
  readonly expected: bigint;
  readonly provided: bigint;

  constructor(expected: bigint, provided: bigint) {
    super(
      `Invalid nonce: expected ${expected}, got ${provided}`,
      'INVALID_NONCE',
      {
        expected: expected.toString(),
        provided: provided.toString(),
      }
    );
    this.name = 'InvalidNonceError';
    this.expected = expected;
    this.provided = provided;
  }
}

/**
 * Contract or function not whitelisted.
 */
export class NotWhitelistedError extends RelayerSDKError {
  readonly target: string;
  readonly selector: string | undefined;

  constructor(target: string, selector?: string | undefined) {
    const msg = selector
      ? `Function ${selector} on contract ${target} is not whitelisted`
      : `Contract ${target} is not whitelisted`;
    super(msg, 'NOT_WHITELISTED', { target, selector });
    this.name = 'NotWhitelistedError';
    this.target = target;
    this.selector = selector;
  }
}

/**
 * Configuration error.
 */
export class ConfigurationError extends RelayerSDKError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}
