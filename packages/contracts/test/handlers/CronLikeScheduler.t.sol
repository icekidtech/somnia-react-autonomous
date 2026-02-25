// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/handlers/CronLikeScheduler.sol";

/**
 * @title CronLikeSchedulerTest
 * @notice Tests for CronLikeScheduler handler
 */
contract CronLikeSchedulerTest is Test {
    CronLikeScheduler scheduler;
    address admin = address(0x1);

    function setUp() public {
        vm.prank(admin);
        scheduler = new CronLikeScheduler(3600); // 1 hour interval
    }

    function testInitialConfiguration() public {
        assertEq(scheduler.executionInterval(), 3600);
        assertTrue(scheduler.isActive());
        assertEq(scheduler.executionsCount(), 0);
    }

    function testSetExecutionInterval() public {
        vm.prank(admin);
        scheduler.setExecutionInterval(7200);
        assertEq(scheduler.executionInterval(), 7200);
    }

    function testSetActive() public {
        vm.prank(admin);
        scheduler.setActive(false);
        assertFalse(scheduler.isActive());

        vm.prank(admin);
        scheduler.setActive(true);
        assertTrue(scheduler.isActive());
    }

    function testResetTimer() public {
        uint256 initialTime = scheduler.lastExecutionTime();
        
        vm.warp(block.timestamp + 1000);
        
        vm.prank(admin);
        scheduler.resetTimer();
        
        assertGt(scheduler.lastExecutionTime(), initialTime);
    }

    function testIsExecutionDue() public {
        // Initially not due (just started)
        assertFalse(scheduler.isExecutionDue());

        // Fast forward past interval
        vm.warp(block.timestamp + 3601);
        assertTrue(scheduler.isExecutionDue());
    }

    function testTimeUntilNextExecution() public {
        uint256 timeRemaining = scheduler.timeUntilNextExecution();
        assertLe(timeRemaining, 3600);
        assertGt(timeRemaining, 0);
    }

    function testGetNextExecutionTime() public {
        uint256 nextTime = scheduler.getNextExecutionTime();
        assertGt(nextTime, block.timestamp);
    }

    function testGetExecutionProgress() public {
        uint256 progress = scheduler.getExecutionProgress();
        assertLe(progress, 100);
        assertGe(progress, 0);

        // Fast forward halfway
        vm.warp(block.timestamp + 1800);
        progress = scheduler.getExecutionProgress();
        assertAlmostEq(progress, 50, 1); // Allow 1% margin
    }

    function testInactiveScheduler() public {
        vm.prank(admin);
        scheduler.setActive(false);
        assertFalse(scheduler.isExecutionDue());
    }

    function testInvalidInterval() public {
        vm.expectRevert("Interval must be positive");
        vm.prank(admin);
        scheduler.setExecutionInterval(0);
    }

    function assertAlmostEq(uint256 a, uint256 b, uint256 tolerance) internal {
        uint256 diff = a > b ? a - b : b - a;
        assertLe(diff, tolerance);
    }
}
