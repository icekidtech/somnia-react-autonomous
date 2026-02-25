// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IReactiveEvents.sol";

/**
 * @title BaseReactiveHandler
 * @dev Abstract base contract for all reactive handlers with safety features
 *
 * Features:
 * - Reentrancy guard
 * - Gas limit checks
 * - Event emission for success/error
 * - Common event decoding helpers
 *
 * Note: This should inherit from SomniaEventHandler for production use.
 * For now, we provide the base interface here.
 */
abstract contract BaseReactiveHandler is IReactiveEvents {
    /// @notice Reentrancy guard state
    uint256 private locked;

    /// @notice Minimum gas required for safe execution
    uint256 public constant MIN_GAS_REQUIRED = 5000;

    /// @notice Error message for reentrancy attempts
    error ReentrancyGuardReentrantCall();

    /// @notice Error message for insufficient gas
    error InsufficientGas();

    /// @dev Constructor
    constructor() {
        locked = 1;
    }

    /**
     * @dev Reentrancy guard modifier
     */
    modifier nonReentrant() {
        if (locked != 1) revert ReentrancyGuardReentrantCall();
        locked = 2;
        _;
        locked = 1;
    }

    /**
     * @dev Gas limit check modifier
     * @param minGasRequired Minimum gas required for the operation
     */
    modifier gasLimitCheck(uint256 minGasRequired) {
        if (gasleft() < minGasRequired) revert InsufficientGas();
        _;
    }

    /**
     * @dev Override _onEvent for specific handler logic
     */
    function _onEvent(bytes memory eventData) internal virtual override;

    /**
     * @dev Emit success event
     * @param action Description of successful action
     * @param data Additional event data
     */
    function _emitSuccess(string memory action, bytes memory data) internal {
        emit HandleSuccess(action, data);
    }

    /**
     * @dev Emit error event
     * @param reason Error reason description
     * @param errorData Additional error data
     */
    function _emitError(string memory reason, bytes memory errorData) internal {
        emit HandleError(reason, errorData);
    }
}
