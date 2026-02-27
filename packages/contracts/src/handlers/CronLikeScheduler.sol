// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/BaseReactiveHandler.sol";

/**
 * @title CronLikeScheduler
 * @notice Schedules execution at fixed intervals
 * @dev Tracks last execution time and executes only when interval elapses
 */
contract CronLikeScheduler is BaseReactiveHandler {
    // ============================================================================
    // STATE
    // ============================================================================

    /// @notice Minimum interval between executions
    uint256 public executionInterval;

    /// @notice Last execution timestamp
    uint256 public lastExecutionTime;

    /// @notice Total executions performed
    uint256 public executionsCount;

    /// @notice Whether scheduler is active
    bool public isActive;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event SchedulerConfigured(uint256 interval);
    event SchedulerStatusChanged(bool active);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize scheduler
     * @param _interval Interval between executions in seconds
     */
    constructor(uint256 _interval) {
        require(_interval > 0, "Interval must be positive");
        
        executionInterval = _interval;
        lastExecutionTime = block.timestamp;
        isActive = true;
        
        emit SchedulerConfigured(_interval);
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Update execution interval
     * @param _interval New interval in seconds
     */
    function setExecutionInterval(uint256 _interval) external onlyOwner {
        require(_interval > 0, "Interval must be positive");
        
        executionInterval = _interval;
        emit SchedulerConfigured(_interval);
    }

    /**
     * @notice Pause/resume scheduler
     * @param _active Whether to activate or deactivate
     */
    function setActive(bool _active) external onlyOwner {
        isActive = _active;
        emit SchedulerStatusChanged(_active);
    }

    /**
     * @notice Manually reset execution timer
     */
    function resetTimer() external onlyOwner {
        lastExecutionTime = block.timestamp;
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Handle scheduled execution
     * @param eventData Event data from Somnia reactive network
     */
    function _onEvent(bytes memory) internal override nonReentrant {
        if (!isActive) {
            _emitError(abi.encode("scheduler_inactive"));
            return;
        }

        uint256 timeSinceLastExecution = block.timestamp - lastExecutionTime;

        if (timeSinceLastExecution < executionInterval) {
            uint256 timeRemaining = executionInterval - timeSinceLastExecution;
            emit ReactiveExecution("execution_not_due", false);
            _emitError(
                abi.encode("execution_not_ready", timeSinceLastExecution, timeRemaining)
            );
            return;
        }

        // Time to execute
        lastExecutionTime = block.timestamp;
        executionsCount++;

        uint256 nextExecutionTime = block.timestamp + executionInterval;
        emit ScheduledExecution(block.timestamp, nextExecutionTime);
        emit ReactiveExecution("scheduled_execution", true);
        _emitSuccess("execution_scheduled");
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @notice Check if execution is due
     * @return bool True if execution interval has elapsed
     */
    function isExecutionDue() external view returns (bool) {
        if (!isActive) return false;
        
        uint256 timeSinceLastExecution = block.timestamp - lastExecutionTime;
        return timeSinceLastExecution >= executionInterval;
    }

    /**
     * @notice Get time until next execution
     * @return uint256 Seconds until next execution (0 if due)
     */
    function timeUntilNextExecution() external view returns (uint256) {
        uint256 timeSinceLastExecution = block.timestamp - lastExecutionTime;
        
        if (timeSinceLastExecution >= executionInterval) {
            return 0;
        }
        
        return executionInterval - timeSinceLastExecution;
    }

    /**
     * @notice Get next execution timestamp
     * @return uint256 Timestamp of next scheduled execution
     */
    function getNextExecutionTime() external view returns (uint256) {
        uint256 nextTime = lastExecutionTime + executionInterval;
        
        if (nextTime <= block.timestamp) {
            return block.timestamp;
        }
        
        return nextTime;
    }

    /**
     * @notice Get execution progress as percentage
     * @return uint256 Progress from 0 to 100
     */
    function getExecutionProgress() external view returns (uint256) {
        uint256 timeSinceLastExecution = block.timestamp - lastExecutionTime;
        
        if (timeSinceLastExecution >= executionInterval) {
            return 100;
        }
        
        return (timeSinceLastExecution * 100) / executionInterval;
    }
}
