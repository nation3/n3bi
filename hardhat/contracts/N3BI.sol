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

    function isEligible(address citizen) public view returns (bool) {
        // The account has a passport NFT
        // TO DO

        // The passport has not yet expired
        // TO DO

        // The passport is not about to expire within the next year
        // TO DO

        // The citizen is active
        // TO DO

        return false;
    }

    function enroll() public {
        // TO DO
    }

    function claim() public {
        // TO DO
    }
}
