// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract TreatyDAO is Governor {
    constructor(ERC20Votes _token)
        Governor("TreatyDAO")
    {
        // Note: governance token ownership should be set up externally
    }

    // Propose a new treaty (E.SOIL node deployment)
    function proposeTreaty(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        return propose(targets, values, calldatas, description);
    }
}