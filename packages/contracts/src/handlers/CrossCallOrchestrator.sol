// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/BaseReactiveHandler.sol";

/**
 * @title CrossCallOrchestrator
 * @notice Queues and executes external calls atomically
 * @dev Allows batching multiple calls triggered by a single reactive event
 */
contract CrossCallOrchestrator is BaseReactiveHandler {
    // ============================================================================
    // STRUCTS
    // ============================================================================

    struct Call {
        address target;
        bytes data;
        bool executed;
        bool success;
        bytes result;
    }

    // ============================================================================
    // STATE
    // ============================================================================

    /// @notice Queue of pending calls
    Call[] public callQueue;

    /// @notice Maximum calls allowed in queue
    uint256 public maxQueueSize;

    /// @notice Total calls executed
    uint256 public totalExecuted;

    /// @notice Total calls failed
    uint256 public totalFailed;

    /// @notice Whether to revert on single call failure
    bool public batchFailureMode;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event MaxQueueSizeUpdated(uint256 newSize);
    event BatchFailureModeUpdated(bool newMode);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize the orchestrator
     * @param _maxQueueSize Maximum calls in queue
     */
    constructor(uint256 _maxQueueSize) {
        require(_maxQueueSize > 0, "Queue size must be positive");
        maxQueueSize = _maxQueueSize;
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Enqueue a call for execution
     * @param target Target contract address
     * @param data Encoded call data
     */
    function enqueueCall(address target, bytes calldata data) external onlyOwner {
        require(target != address(0), "Invalid target");
        require(callQueue.length < maxQueueSize, "Queue full");

        Call storage newCall = callQueue.push();
        newCall.target = target;
        newCall.data = data;
        newCall.executed = false;
        newCall.success = false;

        uint256 callIndex = callQueue.length - 1;
        emit CrossCallEnqueued(callIndex, target, data);
    }

    /**
     * @notice Update maximum queue size
     * @param _newSize New maximum size
     */
    function setMaxQueueSize(uint256 _newSize) external onlyOwner {
        require(_newSize > 0, "Size must be positive");
        maxQueueSize = _newSize;
        emit MaxQueueSizeUpdated(_newSize);
    }

    /**
     * @notice Update batch failure mode
     * @param _failureMode Whether to fail entire batch on single failure
     */
    function setBatchFailureMode(bool _failureMode) external onlyOwner {
        batchFailureMode = _failureMode;
        emit BatchFailureModeUpdated(_failureMode);
    }

    /**
     * @notice Clear the call queue
     */
    function clearQueue() external onlyOwner {
        delete callQueue;
    }

    /**
     * @notice Manually execute all queued calls
     * @return executed Number of successful executions
     * @return failed Number of failures
     */
    function executeQueuedCalls()
        external
        onlyOwner
        nonReentrant
        returns (uint256 executed, uint256 failed)
    {
        return _executeAllCalls();
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Handle reactive event and execute queued calls
     * @param eventData Event data from Somnia reactive network
     */
    function _onEvent(bytes memory eventData) internal override nonReentrant gasLimitCheck(150000) {
        if (callQueue.length == 0) {
            emit ReactiveExecution("empty_queue", false);
            _emitSuccess("queue_empty");
            return;
        }

        (uint256 executed, uint256 failed) = _executeAllCalls();

        if (failed == 0) {
            emit ReactiveExecution("all_calls_executed", true);
            _emitSuccess("all_calls_succeeded");
        } else if (executed > 0) {
            emit ReactiveExecution("partial_execution", true);
            _emitError(
                abi.encode("partial_execution", executed, failed)
            );
        } else {
            emit ReactiveExecution("all_calls_failed", false);
            _emitError(abi.encode("all_calls_failed", failed));
        }
    }

    /**
     * @notice Execute all queued calls
     * @return executed Number of successful calls
     * @return failed Number of failed calls
     */
    function _executeAllCalls()
        internal
        returns (uint256 executed, uint256 failed)
    {
        uint256 length = callQueue.length;

        for (uint256 i = 0; i < length; i++) {
            Call storage call = callQueue[i];

            if (call.executed) continue; // Skip already executed calls

            (bool success, bytes memory result) = call.target.call(call.data);

            call.executed = true;
            call.success = success;
            call.result = result;

            if (success) {
                executed++;
                totalExecuted++;
                emit ReactiveExecution(
                    string(abi.encodePacked("call_", _uint2str(i), "_succeeded")),
                    true
                );
            } else {
                failed++;
                totalFailed++;
                emit ReactiveExecution(
                    string(abi.encodePacked("call_", _uint2str(i), "_failed")),
                    false
                );

                if (batchFailureMode) {
                    revert("Batch execution failed");
                }
            }
        }

        emit CrossCallsExecuted(executed, failed);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @notice Get queue length
     * @return uint256 Number of calls in queue
     */
    function getQueueLength() external view returns (uint256) {
        return callQueue.length;
    }

    /**
     * @notice Get call at index
     * @param index Queue index
     * @return call The call data
     */
    function getCall(uint256 index)
        external
        view
        returns (Call memory call)
    {
        require(index < callQueue.length, "Index out of bounds");
        return callQueue[index];
    }

    /**
     * @notice Get execution stats
     * @return executed Total executed
     * @return failed Total failed
     */
    function getStats() external view returns (uint256 executed, uint256 failed) {
        return (totalExecuted, totalFailed);
    }

    // ============================================================================
    // INTERNAL HELPERS
    // ============================================================================

    /**
     * @notice Convert uint to string
     * @param value Value to convert
     * @return str Result string
     */
    function _uint2str(uint256 value) internal pure returns (string memory str) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
