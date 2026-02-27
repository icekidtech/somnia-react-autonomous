// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/handlers/LiquidationGuardian.sol";

// Mock oracle
contract MockOracle {
    function getPrice(address token) external view returns (uint256) {
        return 1e18; // $1 per token
    }
}

// Mock lending pool
contract MockLendingPool {
    mapping(address => bool) public riskyPositions;

    function setRisky(address user, bool isRisky) external {
        riskyPositions[user] = isRisky;
    }

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
        )
    {
        if (riskyPositions[user]) {
            return (
                1000e18, // $1000 collateral
                950e18,  // $950 debt
                50e18,   // $50 available
                8000,    // 80% LT
                7000,    // 70% LTV
                1050e15  // 1.05 health factor (below threshold)
            );
        } else {
            return (
                1000e18, // $1000 collateral
                500e18,  // $500 debt
                500e18,  // $500 available
                8000,    // 80% LT
                5000,    // 50% LTV
                2000e15  // 2.0 health factor (healthy)
            );
        }
    }

    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external {
        // Mock implementation
    }
}

/**
 * @title LiquidationGuardianTest
 * @notice Tests for LiquidationGuardian handler
 */
contract LiquidationGuardianTest is Test {
    LiquidationGuardian guardian;
    MockOracle oracle;
    MockLendingPool pool;
    address admin = address(0x1);
    address user = address(0x2);

    function setUp() public {
        oracle = new MockOracle();
        pool = new MockLendingPool();

        vm.prank(admin);
        guardian = new LiquidationGuardian(
            address(oracle),
            address(pool),
            1100e15 // 1.1 health factor threshold
        );
    }

    function testInitialConfiguration() public {
        assertEq(guardian.priceOracle(), address(oracle));
        assertEq(guardian.lendingPool(), address(pool));
        assertEq(guardian.healthFactorThreshold(), 1100e15);
    }

    function testSetHealthFactorThreshold() public {
        vm.prank(admin);
        guardian.setHealthFactorThreshold(1200e15);
        assertEq(guardian.healthFactorThreshold(), 1200e15);
    }

    function testSetPriceOracle() public {
        address newOracle = address(0x5);
        vm.prank(admin);
        guardian.setPriceOracle(newOracle);
        assertEq(guardian.priceOracle(), newOracle);
    }

    function testCheckHealthFactor() public {
        // Healthy position
        (bool needsLiquidation, uint256 healthFactor) = guardian.checkHealthFactor(user);
        assertFalse(needsLiquidation);
        assertGt(healthFactor, guardian.healthFactorThreshold());

        // Risky position
        pool.setRisky(user, true);
        (needsLiquidation, healthFactor) = guardian.checkHealthFactor(user);
        assertTrue(needsLiquidation);
        assertLt(healthFactor, guardian.healthFactorThreshold());
    }

    function testGetLiquidationStats() public {
        (uint256 executed, uint256 failed) = guardian.getLiquidationStats();
        assertEq(executed, 0);
        assertEq(failed, 0);
    }

    function testInvalidConfiguration() public {
        vm.expectRevert("Invalid oracle");
        vm.prank(admin);
        new LiquidationGuardian(address(0), address(pool), 1100e15);

        vm.expectRevert("Invalid pool");
        vm.prank(admin);
        new LiquidationGuardian(address(oracle), address(0), 1100e15);

        vm.expectRevert("Invalid threshold");
        vm.prank(admin);
        new LiquidationGuardian(address(oracle), address(pool), 0);
    }

    function testOnlyOwnerCanUpdateThreshold() public {
        vm.prank(user); // Not owner
        vm.expectRevert(BaseReactiveHandler.Unauthorized.selector);
        guardian.setHealthFactorThreshold(1200e15);
    }
}
