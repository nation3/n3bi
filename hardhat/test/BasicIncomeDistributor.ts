import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1_000;

describe("BasicIncomeDistributor", function () {
  async function deployFixture() {
    const [owner, otherAccount, user1, user2, user3] =
      await ethers.getSigners();
    const ownerBalance = await owner.getBalance();
    console.log("ownerBalance:", ownerBalance);

    const PASS3 = await ethers.getContractFactory("PassportMock");
    const pass3 = await PASS3.deploy();

    const PassportIssuer = await ethers.getContractFactory(
      "PassportIssuerMock"
    );
    const passportIssuer = await PassportIssuer.deploy();

    const VotingEscrow = await ethers.getContractFactory("VotingEscrowMock");
    const votingEscrow = await VotingEscrow.deploy();

    const PassportUtils = await ethers.getContractFactory("PassportUtilsMock");
    const passportUtils = await PassportUtils.deploy(
      passportIssuer.address,
      votingEscrow.address
    );

    const NationCred = await ethers.getContractFactory("NationCredMock");
    const nationCred = await NationCred.deploy(pass3.address);

    const amountPerEnrollment = ethers.utils.parseEther("0.12");

    const BasicIncomeDistributor = await ethers.getContractFactory(
      "BasicIncomeDistributor"
    );

    const distributor = await BasicIncomeDistributor.deploy(
      passportUtils.address,
      nationCred.address,
      amountPerEnrollment
    );
    await distributor.deployed();

    return {
      pass3,
      votingEscrow,
      passportUtils,
      passportIssuer,
      nationCred,
      distributor,
      owner,
      otherAccount,
      user1,
      user2,
      user3,
    };
  }

  it("Should deploy contract", async function () {
    const { distributor, passportUtils } = await loadFixture(deployFixture);

    expect(distributor.address).to.not.equal(undefined);
    expect(distributor.address.length).to.equal(42);

    expect(passportUtils.address).to.not.equal(undefined);
    expect(passportUtils.address.length).to.equal(42);
  });

  describe("isEligibleToEnroll", function () {
    it("address is not passport owner", async function () {
      const { distributor, owner } = await loadFixture(deployFixture);

      expect(await distributor.isEligibleToEnroll(owner.address)).to.equal(
        false
      );
    });

    it("address is passport owner, but passport has expired", async function () {
      const { distributor, passportIssuer, otherAccount } = await loadFixture(
        deployFixture
      );

      // Claim passport
      await passportIssuer.connect(otherAccount).claim();

      expect(
        await distributor.isEligibleToEnroll(otherAccount.address)
      ).to.equal(false);
    });

    it("address is passport owner, but passport will expire within the next year", async function () {
      const {
        distributor,
        passportIssuer,
        passportUtils,
        votingEscrow,
        otherAccount,
      } = await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(otherAccount).claim();

      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);

      // Lock 1.60 $NATION for 4 years
      //  - 1.20 $veNATION after 1 year
      //  - 0.80 $veNATION after 2 years
      //  - 0.40 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("1.60");
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(otherAccount)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(
        otherAccount.address
      );
      console.log("votingEscrowBalance:", votingEscrowBalance);

      const expirationTimestamp = await passportUtils.getExpirationTimestamp(
        otherAccount.address
      );
      console.log("expirationTimestamp:", expirationTimestamp);
      console.log(
        "expirationTimestamp (Date):",
        new Date(expirationTimestamp * 1_000)
      );

      expect(
        await distributor.isEligibleToEnroll(otherAccount.address)
      ).to.equal(false);
    });

    it("passport will not expire within the next year, but nationcred is not active", async function () {
      const { distributor, passportIssuer, votingEscrow, owner } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();

      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow.create_lock(
        lockAmount,
        ethers.BigNumber.from(lockEndInSeconds)
      );
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      expect(await distributor.isEligibleToEnroll(owner.address)).to.equal(
        false
      );
    });

    // TO DO:  passport will not expire within the next year, and nationcred is active
  });

  describe("enroll", function () {
    it("address is not passport owner", async function () {
      const { distributor, owner } = await loadFixture(deployFixture);

      await expect(distributor.enroll()).to.be.revertedWithCustomError(
        distributor,
        "NotEligibleError"
      );
      expect(await distributor.enrollments(owner.address).timestamp).to.equal(
        undefined
      );
      expect(await distributor.enrollments(owner.address).amount).to.equal(
        undefined
      );
    });

    // TO DO:  citizen is eligible

    // TO DO:  two enrollments - 2nd enrollment same da

    // TO DO:  two enrollments - 2nd enrollment 364 days later

    // TO DO:  two enrollments - 2nd enrollment 366 days later
  });

  describe("isEligibleToClaim", function () {
    it("address is not passport owner", async function () {
      const { distributor, user2 } = await loadFixture(deployFixture);

      expect(await distributor.isEligibleToClaim(user2.address)).to.equal(
        false
      );
    });

    it("address is passport owner, but passport has expired", async function () {
      const { distributor, user2, passportIssuer } = await loadFixture(
        deployFixture
      );

      // Claim passport
      await passportIssuer.connect(user2).claim();

      expect(await distributor.isEligibleToClaim(user2.address)).to.equal(
        false
      );
    });
  });

  describe("getClaimableAmount", function () {
    // TO DO
  });

  describe("claim", function () {
    // TO DO
  });
});
