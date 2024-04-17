//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Nation3Mock is ERC20 {
    constructor() ERC20("NATION3", "NATION") {
        _mint(msg.sender, 100 * 1e18);
    }
}
