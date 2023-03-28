//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "./nationcred/INationCred.sol";

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

    /**
     * @notice The smart contract used for checking if a Nation3 citizen is active.
     */
    INationCred public nationCred;

    constructor(
        address incomeTokenAddress,
        address passportAddress,
        address nationCredAddress
    ) {
        console.log("Deploying N3BI");
        console.log("incomeTokenAddress:", incomeTokenAddress);
        incomeToken = IERC20(incomeTokenAddress);
        passport = IERC721(passportAddress);
        nationCred = INationCred(nationCredAddress);
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
        uint16 passportID = getPassportID(citizen);
        console.log("passportID:", passportID);
        if (!nationCred.isActive(passportID)) {
            return false;
        }

        return true;
    }

    function getPassportID(address citizen) public view returns (uint16) {
        for (uint16 i = 0; i < 420; i++) {
            if (passport.ownerOf(i) == citizen) {
                return i;
            }
        }
        return 0;
    }

    function enroll() public {
        // TO DO
    }

    function claim() public {
        // TO DO
    }
}
