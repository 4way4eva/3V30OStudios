// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CanonRegistry {
    // Mapping from scroll entry ID to IPFS hash
    mapping(uint256 => string) private _scrollEntries;

    // Add a new scroll entry (IPFS hash)
    function addScrollEntry(uint256 entryId, string memory ipfsHash) public {
        _scrollEntries[entryId] = ipfsHash;
    }

    // Get a scroll entry's IPFS hash
    function getScrollEntry(uint256 entryId) public view returns (string memory) {
        return _scrollEntries[entryId];
    }
}