// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/base/BaseReactiveHandler.sol";

// Test implementation of BaseReactiveHandler
contract MockHandler is BaseReactiveHandler {
    uint256 public eventCount;
    bytes public lastEventData;

    function _onEvent(bytes memory eventData) internal override {
        eventCount++;
        lastEventData = eventData;
        _emitSuccess("test_event");
    }
}

/**
 * @title BaseReactiveHandlerTest
 * @notice Tests for BaseReactiveHandler
 */
contract BaseReactiveHandlerTest is Test {
    MockHandler handler;
    address admin = address(0x2);

    function setUp() public {
        vm.prank(admin);
        handler = new MockHandler();
    }

    function testInitialState() public {
        assertEq(handler.owner(), admin);
        assertEq(handler.MIN_GAS_REQUIRED(), 5000);
    }

    function testOwnershipTransfer() public {
        address newOwner = address(0x3);
        vm.prank(admin);
        handler.transferOwnership(newOwner);
        assertEq(handler.owner(), newOwner);
    }

    function testOnlyOwnerCanTransfer() public {
        address user = address(0x1);
        vm.prank(user);
        vm.expectRevert(BaseReactiveHandler.Unauthorized.selector);
        handler.transferOwnership(address(0x4));
    }

    function testMinimumGasRequired() public {
        assertGe(handler.MIN_GAS_REQUIRED(), 5000);
    }
}
