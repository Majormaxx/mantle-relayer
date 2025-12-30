// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockRelayerHub
 * @notice Minimal RelayerHub implementation for testing Paymaster in isolation
 * @dev Simplified version with only essential functions for Paymaster testing
 *
 * TESTING PURPOSE:
 * - Allows unit testing Paymaster without deploying full RelayerHub
 * - Provides basic relayer approval functionality
 * - Configurable gas limits for testing
 *
 * PRODUCTION NOTE:
 * - This is for testing ONLY
 * - Use the full RelayerHub contract in production
 */
contract MockRelayerHub {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Mapping of approved relayer addresses
    mapping(address => bool) private _approvedRelayers;

    /// @notice Array of approved relayers for enumeration
    address[] private _relayerList;

    /// @notice Maximum gas limit per transaction
    uint256 private _maxGasLimit;

    /// @notice Minimum Paymaster balance
    uint256 private _minPaymasterBalance;

    /// @notice Owner address (for admin functions)
    address public owner;

    // ============================================
    // EVENTS
    // ============================================

    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    event MaxGasLimitUpdated(uint256 newLimit);
    event MinBalanceUpdated(uint256 newBalance);

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Initialize the mock RelayerHub
     * @dev Sets default values for testing
     */
    constructor() {
        owner = msg.sender;
        _maxGasLimit = 10_000_000; // 10 million gas default
        _minPaymasterBalance = 0.1 ether; // 0.1 ETH default
    }

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ============================================
    // RELAYER MANAGEMENT
    // ============================================

    /**
     * @notice Add an approved relayer
     * @dev Public function for easy testing (no onlyOwner restriction)
     * @param relayer Address of the relayer to approve
     */
    function addRelayer(address relayer) external {
        require(relayer != address(0), "Zero address");
        require(!_approvedRelayers[relayer], "Already approved");

        _approvedRelayers[relayer] = true;
        _relayerList.push(relayer);

        emit RelayerAdded(relayer);
    }

    /**
     * @notice Remove an approved relayer
     * @dev Public function for easy testing
     * @param relayer Address of the relayer to remove
     */
    function removeRelayer(address relayer) external {
        require(_approvedRelayers[relayer], "Not approved");

        _approvedRelayers[relayer] = false;

        // Remove from array
        uint256 length = _relayerList.length;
        for (uint256 i = 0; i < length; i++) {
            if (_relayerList[i] == relayer) {
                _relayerList[i] = _relayerList[length - 1];
                _relayerList.pop();
                break;
            }
        }

        emit RelayerRemoved(relayer);
    }

    /**
     * @notice Check if an address is an approved relayer
     * @dev CRITICAL FUNCTION - Called by Paymaster before executing transactions
     * @param relayer Address to check
     * @return Whether the address is an approved relayer
     */
    function isApprovedRelayer(address relayer) external view returns (bool) {
        return _approvedRelayers[relayer];
    }

    /**
     * @notice Get all approved relayers
     * @return Array of approved relayer addresses
     */
    function getApprovedRelayers() external view returns (address[] memory) {
        return _relayerList;
    }

    // ============================================
    // CONFIGURATION
    // ============================================

    /**
     * @notice Set maximum gas limit per transaction
     * @dev Used for testing gas limit validation
     * @param maxGas New maximum gas limit
     */
    function setMaxGasLimit(uint256 maxGas) external onlyOwner {
        _maxGasLimit = maxGas;
        emit MaxGasLimitUpdated(maxGas);
    }

    /**
     * @notice Set minimum Paymaster balance requirement
     * @dev Used for testing balance checks
     * @param minBalance New minimum balance in wei
     */
    function setMinPaymasterBalance(uint256 minBalance) external onlyOwner {
        _minPaymasterBalance = minBalance;
        emit MinBalanceUpdated(minBalance);
    }

    /**
     * @notice Get maximum gas limit
     * @return Maximum gas limit per transaction
     */
    function maxGasLimit() external view returns (uint256) {
        return _maxGasLimit;
    }

    /**
     * @notice Get minimum Paymaster balance
     * @return Minimum balance in wei
     */
    function minPaymasterBalance() external view returns (uint256) {
        return _minPaymasterBalance;
    }

    // ============================================
    // TEST HELPER FUNCTIONS
    // ============================================

    /**
     * @notice Approve multiple relayers at once
     * @dev Helper function for test setup
     * @param relayers Array of relayer addresses to approve
     */
    function addRelayers(address[] calldata relayers) external {
        for (uint256 i = 0; i < relayers.length; i++) {
            if (!_approvedRelayers[relayers[i]] && relayers[i] != address(0)) {
                _approvedRelayers[relayers[i]] = true;
                _relayerList.push(relayers[i]);
                emit RelayerAdded(relayers[i]);
            }
        }
    }

    /**
     * @notice Remove all approved relayers
     * @dev Helper function for test cleanup
     */
    function clearAllRelayers() external onlyOwner {
        for (uint256 i = 0; i < _relayerList.length; i++) {
            _approvedRelayers[_relayerList[i]] = false;
            emit RelayerRemoved(_relayerList[i]);
        }
        delete _relayerList;
    }

    /**
     * @notice Check if a specific number of relayers are approved
     * @return Number of approved relayers
     */
    function getRelayerCount() external view returns (uint256) {
        return _relayerList.length;
    }

    /**
     * @notice Reset to initial state
     * @dev Useful for test cleanup between test cases
     */
    function reset() external onlyOwner {
        // Clear all relayers
        for (uint256 i = 0; i < _relayerList.length; i++) {
            _approvedRelayers[_relayerList[i]] = false;
        }
        delete _relayerList;

        // Reset configuration to defaults
        _maxGasLimit = 10_000_000;
        _minPaymasterBalance = 0.1 ether;
    }

    // ============================================
    // PLATFORM FEE (STUB)
    // ============================================

    /**
     * @notice Stub platform fee struct for compatibility
     * @dev Returns disabled fee (0%, no recipient)
     */
    function platformFee() external pure returns (
        uint256 feePercentage,
        address feeRecipient,
        bool enabled
    ) {
        return (0, address(0), false);
    }

    // ============================================
    // FACTORY (STUB)
    // ============================================

    /**
     * @notice Stub for PaymasterFactory address
     * @dev Returns zero address (not needed for testing)
     */
    function paymasterFactory() external pure returns (address) {
        return address(0);
    }
}
