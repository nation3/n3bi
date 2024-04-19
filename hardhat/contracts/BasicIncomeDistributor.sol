// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.25;

import "@nation3/nationcred-contracts/INationCred.sol";
import "@nation3/nationcred-contracts/utils/IPassportUtils.sol";

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
contract BasicIncomeDistributor {
  struct Enrollment {
    uint256 timestamp;
    uint256 amount;
  }
    string public constant VERSION = "0.4.0";

    address public owner;

    /// The smart contract used for checking if a citizen holds a valid passport.
    IPassportUtils public passportUtils;

    /// The smart contract used for checking if a Nation3 citizen is active.
    INationCred public nationCred;

    /// The Basic Income amount a citizen can claim per yearly enrollment.
    uint256 public amountPerEnrollment;

    /// The total amount enrolled, accumulated over time.
    uint256 public amountEnrolled;

    /// The timestamp of each citizen's most recent enrollment.
    mapping(address => Enrollment) public enrollments;
    mapping(address => uint256) public latestClaimTimestamps;

    event Enrolled(address citizen);
    event Claimed(address citizen, uint256 amount);
    event AmountPerEnrollmentUpdated(uint256 newAmount);

    error NotEligibleError(address citizen);
    error CurrentlyEnrolledError(address citizen, uint256 enrollmentTimestamp);
    error NotEnoughFunding(uint256 amountAvailable, uint256 amountRequested);

    constructor(
        address passportUtilsAddress,
        address nationCredAddress,
        uint256 amountPerEnrollment_
    ) {
        owner = address(msg.sender);
        passportUtils = IPassportUtils(passportUtilsAddress);
        nationCred = INationCred(nationCredAddress);
        amountPerEnrollment = amountPerEnrollment_;
    }

    receive() external payable {}

    function setOwner(address ownerAddress) public {
        require(msg.sender == owner, "You are not the owner");
        owner = ownerAddress;
    }

    function setPassportUtils(address passportUtilsAddress) public {
        require(msg.sender == owner, "You are not the owner");
        passportUtils = IPassportUtils(passportUtilsAddress);
    }

    function setNationCred(address nationCredAddress) public {
        require(msg.sender == owner, "You are not the owner");
        nationCred = INationCred(nationCredAddress);
    }

    function setAmountPerEnrollment(uint256 amount) public {
        require(msg.sender == owner, "You are not the owner");
        amountPerEnrollment = amount;
        emit AmountPerEnrollmentUpdated(amountPerEnrollment);
    }

    /// Checks if a Nation3 citizen is eligible to enroll for Basic Income.
    function isEligibleToEnroll(address citizen) public view returns (bool) {
        // The account owns the passport NFT
        if (!passportUtils.isOwner(citizen)) {
            return false;
        }

        // The passport has not yet expired
        if (passportUtils.isExpired(citizen)) {
            return false;
        }

        // The passport is not about to expire within the next year
        uint256 expirationTimestamp = passportUtils.getExpirationTimestamp(
            citizen
        );
        uint256 oneYearFromNow = block.timestamp + 365 days;
        if (expirationTimestamp < oneYearFromNow) {
            return false;
        }

        // The citizen is active
        if (!nationCred.isActiveAddress(citizen)) {
            return false;
        }

        return true;
    }

    /// Once eligible, the citizen can enroll for Basic Income, as long as the smart contract contains enough funding for covering one additional citizen's Basic Income for the duration of 1 year.
    function enroll() public {
        if (!isEligibleToEnroll(msg.sender)) {
            revert NotEligibleError(msg.sender);
        }

        uint256 oneYearAgo = block.timestamp - 365 days;
        if (enrollments[msg.sender].timestamp > oneYearAgo) {
            revert CurrentlyEnrolledError(
                msg.sender,
                enrollments[msg.sender].timestamp
            );
        }

        uint256 amountAvailable = address(this).balance - amountEnrolled;
        if (amountAvailable < amountPerEnrollment) {
            revert NotEnoughFunding(amountAvailable, amountPerEnrollment);
        }

        amountEnrolled += amountPerEnrollment;
        enrollments[msg.sender].timestamp = block.timestamp;
        enrollments[msg.sender].amount = amountPerEnrollment;
        emit Enrolled(msg.sender);
    }

    /// Checks if a Nation3 citizen is eligible to claim Basic Income.
    function isEligibleToClaim(address citizen) public view returns (bool) {
        // The account owns the passport NFT
        if (!passportUtils.isOwner(citizen)) {
            return false;
        }

        // The passport has not yet expired
        if (passportUtils.isExpired(citizen)) {
            return false;
        }

        return true;
    }

    /// Calculate the amount that an enrolled citizen can claim
    function getClaimableAmount(address citizen) public view returns (uint256) {
        uint256 latestClaimTimestamp = latestClaimTimestamps[citizen];
        uint256 enrollmentDuration = latestClaimTimestamp == 0
            ? block.timestamp - enrollments[citizen].amount
            : block.timestamp - latestClaimTimestamp;

        uint256 daysSinceLastClaim = enrollmentDuration / 365 days;
        return daysSinceLastClaim * enrollments[citizen].amount;
    }

    /// Once enrolled, citizens can claim their earned Basic Income at any time.
    function claim() public {
        if (!isEligibleToClaim(msg.sender)) {
            revert NotEligibleError(msg.sender);
        }

        uint256 claimableAmount = getClaimableAmount(msg.sender);
        require(claimableAmount > 0, "There is no reward to claim.");

        // Distribute income to citizen
        payable(msg.sender).transfer(claimableAmount);

        // Update latest claim timestamp
        latestClaimTimestamps[msg.sender] = block.timestamp;
        emit Claimed(msg.sender, claimableAmount);
    }
}
