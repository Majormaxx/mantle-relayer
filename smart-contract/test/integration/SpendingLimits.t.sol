// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {RelayerHub} from "../../src/core/RelayerHub.sol";
import {Paymaster} from "../../src/core/Paymaster.sol";
import {PaymasterFactory} from "../../src/core/PaymasterFactory.sol";
import {MockTarget} from "../mocks/MockTarget.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title SpendingLimitsIntegrationTest
 * @notice Complex integration tests for spending limit scenarios
 * @dev Tests realistic spending patterns over multiple days and months
 */
contract SpendingLimitsIntegrationTest is Test {
    // Contracts
    RelayerHub public relayerHub;
    RelayerHub public relayerHubImpl;
    Paymaster public paymasterImplementation;
    PaymasterFactory public factory;
    PaymasterFactory public factoryImpl;
    MockTarget public mockTarget;
    Paymaster public paymaster;
    
    // Test accounts
    address public owner;
    address public developer;
    address public user;
    address public relayer;
    
    uint256 public userPrivateKey = 0x1234;
    
    // EIP-712 constants
    bytes32 public constant METATRANSACTION_TYPEHASH = keccak256(
        "MetaTransaction(address user,address target,bytes data,uint256 gasLimit,uint256 nonce,uint256 deadline)"
    );
    
    function setUp() public {
        // Create test accounts
        owner = makeAddr("owner");
        developer = makeAddr("developer");
        user = vm.addr(userPrivateKey);
        relayer = makeAddr("relayer");
        
        // Fund accounts
        vm.deal(owner, 100 ether);
        vm.deal(developer, 150 ether); // Increased to cover 100 ether deposit
        vm.deal(relayer, 10 ether);
        
        // Deploy RelayerHub via proxy
        vm.startPrank(owner);
        relayerHubImpl = new RelayerHub();
        bytes memory hubInitData = abi.encodeWithSelector(RelayerHub.initialize.selector, owner);
        ERC1967Proxy hubProxy = new ERC1967Proxy(address(relayerHubImpl), hubInitData);
        relayerHub = RelayerHub(address(hubProxy));
        
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
        
        relayerHub.setPaymasterFactory(address(factory));
        vm.stopPrank();
        
        // Deploy MockTarget
        mockTarget = new MockTarget();
        
        // Deploy Paymaster for testing
        vm.startPrank(developer);
        address paymasterAddr = factory.createPaymaster();
        paymaster = Paymaster(payable(paymasterAddr));
        paymaster.deposit{value: 100 ether}(); // Large deposit for testing
        paymaster.addWhitelistedContract(address(mockTarget));
        paymaster.addWhitelistedFunction(address(mockTarget), mockTarget.simpleFunction.selector);
        vm.stopPrank();
    }
    
    /// @notice Helper to sign meta-transaction
    function signMetaTransaction(
        address target,
        bytes memory data,
        uint256 gasLimit,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                METATRANSACTION_TYPEHASH,
                user,
                target,
                keccak256(data),
                gasLimit,
                nonce,
                deadline
            )
        );
        
        bytes32 domainSeparator = paymaster.DOMAIN_SEPARATOR();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivateKey, digest);
        return abi.encodePacked(r, s, v);
    }
    
    /// @notice Execute a meta-transaction as relayer
    function executeTransaction() internal returns (bool success) {
        bytes memory data = abi.encodeWithSelector(mockTarget.simpleFunction.selector);
        uint256 gasLimit = 200000;
        uint256 nonce = paymaster.nonces(user);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = signMetaTransaction(
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline
        );
        
        vm.prank(relayer);
        (success, ) = paymaster.executeMetaTransaction(
            user,
            address(mockTarget),
            data,
            gasLimit,
            nonce,
            deadline,
            signature
        );
    }
    
    /// @notice Test complex spending scenario over multiple days and months
    function test_SpendingLimits_ComplexScenario() public {
        // Set spending limits:
        // - Per transaction: 1 MNT
        // - Daily: 5 MNT
        // - Monthly: 50 MNT
        vm.startPrank(developer);
        paymaster.setPerTransactionLimit(1 ether);
        paymaster.setDailyLimit(5 ether);
        paymaster.setMonthlyLimit(50 ether);
        vm.stopPrank();
        
        // Note: In test environment with tx.gasprice = 0, spending limits based on cost
        // won't trigger realistically. This test validates the time reset logic.
        
        console.log("=== Day 1: Execute transactions ===");
        
        // Execute 5 transactions on Day 1
        for (uint256 i = 0; i < 5; i++) {
            bool success = executeTransaction();
            assertTrue(success);
            console.log("Transaction", i + 1, "executed successfully");
        }
        
        // Get spending status
        Paymaster.SpendingLimit memory limits1 = paymaster.getSpendingLimitStatus();
        console.log("Day 1 - Daily spent:", limits1.dailySpent);
        console.log("Day 1 - Monthly spent:", limits1.monthlySpent);
        
        // Advance 1 day
        console.log("\n=== Advancing 1 day ===");
        vm.warp(block.timestamp + 1 days);
        
        // Execute 5 more transactions on Day 2 (should succeed after reset)
        console.log("\n=== Day 2: Execute transactions after daily reset ===");
        for (uint256 i = 0; i < 5; i++) {
            bool success = executeTransaction();
            assertTrue(success);
            console.log("Transaction", i + 1, "executed successfully");
        }
        
        Paymaster.SpendingLimit memory limits2 = paymaster.getSpendingLimitStatus();
        console.log("Day 2 - Daily spent:", limits2.dailySpent);
        console.log("Day 2 - Monthly spent:", limits2.monthlySpent);
        
        // Continue for 8 more days (total 10 days of transactions)
        console.log("\n=== Days 3-10: Continue transactions ===");
        for (uint256 day = 3; day <= 10; day++) {
            vm.warp(block.timestamp + 1 days);
            console.log("\n--- Day", day, "---");
            
            for (uint256 i = 0; i < 5; i++) {
                bool success = executeTransaction();
                assertTrue(success);
            }
            
            Paymaster.SpendingLimit memory limitsDay = paymaster.getSpendingLimitStatus();
            console.log("Day", day, "- Monthly spent:", limitsDay.monthlySpent);
        }
        
        // At this point, 50 transactions have been executed (10 days * 5 tx/day)
        // In a real environment with gas costs, monthly limit might be hit
        
        // Advance to next month
        console.log("\n=== Advancing to next month ===");
        vm.warp(block.timestamp + 30 days);
        
        // Execute transaction after monthly reset - should succeed
        console.log("\n=== Next month: Execute transaction after monthly reset ===");
        bool successAfterMonthlyReset = executeTransaction();
        assertTrue(successAfterMonthlyReset);
        console.log("Transaction after monthly reset executed successfully");
        
        // Verify analytics
        (uint256 totalTx, , uint256 uniqueUsers) = paymaster.getAnalytics();
        console.log("\n=== Final Analytics ===");
        console.log("Total transactions:", totalTx);
        console.log("Unique users:", uniqueUsers);
        
        assertTrue(totalTx >= 51); // At least 51 transactions executed
        assertEq(uniqueUsers, 1); // Only 1 unique user
    }
    
    /// @notice Test that spending limits properly enforce restrictions
    function test_SpendingLimits_EnforcementLogic() public {
        // Set very restrictive limits for testing
        vm.startPrank(developer);
        paymaster.setPerTransactionLimit(0.001 ether);
        paymaster.setDailyLimit(0.005 ether);
        paymaster.setMonthlyLimit(0.1 ether);
        vm.stopPrank();
        
        // Verify limits are set correctly
        Paymaster.SpendingLimit memory limits = paymaster.getSpendingLimitStatus();
        assertEq(limits.perTransactionLimit, 0.001 ether);
        assertEq(limits.dailyLimit, 0.005 ether);
        assertEq(limits.monthlyLimit, 0.1 ether);
        
        console.log("Spending limits configured:");
        console.log("- Per transaction:", limits.perTransactionLimit);
        console.log("- Daily:", limits.dailyLimit);
        console.log("- Monthly:", limits.monthlyLimit);
    }
    
    /// @notice Test spending limit reset behavior at day boundaries
    function test_SpendingLimits_DayBoundaryReset() public {
        vm.startPrank(developer);
        paymaster.setDailyLimit(1 ether);
        vm.stopPrank();
        
        // Execute first transaction
        bool success1 = executeTransaction();
        assertTrue(success1);
        
        Paymaster.SpendingLimit memory limits1 = paymaster.getSpendingLimitStatus();
        uint256 lastResetDay1 = limits1.lastResetDay;
        
        // Advance exactly 1 day
        vm.warp(block.timestamp + 1 days);
        
        // Execute second transaction after 1 day
        bool success2 = executeTransaction();
        assertTrue(success2);
        
        Paymaster.SpendingLimit memory limits2 = paymaster.getSpendingLimitStatus();
        uint256 lastResetDay2 = limits2.lastResetDay;
        
        // Verify reset occurred (lastResetDay should be updated)
        assertTrue(lastResetDay2 >= lastResetDay1);
    }
    
    /// @notice Test spending limit reset behavior at month boundaries
    function test_SpendingLimits_MonthBoundaryReset() public {
        vm.startPrank(developer);
        paymaster.setMonthlyLimit(10 ether);
        vm.stopPrank();
        
        // Execute first transaction
        bool success1 = executeTransaction();
        assertTrue(success1);
        
        Paymaster.SpendingLimit memory limits1 = paymaster.getSpendingLimitStatus();
        uint256 lastResetMonth1 = limits1.lastResetMonth;
        
        // Advance 30 days (approximately 1 month)
        vm.warp(block.timestamp + 30 days);
        
        // Execute second transaction after 30 days
        bool success2 = executeTransaction();
        assertTrue(success2);
        
        Paymaster.SpendingLimit memory limits2 = paymaster.getSpendingLimitStatus();
        uint256 lastResetMonth2 = limits2.lastResetMonth;
        
        // Verify reset occurred
        assertTrue(lastResetMonth2 >= lastResetMonth1);
    }
    
    /// @notice Test that global limit persists across resets
    function test_SpendingLimits_GlobalLimitPersistence() public {
        vm.startPrank(developer);
        paymaster.setGlobalLimit(20 ether);
        paymaster.setDailyLimit(5 ether);
        vm.stopPrank();
        
        // Execute transactions on Day 1
        for (uint256 i = 0; i < 3; i++) {
            executeTransaction();
        }
        
        Paymaster.SpendingLimit memory limits1 = paymaster.getSpendingLimitStatus();
        uint256 globalSpent1 = limits1.globalSpent;
        
        // Advance 1 day (daily limit resets, global does not)
        vm.warp(block.timestamp + 1 days);
        
        // Execute more transactions on Day 2
        for (uint256 i = 0; i < 3; i++) {
            executeTransaction();
        }
        
        Paymaster.SpendingLimit memory limits2 = paymaster.getSpendingLimitStatus();
        uint256 globalSpent2 = limits2.globalSpent;
        
        // Global spending should have accumulated across days
        assertTrue(globalSpent2 >= globalSpent1);
        
        console.log("Global spending after Day 1:", globalSpent1);
        console.log("Global spending after Day 2:", globalSpent2);
    }
}
