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
        console.log("passportAddress:", passportAddress);
        console.log("nationCredAddress:", nationCredAddress);
        incomeToken = IERC20(incomeTokenAddress);
        passport = IERC721(passportAddress);
        nationCred = INationCred(nationCredAddress);
    }

    /**
     * @notice Checks if a Nation3 citizen is eligible to enroll for Basic Income.
     */
    function isEligible(
        address citizen,
        uint16 passportID
    ) public view returns (bool) {
        console.log("isEligible");

        // The account owns the passport NFT
        if (!isPassportOwner(citizen, passportID)) {
            return false;
        }
        console.log(unicode"✅ The account owns the passport NFT");

        // The passport has not yet expired
        // TO DO
        console.log(unicode"✅ The passport has not yet expired");

        // The passport is not about to expire within the next year
        // TO DO
        console.log(
            unicode"✅ The passport is not about to expire within the next year"
        );

        // The citizen is active
        if (!nationCred.isActiveID(passportID)) {
            return false;
        }
        console.log(unicode"✅ The citizen is active");

        return true;
    }

    function isPassportOwner(
        address citizen,
        uint16 passportID
    ) public view returns (bool) {
        console.log("isPassportOwner");
        address passportOwner = passport.ownerOf(passportID);
        return (citizen == passportOwner);
    }

    /**
     * @notice Once eligible, the citizen can enroll for Basic Income, as long as the smart contract contains enough funding for covering one additional citizen's Basic Income for the duration of 1 year.
     */
    function enroll() public {
        console.log("enroll");
        // TO DO
    }

    /**
     * @notice Once enrolled, citizens can claim their earned Basic Income at any time.
     */
    function claim() public {
        console.log("claim");
        // TO DO
    }
}
