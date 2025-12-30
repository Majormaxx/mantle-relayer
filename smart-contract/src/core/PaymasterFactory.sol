// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IPaymasterFactory} from "../interfaces/IPaymasterFactory.sol";
import {IPaymaster} from "../interfaces/IPaymaster.sol";
import {IRelayerHub} from "../interfaces/IRelayerHub.sol";
import "../utils/Errors.sol";

contract PaymasterFactory is 
    Initializable, 
    UUPSUpgradeable, 
    Ownable2StepUpgradeable 
{
    // STATE VARIABLES

    address private _currentImplementation;

    address private _relayerHub;

    mapping(address => address[]) private _ownerToPaymasters;

    mapping(address => address) private _paymasterToOwner;

    mapping(address => uint256) private _paymasterToVersion;

    address[] private _allPaymasters;

    struct ImplementationVersion {
        address implementation;
        uint256 timestamp;
        string version;
        string description;
        bool deprecated;
    }

    ImplementationVersion[] private _implementationHistory;

    uint256 private _currentVersionIndex;

    uint256 private _deploymentFee;

    // EVENTS

    event PaymasterCreated(
        address indexed owner,
        address indexed paymasterAddress,
        uint256 versionIndex,
        uint256 timestamp
    );
    event DeploymentFeeUpdated(uint256 oldFee, uint256 newFee);
    event ImplementationUpdated(
        address indexed oldImplementation,
        address indexed newImplementation,
        uint256 versionIndex,
        string version
    );
    event VersionDeprecated(uint256 indexed versionIndex, string version);

    // ERRORS

    /// @notice Thrown when deployment fee payment is insufficient
    error InsufficientDeploymentFee(uint256 required, uint256 provided);

    /// @notice Thrown when version index is out of bounds
    error InvalidVersionIndex(uint256 provided, uint256 maxIndex);

    /// @notice Thrown when address is not a Paymaster
    error NotAPaymaster(address addr);

    /// @notice Thrown when arrays have mismatched lengths
    error ArrayLengthMismatch();

    // INITIALIZATION

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        address relayerHub_,
        address initialImplementation
    ) external initializer {
        if (initialOwner == address(0)) revert ZeroAddress();
        if (relayerHub_ == address(0)) revert ZeroAddress();
        if (initialImplementation == address(0)) revert ZeroAddress();

        // Initialize parent contracts
        __Ownable2Step_init();
        __UUPSUpgradeable_init();

        // Transfer ownership to initial owner
        _transferOwnership(initialOwner);

        // Set state
        _relayerHub = relayerHub_;
        _currentImplementation = initialImplementation;

        // Add initial version to history
        _implementationHistory.push(ImplementationVersion({
            implementation: initialImplementation,
            timestamp: block.timestamp,
            version: "v1.0.0",
            description: "Initial Paymaster implementation",
            deprecated: false
        }));

        _currentVersionIndex = 0;
        _deploymentFee = 0; // Free deployment initially
    }

    // CORE DEPLOYMENT FUNCTIONS

    function createPaymaster() external payable returns (address paymaster) {
        // Check deployment fee
        if (msg.value < _deploymentFee) {
            revert InsufficientDeploymentFee(_deploymentFee, msg.value);
        }

        // Deploy minimal proxy clone
        paymaster = Clones.clone(_currentImplementation);

        // Initialize the clone
        // Note: We call initialize directly (not in IPaymaster interface)
        (bool success, ) = paymaster.call(
            abi.encodeWithSignature(
                "initialize(address,address,string)",
                msg.sender,
                _relayerHub,
                string(abi.encodePacked("Paymaster-", _addressToString(paymaster)))
            )
        );
        require(success, "Initialization failed");

        // Record in registry
        _registerPaymaster(msg.sender, paymaster);

        // Emit event
        emit PaymasterCreated(
            msg.sender,
            paymaster,
            _currentVersionIndex,
            block.timestamp
        );

        return paymaster;
    }

    function createPaymasterWithConfig(
        uint256 initialDeposit,
        address[] calldata whitelistedContracts,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external payable returns (address paymaster) {
        // Check total payment covers deployment fee + deposit
        uint256 totalRequired = _deploymentFee + initialDeposit;
        if (msg.value < totalRequired) {
            revert InsufficientDeploymentFee(totalRequired, msg.value);
        }

        // Deploy Paymaster
        paymaster = Clones.clone(_currentImplementation);

        // Initialize the clone
        (bool success, ) = paymaster.call(
            abi.encodeWithSignature(
                "initialize(address,address,string)",
                msg.sender,
                _relayerHub,
                string(abi.encodePacked("Paymaster-", _addressToString(paymaster)))
            )
        );
        require(success, "Initialization failed");

        // Record in registry
        _registerPaymaster(msg.sender, paymaster);

        // Deposit initial funds if provided
        if (initialDeposit > 0) {
            IPaymaster(paymaster).deposit{value: initialDeposit}();
        }

        // Whitelist contracts if provided
        if (whitelistedContracts.length > 0) {
            for (uint256 i = 0; i < whitelistedContracts.length; i++) {
                IPaymaster(paymaster).addWhitelistedContract(whitelistedContracts[i]);
            }
        }

        // Set spending limits if provided
        if (dailyLimit > 0) {
            IPaymaster(paymaster).setDailyLimit(dailyLimit);
        }
        if (monthlyLimit > 0) {
            IPaymaster(paymaster).setMonthlyLimit(monthlyLimit);
        }

        // Emit event
        emit PaymasterCreated(
            msg.sender,
            paymaster,
            _currentVersionIndex,
            block.timestamp
        );

        return paymaster;
    }

    // REGISTRY FUNCTIONS

    function getPaymasters(address owner) external view returns (address[] memory) {
        return _ownerToPaymasters[owner];
    }

    function getAllPaymasters() external view returns (address[] memory) {
        return _allPaymasters;
    }

    function getTotalPaymasters() external view returns (uint256) {
        return _allPaymasters.length;
    }

    function isPaymaster(address addr) external view returns (bool) {
        return _paymasterToOwner[addr] != address(0);
    }

    // VERSION MANAGEMENT

    function updateImplementation(
        address newImplementation,
        string calldata version,
        string calldata description
    ) external onlyOwner {
        if (newImplementation == address(0)) revert ZeroAddress();

        address oldImplementation = _currentImplementation;

        // Add new version to history
        _implementationHistory.push(ImplementationVersion({
            implementation: newImplementation,
            timestamp: block.timestamp,
            version: version,
            description: description,
            deprecated: false
        }));

        // Update current implementation
        _currentImplementation = newImplementation;
        _currentVersionIndex = _implementationHistory.length - 1;

        emit ImplementationUpdated(
            oldImplementation,
            newImplementation,
            _currentVersionIndex,
            version
        );
    }

    function deprecateVersion(uint256 versionIndex) external onlyOwner {
        if (versionIndex >= _implementationHistory.length) {
            revert InvalidVersionIndex(versionIndex, _implementationHistory.length - 1);
        }

        _implementationHistory[versionIndex].deprecated = true;

        emit VersionDeprecated(
            versionIndex,
            _implementationHistory[versionIndex].version
        );
    }

    function getCurrentImplementation()
        external
        view
        returns (address implementation, string memory version, uint256 timestamp)
    {
        ImplementationVersion memory current = _implementationHistory[_currentVersionIndex];
        return (current.implementation, current.version, current.timestamp);
    }

    function getImplementationHistory() external view returns (ImplementationVersion[] memory) {
        return _implementationHistory;
    }

    function getPaymasterVersion(address paymaster) external view returns (uint256 versionIndex) {
        if (_paymasterToOwner[paymaster] == address(0)) {
            revert NotAPaymaster(paymaster);
        }
        return _paymasterToVersion[paymaster];
    }

    function isPaymasterDeprecated(address paymaster) external view returns (bool) {
        if (_paymasterToOwner[paymaster] == address(0)) {
            revert NotAPaymaster(paymaster);
        }
        uint256 versionIndex = _paymasterToVersion[paymaster];
        return _implementationHistory[versionIndex].deprecated;
    }

    // ADMIN FUNCTIONS

    function setDeploymentFee(uint256 fee) external onlyOwner {
        uint256 oldFee = _deploymentFee;
        _deploymentFee = fee;
        emit DeploymentFeeUpdated(oldFee, fee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();

        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert TransactionFailed();
    }

    // VIEW FUNCTIONS

    function deploymentFee() external view returns (uint256) {
        return _deploymentFee;
    }

    function currentImplementation() external view returns (address) {
        return _currentImplementation;
    }

    function relayerHub() external view returns (address) {
        return _relayerHub;
    }

    function currentVersionIndex() external view returns (uint256) {
        return _currentVersionIndex;
    }

    // UUPS UPGRADE AUTHORIZATION

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {
        // Only owner can upgrade factory
    }

    // INTERNAL HELPER FUNCTIONS

    function _registerPaymaster(address owner, address paymaster) internal {
        // Record owner -> paymaster
        _ownerToPaymasters[owner].push(paymaster);

        // Record paymaster -> owner
        _paymasterToOwner[paymaster] = owner;

        // Record paymaster -> version
        _paymasterToVersion[paymaster] = _currentVersionIndex;

        // Add to global list
        _allPaymasters.push(paymaster);
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
