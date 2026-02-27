// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseReactiveHandler} from "../base/BaseReactiveHandler.sol";

/**
 * @title EventFilterThrottle
 * @notice Throttles rapid event execution using sliding window counting
 * @dev Prevents event flooding by limiting events in a time window
 */
contract EventFilterThrottle is BaseReactiveHandler {
    // ============================================================================
    // CONSTANTS
    // ============================================================================

    /// @notice Default time window for counting events (1 hour)
    uint256 public constant DEFAULT_WINDOW_SIZE = 3600;

    // ============================================================================
    // STATE
    // ============================================================================

    /// @notice Time window for throttling events
    uint256 public windowSize;

    /// @notice Maximum events allowed in a window
    uint256 public maxEventsPerWindow;

    /// @notice Last execution timestamp
    uint256 public lastExecutionTime;

    /// @notice Event count in current window
    uint256 public eventCount;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event ThrottleConfigUpdated(uint256 newWindow, uint256 newMax);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize the throttle handler
     * @param _windowSize Time window for counting events
     * @param _maxEvents Maximum events allowed per window
     */
    constructor(uint256 _windowSize, uint256 _maxEvents) {
        require(_windowSize > 0, "Window size must be positive");
        require(_maxEvents > 0, "Max events must be positive");
        
        windowSize = _windowSize;
        maxEventsPerWindow = _maxEvents;
        lastExecutionTime = block.timestamp;
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Update throttle configuration
     * @param _windowSize New window size
     * @param _maxEvents New max events
     */
    function updateThrottleConfig(uint256 _windowSize, uint256 _maxEvents) 
        external 
        onlyOwner 
    {
        require(_windowSize > 0, "Window size must be positive");
        require(_maxEvents > 0, "Max events must be positive");
        
        windowSize = _windowSize;
        maxEventsPerWindow = _maxEvents;
        
        emit ThrottleConfigUpdated(_windowSize, _maxEvents);
    }

    /**
     * @notice Reset event counter (owner only)
     */
    function resetCounter() external onlyOwner {
        eventCount = 0;
        lastExecutionTime = block.timestamp;
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Handle incoming reactive event with throttling
     */
    function _onEvent(bytes memory) internal override nonReentrant {
        // Check if window has expired
        if (block.timestamp >= lastExecutionTime + windowSize) {
            // Window expired, reset counter
            eventCount = 0;
            lastExecutionTime = block.timestamp;
        }

        // Increment event count
        eventCount++;

        // Check if we exceeded threshold
        if (eventCount > maxEventsPerWindow) {
            emit ThrottleTriggered(eventCount, maxEventsPerWindow);
            _emitError(abi.encode("throttle_limit_exceeded", eventCount, maxEventsPerWindow));
            return;
        }

        // Process event normally
        _emitSuccess("event_throttled_ok");
        emit ReactiveExecution("throttle_check_passed", true);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @notice Check if event would be throttled
     * @param _eventCount Hypothetical event count
     * @return bool True if would be throttled
     */
    function wouldThrottle(uint256 _eventCount) external view returns (bool) {
        // Check if window still active
        if (block.timestamp < lastExecutionTime + windowSize) {
            return _eventCount > maxEventsPerWindow;
        }
        // Window expired, event would not throttle
        return false;
    }

    /**
     * @notice Get time until window expires
     * @return uint256 Seconds until window expires
     */
    function timeUntilWindowExpires() external view returns (uint256) {
        uint256 windowEnd = lastExecutionTime + windowSize;
        if (block.timestamp >= windowEnd) {
            return 0;
        }
        return windowEnd - block.timestamp;
    }
}
