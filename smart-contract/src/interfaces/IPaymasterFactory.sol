// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaymasterFactory {
    // ============ Structs ============

    struct ImplementationVersion {
        address implementation;
        uint256 timestamp;
        string version;
        string description;
        bool deprecated;
    }

    // ============ Events ============

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

    // ============ Core Functions ============

    function createPaymaster() external payable returns (address paymaster);

    function createPaymasterWithConfig(
        uint256 initialDeposit,
        address[] calldata whitelistedContracts,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external payable returns (address paymaster);

    // ============ Registry Functions ============

    function getPaymasters(address owner) external view returns (address[] memory);

    function getAllPaymasters() external view returns (address[] memory);

    function getTotalPaymasters() external view returns (uint256);

    function isPaymaster(address addr) external view returns (bool);

    // ============ Version Management ============

    function updateImplementation(
        address newImplementation,
        string calldata version,
        string calldata description
    ) external;

    function deprecateVersion(uint256 versionIndex) external;

    function getCurrentImplementation()
        external
        view
        returns (address implementation, string memory version, uint256 timestamp);

    function getImplementationHistory() external view returns (ImplementationVersion[] memory);

    function getPaymasterVersion(address paymaster) external view returns (uint256 versionIndex);

    function isPaymasterDeprecated(address paymaster) external view returns (bool);

    // ============ Admin Functions ============

    function setDeploymentFee(uint256 fee) external;

    function withdrawFees() external;

    // ============ View Functions ============

    function deploymentFee() external view returns (uint256);

    function currentImplementation() external view returns (address);

    function relayerHub() external view returns (address);

    function owner() external view returns (address);

    function currentVersionIndex() external view returns (uint256);
}
