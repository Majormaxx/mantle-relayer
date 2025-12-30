// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaymaster {
    // ============ Structs ============

    struct MetaTransaction {
        address user;
        address target;
        bytes data;
        uint256 gasLimit;
        uint256 nonce;
        uint256 deadline;
    }

    struct SpendingLimit {
        uint256 perTransactionLimit;
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 globalLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 globalSpent;
        uint256 lastResetDay;
        uint256 lastResetMonth;
    }

    // ============ Events ============

    event Deposited(address indexed owner, uint256 amount, uint256 newBalance);

    event Withdrawn(address indexed owner, uint256 amount, uint256 newBalance);

    event MetaTransactionExecuted(
        address indexed user,
        address indexed target,
        bytes4 indexed functionSelector,
        uint256 gasUsed,
        bool success
    );

    event ContractWhitelisted(address indexed contractAddress);

    event ContractRemovedFromWhitelist(address indexed contractAddress);

    event FunctionWhitelisted(address indexed contractAddress, bytes4 indexed selector);

    event FunctionRemovedFromWhitelist(address indexed contractAddress, bytes4 indexed selector);

    event SpendingLimitUpdated(string limitType, uint256 newLimit);

    event LowBalanceAlert(uint256 currentBalance, uint256 threshold);

    event Paused(address indexed owner);

    event Unpaused(address indexed owner);

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    event PreFlightCheckPerformed(
        address indexed user,
        address indexed target,
        bool canExecute,
        uint8 errorCode
    );

    event BatchWhitelistUpdated(
        address indexed contractAddress,
        uint256 functionsAdded,
        uint256 functionsRemoved
    );

    // ============ Core Functions ============

    function executeMetaTransaction(
        address user,
        address target,
        bytes calldata data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external returns (bool success, bytes memory returnData);

    function canExecuteMetaTransaction(
        address user,
        address target,
        bytes calldata data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline
    ) external view returns (bool canExecute, uint8 errorCode, string memory reason);

    function estimateTransactionCost(
        address target,
        bytes calldata data,
        uint256 gasLimit
    ) external view returns (uint256 estimatedGas, uint256 estimatedCostWei);

    // ============ Admin Functions ============

    function deposit() external payable;

    function withdraw(uint256 amount) external;

    function withdrawAll() external;

    function addWhitelistedContract(address contractAddress) external;

    function removeWhitelistedContract(address contractAddress) external;

    function addWhitelistedFunction(address contractAddress, bytes4 selector) external;

    function removeWhitelistedFunction(address contractAddress, bytes4 selector) external;

    function batchAddWhitelistedFunctions(
        address contractAddress,
        bytes4[] calldata selectors
    ) external;

    function batchRemoveWhitelistedFunctions(
        address contractAddress,
        bytes4[] calldata selectors
    ) external;

    function batchAddWhitelistedContractsWithFunctions(
        address[] calldata contracts,
        bytes4[][] calldata functionSelectors
    ) external;

    function setPerTransactionLimit(uint256 limit) external;

    function setDailyLimit(uint256 limit) external;

    function setMonthlyLimit(uint256 limit) external;

    function setGlobalLimit(uint256 limit) external;

    function setLowBalanceThreshold(uint256 threshold) external;

    function resetLowBalanceAlert() external;

    function pause() external;

    function unpause() external;

    function transferOwnership(address newOwner) external;

    function acceptOwnership() external;

    // ============ View Functions ============

    function isContractWhitelisted(address contractAddress) external view returns (bool);

    function isFunctionWhitelisted(address contractAddress, bytes4 selector)
        external
        view
        returns (bool);

    function getWhitelistedContracts() external view returns (address[] memory);

    function getRemainingDailyLimit() external view returns (uint256);

    function getRemainingMonthlyLimit() external view returns (uint256);

    function getRemainingGlobalLimit() external view returns (uint256);

    function getSpendingLimitStatus() external view returns (SpendingLimit memory);

    function getAnalytics()
        external
        view
        returns (uint256 totalTransactions, uint256 totalGasSpent, uint256 uniqueUsers);

    function getBalance() external view returns (uint256);

    function isLowBalance() external view returns (bool);

    function nonces(address user) external view returns (uint256);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function owner() external view returns (address);

    function relayerHub() external view returns (address);

    function paused() external view returns (bool);
}
