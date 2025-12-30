// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {RelayerHub} from "../../src/core/RelayerHub.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title RelayerHubTest
 * @notice Comprehensive unit tests for RelayerHub contract
 * @dev Tests deployment, relayer management, configuration, and upgrades
 */
contract RelayerHubTest is Test {
    // Contracts
    RelayerHub public implementation;
    RelayerHub public hub;
    
    // Test accounts
    address public owner;
    address public user1;
    address public user2;
    address public relayer1;
    address public relayer2;
    address public factory;
    
    // Events to test
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    event PaymasterFactoryUpdated(address indexed oldFactory, address indexed newFactory);
    event PlatformFeeUpdated(uint256 feePercentage, address feeRecipient);
    event PlatformFeeEnabled();
    event PlatformFeeDisabled();
    event SystemConfigUpdated(string parameter, uint256 value);

    function setUp() public {
        // Create test accounts
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        relayer1 = makeAddr("relayer1");
        relayer2 = makeAddr("relayer2");
        factory = makeAddr("factory");
        
        // Deploy implementation
        implementation = new RelayerHub();
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            RelayerHub.initialize.selector,
            owner
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        
        hub = RelayerHub(address(proxy));
    }

    // ============================================
    // DEPLOYMENT TESTS
    // ============================================

    function test_Deployment() public view {
        // Verify owner is set correctly
        assertEq(hub.owner(), owner);
        
        // Verify default configuration
        assertEq(hub.minPaymasterBalance(), 0.1 ether);
        assertEq(hub.maxGasLimit(), 10_000_000);
        
        // Verify no relayers approved initially
        address[] memory relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 0);
        
        // Verify platform fee disabled initially
        RelayerHub.PlatformFee memory fee = hub.platformFee();
        assertEq(fee.feePercentage, 0);
        assertEq(fee.feeRecipient, address(0));
        assertFalse(fee.enabled);
    }

    // ============================================
    // RELAYER MANAGEMENT TESTS
    // ============================================

    function test_AddRelayer() public {
        // Expect event
        vm.expectEmit(true, false, false, false);
        emit RelayerAdded(relayer1);
        
        // Add relayer as owner
        vm.prank(owner);
        hub.addRelayer(relayer1);
        
        // Verify relayer is approved
        assertTrue(hub.isApprovedRelayer(relayer1));
        
        // Verify relayer in list
        address[] memory relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 1);
        assertEq(relayers[0], relayer1);
    }

    function test_AddRelayer_Multiple() public {
        vm.startPrank(owner);
        
        // Add multiple relayers
        hub.addRelayer(relayer1);
        hub.addRelayer(relayer2);
        
        vm.stopPrank();
        
        // Verify both are approved
        assertTrue(hub.isApprovedRelayer(relayer1));
        assertTrue(hub.isApprovedRelayer(relayer2));
        
        // Verify list contains both
        address[] memory relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 2);
    }

    function test_AddRelayer_RevertIf_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        hub.addRelayer(relayer1);
    }

    function test_AddRelayer_RevertIf_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert();
        hub.addRelayer(address(0));
    }

    function test_AddRelayer_RevertIf_AlreadyAdded() public {
        vm.startPrank(owner);
        
        // Add relayer first time
        hub.addRelayer(relayer1);
        
        // Try to add again - should revert
        vm.expectRevert();
        hub.addRelayer(relayer1);
        
        vm.stopPrank();
    }

    function test_RemoveRelayer() public {
        // Setup: Add relayer first
        vm.startPrank(owner);
        hub.addRelayer(relayer1);
        
        // Verify added
        assertTrue(hub.isApprovedRelayer(relayer1));
        
        // Expect event
        vm.expectEmit(true, false, false, false);
        emit RelayerRemoved(relayer1);
        
        // Remove relayer
        hub.removeRelayer(relayer1);
        vm.stopPrank();
        
        // Verify removed
        assertFalse(hub.isApprovedRelayer(relayer1));
        
        // Verify list is empty
        address[] memory relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 0);
    }

    function test_RemoveRelayer_FromMultiple() public {
        vm.startPrank(owner);
        
        // Add multiple relayers
        hub.addRelayer(relayer1);
        hub.addRelayer(relayer2);
        
        // Remove one
        hub.removeRelayer(relayer1);
        
        vm.stopPrank();
        
        // Verify only relayer2 remains
        assertFalse(hub.isApprovedRelayer(relayer1));
        assertTrue(hub.isApprovedRelayer(relayer2));
        
        address[] memory relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 1);
        assertEq(relayers[0], relayer2);
    }

    function test_RemoveRelayer_RevertIf_NotOwner() public {
        // Setup: Add relayer
        vm.prank(owner);
        hub.addRelayer(relayer1);
        
        // Try to remove as non-owner
        vm.prank(user1);
        vm.expectRevert();
        hub.removeRelayer(relayer1);
    }

    function test_RemoveRelayer_RevertIf_NotApproved() public {
        vm.prank(owner);
        vm.expectRevert();
        hub.removeRelayer(relayer1);
    }

    function test_IsApprovedRelayer() public {
        // Initially not approved
        assertFalse(hub.isApprovedRelayer(relayer1));
        
        // Add relayer
        vm.prank(owner);
        hub.addRelayer(relayer1);
        
        // Now approved
        assertTrue(hub.isApprovedRelayer(relayer1));
    }

    function test_GetApprovedRelayers() public {
        // Initially empty
        address[] memory relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 0);
        
        // Add relayers
        vm.startPrank(owner);
        hub.addRelayer(relayer1);
        hub.addRelayer(relayer2);
        vm.stopPrank();
        
        // Get list
        relayers = hub.getApprovedRelayers();
        assertEq(relayers.length, 2);
    }

    // ============================================
    // FACTORY MANAGEMENT TESTS
    // ============================================

    function test_SetPaymasterFactory() public {
        // Expect event
        vm.expectEmit(true, true, false, false);
        emit PaymasterFactoryUpdated(address(0), factory);
        
        // Set factory as owner
        vm.prank(owner);
        hub.setPaymasterFactory(factory);
        
        // Verify factory is set
        assertEq(hub.paymasterFactory(), factory);
    }

    function test_SetPaymasterFactory_Update() public {
        vm.startPrank(owner);
        
        // Set initial factory
        hub.setPaymasterFactory(factory);
        
        // Update to new factory
        address newFactory = makeAddr("newFactory");
        
        vm.expectEmit(true, true, false, false);
        emit PaymasterFactoryUpdated(factory, newFactory);
        
        hub.setPaymasterFactory(newFactory);
        
        vm.stopPrank();
        
        // Verify new factory is set
        assertEq(hub.paymasterFactory(), newFactory);
    }

    function test_SetPaymasterFactory_RevertIf_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        hub.setPaymasterFactory(factory);
    }

    function test_SetPaymasterFactory_RevertIf_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert();
        hub.setPaymasterFactory(address(0));
    }

    // ============================================
    // PLATFORM FEE TESTS
    // ============================================

    function test_SetPlatformFee() public {
        address feeRecipient = makeAddr("feeRecipient");
        uint256 feePercentage = 250; // 2.5%
        
        // Expect event
        vm.expectEmit(false, false, false, true);
        emit PlatformFeeUpdated(feePercentage, feeRecipient);
        
        // Set platform fee
        vm.prank(owner);
        hub.setPlatformFee(feePercentage, feeRecipient);
        
        // Verify fee is set
        RelayerHub.PlatformFee memory fee = hub.platformFee();
        assertEq(fee.feePercentage, feePercentage);
        assertEq(fee.feeRecipient, feeRecipient);
        assertFalse(fee.enabled); // Not enabled yet
    }

    function test_SetPlatformFee_Maximum() public {
        address feeRecipient = makeAddr("feeRecipient");
        uint256 feePercentage = 10000; // 100% (maximum)
        
        vm.prank(owner);
        hub.setPlatformFee(feePercentage, feeRecipient);
        
        RelayerHub.PlatformFee memory fee = hub.platformFee();
        assertEq(fee.feePercentage, feePercentage);
    }

    function test_SetPlatformFee_RevertIf_TooHigh() public {
        address feeRecipient = makeAddr("feeRecipient");
        uint256 feePercentage = 10001; // > 100%
        
        vm.prank(owner);
        vm.expectRevert();
        hub.setPlatformFee(feePercentage, feeRecipient);
    }

    function test_SetPlatformFee_RevertIf_ZeroRecipient() public {
        vm.prank(owner);
        vm.expectRevert();
        hub.setPlatformFee(250, address(0));
    }

    function test_SetPlatformFee_RevertIf_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        hub.setPlatformFee(250, user1);
    }

    function test_EnablePlatformFee() public {
        // Setup: Set platform fee first
        vm.startPrank(owner);
        hub.setPlatformFee(250, user1);
        
        // Expect event
        vm.expectEmit(false, false, false, false);
        emit PlatformFeeEnabled();
        
        // Enable fee
        hub.enablePlatformFee();
        vm.stopPrank();
        
        // Verify fee is enabled
        RelayerHub.PlatformFee memory fee = hub.platformFee();
        assertTrue(fee.enabled);
    }

    function test_DisablePlatformFee() public {
        // Setup: Enable fee first
        vm.startPrank(owner);
        hub.setPlatformFee(250, user1);
        hub.enablePlatformFee();
        
        // Verify enabled
        RelayerHub.PlatformFee memory fee1 = hub.platformFee();
        assertTrue(fee1.enabled);
        
        // Expect event
        vm.expectEmit(false, false, false, false);
        emit PlatformFeeDisabled();
        
        // Disable fee
        hub.disablePlatformFee();
        vm.stopPrank();
        
        // Verify fee is disabled
        RelayerHub.PlatformFee memory fee2 = hub.platformFee();
        assertFalse(fee2.enabled);
    }

    function test_EnableDisablePlatformFee() public {
        vm.startPrank(owner);
        hub.setPlatformFee(250, user1);
        
        // Enable
        hub.enablePlatformFee();
        RelayerHub.PlatformFee memory fee1 = hub.platformFee();
        assertTrue(fee1.enabled);
        
        // Disable
        hub.disablePlatformFee();
        RelayerHub.PlatformFee memory fee2 = hub.platformFee();
        assertFalse(fee2.enabled);
        
        // Enable again
        hub.enablePlatformFee();
        RelayerHub.PlatformFee memory fee3 = hub.platformFee();
        assertTrue(fee3.enabled);
        
        vm.stopPrank();
    }

    // ============================================
    // SYSTEM CONFIGURATION TESTS
    // ============================================

    function test_SetMinPaymasterBalance() public {
        uint256 newBalance = 1 ether;
        
        // Expect event
        vm.expectEmit(false, false, false, true);
        emit SystemConfigUpdated("minPaymasterBalance", newBalance);
        
        // Set min balance
        vm.prank(owner);
        hub.setMinPaymasterBalance(newBalance);
        
        // Verify balance is set
        assertEq(hub.minPaymasterBalance(), newBalance);
    }

    function test_SetMinPaymasterBalance_Zero() public {
        vm.prank(owner);
        hub.setMinPaymasterBalance(0);
        
        assertEq(hub.minPaymasterBalance(), 0);
    }

    function test_SetMinPaymasterBalance_RevertIf_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        hub.setMinPaymasterBalance(1 ether);
    }

    function test_SetMaxGasLimit() public {
        uint256 newLimit = 20_000_000;
        
        // Expect event
        vm.expectEmit(false, false, false, true);
        emit SystemConfigUpdated("maxGasLimit", newLimit);
        
        // Set max gas
        vm.prank(owner);
        hub.setMaxGasLimit(newLimit);
        
        // Verify limit is set
        assertEq(hub.maxGasLimit(), newLimit);
    }

    function test_SetMaxGasLimit_RevertIf_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        hub.setMaxGasLimit(20_000_000);
    }

    // ============================================
    // OWNERSHIP TESTS
    // ============================================

    function test_TransferOwnership_TwoStep() public {
        address newOwner = makeAddr("newOwner");
        
        // Step 1: Initiate transfer
        vm.prank(owner);
        hub.transferOwnership(newOwner);
        
        // Verify pending owner is set
        assertEq(hub.pendingOwner(), newOwner);
        
        // Verify current owner unchanged
        assertEq(hub.owner(), owner);
        
        // Step 2: Accept ownership
        vm.prank(newOwner);
        hub.acceptOwnership();
        
        // Verify ownership transferred
        assertEq(hub.owner(), newOwner);
        assertEq(hub.pendingOwner(), address(0));
    }

    function test_TransferOwnership_RevertIf_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        hub.transferOwnership(user2);
    }

    function test_AcceptOwnership_RevertIf_NotPendingOwner() public {
        address newOwner = makeAddr("newOwner");
        
        // Initiate transfer
        vm.prank(owner);
        hub.transferOwnership(newOwner);
        
        // Try to accept as wrong address
        vm.prank(user1);
        vm.expectRevert();
        hub.acceptOwnership();
    }

    // ============================================
    // UPGRADE TESTS
    // ============================================

    function test_Upgrade() public {
        // Deploy new implementation
        RelayerHub newImplementation = new RelayerHub();
        
        // Upgrade as owner
        vm.prank(owner);
        hub.upgradeToAndCall(address(newImplementation), "");
        
        // Verify upgrade succeeded (proxy still works)
        assertEq(hub.owner(), owner);
    }

    function test_Upgrade_RevertIf_NotOwner() public {
        RelayerHub newImplementation = new RelayerHub();
        
        vm.prank(user1);
        vm.expectRevert();
        hub.upgradeToAndCall(address(newImplementation), "");
    }

    // ============================================
    // INTEGRATION TESTS
    // ============================================

    function test_CompleteSetup() public {
        vm.startPrank(owner);
        
        // Add relayers
        hub.addRelayer(relayer1);
        hub.addRelayer(relayer2);
        
        // Set factory
        hub.setPaymasterFactory(factory);
        
        // Configure platform fee
        hub.setPlatformFee(250, user1);
        hub.enablePlatformFee();
        
        // Set system configuration
        hub.setMinPaymasterBalance(1 ether);
        hub.setMaxGasLimit(20_000_000);
        
        vm.stopPrank();
        
        // Verify all settings
        assertTrue(hub.isApprovedRelayer(relayer1));
        assertTrue(hub.isApprovedRelayer(relayer2));
        assertEq(hub.paymasterFactory(), factory);
        
        RelayerHub.PlatformFee memory fee = hub.platformFee();
        assertEq(fee.feePercentage, 250);
        assertEq(fee.feeRecipient, user1);
        assertTrue(fee.enabled);
        
        assertEq(hub.minPaymasterBalance(), 1 ether);
        assertEq(hub.maxGasLimit(), 20_000_000);
    }
}
