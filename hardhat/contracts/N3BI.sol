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

    function isEligible(
        address citizen,
        uint16 passportID
    ) public view returns (bool) {
        // The account owns the passport NFT
        if (!isPassportOwner(citizen, passportID)) {
            return false;
        }

        // The passport has not yet expired
        // TO DO

        // The passport is not about to expire within the next year
        // TO DO

        // The citizen is active
        if (!nationCred.isActive(passportID)) {
            return false;
        }

        return true;
    }

    function isPassportOwner(
        address citizen,
        uint16 passportID
    ) public view returns (bool) {
        address passportOwner = passport.ownerOf(passportID);
        return (citizen == passportOwner);
    }

    function enroll() public {
        // TO DO
    }

    function claim() public {
        // TO DO
    }
}
