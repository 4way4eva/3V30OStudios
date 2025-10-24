// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EV0L1155 is ERC1155, Ownable {
    constructor(string memory baseUri_) ERC1155(baseUri_) {}

    function setURI(string memory newuri) external onlyOwner { _setURI(newuri); }

    function mintAll(address to, uint256[] calldata ids, uint256[] calldata amounts) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}
