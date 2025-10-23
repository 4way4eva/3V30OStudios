// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MEGAZIONHybrid1155.sol";

/// @notice Shared deployment utilities for the MEGAZION Hybrid Ω48 collection.
abstract contract MEGAZIONDeployBase {
    event CollectionDeployed(address indexed collection, uint256 indexed chainId, string baseUri);

    function _deploy(string memory baseUri, address owner) internal returns (MEGAZIONHybrid1155 collection) {
        collection = new MEGAZIONHybrid1155(baseUri);
        collection.transferOwnership(owner);
        emit CollectionDeployed(address(collection), block.chainid, baseUri);
    }
}

/// @notice Avalanche C-Chain deployment entry point.
contract AvalancheMEGAZIONDeployer is MEGAZIONDeployBase {
    uint256 internal constant AVALANCHE_CHAIN_ID = 43114;

    function deploy(string memory avalancheUri, address owner)
        external
        returns (MEGAZIONHybrid1155 collection)
    {
        collection = _deploy(avalancheUri, owner);
        collection.configureChain(AVALANCHE_CHAIN_ID, avalancheUri, true);
    }
}

/// @notice Polygon PoS deployment entry point.
contract PolygonMEGAZIONDeployer is MEGAZIONDeployBase {
    uint256 internal constant POLYGON_CHAIN_ID = 137;

    function deploy(string memory polygonUri, address owner)
        external
        returns (MEGAZIONHybrid1155 collection)
    {
        collection = _deploy(polygonUri, owner);
        collection.configureChain(POLYGON_CHAIN_ID, polygonUri, true);
    }
}

/// @notice BLEUChain sovereign deployment entry point.
contract BleuChainMEGAZIONDeployer is MEGAZIONDeployBase {
    /// @dev Placeholder chain id for BLEUChain sovereign runtime.
    uint256 internal constant BLEUCHAIN_ID = 707070;

    function deploy(string memory bleuChainUri, address owner)
        external
        returns (MEGAZIONHybrid1155 collection)
    {
        collection = _deploy(bleuChainUri, owner);
        collection.configureChain(BLEUCHAIN_ID, bleuChainUri, true);
    }
}
