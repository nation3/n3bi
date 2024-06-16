import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const amountPerEnrollment = ethers.utils.parseEther("0.12");
const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1_000;
const ONE_DAY_IN_SECONDS = 1 * 24 * 60 * 60;

describe("BasicIncomeDistributor", function () {
  async function deployFixture() {
    const [owner, otherAccount, user1, user2, user3] =
      await ethers.getSigners();

    console.log("owner:", owner.address);

    const ownerBalance = await owner.getBalance();
    console.log("ownerBalance:", ownerBalance);

    const PASS3 = await ethers.getContractFactory("PassportMock");
    const pass3 = await PASS3.deploy();

    const PassportIssuer = await ethers.getContractFactory(
      "PassportIssuerMock"
    );
    const passportIssuer = await PassportIssuer.deploy(pass3.address);

    const VotingEscrow = await ethers.getContractFactory("VotingEscrowMock");
    const votingEscrow = await VotingEscrow.deploy();

    const PassportUtils = await ethers.getContractFactory("PassportUtilsMock");
    const passportUtils = await PassportUtils.deploy(
      passportIssuer.address,
      votingEscrow.address
    );

    const NationCred = await ethers.getContractFactory("NationCredMock");
    const nationCred = await NationCred.deploy(pass3.address);

    const BasicIncomeDistributor = await ethers.getContractFactory(
      "BasicIncomeDistributor"
    );

    const distributor = await BasicIncomeDistributor.deploy(
      owner.address,
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

  beforeEach(async function () {
    // Make test output more readable
    console.log("");
  });

  it("Should set the correct owner during deployment", async function () {
    const { distributor, owner } = await loadFixture(deployFixture);
    expect(await distributor.owner()).to.equal(owner.address);
  });

  it("Should deploy contract", async function () {
    const { distributor, passportUtils } = await loadFixture(deployFixture);

    expect(distributor.address).to.not.equal(undefined);
    expect(distributor.address.length).to.equal(42);

    expect(passportUtils.address).to.not.equal(undefined);
    expect(passportUtils.address.length).to.equal(42);
  });

  it("Should set owner via constructor parameter during deployment", async () => {
    const { owner, distributor } = await loadFixture(deployFixture);
    expect(await distributor.signer.getAddress()).to.equal(owner.address);
  });

  it("setOwner", async function () {
    const { otherAccount, distributor } = await loadFixture(deployFixture);

    await distributor.setOwner(otherAccount.address);
    expect(await distributor.owner()).to.equal(otherAccount.address);
  });

  it("setPassportUtils", async function () {
    const { distributor } = await loadFixture(deployFixture);

    await distributor.setPassportUtils(ethers.constants.AddressZero);
    expect(await distributor.passportUtils()).to.equal(
      ethers.constants.AddressZero
    );
  });

  it("setNationCred", async function () {
    const { distributor } = await loadFixture(deployFixture);

    await distributor.setNationCred(ethers.constants.AddressZero);
    expect(await distributor.nationCred()).to.equal(
      ethers.constants.AddressZero
    );
  });

  it("setAmountPerEnrollment", async function () {
    const { distributor } = await loadFixture(deployFixture);

    await distributor.setAmountPerEnrollment(0);
    expect(await distributor.amountPerEnrollment()).to.equal(0);
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

    it("passport will not expire within the next year, and nationcred is active", async function () {
      const { distributor, passportIssuer, votingEscrow, nationCred, owner } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

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

      await nationCred.setActiveCitizens([passportId]);

      expect(await distributor.isEligibleToEnroll(owner.address)).to.equal(
        true
      );
    });
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

    it("address is passport owner, but passport has expired", async function () {
      const { distributor, owner, passportIssuer } = await loadFixture(
        deployFixture
      );

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      await expect(distributor.enroll()).to.be.revertedWithCustomError(
        distributor,
        "NotEligibleError"
      );

      const enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      expect(enrollment.timestamp).to.equal(0);
      expect(enrollment.amount).to.equal(0);
    });

    it("passport will not expire within the next year, but nationcred is not active", async function () {
      const { distributor, owner, passportIssuer, votingEscrow } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await expect(
        distributor.connect(owner).enroll()
      ).to.be.revertedWithCustomError(distributor, "NotEligibleError");

      const enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      expect(enrollment.timestamp).to.equal(0);
      expect(enrollment.amount).to.equal(0);
    });

    it("is eligible to enroll, but distributor contract has insufficient funding", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      await expect(
        distributor.connect(owner).enroll()
      ).to.be.revertedWithCustomError(distributor, "NotEnoughFundingError");

      const enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      expect(enrollment.timestamp).to.equal(0);
      expect(enrollment.amount).to.equal(0);
    });

    it("is eligible to enroll, and distributor contract has enough funding", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      await distributor.connect(owner).enroll();

      const enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      expect(enrollment.timestamp).to.not.equal(0);
      expect(enrollment.amount).to.equal(amountPerEnrollment);
    });

    it("two enrollments - 2nd enrollment same day", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      // 1st enrollment
      await distributor.connect(owner).enroll();

      // 2nd enrollment
      await expect(
        distributor.connect(owner).enroll()
      ).to.be.revertedWithCustomError(distributor, "CurrentlyEnrolledError");
    });

    it("two enrollments - 2nd enrollment 364 days later", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      // 1st enrollment
      await distributor.connect(owner).enroll();

      // Simulate the passage of time, to 364 days later
      await time.increase(ONE_DAY_IN_SECONDS * 364);
      console.log("364 days later:", new Date((await time.latest()) * 1_000));

      // 2nd enrollment
      await expect(
        distributor.connect(owner).enroll()
      ).to.be.revertedWithCustomError(distributor, "CurrentlyEnrolledError");
    });

    it("two enrollments - 2nd enrollment 366 days later", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      // 1st enrollment
      await distributor.connect(owner).enroll();

      // Simulate the passage of time, to 366 days later
      await time.increase(ONE_DAY_IN_SECONDS * 366);
      console.log("364 days later:", new Date((await time.latest()) * 1_000));

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      // 2nd enrollment
      await distributor.connect(owner).enroll();

      const enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      expect(enrollment.timestamp).to.not.equal(0);
      expect(enrollment.amount).to.equal(amountPerEnrollment);
    });
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
      const passportId = await passportIssuer.passportId(user2.address);
      console.log("passportId:", passportId);

      expect(await distributor.isEligibleToClaim(user2.address)).to.equal(
        false
      );
    });

    it("address is passport owner, and passport has not expired", async function () {
      const { distributor, user2, passportIssuer, votingEscrow } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(user2).claim();
      const passportId = await passportIssuer.passportId(user2.address);
      console.log("passportId:", passportId);

      // Lock 1.60 $NATION for 4 years
      const lockAmount = ethers.utils.parseUnits("1.60");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(user2)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(user2.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      expect(await distributor.isEligibleToClaim(user2.address)).to.equal(true);
    });
  });

  describe("getClaimableAmount", function () {
    it("not enrolled", async function () {
      const { distributor, owner } = await loadFixture(deployFixture);

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);
      expect(claimableAmount).to.equal(0);
    });

    it("claimable - immediately after enrolling", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      await distributor.connect(owner).enroll();

      const enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      expect(enrollment.timestamp).to.not.equal(0);
      expect(enrollment.amount).to.equal(amountPerEnrollment);

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);
      expect(claimableAmount).to.equal(0);
    });

    it("claimable - 182.5 days after enrolling", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      await distributor.connect(owner).enroll();

      // Simulate the passage of time, to 182.5 days later
      await time.increase(ONE_DAY_IN_SECONDS * 182.5);
      console.log("182.5 days later:", new Date((await time.latest()) * 1_000));

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);
      expect(claimableAmount).to.equal(ethers.utils.parseEther("0.06")); // 0.12 / 2
    });

    it("claimable - 365 days after enrolling", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 3.20 $NATION for 4 years
      //  - 2.40 $veNATION after 1 year
      //  - 1.60 $veNATION after 2 years
      //  - 0.80 $veNATION after 3 years
      //  - 0.00 $veNATION after 4 years
      const lockAmount = ethers.utils.parseUnits("3.20");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      await distributor.connect(owner).enroll();

      // Simulate the passage of time, to 365 days later
      await time.increase(ONE_DAY_IN_SECONDS * 365);
      console.log("365 days later:", new Date((await time.latest()) * 1_000));

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);
      expect(claimableAmount).to.equal(amountPerEnrollment);
    });
  });

  describe("claim", function () {
    it("address is not passport owner", async function () {
      const { distributor, owner } = await loadFixture(deployFixture);

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);

      await expect(
        distributor.connect(owner).claim()
      ).to.be.revertedWithCustomError(distributor, "NotEligibleError");
    });

    it("address is passport owner, but passport has expired", async function () {
      const { distributor, owner, passportIssuer } = await loadFixture(
        deployFixture
      );

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);

      await expect(
        distributor.connect(owner).claim()
      ).to.be.revertedWithCustomError(distributor, "NotEligibleError");
    });

    it("address is passport owner, and passport has not expired", async function () {
      const { distributor, owner, passportIssuer, votingEscrow } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 1.51 $NATION for 4 years
      const lockAmount = ethers.utils.parseUnits("1.51");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      const claimableAmount = await distributor.getClaimableAmount(
        owner.address
      );
      console.log("claimableAmount:", claimableAmount);

      await expect(distributor.connect(owner).claim()).to.emit(
        distributor,
        "Claimed"
      );
    });

    it("handle multiple claims during one enrollment", async function () {
      const { distributor, owner, passportIssuer, votingEscrow, nationCred } =
        await loadFixture(deployFixture);

      // Claim passport
      await passportIssuer.connect(owner).claim();
      const passportId = await passportIssuer.passportId(owner.address);
      console.log("passportId:", passportId);

      // Lock 10 $NATION for 4 years
      const lockAmount = ethers.utils.parseUnits("10");
      const initialLockDate = new Date();
      console.log("initialLockDate:", initialLockDate);
      const lockEnd = new Date(
        initialLockDate.getTime() + 4 * oneYearInMilliseconds
      );
      console.log("lockEnd:", lockEnd);
      const lockEndInSeconds = Math.round(lockEnd.getTime() / 1_000);
      await votingEscrow
        .connect(owner)
        .create_lock(lockAmount, ethers.BigNumber.from(lockEndInSeconds));
      const votingEscrowBalance = await votingEscrow.balanceOf(owner.address);
      console.log("votingEscrowBalance:", votingEscrowBalance);

      await nationCred.setActiveCitizens([passportId]);

      // Fund contract for covering one additional citizen's Basic Income
      await owner.sendTransaction({
        to: distributor.address,
        value: amountPerEnrollment,
      });

      let distributorBalance = await distributor.provider.getBalance(
        distributor.address
      );
      console.log("distributorBalance:", distributorBalance);
      expect(distributorBalance).to.equal(ethers.utils.parseEther("0.12"));

      await distributor.connect(owner).enroll();
      let enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);
      console.log("enrollment date:", new Date(enrollment.timestamp * 1_000));

      // Simulate the passage of time, to 91.25 days after enrollment
      const timestampOf1stClaim =
        Number(enrollment.timestamp) + ONE_DAY_IN_SECONDS * 91.25;
      console.log("timestampOf1stClaim:", timestampOf1stClaim);
      await time.increaseTo(timestampOf1stClaim);
      console.log("91.25 days later:", new Date((await time.latest()) * 1_000));

      let claimableAmount = await distributor.getClaimableAmount(owner.address);
      console.log("claimableAmount:", claimableAmount);

      await expect(distributor.connect(owner).claim()).to.emit(
        distributor,
        "Claimed"
      ) /* .withArgs(owner.address, ethers.utils.parseEther("0.03")) */;

      enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);

      distributorBalance = await distributor.provider.getBalance(
        distributor.address
      );
      console.log("distributorBalance:", distributorBalance);
      expect(distributorBalance).to.be.lessThanOrEqual(
        ethers.utils.parseEther("0.09")
      ); // 0.12 - 0.03 = 0.09
      expect(distributorBalance).to.be.greaterThan(
        ethers.utils.parseEther("0.089999")
      );

      // Simulate the passage of time, to 182.5 days after enrollment
      const timestampOf2ndClaim =
        Number(enrollment.timestamp) + ONE_DAY_IN_SECONDS * 182.5;
      console.log("timestampOf2ndClaim:", timestampOf2ndClaim);
      await time.increaseTo(timestampOf2ndClaim);
      console.log("182.5 days later:", new Date((await time.latest()) * 1_000));

      claimableAmount = await distributor.getClaimableAmount(owner.address);
      console.log("claimableAmount:", claimableAmount);

      await expect(distributor.connect(owner).claim()).to.emit(
        distributor,
        "Claimed"
      ) /* .withArgs(owner.address, ethers.utils.parseEther("0.03")) */;

      enrollment = await distributor.enrollments(owner.address);
      console.log("enrollment:", enrollment);

      distributorBalance = await distributor.provider.getBalance(
        distributor.address
      );
      console.log("distributorBalance:", distributorBalance);
      expect(distributorBalance).to.be.lessThanOrEqual(
        ethers.utils.parseEther("0.06")
      ); // 0.12 - 0.03 - 0.03 = 0.06
      expect(distributorBalance).to.be.greaterThan(
        ethers.utils.parseEther("0.059999")
      );
    });
  });
});
