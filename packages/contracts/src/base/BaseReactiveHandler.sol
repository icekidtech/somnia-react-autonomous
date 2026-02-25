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
 * - Owner-based access control
 *
 * Note: This should inherit from SomniaEventHandler for production use.
 * For now, we provide the base interface here.
 */
abstract contract BaseReactiveHandler is IReactiveEvents {
    // ============================================================================
    // CONSTANTS
    // ============================================================================

    /// @notice Minimum gas required for safe execution
    uint256 public constant MIN_GAS_REQUIRED = 5000;

    // ============================================================================
    // STATE
    // ============================================================================

    /// @notice Reentrancy guard state
    uint256 private locked = 1;

    /// @notice Contract owner
    address public owner;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============================================================================
    // ERRORS
    // ============================================================================

    error ReentrancyGuardReentrantCall();
    error InsufficientGas();
    error Unauthorized();

    // ============================================================================
    // MODIFIERS
    // ============================================================================

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
     * @dev Only owner can call
     */
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Transfer ownership to a new address
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    // ============================================================================
    // INTERNAL FUNCTIONS (TO BE OVERRIDDEN)
    // ============================================================================

    /**
     * @notice Core event handling logic - must be implemented by subclasses
     * @param eventData Event data
     */
    function _onEvent(bytes memory eventData) internal virtual;

    /**
     * @notice Emit success with action description
     * @param action Action description
     */
    function _emitSuccess(string memory action) internal {
        emit ReactiveSuccess(action);
    }

    /**
     * @notice Emit error with reason
     * @param reason Error reason
     */
    function _emitError(bytes memory reason) internal {
        emit ReactiveError(reason);
    }
}
