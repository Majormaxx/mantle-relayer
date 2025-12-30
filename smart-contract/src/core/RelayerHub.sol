// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {IRelayerHub} from "../interfaces/IRelayerHub.sol";
import {Unauthorized} from "../utils/Errors.sol";

contract RelayerHub is 
    Initializable, 
    UUPSUpgradeable, 
    Ownable2StepUpgradeable 
{
    // STATE VARIABLES

    address private _paymasterFactory;

    mapping(address => bool) private _approvedRelayers;

    address[] private _relayerList;

    struct PlatformFee {
        uint256 feePercentage;
        address feeRecipient;
        bool enabled;
    }

    PlatformFee private _platformFee;

    uint256 private _minPaymasterBalance;

    uint256 private _maxGasLimit;

    // ============ Events ============

    event RelayerAdded(address indexed relayer);

    event RelayerRemoved(address indexed relayer);

    event PaymasterFactoryUpdated(address indexed oldFactory, address indexed newFactory);

    event PlatformFeeUpdated(uint256 feePercentage, address feeRecipient);

    event PlatformFeeEnabled();

    event PlatformFeeDisabled();

    event SystemConfigUpdated(string parameter, uint256 value);

    // CONSTANTS

    /// @notice Maximum allowed fee percentage (100% = 10000 basis points)
    uint256 public constant MAX_FEE_PERCENTAGE = 10000;

    /// @notice Default minimum Paymaster balance (0.1 ETH)
    uint256 public constant DEFAULT_MIN_BALANCE = 0.1 ether;

    /// @notice Default maximum gas limit (10 million gas)
    uint256 public constant DEFAULT_MAX_GAS_LIMIT = 10_000_000;

    // ERRORS

    /// @notice Thrown when address parameter is zero address
    error ZeroAddress();

    /// @notice Thrown when fee percentage exceeds maximum (10000 basis points)
    /// @param provided The fee percentage that was provided
    /// @param maximum The maximum allowed fee percentage
    error InvalidFeePercentage(uint256 provided, uint256 maximum);

    /// @notice Thrown when trying to add a relayer that is already approved
    /// @param relayer The relayer address that is already approved
    error RelayerAlreadyAdded(address relayer);

    /// @notice Thrown when trying to remove a relayer that is not approved
    /// @param relayer The relayer address that is not approved
    error RelayerNotFound(address relayer);

    // INITIALIZATION

    function initialize(address initialOwner) public initializer {
        if (initialOwner == address(0)) revert ZeroAddress();

        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        
        // Transfer ownership to initial owner
        _transferOwnership(initialOwner);

        // Set default configuration
        _minPaymasterBalance = DEFAULT_MIN_BALANCE;
        _maxGasLimit = DEFAULT_MAX_GAS_LIMIT;

        // Platform fee disabled by default
        _platformFee.enabled = false;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // RELAYER MANAGEMENT

    function addRelayer(address relayer) external onlyOwner {
        if (relayer == address(0)) revert ZeroAddress();
        if (_approvedRelayers[relayer]) revert RelayerAlreadyAdded(relayer);

        _approvedRelayers[relayer] = true;
        _relayerList.push(relayer);

        emit RelayerAdded(relayer);
    }

    function removeRelayer(address relayer) external onlyOwner {
        if (!_approvedRelayers[relayer]) revert RelayerNotFound(relayer);

        _approvedRelayers[relayer] = false;

        // Remove from array (swap with last element, then pop)
        uint256 length = _relayerList.length;
        for (uint256 i = 0; i < length; i++) {
            if (_relayerList[i] == relayer) {
                // Move last element to this position
                _relayerList[i] = _relayerList[length - 1];
                // Remove last element
                _relayerList.pop();
                break;
            }
        }

        emit RelayerRemoved(relayer);
    }

    function isApprovedRelayer(address relayer) external view returns (bool) {
        return _approvedRelayers[relayer];
    }

    function getApprovedRelayers() external view returns (address[] memory) {
        return _relayerList;
    }

    // FACTORY MANAGEMENT

    function setPaymasterFactory(address factory) external onlyOwner {
        if (factory == address(0)) revert ZeroAddress();
        
        address oldFactory = _paymasterFactory;
        _paymasterFactory = factory;

        emit PaymasterFactoryUpdated(oldFactory, factory);
    }

    function paymasterFactory() external view returns (address) {
        return _paymasterFactory;
    }

    // PLATFORM FEE MANAGEMENT

    function setPlatformFee(
        uint256 feePercentage,
        address feeRecipient
    ) external onlyOwner {
        if (feePercentage > MAX_FEE_PERCENTAGE) {
            revert InvalidFeePercentage(feePercentage, MAX_FEE_PERCENTAGE);
        }
        if (feeRecipient == address(0)) revert ZeroAddress();

        _platformFee.feePercentage = feePercentage;
        _platformFee.feeRecipient = feeRecipient;

        emit PlatformFeeUpdated(feePercentage, feeRecipient);
    }

    function enablePlatformFee() external onlyOwner {
        _platformFee.enabled = true;
        emit PlatformFeeEnabled();
    }

    function disablePlatformFee() external onlyOwner {
        _platformFee.enabled = false;
        emit PlatformFeeDisabled();
    }

    function platformFee() external view returns (PlatformFee memory) {
        return _platformFee;
    }

    // SYSTEM CONFIGURATION

    function setMinPaymasterBalance(uint256 minBalance) external onlyOwner {
        _minPaymasterBalance = minBalance;
        emit SystemConfigUpdated("minPaymasterBalance", minBalance);
    }

    function setMaxGasLimit(uint256 maxGas) external onlyOwner {
        _maxGasLimit = maxGas;
        emit SystemConfigUpdated("maxGasLimit", maxGas);
    }

    function minPaymasterBalance() external view returns (uint256) {
        return _minPaymasterBalance;
    }

    function maxGasLimit() external view returns (uint256) {
        return _maxGasLimit;
    }

    // OWNERSHIP MANAGEMENT

    // function transferOwnership(address newOwner) public virtual override onlyOwner
    // Inherited from Ownable2StepUpgradeable

    // function acceptOwnership() public virtual override
    // Inherited from Ownable2StepUpgradeable

    // UUPS UPGRADE AUTHORIZATION

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {
        // Only owner can upgrade
        // Additional upgrade logic can be added here if needed
    }

    // VIEW FUNCTIONS

    // function owner() public view virtual override returns (address)
    // Inherited from Ownable2StepUpgradeable

    // function pendingOwner() public view virtual override returns (address)
    // Inherited from Ownable2StepUpgradeable
}
