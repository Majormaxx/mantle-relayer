// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RelayerHub} from "../src/core/RelayerHub.sol";
import {Paymaster} from "../src/core/Paymaster.sol";
import {PaymasterFactory} from "../src/core/PaymasterFactory.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeployScript
 * @notice Deployment script for Mantle Gas-Less Relayer system
 * @dev Deploys RelayerHub, Paymaster implementation, and PaymasterFactory with proper configuration
 * 
 * Usage:
 * 1. Set up .env file with required variables:
 *    - PRIVATE_KEY (deployer's private key)
 *    - MANTLE_TESTNET_RPC_URL (Mantle testnet RPC)
 *    - RELAYER_ADDRESS (optional - initial relayer to add)
 * 
 * 2. Deploy to local Anvil:
 *    forge script script/Deploy.s.sol:DeployScript --fork-url http://localhost:8545 --broadcast -vvvv
 * 
 * 3. Deploy to Mantle Testnet:
 *    forge script script/Deploy.s.sol:DeployScript --rpc-url $MANTLE_TESTNET_RPC_URL --broadcast --verify -vvvv
 */
contract DeployScript is Script {
    // Deployed contract addresses (will be populated during deployment)
    RelayerHub public relayerHub;
    RelayerHub public relayerHubImpl;
    Paymaster public paymasterImplementation;
    PaymasterFactory public factory;
    PaymasterFactory public factoryImpl;
    
    function run() external {
        // Read deployment configuration from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Optional: Get initial relayer address
        address relayer = vm.envOr("RELAYER_ADDRESS", address(0));
        
        console.log("========================================");
        console.log("MANTLE GAS-LESS RELAYER DEPLOYMENT");
        console.log("========================================");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        console.log("========================================\n");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ============================================
        // STEP 1: Deploy RelayerHub (Implementation + Proxy)
        // ============================================
        console.log("Step 1: Deploying RelayerHub...");
        
        relayerHubImpl = new RelayerHub();
        console.log("  RelayerHub implementation deployed at:", address(relayerHubImpl));
        
        // Initialize RelayerHub via proxy
        bytes memory hubInitData = abi.encodeWithSelector(
            RelayerHub.initialize.selector,
            deployer
        );
        
        ERC1967Proxy hubProxy = new ERC1967Proxy(
            address(relayerHubImpl),
            hubInitData
        );
        relayerHub = RelayerHub(address(hubProxy));
        
        console.log("  RelayerHub proxy deployed at:", address(relayerHub));
        console.log("  RelayerHub initialized with owner:", deployer);
        console.log("");
        
        // ============================================
        // STEP 2: Deploy Paymaster Implementation
        // ============================================
        console.log("Step 2: Deploying Paymaster implementation...");
        
        paymasterImplementation = new Paymaster();
        console.log("  Paymaster implementation deployed at:", address(paymasterImplementation));
        console.log("");
        
        // ============================================
        // STEP 3: Deploy PaymasterFactory (Implementation + Proxy)
        // ============================================
        console.log("Step 3: Deploying PaymasterFactory...");
        
        factoryImpl = new PaymasterFactory();
        console.log("  PaymasterFactory implementation deployed at:", address(factoryImpl));
        
        // Initialize PaymasterFactory via proxy
        bytes memory factoryInitData = abi.encodeWithSelector(
            PaymasterFactory.initialize.selector,
            deployer,
            address(relayerHub),
            address(paymasterImplementation)
        );
        
        ERC1967Proxy factoryProxy = new ERC1967Proxy(
            address(factoryImpl),
            factoryInitData
        );
        factory = PaymasterFactory(address(factoryProxy));
        
        console.log("  PaymasterFactory proxy deployed at:", address(factory));
        console.log("  PaymasterFactory initialized");
        console.log("");
        
        // ============================================
        // STEP 4: Register Factory in RelayerHub
        // ============================================
        console.log("Step 4: Registering PaymasterFactory in RelayerHub...");
        
        relayerHub.setPaymasterFactory(address(factory));
        console.log("  PaymasterFactory registered successfully");
        console.log("");
        
        // ============================================
        // STEP 5: Add Initial Relayer (Optional)
        // ============================================
        if (relayer != address(0)) {
            console.log("Step 5: Adding initial relayer...");
            relayerHub.addRelayer(relayer);
            console.log("  Relayer added:", relayer);
            console.log("");
        } else {
            console.log("Step 5: No initial relayer provided (skipping)");
            console.log("  Use RelayerHub.addRelayer() to add relayers later");
            console.log("");
        }
        
        // ============================================
        // STEP 6: Configure System Parameters
        // ============================================
        console.log("Step 6: Configuring system parameters...");
        
        // Set maximum gas limit for meta-transactions (10M gas)
        relayerHub.setMaxGasLimit(10_000_000);
        console.log("  Max gas limit set to: 10,000,000");
        
        // Set minimum Paymaster balance requirement (0.1 MNT)
        relayerHub.setMinPaymasterBalance(0.1 ether);
        console.log("  Min Paymaster balance set to: 0.1 MNT");
        
        console.log("");
        
        vm.stopBroadcast();
        
        // ============================================
        // DEPLOYMENT SUMMARY
        // ============================================
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================");
        console.log("Network Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("");
        console.log("CONTRACT ADDRESSES:");
        console.log("----------------------------------------");
        console.log("RelayerHub Implementation:", address(relayerHubImpl));
        console.log("RelayerHub Proxy:", address(relayerHub));
        console.log("");
        console.log("Paymaster Implementation:", address(paymasterImplementation));
        console.log("");
        console.log("PaymasterFactory Implementation:", address(factoryImpl));
        console.log("PaymasterFactory Proxy:", address(factory));
        console.log("========================================");
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Add approved relayers via RelayerHub.addRelayer()");
        console.log("3. Developers can deploy Paymasters via factory.createPaymaster()");
        console.log("4. Update Phase 2 (SDK) with these contract addresses");
        console.log("5. Update Phase 3 (Dashboard) with these contract addresses");
        console.log("");
        console.log("VERIFICATION COMMANDS:");
        console.log("----------------------------------------");
        console.log("forge verify-contract", address(relayerHubImpl), "src/core/RelayerHub.sol:RelayerHub");
        console.log("forge verify-contract", address(paymasterImplementation), "src/core/Paymaster.sol:Paymaster");
        console.log("forge verify-contract", address(factoryImpl), "src/core/PaymasterFactory.sol:PaymasterFactory");
        console.log("========================================");
        console.log("");
        console.log("Save these addresses in DEPLOYMENT.md!");
        console.log("");
    }
}
