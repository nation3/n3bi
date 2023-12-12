//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.19;

import "./nationcred/INationCred.sol";
import "./utils/IPassportUtils.sol";
import "hardhat/console.sol";

/**
 *        ---------::::
 *     ---------:---::::::
 *   -----------::---:::::::
 *  ------------:.:--::::::::
 * -------------: .:--::::::::
 * -------------:   .:::::::::
 * -------------:.......::::::
 * -----:..    .:-------::::::
 * --------:.. .:-------::::::
 * ----------:..:--------:::::
 *  -----------.:--------::::
 *   ----------::--------:::
 *     -------------------
 *        -------------
 *
 *         Nation3 DAO
 *     https://nation3.org
 */
contract N3BI {
    string public constant VERSION = "0.0.7";

    address public owner;

    /**
     * @notice The smart contract used for checking if a citizens holds a valid passport.
     */
    IPassportUtils public passportUtils;

    /**
     * @notice The smart contract used for checking if a Nation3 citizen is active.
     */
    INationCred public nationCred;

    error NotEligibleError(address citizen);

    constructor(
        address passportUtilsAddress,
        address nationCredAddress
    ) {
        console.log("Deploying N3BI");
        console.log("passportUtilsAddress:", passportUtilsAddress);
        console.log("nationCredAddress:", nationCredAddress);
        owner = address(msg.sender);
        passportUtils = IPassportUtils(passportUtilsAddress);
        nationCred = INationCred(nationCredAddress);
    }

    function setOwner(address ownerAddress) public {
        require(msg.sender == owner, "You are not the owner");
        owner = ownerAddress;
    }

    function setPassportUtils(address passportUtilsAddress) public {
        require(msg.sender == owner, "You are not the owner");
        passportUtils = IPassportUtils(passportUtilsAddress);
    }

    /**
     * @notice Checks if a Nation3 citizen is eligible to enroll for Basic Income.
     */
    function isEligible(
        address citizen
    ) public view returns (bool) {
        console.log("isEligible");

        // The account owns the passport NFT
        if (!passportUtils.isOwner(citizen)) {
            return false;
        }
        console.log(unicode"✅ The account owns the passport NFT");

        // The passport has not yet expired
        if (passportUtils.isExpired(citizen)) {
            return false;
        }
        console.log(unicode"✅ The passport has not yet expired");

        // The passport is not about to expire within the next year
        uint256 expirationTimestamp = passportUtils.getExpirationTimestamp(citizen);
        console.log("expirationTimestamp:", expirationTimestamp);
        uint256 oneYearFromNow = block.timestamp + 365 days;
        console.log("oneYearFromNow:", oneYearFromNow);
        if (expirationTimestamp < oneYearFromNow) {
            return false;
        }
        console.log(
            unicode"✅ The passport is not about to expire within the next year"
        );

        // The citizen is active
        if (!nationCred.isActiveAddress(citizen)) {
            return false;
        }
        console.log(unicode"✅ The citizen is active");

        return true;
    }

    /**
     * @notice Once eligible, the citizen can enroll for Basic Income, as long as the smart contract contains enough funding for covering one additional citizen's Basic Income for the duration of 1 year.
     */
    function enroll() public {
        console.log("enroll");

        if (!isEligible(msg.sender)) {
            revert NotEligibleError(msg.sender);
        }
        console.log(unicode"✅ The citizen is eligible for enrollment");

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
