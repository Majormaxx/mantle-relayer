// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library ErrorCodes {
    /// @notice Error code for successful operation
    uint8 internal constant SUCCESS = 0;
    
    /// @notice Error code for insufficient Paymaster balance
    uint8 internal constant INSUFFICIENT_BALANCE = 1;
    
    /// @notice Error code for contract not whitelisted
    uint8 internal constant CONTRACT_NOT_WHITELISTED = 2;
    
    /// @notice Error code for function not whitelisted
    uint8 internal constant FUNCTION_NOT_WHITELISTED = 3;
    
    /// @notice Error code for invalid signature
    uint8 internal constant INVALID_SIGNATURE = 4;
    
    /// @notice Error code for invalid nonce
    uint8 internal constant INVALID_NONCE = 5;
    
    /// @notice Error code for expired transaction
    uint8 internal constant TRANSACTION_EXPIRED = 6;
    
    /// @notice Error code for exceeded per-transaction limit
    uint8 internal constant EXCEEDED_PER_TX_LIMIT = 7;
    
    /// @notice Error code for exceeded daily limit
    uint8 internal constant EXCEEDED_DAILY_LIMIT = 8;
    
    /// @notice Error code for exceeded monthly limit
    uint8 internal constant EXCEEDED_MONTHLY_LIMIT = 9;
    
    /// @notice Error code for exceeded global limit
    uint8 internal constant EXCEEDED_GLOBAL_LIMIT = 10;
    
    /// @notice Error code for paused contract
    uint8 internal constant PAUSED = 11;
    
    /// @notice Error code for gas limit too high
    uint8 internal constant GAS_LIMIT_TOO_HIGH = 12;
}
