// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/handlers/AutoCompoundHandler.sol";

// Mock token
contract MockERC20 {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
}

// Mock vault
contract MockVault {
    uint256 public compoundCount;

    function compound() external returns (uint256) {
        compoundCount++;
        return 1;
    }
}

/**
 * @title AutoCompoundHandlerTest
 * @notice Tests for AutoCompoundHandler
 */
contract AutoCompoundHandlerTest is Test {
    AutoCompoundHandler handler;
    MockERC20 rewardToken;
    MockVault vault;
    address admin = address(0x1);

    function setUp() public {
        rewardToken = new MockERC20();
        vault = new MockVault();

        vm.prank(admin);
        handler = new AutoCompoundHandler(
            address(rewardToken),
            address(vault),
            1000 // 1000 wei minimum
        );
    }

    function testInitialConfiguration() public {
        assertEq(handler.rewardToken(), address(rewardToken));
        assertEq(handler.targetVault(), address(vault));
        assertEq(handler.minCompoundAmount(), 1000);
    }

    function testUpdateConfig() public {
        address newVault = address(0x5);
        vm.prank(admin);
        handler.updateConfig(newVault, 2000);

        assertEq(handler.targetVault(), newVault);
        assertEq(handler.minCompoundAmount(), 2000);
    }

    function testGetRewardBalance() public {
        rewardToken.mint(address(handler), 5000);
        assertEq(handler.getRewardBalance(), 5000);
    }

    function testShouldCompound() public {
        // Initially false (no balance)
        assertFalse(handler.shouldCompound());

        // Add balance above minimum
        rewardToken.mint(address(handler), 2000);
        assertTrue(handler.shouldCompound());

        // Add balance below minimum
        MockERC20 lowToken = new MockERC20();
        vm.prank(admin);
        handler = new AutoCompoundHandler(
            address(lowToken),
            address(vault),
            5000
        );

        lowToken.mint(address(handler), 2000);
        assertFalse(handler.shouldCompound());
    }

    function testCompoundsExecutedTracking() public {
        assertEq(handler.compoundsExecuted(), 0);
    }

    function testInvalidConfiguration() public {
        vm.expectRevert("Invalid reward token");
        vm.prank(admin);
        new AutoCompoundHandler(address(0), address(vault), 1000);

        vm.expectRevert("Invalid vault");
        vm.prank(admin);
        new AutoCompoundHandler(address(rewardToken), address(0), 1000);
    }
}
