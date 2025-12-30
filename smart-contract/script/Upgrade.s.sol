// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Paymaster} from "../src/core/Paymaster.sol";
import {PaymasterFactory} from "../src/core/PaymasterFactory.sol";
import {RelayerHub} from "../src/core/RelayerHub.sol";

/**
 * @title UpgradeScript
 * @notice Script for upgrading Paymaster implementation to a new version
 * @dev This script deploys a new Paymaster implementation and updates the factory
 * 
 * Usage:
 * 1. Set up .env file with:
 *    - PRIVATE_KEY (owner's private key - must be factory owner)
 *    - FACTORY_ADDRESS (address of deployed PaymasterFactory)
 *    - NEW_VERSION (e.g., "2.0.0")
 *    - VERSION_DESCRIPTION (e.g., "Gas optimization and security fixes")
 * 
 * 2. Execute locally:
 *    forge script script/Upgrade.s.sol:UpgradeScript --fork-url http://localhost:8545 --broadcast -vvvv
 * 
 * 3. Execute on testnet:
 *    forge script script/Upgrade.s.sol:UpgradeScript --rpc-url $MANTLE_TESTNET_RPC_URL --broadcast --verify -vvvv
 * 
 * IMPORTANT NOTES:
 * - Only the factory owner can execute this upgrade
 * - Existing Paymasters continue using their original implementation
 * - Only NEW Paymasters deployed after upgrade will use the new implementation
 * - This preserves immutability of existing Paymasters (users' funds are safe)
 */
contract UpgradeScript is Script {
    function run() external {
        // Read configuration from environment
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(ownerPrivateKey);
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        string memory newVersion = vm.envString("NEW_VERSION");
        string memory versionDescription = vm.envString("VERSION_DESCRIPTION");
        
        PaymasterFactory factory = PaymasterFactory(factoryAddress);
        
        console.log("========================================");
        console.log("PAYMASTER IMPLEMENTATION UPGRADE");
        console.log("========================================");
        console.log("Owner address:", owner);
        console.log("Factory address:", factoryAddress);
        console.log("New version:", newVersion);
        console.log("Description:", versionDescription);
        console.log("Chain ID:", block.chainid);
        console.log("========================================\n");
        
        // Verify owner has permission
        address currentOwner = factory.owner();
        require(currentOwner == owner, "Caller is not factory owner");
        console.log("Owner verification: PASSED");
        console.log("");
        
        // Get current implementation info
        (address currentImpl, string memory currentVer, ) = factory.getCurrentImplementation();
        console.log("Current Implementation:");
        console.log("  Address:", currentImpl);
        console.log("  Version:", currentVer);
        console.log("");
        
        vm.startBroadcast(ownerPrivateKey);
        
        // ============================================
        // STEP 1: Deploy New Paymaster Implementation
        // ============================================
        console.log("Step 1: Deploying new Paymaster implementation...");
        
        Paymaster newImplementation = new Paymaster();
        console.log("  New implementation deployed at:", address(newImplementation));
        console.log("");
        
        // ============================================
        // STEP 2: Update Factory to Use New Implementation
        // ============================================
        console.log("Step 2: Updating factory with new implementation...");
        
        factory.updateImplementation(
            address(newImplementation),
            newVersion,
            versionDescription
        );
        
        console.log("  Factory updated successfully");
        console.log("  New version:", newVersion);
        console.log("");
        
        vm.stopBroadcast();
        
        // ============================================
        // Verify Upgrade Success
        // ============================================
        console.log("Step 3: Verifying upgrade...");
        
        (address verifyImpl, string memory verifyVer, ) = factory.getCurrentImplementation();
        require(verifyImpl == address(newImplementation), "Upgrade verification failed");
        console.log("  Verification: SUCCESS");
        console.log("  Current implementation:", verifyImpl);
        console.log("  Current version:", verifyVer);
        console.log("");
        
        // ============================================
        // UPGRADE SUMMARY
        // ============================================
        console.log("========================================");
        console.log("UPGRADE COMPLETE");
        console.log("========================================");
        console.log("Factory Address:", factoryAddress);
        console.log("");
        console.log("OLD IMPLEMENTATION:");
        console.log("  Address:", currentImpl);
        console.log("  Version:", currentVer);
        console.log("");
        console.log("NEW IMPLEMENTATION:");
        console.log("  Address:", address(newImplementation));
        console.log("  Version:", newVersion);
        console.log("  Description:", versionDescription);
        console.log("========================================");
        console.log("");
        console.log("IMPORTANT NOTES:");
        console.log("1. Existing Paymasters CONTINUE using old implementation");
        console.log("2. New Paymasters deployed via factory will use new implementation");
        console.log("3. This preserves immutability and user fund safety");
        console.log("4. Users can verify their Paymaster version via factory.getPaymasterVersion()");
        console.log("");
        console.log("VERIFICATION COMMAND:");
        console.log("----------------------------------------");
        console.log("forge verify-contract", address(newImplementation), "src/core/Paymaster.sol:Paymaster");
        console.log("========================================");
        console.log("");
    }
}

/**
 * @title UpgradeRelayerHubScript
 * @notice Script for upgrading RelayerHub implementation (UUPS pattern)
 * @dev This uses UUPS upgrade pattern to upgrade the RelayerHub proxy
 */
contract UpgradeRelayerHubScript is Script {
    function run() external {
        // Read configuration
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(ownerPrivateKey);
        address hubProxyAddress = vm.envAddress("RELAYER_HUB_ADDRESS");
        
        RelayerHub hubProxy = RelayerHub(hubProxyAddress);
        
        console.log("========================================");
        console.log("RELAYER HUB UUPS UPGRADE");
        console.log("========================================");
        console.log("Owner address:", owner);
        console.log("RelayerHub proxy:", hubProxyAddress);
        console.log("Chain ID:", block.chainid);
        console.log("========================================\n");
        
        // Verify owner
        address currentOwner = hubProxy.owner();
        require(currentOwner == owner, "Caller is not hub owner");
        console.log("Owner verification: PASSED");
        console.log("");
        
        vm.startBroadcast(ownerPrivateKey);
        
        // Deploy new implementation
        console.log("Deploying new RelayerHub implementation...");
        RelayerHub newHubImpl = new RelayerHub();
        console.log("  New implementation:", address(newHubImpl));
        console.log("");
        
        // Upgrade proxy to new implementation
        console.log("Upgrading proxy...");
        hubProxy.upgradeToAndCall(address(newHubImpl), "");
        console.log("  Upgrade complete");
        console.log("");
        
        vm.stopBroadcast();
        
        console.log("========================================");
        console.log("RELAYER HUB UPGRADE COMPLETE");
        console.log("========================================");
        console.log("Proxy Address:", hubProxyAddress);
        console.log("New Implementation:", address(newHubImpl));
        console.log("========================================");
        console.log("");
    }
}

/**
 * @title UpgradeFactoryScript
 * @notice Script for upgrading PaymasterFactory implementation (UUPS pattern)
 */
contract UpgradeFactoryScript is Script {
    function run() external {
        // Read configuration
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(ownerPrivateKey);
        address factoryProxyAddress = vm.envAddress("FACTORY_ADDRESS");
        
        PaymasterFactory factoryProxy = PaymasterFactory(factoryProxyAddress);
        
        console.log("========================================");
        console.log("PAYMASTER FACTORY UUPS UPGRADE");
        console.log("========================================");
        console.log("Owner address:", owner);
        console.log("Factory proxy:", factoryProxyAddress);
        console.log("Chain ID:", block.chainid);
        console.log("========================================\n");
        
        // Verify owner
        address currentOwner = factoryProxy.owner();
        require(currentOwner == owner, "Caller is not factory owner");
        console.log("Owner verification: PASSED");
        console.log("");
        
        vm.startBroadcast(ownerPrivateKey);
        
        // Deploy new implementation
        console.log("Deploying new PaymasterFactory implementation...");
        PaymasterFactory newFactoryImpl = new PaymasterFactory();
        console.log("  New implementation:", address(newFactoryImpl));
        console.log("");
        
        // Upgrade proxy
        console.log("Upgrading proxy...");
        factoryProxy.upgradeToAndCall(address(newFactoryImpl), "");
        console.log("  Upgrade complete");
        console.log("");
        
        vm.stopBroadcast();
        
        console.log("========================================");
        console.log("FACTORY UPGRADE COMPLETE");
        console.log("========================================");
        console.log("Proxy Address:", factoryProxyAddress);
        console.log("New Implementation:", address(newFactoryImpl));
        console.log("========================================");
        console.log("");
    }
}
