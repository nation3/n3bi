//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.26;

import "../governance/IVotingEscrow.sol";

contract VotingEscrowMock is IVotingEscrow {
    mapping(address => LockedBalance) locks;

    function create_lock(int128 _value, uint256 _unlock_time) public {
        LockedBalance memory lockedBalance = LockedBalance({
            amount: _value,
            end: _unlock_time
        });
        locks[msg.sender] = lockedBalance;
    }

    function locked(
        address account
    ) public view returns (LockedBalance memory lockedBalance) {
        return locks[account];
    }

    function balanceOf(address account) external view returns (uint256) {
        LockedBalance memory lockedBalance = locks[account];

        uint256 lockAmount = uint256(int256(lockedBalance.amount));
        if (lockAmount == 0) {
            return 0;
        }

        uint256 lockEnd = lockedBalance.end;
        if (lockEnd < block.timestamp) {
            return 0;
        }

        uint256 maxLockPeriod = 4 * 365 days;
        uint256 lockPeriodRemaining = lockEnd - block.timestamp;
        uint256 percentageRemaining = (100 ether * lockPeriodRemaining) /
            maxLockPeriod;
        uint256 amountRemaining = (lockAmount * percentageRemaining) /
            100 ether;
        return amountRemaining;
    }
}
