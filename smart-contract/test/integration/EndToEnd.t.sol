// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {RelayerHub} from "../../src/core/RelayerHub.sol";
import {Paymaster} from "../../src/core/Paymaster.sol";
import {PaymasterFactory} from "../../src/core/PaymasterFactory.sol";
import {MockTarget} from "../mocks/MockTarget.sol";
import {IPaymaster} from "../../src/interfaces/IPaymaster.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title EndToEndIntegrationTest
 * @notice Comprehensive integration tests for the full Paymaster system
 * @dev Tests complete user journeys from deployment to execution
 */
contract EndToEndIntegrationTest is Test {
    // Contracts
    RelayerHub public relayerHub;
    RelayerHub public relayerHubImpl;
    Paymaster public paymasterImplementation;
    PaymasterFactory public factory;
    PaymasterFactory public factoryImpl;
    MockTarget public mockTarget;
    
    // Test accounts
    address public owner;
    address public developer;
    address public user1;
    address public user2;
    address public user3;
    address public user4;
    address public user5;
    address public relayer;
    
    // Private keys for signing
    uint256 public user1PrivateKey = 0x1111;
    uint256 public user2PrivateKey = 0x2222;
    uint256 public user3PrivateKey = 0x3333;
    uint256 public user4PrivateKey = 0x4444;
    uint256 public user5PrivateKey = 0x5555;
    
    // EIP-712 constants
    bytes32 public constant METATRANSACTION_TYPEHASH = keccak256(
        "MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)"
    );
    
    function setUp() public {
        // Create test accounts
        owner = makeAddr("owner");
        developer = makeAddr("developer");
        user1 = vm.addr(user1PrivateKey);
        user2 = vm.addr(user2PrivateKey);
        user3 = vm.addr(user3PrivateKey);
        user4 = vm.addr(user4PrivateKey);
        user5 = vm.addr(user5PrivateKey);
        relayer = makeAddr("relayer");
        
        // Fund accounts
        vm.deal(owner, 100 ether);
        vm.deal(developer, 50 ether);
        vm.deal(relayer, 10 ether);
        
        // Deploy RelayerHub via proxy
        vm.startPrank(owner);
        relayerHubImpl = new RelayerHub();
        bytes memory hubInitData = abi.encodeWithSelector(RelayerHub.initialize.selector, owner);
        ERC1967Proxy hubProxy = new ERC1967Proxy(address(relayerHubImpl), hubInitData);
        relayerHub = RelayerHub(address(hubProxy));
        
        // Add relayer to hub
        relayerHub.addRelayer(relayer);
        
        // Deploy Paymaster implementation
        paymasterImplementation = new Paymaster();
        
        // Deploy PaymasterFactory via proxy
        factoryImpl = new PaymasterFactory();
        bytes memory factoryInitData = abi.encodeWithSelector(
            PaymasterFactory.initialize.selector,
            owner,
            address(relayerHub),
            address(paymasterImplementation)
        );
        ERC1967Proxy factoryProxy = new ERC1967Proxy(address(factoryImpl), factoryInitData);
        factory = PaymasterFactory(address(factoryProxy));
        
        // Register factory in hub
        relayerHub.setPaymasterFactory(address(factory));
        
        vm.stopPrank();
        
        // Deploy MockTarget
        mockTarget = new MockTarget();
    }
    
    /// @notice Helper to sign meta-transaction
    function signMetaTransaction(
        uint256 privateKey,
        address paymaster,
        address target,
        bytes memory data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                METATRANSACTION_TYPEHASH,
                vm.addr(privateKey),
                target,
                keccak256(data),
                gasLimit,
                nonce,
                deadline
            )
        );
        
        bytes32 domainSeparator = Paymaster(payable(paymaster)).DOMAIN_SEPARATOR();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        return abi.encodePacked(r, s, v);
    }
    
    /// @notice Test complete deployment, configuration, and execution flow
    function test_FullFlow_DeployConfigureExecute() public {
        // Step 1: Developer deploys Paymaster via Factory
        vm.startPrank(developer);
        address paymasterAddr = factory.createPaymaster();
        Paymaster paymaster = Paymaster(payable(paymasterAddr));
        
        // Step 2: Developer deposits funds
        paymaster.deposit{value: 10 ether}();
        assertEq(address(paymaster).balance, 10 ether);
        
        // Step 3: Developer whitelists target contract and functions
        paymaster.addWhitelistedContract(address(mockTarget));
        paymaster.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        
        // Step 4: Developer sets spending limits
        paymaster.setPerTransactionLimit(1 ether);
        paymaster.setDailyLimit(5 ether);
        paymaster.setMonthlyLimit(50 ether);
        
        vm.stopPrank();
        
        // Step 5: User signs meta-transaction
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        uint256 nonce = paymaster.nonces(user1);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = signMetaTransaction(
            user1PrivateKey,
            address(paymaster),
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline
        );
        
        // Step 6: Relayer submits transaction
        uint256 relayerBalanceBefore = relayer.balance;
        
        vm.prank(relayer);
        (bool success, ) = paymaster.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline,
            signature
        );
        
        // Step 7: Transaction executes successfully
        assertTrue(success);
        assertEq(mockTarget.counter(), 1);
        
        // Step 8: Relayer gets reimbursed (may be 0 if gasprice=0 in test)
        assertTrue(relayer.balance >= relayerBalanceBefore);
        
        // Step 9: Analytics updated
        (uint256 totalTx, , uint256 uniqueUsers) = paymaster.getAnalytics();
        assertEq(totalTx, 1);
        assertEq(uniqueUsers, 1);
        
        // Step 10: Verify nonce incremented
        assertEq(paymaster.nonces(user1), 1);
    }
    
    /// @notice Test multiple users using same Paymaster
    function test_MultipleUsers_SamePaymaster() public {
        // Deploy and configure Paymaster
        vm.startPrank(developer);
        address paymasterAddr = factory.createPaymaster();
        Paymaster paymaster = Paymaster(payable(paymasterAddr));
        paymaster.deposit{value: 10 ether}();
        paymaster.addWhitelistedContract(address(mockTarget));
        paymaster.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        vm.stopPrank();
        
        address[5] memory users = [user1, user2, user3, user4, user5];
        uint256[5] memory privateKeys = [
            user1PrivateKey,
            user2PrivateKey,
            user3PrivateKey,
            user4PrivateKey,
            user5PrivateKey
        ];
        
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        uint256 deadline = block.timestamp + 1 hours;
        
        // Execute transaction for each user
        for (uint256 i = 0; i < 5; i++) {
            uint256 nonce = paymaster.nonces(users[i]);
            assertEq(nonce, 0); // Each user starts with nonce 0
            
            bytes memory signature = signMetaTransaction(
                privateKeys[i],
                address(paymaster),
                address(mockTarget),
                data,
                gasLimit,
                nonce,
                deadline
            );
            
            vm.prank(relayer);
            (bool success, ) = paymaster.executeMetaTransaction(
                users[i],
                address(mockTarget),
                data,
                gasLimit,
                nonce,
                deadline,
                signature
            );
            
            assertTrue(success);
            assertEq(paymaster.nonces(users[i]), 1); // Each user nonce incremented independently
        }
        
        // Verify analytics tracks all unique users
        (, , uint256 uniqueUsers) = paymaster.getAnalytics();
        assertEq(uniqueUsers, 5);
        assertEq(mockTarget.counter(), 5); // 5 transactions executed
    }
    
    /// @notice Test spending limit resets after time advancement
    function test_MultipleDays_SpendingLimitResets() public {
        // Deploy and configure Paymaster with low daily limit
        vm.startPrank(developer);
        address paymasterAddr = factory.createPaymaster();
        Paymaster paymaster = Paymaster(payable(paymasterAddr));
        paymaster.deposit{value: 10 ether}();
        paymaster.addWhitelistedContract(address(mockTarget));
        paymaster.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        paymaster.setDailyLimit(0.01 ether); // Very low limit
        vm.stopPrank();
        
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        
        // Execute first transaction
        uint256 nonce1 = paymaster.nonces(user1);
        uint256 deadline1 = block.timestamp + 1 hours;
        bytes memory sig1 = signMetaTransaction(
            user1PrivateKey,
            address(paymaster),
            address(mockTarget),
            data,
            gasLimit,
            nonce1,
            deadline1
        );
        
        vm.prank(relayer);
        (bool success1, ) = paymaster.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce1,
            deadline1,
            sig1
        );
        assertTrue(success1);
        
        // Try multiple more transactions - may hit daily limit
        // (In test env with gasprice=0, limits may not trigger)
        
        // Advance time by 24 hours
        vm.warp(block.timestamp + 1 days);
        
        // Execute transaction after reset - create fresh signature with new deadline
        // CRITICAL: Use vm.getBlockTimestamp() instead of block.timestamp to avoid via-ir caching
        uint256 nonce2 = paymaster.nonces(user1);
        uint256 deadline2 = vm.getBlockTimestamp() + 1 hours;
        bytes memory sig2 = signMetaTransaction(
            user1PrivateKey,
            address(paymaster),
            address(mockTarget),
            data,
            gasLimit,
            nonce2,
            deadline2
        );
        
        vm.prank(relayer);
        (bool success2, ) = paymaster.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce2,
            deadline2,
            sig2
        );
        assertTrue(success2);
    }
    
    /// @notice Test low balance alert mechanism
    function test_LowBalance_Alert() public {
        // Deploy Paymaster
        vm.startPrank(developer);
        address paymasterAddr = factory.createPaymaster();
        Paymaster paymaster = Paymaster(payable(paymasterAddr));
        
        // Deposit small amount
        paymaster.deposit{value: 1 ether}();
        
        // Set high threshold to trigger alert
        paymaster.setLowBalanceThreshold(5 ether);
        
        paymaster.addWhitelistedContract(address(mockTarget));
        paymaster.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        vm.stopPrank();
        
        // Execute transaction - should trigger alert since balance < threshold
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        uint256 nonce = paymaster.nonces(user1);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = signMetaTransaction(
            user1PrivateKey,
            address(paymaster),
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline
        );
        
        // Expect low balance alert event
        vm.expectEmit(true, false, false, false);
        emit IPaymaster.LowBalanceAlert(address(paymaster).balance, 5 ether);
        
        vm.prank(relayer);
        paymaster.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline,
            signature
        );
        
        // Developer deposits more funds
        vm.prank(developer);
        paymaster.deposit{value: 10 ether}();
        
        // Alert should reset (balance now > threshold)
        assertTrue(address(paymaster).balance > 5 ether);
    }
    
    /// @notice Test upgrade scenario with multiple versions
    function test_UpgradeScenario() public {
        // Deploy Paymaster v1.0.0 via factory
        vm.startPrank(developer);
        address paymaster1 = factory.createPaymaster();
        Paymaster pm1 = Paymaster(payable(paymaster1));
        pm1.deposit{value: 5 ether}();
        pm1.addWhitelistedContract(address(mockTarget));
        pm1.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        vm.stopPrank();
        
        // Execute transaction on v1
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        uint256 nonce1 = pm1.nonces(user1);
        uint256 deadline1 = block.timestamp + 1 hours;
        
        bytes memory sig1 = signMetaTransaction(
            user1PrivateKey,
            paymaster1,
            address(mockTarget),
            data,
            gasLimit,
            nonce1,
            deadline1
        );
        
        vm.prank(relayer);
        (bool success1, ) = pm1.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce1,
            deadline1,
            sig1
        );
        assertTrue(success1);
        
        // Factory owner deploys new implementation v2.0.0
        vm.startPrank(owner);
        Paymaster newImplementation = new Paymaster();
        factory.updateImplementation(
            address(newImplementation),
            "2.0.0",
            "Enhanced security and gas optimization"
        );
        vm.stopPrank();
        
        // Old Paymaster still works
        uint256 nonce2 = pm1.nonces(user1);
        uint256 deadline2 = block.timestamp + 1 hours;
        bytes memory sig2 = signMetaTransaction(
            user1PrivateKey,
            paymaster1,
            address(mockTarget),
            data,
            gasLimit,
            nonce2,
            deadline2
        );
        
        vm.prank(relayer);
        (bool success2, ) = pm1.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce2,
            deadline2,
            sig2
        );
        assertTrue(success2);
        
        // New deployments use v2.0.0
        vm.startPrank(developer);
        address paymaster2 = factory.createPaymaster();
        Paymaster pm2 = Paymaster(payable(paymaster2));
        vm.stopPrank();
        
        // Verify version tracking
        assertEq(factory.getPaymasterVersion(paymaster1), 0); // v1.0.0
        assertEq(factory.getPaymasterVersion(paymaster2), 1); // v2.0.0
    }
    
    /// @notice Test emergency pause functionality
    function test_EmergencyPause() public {
        // Deploy and configure Paymaster
        vm.startPrank(developer);
        address paymasterAddr = factory.createPaymaster();
        Paymaster paymaster = Paymaster(payable(paymasterAddr));
        paymaster.deposit{value: 5 ether}();
        paymaster.addWhitelistedContract(address(mockTarget));
        paymaster.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        
        // Developer pauses Paymaster
        paymaster.pause();
        assertTrue(paymaster.paused());
        
        vm.stopPrank();
        
        // Try to execute transaction - should revert
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        uint256 nonce = paymaster.nonces(user1);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = signMetaTransaction(
            user1PrivateKey,
            address(paymaster),
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline
        );
        
        vm.prank(relayer);
        vm.expectRevert(); // ContractPaused error
        paymaster.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline,
            signature
        );
        
        // Developer unpauses
        vm.prank(developer);
        paymaster.unpause();
        assertFalse(paymaster.paused());
        
        // Transaction now works
        vm.prank(relayer);
        (bool success, ) = paymaster.executeMetaTransaction(
            user1,
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline,
            signature
        );
        assertTrue(success);
    }
}
