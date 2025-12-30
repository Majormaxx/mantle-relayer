// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRelayerHub {
    // ============ Structs ============

    struct PlatformFee {
        uint256 feePercentage;
        address feeRecipient;
        bool enabled;
    }

    // ============ Events ============

    event RelayerAdded(address indexed relayer);

    event RelayerRemoved(address indexed relayer);

    event PaymasterFactoryUpdated(address indexed oldFactory, address indexed newFactory);

    event PlatformFeeUpdated(uint256 feePercentage, address feeRecipient);

    event PlatformFeeEnabled();

    event PlatformFeeDisabled();

    event SystemConfigUpdated(string parameter, uint256 value);

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Relayer Management ============

    function addRelayer(address relayer) external;

    function removeRelayer(address relayer) external;

    function isApprovedRelayer(address relayer) external view returns (bool);

    function getApprovedRelayers() external view returns (address[] memory);

    // ============ Factory Management ============

    function setPaymasterFactory(address factory) external;

    // ============ Platform Fee Management ============

    function setPlatformFee(uint256 feePercentage, address feeRecipient) external;

    function enablePlatformFee() external;

    function disablePlatformFee() external;

    function platformFee() external view returns (PlatformFee memory fee);

    // ============ System Configuration ============

    function setMinPaymasterBalance(uint256 minBalance) external;

    function setMaxGasLimit(uint256 maxGas) external;

    // ============ Ownership Management ============

    function transferOwnership(address newOwner) external;

    function acceptOwnership() external;

    // ============ View Functions ============

    function paymasterFactory() external view returns (address);

    function minPaymasterBalance() external view returns (uint256);

    function maxGasLimit() external view returns (uint256);

    function owner() external view returns (address);

    function pendingOwner() external view returns (address);
}
