// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../base/BaseReactiveHandler.sol";

// ============================================================================
// INTERFACES
// ============================================================================

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface ICompoundable {
    function compound() external returns (uint256);
}

/**
 * @title AutoCompoundHandler
 * @notice Automatically compounds rewards when detected
 * @dev Listens for reward token transfers and triggers compound operations
 */
contract AutoCompoundHandler is BaseReactiveHandler {

    // ============================================================================
    // STATE
    // ============================================================================

    /// @notice Reward token address
    address public rewardToken;

    /// @notice Vault/Target contract to compound
    address public targetVault;

    /// @notice Minimum balance required to trigger compound
    uint256 public minCompoundAmount;

    /// @notice Total compounds executed
    uint256 public compoundsExecuted;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event CompoundTriggered(uint256 amount, uint256 newTotal);
    event ConfigUpdated(address newVault, uint256 newMinAmount);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize AutoCompound handler
     * @param _rewardToken Reward token address
     * @param _targetVault Vault to compound into
     * @param _minCompound Minimum amount to trigger compound
     */
    constructor(address _rewardToken, address _targetVault, uint256 _minCompound) {
        require(_rewardToken != address(0), "Invalid reward token");
        require(_targetVault != address(0), "Invalid vault");
        
        rewardToken = _rewardToken;
        targetVault = _targetVault;
        minCompoundAmount = _minCompound;
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Update configuration
     * @param _vault New vault address
     * @param _minAmount New minimum compound amount
     */
    function updateConfig(address _vault, uint256 _minAmount) external onlyOwner {
        require(_vault != address(0), "Invalid vault");
        
        targetVault = _vault;
        minCompoundAmount = _minAmount;
        
        emit ConfigUpdated(_vault, _minAmount);
    }

    /**
     * @notice Manually trigger compound if conditions met
     * @return success Whether compound was successful
     */
    function manualCompound() external returns (bool success) {
        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        require(balance >= minCompoundAmount, "Insufficient balance");
        
        return _executeCompound(balance);
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Handle reward transfer event
     */
    function _onEvent(bytes memory) internal override nonReentrant gasLimitCheck(50000) {
        // Check current reward balance
        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        
        if (balance >= minCompoundAmount) {
            bool success = _executeCompound(balance);
            if (success) {
                emit CompoundTriggered(balance, compoundsExecuted);
                _emitSuccess("compound_executed");
            } else {
                _emitError(abi.encode("compound_failed", balance));
            }
        } else {
            emit ReactiveExecution("insufficient_balance", false);
            _emitError(abi.encode("insufficient_balance", balance, minCompoundAmount));
        }
    }

    /**
     * @notice Execute compound operation
     * @param amount Amount to compound
     * @return success Whether operation succeeded
     */
    function _executeCompound(uint256 amount) internal returns (bool success) {
        try IERC20(rewardToken).approve(targetVault, amount) {
            try ICompoundable(targetVault).compound() {
                compoundsExecuted++;
                emit ReactiveExecution("compound_success", true);
                return true;
            } catch (bytes memory reason) {
                emit ReactiveExecution("compound_call_failed", false);
                _emitError(reason);
                return false;
            }
        } catch (bytes memory reason) {
            emit ReactiveExecution("approve_failed", false);
            _emitError(reason);
            return false;
        }
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @notice Get current reward balance
     * @return uint256 Current balance of reward token
     */
    function getRewardBalance() external view returns (uint256) {
        return IERC20(rewardToken).balanceOf(address(this));
    }

    /**
     * @notice Check if compound would execute
     * @return bool True if conditions met
     */
    function shouldCompound() external view returns (bool) {
        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        return balance >= minCompoundAmount;
    }
}
