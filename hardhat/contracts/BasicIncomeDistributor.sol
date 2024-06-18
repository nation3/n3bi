// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.26;

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
        uint256 amountClaimed;
    }

    string public constant VERSION = "0.8.0";

    address public owner;

    /// @notice The smart contract used for checking if a citizen holds a valid passport.
    IPassportUtils public passportUtils;

    /// @notice The smart contract used for checking if a Nation3 citizen is active.
    INationCred public nationCred;

    /// @notice The Basic Income amount a citizen can claim per yearly enrollment.
    uint256 public amountPerEnrollment;

    /// @notice The total amount enrolled, accumulated over time.
    uint256 public amountEnrolled;

    /// @notice Each citizen's most recent enrollment.
    mapping(address => Enrollment) public enrollments;

    event Enrolled(address citizen);
    event Claimed(address citizen, uint256 amount);
    event AmountPerEnrollmentUpdated(uint256 newAmount);

    error NotEligibleError(address citizen);
    error CurrentlyEnrolledError(address citizen, uint256 enrollmentTimestamp);
    error NotEnoughFundingError(
        uint256 amountAvailable,
        uint256 amountRequested
    );
    error NotEnrolledError(address citizen);

    constructor(
        address ownerAddress,
        address passportUtilsAddress,
        address nationCredAddress,
        uint256 amountPerEnrollment_
    ) {
        owner = ownerAddress;
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

    /// @notice Checks if a citizen is eligible to enroll for Basic Income.
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

    /// @notice Checks if a citizen is currently enrolled.
    function isEnrolled(address citizen) public view returns (bool) {
        return enrollments[citizen].timestamp != 0;
    }

    /// @notice Once eligible, the citizen can enroll for Basic Income, as long as the smart contract contains enough funding for covering one additional citizen's Basic Income for the duration of 1 year.
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
            revert NotEnoughFundingError(amountAvailable, amountPerEnrollment);
        }

        amountEnrolled += amountPerEnrollment;
        enrollments[msg.sender].timestamp = block.timestamp;
        enrollments[msg.sender].amount = amountPerEnrollment;
        emit Enrolled(msg.sender);
    }

    /// @notice Checks if a citizen is eligible to claim Basic Income.
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

    /// @notice Calculate the amount that an enrolled citizen can claim.
    function getClaimableAmount(address citizen) public view returns (uint256) {
        Enrollment memory enrollment = enrollments[citizen];

        // If the citizen has not enrolled, return zero
        if (enrollment.timestamp == 0) {
            return 0;
        }

        // Calculate the time passed since the enrollment
        uint256 enrollmentDuration = block.timestamp - enrollment.timestamp;

        // Calculate the total claimable amount based on the enrollment duration relative to 1 year
        uint256 totalClaimableAmount = (enrollmentDuration >= 365 days)
            ? amountPerEnrollment
            : (amountPerEnrollment * enrollmentDuration) / 365 days;

        // Return the total claimable amount, minus previous claims (if any)
        return totalClaimableAmount - enrollment.amountClaimed;
    }

    /// @notice Once enrolled, citizens can claim their earned Basic Income at any time.
    function claim() public {
        if (!isEligibleToClaim(msg.sender)) {
            revert NotEligibleError(msg.sender);
        }

        if (!isEnrolled(msg.sender)) {
            revert NotEnrolledError(msg.sender);
        }

        uint256 claimableAmount = getClaimableAmount(msg.sender);

        // Distribute income to citizen
        payable(msg.sender).transfer(claimableAmount);

        // Update enrollment
        Enrollment memory enrollment = enrollments[msg.sender];
        enrollment.amountClaimed += claimableAmount;
        enrollments[msg.sender] = enrollment;

        emit Claimed(msg.sender, claimableAmount);
    }
}
