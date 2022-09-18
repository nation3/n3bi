//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract N3BI {
    using SafeERC20 for IERC20;

    /**
     * The token that Nation3 citizens will receive when they claim their income.
     */
    IERC20 public incomeToken;

    constructor(address incomeTokenAddress) {
        console.log("Deploying N3BI");
        console.log("incomeTokenAddress:", incomeTokenAddress);
        incomeToken = IERC20(incomeTokenAddress);
    }
}
