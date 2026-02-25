// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/handlers/CrossCallOrchestrator.sol";

// Mock target contract
contract MockTarget {
    uint256 public callCount;
    bool public shouldFail;

    function doSomething() external {
        if (shouldFail) revert("Call failed");
        callCount++;
    }
}

/**
 * @title CrossCallOrchestratorTest
 * @notice Tests for CrossCallOrchestrator handler
 */
contract CrossCallOrchestratorTest is Test {
    CrossCallOrchestrator orchestrator;
    MockTarget target;
    address admin = address(0x1);

    function setUp() public {
        target = new MockTarget();
        vm.prank(admin);
        orchestrator = new CrossCallOrchestrator(10); // Max 10 calls
    }

    function testInitialConfiguration() public {
        assertEq(orchestrator.maxQueueSize(), 10);
        assertFalse(orchestrator.batchFailureMode());
        assertEq(orchestrator.getQueueLength(), 0);
    }

    function testEnqueueCall() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        orchestrator.enqueueCall(address(target), callData);

        assertEq(orchestrator.getQueueLength(), 1);
    }

    function testEnqueueMultipleCalls() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        for (uint256 i = 0; i < 5; i++) {
            orchestrator.enqueueCall(address(target), callData);
        }

        assertEq(orchestrator.getQueueLength(), 5);
    }

    function testSetMaxQueueSize() public {
        vm.prank(admin);
        orchestrator.setMaxQueueSize(20);
        assertEq(orchestrator.maxQueueSize(), 20);
    }

    function testSetBatchFailureMode() public {
        vm.prank(admin);
        orchestrator.setBatchFailureMode(true);
        assertTrue(orchestrator.batchFailureMode());
    }

    function testClearQueue() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        orchestrator.enqueueCall(address(target), callData);
        assertEq(orchestrator.getQueueLength(), 1);

        vm.prank(admin);
        orchestrator.clearQueue();
        assertEq(orchestrator.getQueueLength(), 0);
    }

    function testExecuteQueuedCalls() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        orchestrator.enqueueCall(address(target), callData);

        vm.prank(admin);
        (uint256 executed, uint256 failed) = orchestrator.executeQueuedCalls();
        
        assertEq(executed, 1);
        assertEq(failed, 0);
    }

    function testGetStats() public {
        (uint256 executed, uint256 failed) = orchestrator.getStats();
        assertEq(executed, 0);
        assertEq(failed, 0);
    }

    function testGetCall() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        orchestrator.enqueueCall(address(target), callData);

        CrossCallOrchestrator.Call memory call = orchestrator.getCall(0);
        assertEq(call.target, address(target));
        assertEq(call.data, callData);
        assertFalse(call.executed);
    }

    function testQueueFull() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        for (uint256 i = 0; i < 10; i++) {
            orchestrator.enqueueCall(address(target), callData);
        }

        // Next enqueue should fail
        vm.prank(admin);
        vm.expectRevert("Queue full");
        orchestrator.enqueueCall(address(target), callData);
    }

    function testInvalidTarget() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        vm.prank(admin);
        vm.expectRevert("Invalid target");
        orchestrator.enqueueCall(address(0), callData);
    }

    function testInvalidMaxQueueSize() public {
        vm.prank(admin);
        vm.expectRevert("Size must be positive");
        orchestrator.setMaxQueueSize(0);
    }

    function testOnlyOwnerCanEnqueue() public {
        bytes memory callData = abi.encodeWithSignature("doSomething()");
        
        address user = address(0x2);
        vm.prank(user);
        vm.expectRevert("Only owner");
        orchestrator.enqueueCall(address(target), callData);
    }
}
