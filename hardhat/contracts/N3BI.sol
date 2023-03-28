//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

contract N3BI {
    using SafeERC20 for IERC20;

    /**
     * @notice The token that Nation3 citizens will receive when they claim their income.
     */
    IERC20 public incomeToken;

    /**
     * @notice Nation3 Genesis Passport (PASS3).
     */
    IERC721 public passport;

    constructor(address incomeTokenAddress, address passportAddress) {
        console.log("Deploying N3BI");
        console.log("incomeTokenAddress:", incomeTokenAddress);
        incomeToken = IERC20(incomeTokenAddress);
        passport = IERC721(passportAddress);
    }

    function isEligible(address citizen) public view returns (bool) {
        // The account has a passport NFT
        uint256 passportBalance = passport.balanceOf(citizen);
        console.log("passportBalance:", passportBalance);
        if (passportBalance < 1) {
            return false;
        }

        // The passport has not yet expired
        // TO DO

        // The passport is not about to expire within the next year
        // TO DO

        // The citizen is active
        // TO DO

        return true;
    }

    function enroll() public {
        // TO DO
    }

    function claim() public {
        // TO DO
    }
}
