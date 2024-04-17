import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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

    // TO DO:  address is passport owner, but passport has expired

    // TO DO:  address is passport owner, but passport will expire within the next year

    it("address is owner of valid passport, but nationcred is not active", async function () {
      const { distributor, passportIssuer, votingEscrow, owner } = await loadFixture(
        deployFixture
      );

      // Claim passport
      await passportIssuer.connect(owner).claim();

      // Lock 6 $NATION for 4 years
      //  - 4.5 $veNATION after 1 year
      //  - 3.0 $veNATION after 2 years
      //  - 1.5 $veNATION after 3 years
      //  - 0.0 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("6");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow.create_lock(
        lockAmount,
        ethers.BigNumber.from(lockEndInSeconds)
      );

      expect(await distributor.isEligibleToEnroll(owner.address)).to.equal(
        false
      );
    });

    // TO DO:  address is owner of valid passport, and nationcred is active
  });

  
  describe("enroll", function () {
    it("address is not passport owner", async function () {
      const { distributor, owner } = await loadFixture(deployFixture);

      await expect(distributor.enroll()).to.be.revertedWithCustomError(
        distributor,
        "NotEligibleError"
      );
      expect(await distributor.enrollmentTimestamps(owner.address)).to.equal(0);
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
      const { distributor, user2, passportIssuer } = await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(user2).claim();

      expect(await distributor.isEligibleToClaim(user2.address)).to.equal(
        false
      );
    });
  });


  describe("claim", function () {
    // TO DO
  });
});
