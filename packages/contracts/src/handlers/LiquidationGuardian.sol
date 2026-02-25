// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/BaseReactiveHandler.sol";

// ============================================================================
// INTERFACES
// ============================================================================

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
}

interface ILendingPool {
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
    
    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external;
}

/**
 * @title LiquidationGuardian
 * @notice Monitors health factor and triggers liquidations when necessary
 * @dev Listens for price updates and checks if positions should be liquidated
 */
contract LiquidationGuardian is BaseReactiveHandler {
    // ============================================================================
    // STATE
    // ============================================================================

    /// @notice Price oracle for checking prices
    address public priceOracle;

    /// @notice Lending pool contract
    address public lendingPool;

    /// @notice Health factor threshold (multiplied by 10^18)
    uint256 public healthFactorThreshold;

    /// @notice Tracked risky positions
    mapping(address => bool) public riskyPositions;

    /// @notice Total liquidations executed
    uint256 public liquidationsExecuted;

    /// @notice Failed liquidation attempts
    uint256 public liquidationsFailed;

    // ============================================================================
    // EVENTS
    // ============================================================================

    event HealthFactorThresholdUpdated(uint256 newThreshold);
    event LiquidationAttempted(address indexed user, uint256 healthFactor);
    event LiquidationSucceeded(address indexed user, uint256 healthFactor);
    event PositionMonitored(address indexed user, uint256 healthFactor);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize liquidation guardian
     * @param _priceOracle Price oracle address
     * @param _lendingPool Lending pool address
     * @param _healthFactorThreshold Health factor threshold (e.g., 1.05e18 for 1.05)
     */
    constructor(
        address _priceOracle,
        address _lendingPool,
        uint256 _healthFactorThreshold
    ) {
        require(_priceOracle != address(0), "Invalid oracle");
        require(_lendingPool != address(0), "Invalid pool");
        require(_healthFactorThreshold > 0, "Invalid threshold");

        priceOracle = _priceOracle;
        lendingPool = _lendingPool;
        healthFactorThreshold = _healthFactorThreshold;

        emit HealthFactorThresholdUpdated(_healthFactorThreshold);
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Update health factor threshold
     * @param _threshold New threshold value
     */
    function setHealthFactorThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0, "Invalid threshold");
        
        healthFactorThreshold = _threshold;
        emit HealthFactorThresholdUpdated(_threshold);
    }

    /**
     * @notice Update price oracle
     * @param _oracle New oracle address
     */
    function setPriceOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle");
        priceOracle = _oracle;
    }

    /**
     * @notice Check if a position should be liquidated
     * @param user User address
     * @return needsLiquidation True if position health factor is below threshold
     * @return healthFactor Current health factor
     */
    function checkHealthFactor(address user)
        external
        view
        returns (bool needsLiquidation, uint256 healthFactor)
    {
        (,, ,, , healthFactor) = ILendingPool(lendingPool).getUserAccountData(user);

        needsLiquidation = healthFactor < healthFactorThreshold;
        return (needsLiquidation, healthFactor);
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Handle price update event
     * @param eventData Event data from Somnia reactive network
     */
    function _onEvent(bytes memory eventData) internal override nonReentrant gasLimitCheck(100000) {
        // Extract user address from event data (first 32 bytes after selector)
        if (eventData.length < 32) {
            _emitError("invalid_event_data", eventData);
            return;
        }

        address user;
        assembly {
            user := calldataload(add(eventData.offset, 32))
        }

        try ILendingPool(lendingPool).getUserAccountData(user) returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256 healthFactor
        ) {
            emit PositionMonitored(user, healthFactor);

            if (healthFactor < healthFactorThreshold) {
                emit LiquidationAttempted(user, healthFactor);
                
                _executeLiquidation(user, healthFactor);
            } else {
                emit ReactiveExecution("position_healthy", true);
                _emitSuccess("position_healthy");
            }
        } catch (bytes memory reason) {
            _emitError("health_check_failed", reason);
            emit ReactiveExecution("health_check_failed", false);
        }
    }

    /**
     * @notice Execute liquidation on monitored position
     * @param user Address of user to liquidate
     * @param healthFactor Current health factor
     */
    function _executeLiquidation(address user, uint256 healthFactor) internal {
        try this._performLiquidation(user) {
            liquidationsExecuted++;
            emit LiquidationSucceeded(user, healthFactor);
            emit ReactiveExecution("liquidation_executed", true);
            _emitSuccess("liquidation_executed");
        } catch (bytes memory reason) {
            liquidationsFailed++;
            emit ReactiveExecution("liquidation_failed", false);
            _emitError("liquidation_failed", reason);
        }
    }

    /**
     * @notice Perform the actual liquidation call
     * @param user User to liquidate
     */
    function _performLiquidation(address user) external {
        // This is a simplified version - actual implementation would:
        // 1. Get protocol state (collateral, debt assets)
        // 2. Calculate optimal debt to cover
        // 3. Call liquidationCall on lending pool
        
        revert("Liquidation logic must be implemented per protocol");
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @notice Get liquidation stats
     * @return executed Total liquidations executed
     * @return failed Total liquidation failures
     */
    function getLiquidationStats()
        external
        view
        returns (uint256 executed, uint256 failed)
    {
        return (liquidationsExecuted, liquidationsFailed);
    }
}
