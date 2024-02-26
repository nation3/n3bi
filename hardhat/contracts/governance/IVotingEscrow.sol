//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVotingEscrow is IERC20 {
    struct LockedBalance {
        int128 amount;
        uint256 end;
    }

    function locked(address) external view returns (LockedBalance memory);
}
