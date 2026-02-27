// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseReactiveHandler} from "../base/BaseReactiveHandler.sol";

/**
 * @title UpgradeableReactiveProxy
 * @notice UUPS upgradeable proxy for reactive handlers
 * @dev Allows upgrading handler logic without redeploying
 */
contract UpgradeableReactiveProxy is BaseReactiveHandler {
    // ============================================================================
    // CONSTANTS
    // ============================================================================

    /// @notice Storage slot for implementation address
    bytes32 private constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("somnia.reactive.proxy.implementation")) - 1);

    /// @notice Storage slot for admin address
    bytes32 private constant ADMIN_SLOT =
        bytes32(uint256(keccak256("somnia.reactive.proxy.admin")) - 1);

    // ============================================================================
    // EVENTS
    // ============================================================================

    event Upgraded(address indexed implementation);
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /**
     * @notice Initialize the proxy
     * @param initialImplementation Initial implementation address
     */
    constructor(address initialImplementation) {
        require(initialImplementation != address(0), "Invalid implementation");
        
        _setImplementation(initialImplementation);
        _setAdmin(msg.sender);
    }

    // ============================================================================
    // EXTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Upgrade to new implementation
     * @param newImplementation New implementation address
     */
    function upgradeTo(address newImplementation) external {
        require(msg.sender == _getAdmin(), "Only admin can upgrade");
        require(newImplementation != address(0), "Invalid implementation");
        
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    /**
     * @notice Upgrade and call
     * @param newImplementation New implementation address
     * @param data Call data for initialization
     */
    function upgradeToAndCall(address newImplementation, bytes calldata data)
        external
        returns (bytes memory)
    {
        require(msg.sender == _getAdmin(), "Only admin can upgrade");
        require(newImplementation != address(0), "Invalid implementation");

        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);

        (bool success, bytes memory result) = newImplementation.delegatecall(data);
        require(success, "Upgrade call failed");

        return result;
    }

    /**
     * @notice Change the admin
     * @param newAdmin New admin address
     */
    function changeAdmin(address newAdmin) external {
        require(msg.sender == _getAdmin(), "Only admin can change admin");
        require(newAdmin != address(0), "Invalid admin");

        address previousAdmin = _getAdmin();
        _setAdmin(newAdmin);
        emit AdminChanged(previousAdmin, newAdmin);
    }

    /**
     * @notice Get current implementation
     * @return address Current implementation address
     */
    function getImplementation() external view returns (address) {
        return _getImplementation();
    }

    /**
     * @notice Get current admin
     * @return address Current admin address
     */
    function getAdmin() external view returns (address) {
        return _getAdmin();
    }

    // ============================================================================
    // FALLBACK
    // ============================================================================

    /**
     * @notice Fallback function delegates to implementation
     */
    fallback() external payable {
        _delegate(_getImplementation());
    }

    /**
     * @notice Receive function allows receiving ETH
     */
    receive() external payable {}

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    /**
     * @notice Delegate call to implementation
     * @param implementation Implementation address
     */
    function _delegate(address implementation) internal {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    /**
     * @notice Get implementation from storage
     * @return impl Implementation address
     */
    function _getImplementation() internal view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @notice Set implementation in storage
     * @param newImplementation New implementation address
     */
    function _setImplementation(address newImplementation) internal {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, newImplementation)
        }
    }

    /**
     * @notice Get admin from storage
     * @return adm Admin address
     */
    function _getAdmin() internal view returns (address adm) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            adm := sload(slot)
        }
    }

    /**
     * @notice Set admin in storage
     * @param newAdmin New admin address
     */
    function _setAdmin(address newAdmin) internal {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            sstore(slot, newAdmin)
        }
    }

    // ============================================================================
    // OVERRIDE HANDLER FUNCTION (Required by BaseReactiveHandler)
    // ============================================================================

    /**
     * @notice Forward event handling to implementation
     * @param eventData Event data
     */
    function _onEvent(bytes memory eventData) internal override {
        // This should be implemented in the actual handler logic
        // The proxy delegates to the implementation for actual handling
        address implementation = _getImplementation();
        require(implementation != address(0), "No implementation");

        try this._delegateToImpl(implementation, eventData) {
            _emitSuccess("event_delegated");
        } catch (bytes memory reason) {
            _emitError(reason);
        }
    }

    /**
     * @notice Delegate to implementation for event handling
     * @param implementation Implementation address
     * @param eventData Event data
     */
    function _delegateToImpl(address implementation, bytes memory eventData) external {
        (bool success, bytes memory result) = implementation.delegatecall(
            abi.encodeWithSignature("_onEvent(bytes)", eventData)
        );

        if (!success && result.length > 0) {
            assembly {
                revert(add(32, result), mload(result))
            }
        }
    }
}
