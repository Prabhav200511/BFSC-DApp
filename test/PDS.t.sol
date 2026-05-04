// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "forge-std/Test.sol";
import "../src/contracts/PDS.sol";

contract PDSTest is Test {
    PDS public pds;

    address public creator = address(1);
    address public stateAdmin = address(2);
    address public districtAdmin = address(3);
    address public shopAccount = address(4);
    address public consumerAccount = address(5);
    address public deliveryAgent = address(6);
    address public unauthorizedUser = address(7);

    function setUp() public {
        // Deploy as creator
        vm.prank(creator);
        pds = new PDS(50); // quantity of bag
    }

    // ==========================================
    // PART A: UNIT TESTS (Access Control)
    // ==========================================

    function test_Unit_AddStateAdmin() public {
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        assertTrue(pds.stateAdmin(stateAdmin), "State admin should be added");
    }

    function test_Unit_AddStateAdmin_RevertUnauthorized() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert("Error: Caller is not the Creator");
        pds.addStateAdmins(stateAdmin);
    }

    function test_Unit_AddDistrictAdmin() public {
        // Setup state admin
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);

        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);
        assertTrue(pds.districtAdmin(districtAdmin), "District admin should be added");
    }

    // ==========================================
    // PART B: INTEGRATION TESTS (Full Workflow)
    // ==========================================

    function test_Integration_FullWorkflow() public {
        // 1. Setup Admins
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);

        // 2. Setup Shop and Consumer
        vm.prank(districtAdmin);
        pds.addShops(100, "Test Shop", shopAccount, "Test Loc");
        vm.prank(districtAdmin);
        pds.addConsumer(consumerAccount);

        // 3. Add Items & Bags
        vm.prank(stateAdmin);
        pds.addItems(1, "Rice", 30);
        vm.prank(stateAdmin);
        pds.addBags(1001, 1, 100);

        // 4. Transfer & Receive Bags
        uint256[] memory bagIds = new uint256[](1);
        bagIds[0] = 1001;
        
        vm.prank(stateAdmin);
        pds.transferedBags(1, 100, bagIds);
        assertEq(pds.transfersCount(), 1, "Transfer count should increment");

        vm.prank(shopAccount);
        pds.receivedBags(1, 100, bagIds);
        assertEq(pds.receivedCount(), 1, "Received count should increment");

        // 5. Make Order
        uint256[] memory itemIds = new uint256[](1);
        itemIds[0] = 1;
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 5;

        vm.prank(shopAccount);
        pds.orderMade(consumerAccount, 100, itemIds, quantities);
        assertEq(pds.ordersCount(), 1, "Order count should increment");

        vm.prank(consumerAccount);
        pds.placeConsumerOrder(100, itemIds, quantities);
        assertEq(pds.consumerRequestsCount(), 1, "Consumer request count should increment");
    }

    function test_Integration_ConsumerPlacesOwnOrderRequest() public {
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);
        vm.prank(districtAdmin);
        pds.addShops(100, "Test Shop", shopAccount, "Test Loc");
        vm.prank(districtAdmin);
        pds.addConsumer(consumerAccount);
        vm.prank(stateAdmin);
        pds.addItems(1, "Rice", 30);

        uint256[] memory itemIds = new uint256[](1);
        itemIds[0] = 1;
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 5;

        vm.prank(consumerAccount);
        pds.placeConsumerOrder(100, itemIds, quantities);

        assertEq(pds.consumerRequestsCount(), 1, "Consumer request count should increment");
    }

    function test_Integration_ConsumerOrderRequestRevertsWhenUnregistered() public {
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);
        vm.prank(districtAdmin);
        pds.addShops(100, "Test Shop", shopAccount, "Test Loc");
        vm.prank(stateAdmin);
        pds.addItems(1, "Rice", 30);

        uint256[] memory itemIds = new uint256[](1);
        itemIds[0] = 1;
        uint256[] memory quantities = new uint256[](1);
        quantities[0] = 5;

        vm.prank(unauthorizedUser);
        vm.expectRevert("Error: Caller is not a registered Consumer");
        pds.placeConsumerOrder(100, itemIds, quantities);
    }

    function test_Integration_DeliveryAgentWorkflow() public {
        // Setup Admins & Shop
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);
        vm.prank(districtAdmin);
        pds.addShops(100, "Test Shop", shopAccount, "Test Loc");

        // Add Delivery Agent
        vm.prank(stateAdmin);
        pds.addDeliveryAgent(deliveryAgent);

        // Assign Pickup
        uint256[] memory bagIds = new uint256[](1);
        bagIds[0] = 1001;
        vm.prank(stateAdmin);
        pds.assignRationPickup(deliveryAgent, 100, bagIds);

        uint256 pickupId = pds.nextPickupId();

        // Agent Picks Up
        vm.prank(deliveryAgent);
        pds.markRationPickedUp(pickupId);

        // Agent Delivers
        vm.prank(deliveryAgent);
        pds.markRationDelivered(pickupId);

        // Shop Confirms
        vm.prank(shopAccount);
        pds.confirmRationReceipt(pickupId);

        // Check final status
        (,,, PDS.PickupStatus status,) = pds.rationPickups(pickupId);
        assertTrue(status == PDS.PickupStatus.Confirmed, "Pickup should be confirmed");
    }

    // ==========================================
    // PART C: FUZZ TESTING (Property-Based)
    // ==========================================

    function testFuzz_UpdateShopInventory(uint256 randomQuantity) public {
        // Setup Shop and Item
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);
        vm.prank(districtAdmin);
        pds.addShops(100, "Test Shop", shopAccount, "Test Loc");
        vm.prank(stateAdmin);
        pds.addItems(1, "Rice", 30);

        // Fuzzing the update quantity
        vm.prank(shopAccount);
        pds.updateShopInventory(100, 1, randomQuantity);

        assertEq(pds.shopInventory(100, 1), randomQuantity, "Inventory mismatch after fuzzed update");
    }

    function testFuzz_OrderMadeRevertsMismatchedArrays(
        uint256[] calldata itemIds, 
        uint256[] calldata quantities
    ) public {
        // Assume mismatched lengths
        vm.assume(itemIds.length != quantities.length);

        // Setup Shop and Consumer
        vm.prank(creator);
        pds.addStateAdmins(stateAdmin);
        vm.prank(stateAdmin);
        pds.addDistrictAdmins(districtAdmin);
        vm.prank(districtAdmin);
        pds.addShops(100, "Test Shop", shopAccount, "Test Loc");
        vm.prank(districtAdmin);
        pds.addConsumer(consumerAccount);

        // Expect revert due to invariant: Lengths must match
        vm.prank(shopAccount);
        vm.expectRevert("Error: Item IDs and quantities must have the same length");
        pds.orderMade(consumerAccount, 100, itemIds, quantities);
    }
}
