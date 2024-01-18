import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1_000;

describe("N3BI", function () {
  async function deployFixture() {
    const [owner, otherAccount, user1, user2, user3] =
      await ethers.getSigners();

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

    const N3BI = await ethers.getContractFactory("N3BI");
    const n3bi = await N3BI.deploy(passportUtils.address, nationCred.address);
    await n3bi.deployed();

    return {
      pass3,
      votingEscrow,
      passportUtils,
      nationCred,
      n3bi,
      owner,
      otherAccount,
      user1,
      user2,
      user3,
    };
  }

  it("Should deploy contract", async function () {
    const { n3bi, passportUtils } = await loadFixture(deployFixture);

    expect(n3bi.address).to.not.equal(undefined);
    expect(n3bi.address.length).to.equal(42);

    expect(passportUtils.address).to.not.equal(undefined);
    expect(passportUtils.address.length).to.equal(42);
  });

  describe("isEligible", function () {
    it("address is not passport owner", async function () {
      const { n3bi, owner } = await loadFixture(deployFixture);

      expect(await n3bi.isEligible(owner.address)).to.equal(false);
    });

    // TO DO:  address is passport owner, but passport has expired

    // TO DO:  address is passport owner, but passport will expire within the next year

    it("address is owner of valid passport, but nationcred is not active", async function () {
      const { n3bi, pass3, votingEscrow, owner } = await loadFixture(
        deployFixture
      );

      await pass3.safeMint(owner.address);

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

      expect(await n3bi.isEligible(owner.address)).to.equal(false);
    });

    it("address is owner of valid passport, and nationcred is active", async function () {
      const { n3bi, pass3, votingEscrow, nationCred, owner } =
        await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

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

      const passportID = 0;
      await nationCred.setActiveCitizens([passportID]);

      expect(await n3bi.isEligible(owner.address)).to.equal(true);
    });
  });

  describe("enroll", function () {
    it("address is not passport owner", async function () {
      const { n3bi, owner } = await loadFixture(deployFixture);

      await expect(
        n3bi.enroll()
      ).to.be.revertedWithCustomError(n3bi, "NotEligibleError");
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.equal(0);
    });

    it("citizen is eligible", async function () {
      const { n3bi, pass3, votingEscrow, nationCred, owner } =
        await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

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

      const passportID = 0;
      await nationCred.setActiveCitizens([passportID]);
      
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.equal(0);
      await expect(
        n3bi.enroll()
      ).to.emit(n3bi, "Enrolled");
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.be.greaterThan(0);
    });

    it("two enrollments - 2nd enrollment same day", async function () {
      const { n3bi, pass3, votingEscrow, nationCred, owner } =
        await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

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

      const passportID = 0;
      await nationCred.setActiveCitizens([passportID]);
      
      // 1st enrollment
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.equal(0);
      await expect(
        n3bi.enroll()
      ).to.emit(n3bi, "Enrolled");
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.be.greaterThan(0);

      // 2nd enrollment
      await expect(
        n3bi.enroll()
      ).to.be.revertedWithCustomError(n3bi, "CurrentlyEnrolledError");
    });

    it("two enrollments - 2nd enrollment 364 days later", async function () {
      const { n3bi, pass3, votingEscrow, nationCred, owner } =
        await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

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

      const passportID = 0;
      await nationCred.setActiveCitizens([passportID]);
      
      // 1st enrollment
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.equal(0);
      await expect(
        n3bi.enroll()
      ).to.emit(n3bi, "Enrolled");
      const timestampOfFirstEnrollment = await n3bi.enrollmentTimestamps(owner.address);
      expect(timestampOfFirstEnrollment).to.be.greaterThan(0);

      // Increase the time by 364 days
      const ONE_DAY_IN_SECONDS = 60*60*24;
      await time.increase(364 * ONE_DAY_IN_SECONDS);
      console.log("Time 364 days later:", await time.latest());

      // 2nd enrollment
      await expect(
        n3bi.enroll()
      ).to.be.revertedWithCustomError(n3bi, "CurrentlyEnrolledError");
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.equal(timestampOfFirstEnrollment);
    });

    it("two enrollments - 2nd enrollment 366 days later", async function () {
      const { n3bi, pass3, votingEscrow, nationCred, owner } =
        await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

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

      const passportID = 0;
      await nationCred.setActiveCitizens([passportID]);
      
      // 1st enrollment
      expect(await n3bi.enrollmentTimestamps(owner.address)).to.equal(0);
      await expect(
        n3bi.enroll()
      ).to.emit(n3bi, "Enrolled");
      const timestampOf1stEnrollment = await n3bi.enrollmentTimestamps(owner.address);
      expect(timestampOf1stEnrollment).to.be.greaterThan(0);

      // Increase the time by 366 days
      const ONE_DAY_IN_SECONDS = 60*60*24;
      await time.increase(366 * ONE_DAY_IN_SECONDS);
      console.log("Time 366 days later:", await time.latest());

      // 2nd enrollment
      await expect(
        n3bi.enroll()
      ).to.emit(n3bi, "Enrolled");
      const timestampOf2ndEnrollment = await n3bi.enrollmentTimestamps(owner.address);
      expect(timestampOf2ndEnrollment).to.be.greaterThan(timestampOf1stEnrollment);
    });
  });
});
