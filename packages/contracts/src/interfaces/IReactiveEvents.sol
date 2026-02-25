// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReactiveEvents
 * @notice Standard interface for reactive handler events
 */
interface IReactiveEvents {
    /**
     * @notice Emitted when an event is successfully processed
     * @param action Description of the action performed
     */
    event ReactiveSuccess(string indexed action);

    /**
     * @notice Emitted when an event processing fails
     * @param reason The reason for the failure
     */
    event ReactiveError(bytes indexed reason);

    /**
     * @notice Emitted when execution is attempted
     * @param executionStep The step being executed
     * @param result Boolean result of execution
     */
    event ReactiveExecution(string indexed executionStep, bool result);

    /**
     * @notice Emitted when throttling occurs
     * @param eventCount Current count of events
     * @param threshold The threshold that was exceeded
     */
    event ThrottleTriggered(uint256 indexed eventCount, uint256 threshold);

    /**
     * @notice Emitted when scheduled execution occurs
     * @param executedAt Timestamp of execution
     * @param nextExecutionAt When the next execution is scheduled
     */
    event ScheduledExecution(uint256 indexed executedAt, uint256 nextExecutionAt);

    /**
     * @notice Emitted when a cross-call is enqueued
     * @param callIndex The index of the call in the queue
     * @param target The target address
     * @param data The call data
     */
    event CrossCallEnqueued(uint256 indexed callIndex, address indexed target, bytes data);

    /**
     * @notice Emitted when cross-calls are executed
     * @param executedCount Number of calls executed
     * @param failedCount Number of calls that failed
     */
    event CrossCallsExecuted(uint256 indexed executedCount, uint256 failedCount);
}
