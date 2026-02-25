// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReactiveEvents
 * @dev Common event interfaces for reactive handlers
 */
interface IReactiveEvents {
    /// @notice Emitted when handler execution succeeds
    event HandleSuccess(string indexed action, bytes data);

    /// @notice Emitted when handler execution fails
    event HandleError(string indexed reason, bytes errorData);

    /// @notice Emitted when handler is throttled
    event Throttled(uint256 timestamp, uint256 nextExecutionTime);
}
