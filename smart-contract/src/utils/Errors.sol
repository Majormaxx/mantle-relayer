// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


/// @notice Thrown when caller is not authorized for the operation
error Unauthorized();

/// @notice Thrown when contract has insufficient balance for operation
error InsufficientBalance();

/// @notice Thrown when target contract is not whitelisted
/// @param contractAddress The address of the non-whitelisted contract
error ContractNotWhitelisted(address contractAddress);

/// @notice Thrown when function selector is not whitelisted for the contract
/// @param contractAddress The contract address
/// @param selector The function selector that is not whitelisted
error FunctionNotWhitelisted(address contractAddress, bytes4 selector);

/// @notice Thrown when signature validation fails
error InvalidSignature();

/// @notice Thrown when nonce doesn't match expected value
/// @param expected The expected nonce value
/// @param provided The nonce value that was provided
error InvalidNonce(uint256 expected, uint256 provided);

/// @notice Thrown when transaction execution fails
error TransactionFailed();

/// @notice Thrown when per-transaction gas limit is exceeded
/// @param gasUsed The amount of gas used
/// @param limit The per-transaction limit
error ExceededPerTransactionLimit(uint256 gasUsed, uint256 limit);

/// @notice Thrown when daily spending limit is exceeded
/// @param dailySpent The amount spent today
/// @param limit The daily limit
error ExceededDailyLimit(uint256 dailySpent, uint256 limit);

/// @notice Thrown when monthly spending limit is exceeded
/// @param monthlySpent The amount spent this month
/// @param limit The monthly limit
error ExceededMonthlyLimit(uint256 monthlySpent, uint256 limit);

/// @notice Thrown when global (lifetime) spending limit is exceeded
/// @param globalSpent The total amount spent
/// @param limit The global limit
error ExceededGlobalLimit(uint256 globalSpent, uint256 limit);

/// @notice Thrown when contract is paused
error ContractPaused();

/// @notice Thrown when address parameter is zero address
error ZeroAddress();

/// @notice Thrown when amount parameter is invalid (e.g., zero when non-zero required)
error InvalidAmount();

/// @notice Thrown when transaction deadline has passed
/// @param deadline The transaction deadline timestamp
/// @param currentTime The current block timestamp
error TransactionExpired(uint256 deadline, uint256 currentTime);

/// @notice Thrown when requested gas limit exceeds maximum allowed
/// @param requested The requested gas limit
/// @param maximum The maximum allowed gas limit
error GasLimitTooHigh(uint256 requested, uint256 maximum);
