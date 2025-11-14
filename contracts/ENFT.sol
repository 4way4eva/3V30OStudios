// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ENFT is ERC1155, Ownable {
    string public name = "ENFT Ledger";
    string public symbol = "BLEU";

    constructor(string memory baseURI) ERC1155(baseURI) {}

    function adminMintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }
}