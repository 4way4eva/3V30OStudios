// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeltaTLAToken is ERC20, Ownable {
    constructor() ERC20("DeltaTLA", "ΔTLA") {
        _mint(msg.sender, 1000000 * 10**decimals()); // Initial supply
    }

    // Mint new ΔTLA tokens (restricted to 10:10 intervals via TimelockController)
    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }
}