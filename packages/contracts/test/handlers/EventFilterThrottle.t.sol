// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/handlers/EventFilterThrottle.sol";

/**
 * @title EventFilterThrottleTest
 * @notice Tests for EventFilterThrottle handler
 */
contract EventFilterThrottleTest is Test {
    EventFilterThrottle throttle;
    address admin = address(0x1);

    function setUp() public {
        vm.prank(admin);
        throttle = new EventFilterThrottle(3600, 10);
    }

    function testInitialConfiguration() public {
        assertEq(throttle.windowSize(), 3600);
        assertEq(throttle.maxEventsPerWindow(), 10);
        assertEq(throttle.eventCount(), 0);
    }

    function testUpdateConfig() public {
        vm.prank(admin);
        throttle.updateThrottleConfig(7200, 20);

        assertEq(throttle.windowSize(), 7200);
        assertEq(throttle.maxEventsPerWindow(), 20);
    }

    function testResetCounter() public {
        vm.prank(admin);
        throttle.resetCounter();
        assertEq(throttle.eventCount(), 0);
    }

    function testTimeUntilWindowExpires() public {
        uint256 timeRemaining = throttle.timeUntilWindowExpires();
        assertLe(timeRemaining, throttle.windowSize());
        assertGt(timeRemaining, 0);
    }

    function testWindowExpiration() public {
        // Fast forward past window
        vm.warp(block.timestamp + 3601);
        
        uint256 timeRemaining = throttle.timeUntilWindowExpires();
        assertEq(timeRemaining, 0);
    }

    function testWouldThrottle() public {
        // Check with event below threshold
        bool throttled = throttle.wouldThrottle(5);
        assertFalse(throttled);

        // Check with event above threshold
        throttled = throttle.wouldThrottle(15);
        assertTrue(throttled);
    }

    function testThrottleConfig() public {
        vm.expectRevert("Window size must be positive");
        vm.prank(admin);
        throttle.updateThrottleConfig(0, 10);

        vm.expectRevert("Max events must be positive");
        vm.prank(admin);
        throttle.updateThrottleConfig(3600, 0);
    }
}
