// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IPaymaster} from "../interfaces/IPaymaster.sol";
import {IRelayerHub} from "../interfaces/IRelayerHub.sol";
import {MetaTxLib} from "../libraries/MetaTxLib.sol";
import {SpendingLimitLib} from "../libraries/SpendingLimitLib.sol";
import {ErrorCodes} from "../libraries/ErrorCodes.sol";
import "../utils/Errors.sol";

contract Paymaster is 
    Initializable, 
    EIP712Upgradeable, 
    ReentrancyGuardUpgradeable
{
    // STATE VARIABLES

    address private _owner;

    address private _pendingOwner;

    address private _relayerHub;

    mapping(address => bool) private _whitelistedContracts;

    address[] private _whitelistedContractsList;

    mapping(address => mapping(bytes4 => bool)) private _whitelistedFunctions;

    mapping(address => uint256) private _nonces;

    SpendingLimit private _spendingLimit;

    struct Analytics {
        uint256 totalTransactions;
        uint256 totalGasSpent;
        mapping(address => bool) hasTransacted;
        uint256 uniqueUsers;
    }

    Analytics private _analytics;

    uint256 private _lowBalanceThreshold;

    bool private _lowBalanceAlertTriggered;

    bool private _paused;

    bool private _executionLocked;

    // STRUCTS (from IPaymaster interface)

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

    // EVENTS

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

    // ERRORS

    /// @notice Thrown when funds are locked during execution
    error FundsLocked();

    /// @notice Thrown when contract is already whitelisted
    error ContractAlreadyWhitelisted(address contractAddress);

    /// @notice Thrown when trying to remove a non-whitelisted contract
    error ContractNotInWhitelist(address contractAddress);

    /// @notice Thrown when function is already whitelisted
    error FunctionAlreadyWhitelisted(address contractAddress, bytes4 selector);

    /// @notice Thrown when trying to remove a non-whitelisted function
    error FunctionNotInWhitelist(address contractAddress, bytes4 selector);

    /// @notice Thrown when arrays have mismatched lengths
    error ArrayLengthMismatch();

    /// @notice Thrown when data is too short to extract function selector
    error InvalidData();

    // MODIFIERS

    modifier onlyOwner() {
        if (msg.sender != _owner) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (_paused) revert ContractPaused();
        _;
    }

    modifier onlyRelayer() {
        if (!IRelayerHub(_relayerHub).isApprovedRelayer(msg.sender)) {
            revert Unauthorized();
        }
        _;
    }

    modifier lockExecution() {
        _executionLocked = true;
        _;
        _executionLocked = false;
    }

    // INITIALIZATION

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner_,
        address relayerHub_,
        string memory name_
    ) external initializer {
        if (owner_ == address(0)) revert ZeroAddress();
        if (relayerHub_ == address(0)) revert ZeroAddress();

        // Initialize parent contracts
        __EIP712_init(name_, "1");
        __ReentrancyGuard_init();

        // Set state
        _owner = owner_;
        _relayerHub = relayerHub_;

        // Set default spending limits (unlimited initially)
        _spendingLimit.perTransactionLimit = 0; // 0 = unlimited
        _spendingLimit.dailyLimit = 0; // 0 = unlimited
        _spendingLimit.monthlyLimit = 0; // 0 = unlimited
        _spendingLimit.globalLimit = 0; // 0 = unlimited

        // Initialize reset timestamps
        _spendingLimit.lastResetDay = SpendingLimitLib.getCurrentDay();
        _spendingLimit.lastResetMonth = SpendingLimitLib.getCurrentMonth();

        // Set default low balance threshold (0.01 ETH)
        _lowBalanceThreshold = 0.01 ether;

        // Contract starts unpaused
        _paused = false;
    }

    // FUND MANAGEMENT

    function deposit() external payable onlyOwner {
        if (msg.value == 0) revert InsufficientBalance();

        uint256 newBalance = address(this).balance;
        emit Deposited(msg.sender, msg.value, newBalance);

        // Reset low balance alert if balance is now above threshold
        if (_lowBalanceAlertTriggered && newBalance >= _lowBalanceThreshold) {
            _lowBalanceAlertTriggered = false;
        }
    }

    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        if (_executionLocked) revert FundsLocked();
        if (address(this).balance < amount) revert InsufficientBalance();
        
        // Transfer funds to owner
        (bool success, ) = payable(_owner).call{value: amount}("");
        if (!success) revert TransactionFailed();

        uint256 newBalance = address(this).balance;
        emit Withdrawn(msg.sender, amount, newBalance);

        // Check low balance alert
        _checkLowBalance();
    }

    function withdrawAll() external onlyOwner nonReentrant {
        if (_executionLocked) revert FundsLocked();

        uint256 amount = address(this).balance;
        if (amount == 0) revert InsufficientBalance();

        // Transfer all funds to owner
        (bool success, ) = payable(_owner).call{value: amount}("");
        if (!success) revert TransactionFailed();

        emit Withdrawn(msg.sender, amount, 0);
    }

    // WHITELIST MANAGEMENT

    function addWhitelistedContract(address contractAddress) external onlyOwner {
        if (contractAddress == address(0)) revert ZeroAddress();
        if (_whitelistedContracts[contractAddress]) {
            revert ContractAlreadyWhitelisted(contractAddress);
        }

        _whitelistedContracts[contractAddress] = true;
        _whitelistedContractsList.push(contractAddress);

        emit ContractWhitelisted(contractAddress);
    }

    function removeWhitelistedContract(address contractAddress) external onlyOwner {
        if (!_whitelistedContracts[contractAddress]) {
            revert ContractNotInWhitelist(contractAddress);
        }

        _whitelistedContracts[contractAddress] = false;

        // Remove from array (swap with last, then pop)
        uint256 length = _whitelistedContractsList.length;
        for (uint256 i = 0; i < length; i++) {
            if (_whitelistedContractsList[i] == contractAddress) {
                _whitelistedContractsList[i] = _whitelistedContractsList[length - 1];
                _whitelistedContractsList.pop();
                break;
            }
        }

        emit ContractRemovedFromWhitelist(contractAddress);
    }

    function addWhitelistedFunction(
        address contractAddress,
        bytes4 selector
    ) external onlyOwner {
        if (_whitelistedFunctions[contractAddress][selector]) {
            revert FunctionAlreadyWhitelisted(contractAddress, selector);
        }

        _whitelistedFunctions[contractAddress][selector] = true;
        emit FunctionWhitelisted(contractAddress, selector);
    }

    function removeWhitelistedFunction(
        address contractAddress,
        bytes4 selector
    ) external onlyOwner {
        if (!_whitelistedFunctions[contractAddress][selector]) {
            revert FunctionNotInWhitelist(contractAddress, selector);
        }

        _whitelistedFunctions[contractAddress][selector] = false;
        emit FunctionRemovedFromWhitelist(contractAddress, selector);
    }

    function batchAddWhitelistedFunctions(
        address contractAddress,
        bytes4[] calldata selectors
    ) external onlyOwner {
        uint256 length = selectors.length;
        for (uint256 i = 0; i < length; i++) {
            if (!_whitelistedFunctions[contractAddress][selectors[i]]) {
                _whitelistedFunctions[contractAddress][selectors[i]] = true;
                emit FunctionWhitelisted(contractAddress, selectors[i]);
            }
        }
    }

    function batchRemoveWhitelistedFunctions(
        address contractAddress,
        bytes4[] calldata selectors
    ) external onlyOwner {
        uint256 length = selectors.length;
        for (uint256 i = 0; i < length; i++) {
            if (_whitelistedFunctions[contractAddress][selectors[i]]) {
                _whitelistedFunctions[contractAddress][selectors[i]] = false;
                emit FunctionRemovedFromWhitelist(contractAddress, selectors[i]);
            }
        }
    }

    function batchAddWhitelistedContractsWithFunctions(
        address[] calldata contracts,
        bytes4[][] calldata functionSelectors
    ) external onlyOwner {
        if (contracts.length != functionSelectors.length) {
            revert ArrayLengthMismatch();
        }

        uint256 contractsLength = contracts.length;
        for (uint256 i = 0; i < contractsLength; i++) {
            address contractAddress = contracts[i];
            
            // Add contract if not already whitelisted
            if (!_whitelistedContracts[contractAddress]) {
                _whitelistedContracts[contractAddress] = true;
                _whitelistedContractsList.push(contractAddress);
                emit ContractWhitelisted(contractAddress);
            }

            // Add functions
            uint256 functionsLength = functionSelectors[i].length;
            uint256 functionsAdded = 0;
            
            for (uint256 j = 0; j < functionsLength; j++) {
                bytes4 selector = functionSelectors[i][j];
                if (!_whitelistedFunctions[contractAddress][selector]) {
                    _whitelistedFunctions[contractAddress][selector] = true;
                    emit FunctionWhitelisted(contractAddress, selector);
                    functionsAdded++;
                }
            }

            emit BatchWhitelistUpdated(contractAddress, functionsAdded, 0);
        }
    }

    // SPENDING LIMIT MANAGEMENT

    function setPerTransactionLimit(uint256 limit) external onlyOwner {
        _spendingLimit.perTransactionLimit = limit;
        emit SpendingLimitUpdated("perTransaction", limit);
    }

    function setDailyLimit(uint256 limit) external onlyOwner {
        _spendingLimit.dailyLimit = limit;
        emit SpendingLimitUpdated("daily", limit);
    }

    function setMonthlyLimit(uint256 limit) external onlyOwner {
        _spendingLimit.monthlyLimit = limit;
        emit SpendingLimitUpdated("monthly", limit);
    }

    function setGlobalLimit(uint256 limit) external onlyOwner {
        _spendingLimit.globalLimit = limit;
        emit SpendingLimitUpdated("global", limit);
    }

    // EMERGENCY CONTROLS

    function setLowBalanceThreshold(uint256 threshold) external onlyOwner {
        _lowBalanceThreshold = threshold;
    }

    function resetLowBalanceAlert() external onlyOwner {
        _lowBalanceAlertTriggered = false;
    }

    function pause() external onlyOwner {
        _paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    // OWNERSHIP MANAGEMENT (Two-Step)

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(_owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != _pendingOwner) revert Unauthorized();

        address previousOwner = _owner;
        _owner = _pendingOwner;
        _pendingOwner = address(0);

        emit OwnershipTransferred(previousOwner, _owner);
    }

    // VIEW FUNCTIONS

    function isContractWhitelisted(address contractAddress) external view returns (bool) {
        return _whitelistedContracts[contractAddress];
    }

    function isFunctionWhitelisted(
        address contractAddress,
        bytes4 selector
    ) external view returns (bool) {
        return _whitelistedFunctions[contractAddress][selector];
    }

    function getWhitelistedContracts() external view returns (address[] memory) {
        return _whitelistedContractsList;
    }

    function getRemainingDailyLimit() external view returns (uint256) {
        // Check if daily reset needed
        if (SpendingLimitLib.shouldResetDaily(_spendingLimit.lastResetDay)) {
            return _spendingLimit.dailyLimit;
        }
        return SpendingLimitLib.getRemainingLimit(
            _spendingLimit.dailySpent,
            _spendingLimit.dailyLimit
        );
    }

    function getRemainingMonthlyLimit() external view returns (uint256) {
        // Check if monthly reset needed
        if (SpendingLimitLib.shouldResetMonthly(_spendingLimit.lastResetMonth)) {
            return _spendingLimit.monthlyLimit;
        }
        return SpendingLimitLib.getRemainingLimit(
            _spendingLimit.monthlySpent,
            _spendingLimit.monthlyLimit
        );
    }

    function getRemainingGlobalLimit() external view returns (uint256) {
        return SpendingLimitLib.getRemainingLimit(
            _spendingLimit.globalSpent,
            _spendingLimit.globalLimit
        );
    }

    function getSpendingLimitStatus() external view returns (SpendingLimit memory) {
        return _spendingLimit;
    }

    function getAnalytics()
        external
        view
        returns (uint256 totalTransactions, uint256 totalGasSpent, uint256 uniqueUsers)
    {
        return (
            _analytics.totalTransactions,
            _analytics.totalGasSpent,
            _analytics.uniqueUsers
        );
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function isLowBalance() external view returns (bool) {
        return address(this).balance < _lowBalanceThreshold;
    }

    function nonces(address user) external view returns (uint256) {
        return _nonces[user];
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function pendingOwner() external view returns (address) {
        return _pendingOwner;
    }

    function relayerHub() external view returns (address) {
        return _relayerHub;
    }

    function paused() external view returns (bool) {
        return _paused;
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // INTERNAL HELPER FUNCTIONS

    function _checkLowBalance() internal {
        if (!_lowBalanceAlertTriggered && address(this).balance < _lowBalanceThreshold) {
            _lowBalanceAlertTriggered = true;
            emit LowBalanceAlert(address(this).balance, _lowBalanceThreshold);
        }
    }

    // META-TRANSACTION EXECUTION

    function executeMetaTransaction(
        address user,
        address target,
        bytes calldata data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external onlyRelayer whenNotPaused nonReentrant lockExecution returns (bool success, bytes memory returnData) {
        // PHASE 1: VALIDATION (CHECKS)

        uint256 startGas = gasleft();

        // 1. Check deadline hasn't expired (FIRST - fail fast)
        if (block.timestamp > deadline) {
            revert TransactionExpired(deadline, block.timestamp);
        }

        // 2. Check contract is whitelisted
        if (!_whitelistedContracts[target]) {
            revert ContractNotWhitelisted(target);
        }

        // 3. Extract and check function selector
        if (data.length < 4) revert InvalidData();
        bytes4 selector = bytes4(data[:4]);
        
        if (!_whitelistedFunctions[target][selector]) {
            revert FunctionNotWhitelisted(target, selector);
        }

        // 4. Verify signature using MetaTxLib
        IPaymaster.MetaTransaction memory metaTx = IPaymaster.MetaTransaction({
            user: user,
            target: target,
            data: data,
            gasLimit: gasLimit,
            nonce: nonce,
            deadline: deadline
        });

        bool signatureValid = MetaTxLib.validateSignature(
            _domainSeparatorV4(),
            metaTx,
            signature,
            user
        );

        if (!signatureValid) revert InvalidSignature();

        // 5. Check nonce matches
        if (nonce != _nonces[user]) {
            revert InvalidNonce(_nonces[user], nonce);
        }

        // 6. Estimate gas cost
        uint256 estimatedCost = gasLimit * tx.gasprice;
        
        // 7. Check sufficient balance
        if (address(this).balance < estimatedCost) {
            revert InsufficientBalance();
        }

        // 8. Check spending limits
        _resetSpendingLimitsIfNeeded();
        _validateSpendingLimits(estimatedCost);

        // PHASE 2: STATE CHANGES (EFFECTS)

        // Increment nonce BEFORE external call (prevents replay)
        _nonces[user]++;

        // PHASE 3: EXTERNAL CALL (INTERACTIONS)

        // Execute call to target with gas limit
        (success, returnData) = target.call{gas: gasLimit}(data);

        // Calculate actual gas used
        uint256 gasUsed = startGas - gasleft() + 50000; // Add overhead buffer
        uint256 actualCost = gasUsed * tx.gasprice;

        // PHASE 4: POST-EXECUTION UPDATES

        // Update spending limits
        _updateSpendingLimits(actualCost);

        // Update analytics
        _updateAnalytics(user, actualCost);

        // Reimburse relayer (CRITICAL - must succeed)
        _reimburseRelayer(actualCost);

        // Check and trigger low balance alert
        _checkLowBalance();

        // Emit event
        emit MetaTransactionExecuted(user, target, selector, gasUsed, success);

        return (success, returnData);
    }

    function canExecuteMetaTransaction(
        address user,
        address target,
        bytes calldata data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline
    ) external view returns (bool canExecute, uint8 errorCode, string memory reason) {
        // Check if paused
        if (_paused) {
            return (false, ErrorCodes.PAUSED, "Contract is paused");
        }

        // Check deadline (CRITICAL - must match executeMetaTransaction)
        if (block.timestamp > deadline) {
            return (false, ErrorCodes.TRANSACTION_EXPIRED, "Transaction deadline expired");
        }

        // Check contract whitelisted
        if (!_whitelistedContracts[target]) {
            return (false, ErrorCodes.CONTRACT_NOT_WHITELISTED, "Target contract not whitelisted");
        }

        // Check function whitelisted
        if (data.length < 4) {
            return (false, ErrorCodes.INVALID_SIGNATURE, "Invalid data length");
        }
        bytes4 selector = bytes4(data[:4]);
        if (!_whitelistedFunctions[target][selector]) {
            return (false, ErrorCodes.FUNCTION_NOT_WHITELISTED, "Function not whitelisted");
        }

        // Check nonce
        if (nonce != _nonces[user]) {
            return (false, ErrorCodes.INVALID_NONCE, "Invalid nonce");
        }

        // Check sufficient balance
        uint256 estimatedCost = gasLimit * tx.gasprice;
        if (address(this).balance < estimatedCost) {
            return (false, ErrorCodes.INSUFFICIENT_BALANCE, "Insufficient Paymaster balance");
        }

        // Check spending limits (simulate resets)
        SpendingLimit memory limits = _spendingLimit;
        
        // Simulate daily reset
        if (SpendingLimitLib.shouldResetDaily(limits.lastResetDay)) {
            limits.dailySpent = 0;
        }
        
        // Simulate monthly reset
        if (SpendingLimitLib.shouldResetMonthly(limits.lastResetMonth)) {
            limits.monthlySpent = 0;
        }

        // Check per-transaction limit
        if (!SpendingLimitLib.canSpend(0, limits.perTransactionLimit, estimatedCost)) {
            return (false, ErrorCodes.EXCEEDED_PER_TX_LIMIT, "Exceeds per-transaction limit");
        }

        // Check daily limit
        if (!SpendingLimitLib.canSpend(limits.dailySpent, limits.dailyLimit, estimatedCost)) {
            return (false, ErrorCodes.EXCEEDED_DAILY_LIMIT, "Exceeds daily limit");
        }

        // Check monthly limit
        if (!SpendingLimitLib.canSpend(limits.monthlySpent, limits.monthlyLimit, estimatedCost)) {
            return (false, ErrorCodes.EXCEEDED_MONTHLY_LIMIT, "Exceeds monthly limit");
        }

        // Check global limit
        if (!SpendingLimitLib.canSpend(limits.globalSpent, limits.globalLimit, estimatedCost)) {
            return (false, ErrorCodes.EXCEEDED_GLOBAL_LIMIT, "Exceeds global limit");
        }

        // All checks passed
        return (true, ErrorCodes.SUCCESS, "Transaction can be executed");
    }

    function estimateTransactionCost(
        address target,
        bytes calldata data,
        uint256 gasLimit
    ) external view returns (uint256 estimatedGas, uint256 estimatedCostWei) {
        // Base gas estimate: provided gasLimit + Paymaster overhead
        // Paymaster overhead includes:
        // - Signature verification: ~15k gas
        // - Whitelist checks: ~5k gas
        // - Spending limit checks: ~10k gas
        // - Analytics updates: ~20k gas
        // - Relayer reimbursement: ~10k gas
        // Total overhead: ~60k gas
        
        uint256 paymasterOverhead = 60000;
        estimatedGas = gasLimit + paymasterOverhead;
        
        // Estimate cost using current gas price
        // In production, might want to use a gas price oracle
        estimatedCostWei = estimatedGas * tx.gasprice;
        
        return (estimatedGas, estimatedCostWei);
    }

    // INTERNAL HELPER FUNCTIONS

    function _resetSpendingLimitsIfNeeded() internal {
        // Check and reset daily limit
        if (SpendingLimitLib.shouldResetDaily(_spendingLimit.lastResetDay)) {
            _spendingLimit.dailySpent = 0;
            _spendingLimit.lastResetDay = SpendingLimitLib.getCurrentDay();
            emit SpendingLimitUpdated("dailySpent", 0);
        }

        // Check and reset monthly limit
        if (SpendingLimitLib.shouldResetMonthly(_spendingLimit.lastResetMonth)) {
            _spendingLimit.monthlySpent = 0;
            _spendingLimit.lastResetMonth = SpendingLimitLib.getCurrentMonth();
            emit SpendingLimitUpdated("monthlySpent", 0);
        }
    }

    function _validateSpendingLimits(uint256 estimatedCost) internal view {
        // Check per-transaction limit
        if (SpendingLimitLib.checkLimit(0, _spendingLimit.perTransactionLimit, estimatedCost)) {
            revert ExceededPerTransactionLimit(estimatedCost, _spendingLimit.perTransactionLimit);
        }

        // Check daily limit
        if (SpendingLimitLib.checkLimit(
            _spendingLimit.dailySpent,
            _spendingLimit.dailyLimit,
            estimatedCost
        )) {
            revert ExceededDailyLimit(_spendingLimit.dailySpent + estimatedCost, _spendingLimit.dailyLimit);
        }

        // Check monthly limit
        if (SpendingLimitLib.checkLimit(
            _spendingLimit.monthlySpent,
            _spendingLimit.monthlyLimit,
            estimatedCost
        )) {
            revert ExceededMonthlyLimit(_spendingLimit.monthlySpent + estimatedCost, _spendingLimit.monthlyLimit);
        }

        // Check global limit
        if (SpendingLimitLib.checkLimit(
            _spendingLimit.globalSpent,
            _spendingLimit.globalLimit,
            estimatedCost
        )) {
            revert ExceededGlobalLimit(_spendingLimit.globalSpent + estimatedCost, _spendingLimit.globalLimit);
        }
    }

    function _updateSpendingLimits(uint256 actualCost) internal {
        _spendingLimit.dailySpent += actualCost;
        _spendingLimit.monthlySpent += actualCost;
        _spendingLimit.globalSpent += actualCost;
    }

    function _updateAnalytics(address user, uint256 gasCost) internal {
        // Increment transaction count
        _analytics.totalTransactions++;

        // Update total gas spent
        _analytics.totalGasSpent += gasCost;

        // Track unique users
        if (!_analytics.hasTransacted[user]) {
            _analytics.hasTransacted[user] = true;
            _analytics.uniqueUsers++;
        }
    }

    function _reimburseRelayer(uint256 cost) internal {
        // Transfer MNT to relayer (msg.sender)
        (bool success, ) = payable(msg.sender).call{value: cost}("");
        
        // If transfer fails, log but don't revert
        // This prevents transaction from reverting if relayer cannot receive
        // In production, might want to track failed reimbursements for retry
        if (!success) {
            // Could emit an event here for monitoring
            // emit RelayerReimbursementFailed(msg.sender, cost);
        }
    }

    // PLACEHOLDER FOR PART 2
    // (Remove this section - it's now implemented above)
}
