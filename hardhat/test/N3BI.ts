import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { ethers } from "hardhat";

describe("N3BI", function () {
  async function deployFixture() {
    const [owner, otherAccount, user1, user2, user3] =
      await ethers.getSigners();

    const incomeTokenAddress = ethers.constants.AddressZero;

    const PASS3 = await ethers.getContractFactory("PassportMock");
    const pass3 = await PASS3.deploy();

    const NationCred = await ethers.getContractFactory("NationCredMock");
    const nationCred = await NationCred.deploy();

    const N3BI = await ethers.getContractFactory("N3BI");
    const n3bi = await N3BI.deploy(
      incomeTokenAddress,
      pass3.address,
      nationCred.address
    );
    await n3bi.deployed();

    return {
      incomeTokenAddress,
      pass3,
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
    const { n3bi, incomeTokenAddress } = await loadFixture(deployFixture);

    expect(n3bi.address).to.not.equal(undefined);
    expect(n3bi.address.length).to.equal(42);

    const incomeTokenAddressAfterDeployment = await n3bi.incomeToken();
    expect(incomeTokenAddressAfterDeployment).to.not.equal(undefined);
    expect(incomeTokenAddressAfterDeployment).to.equal(incomeTokenAddress);
  });

  describe("isPassportOwner", function () {
    it("passportID does not exist", async function () {
      const { n3bi, owner } = await loadFixture(deployFixture);

      const passportID = 0;
      await expect(
        n3bi.isPassportOwner(owner.address, passportID)
      ).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("passportID exists, but address is not owner", async function () {
      const { n3bi, pass3, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await pass3.safeMint(owner.address);

      const passportID = 0;
      expect(
        await n3bi.isPassportOwner(otherAccount.address, passportID)
      ).to.equal(false);
    });

    it("passportID exists, and address is owner", async function () {
      const { n3bi, pass3, owner } = await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

      const passportID = 0;
      expect(await n3bi.isPassportOwner(owner.address, passportID)).to.equal(
        true
      );
    });
  });

  describe("isEligible", function () {
    it("passportID does not exist", async function () {
      const { n3bi, owner } = await loadFixture(deployFixture);

      const passportID = 0;
      expect(await n3bi.isEligible(owner.address, passportID)).to.equal(false);
    });

    it("passportID exists, but address is not owner", async function () {
      const { n3bi, pass3, owner, otherAccount } = await loadFixture(
        deployFixture
      );

      await pass3.safeMint(owner.address);

      const passportID = 0;
      expect(await n3bi.isEligible(otherAccount.address, passportID)).to.equal(
        false
      );
    });

    it("passportID exists, and address is owner, but nationcred is not active", async function () {
      const { n3bi, pass3, owner } = await loadFixture(deployFixture);

      await pass3.safeMint(owner.address);

      const passportID = 0;
      expect(await n3bi.isEligible(owner.address, passportID)).to.equal(false);
    });

    it("passportID exists, and address is owner, and nationcred is active", async function () {
      const { n3bi, pass3, nationCred, owner } = await loadFixture(
        deployFixture
      );

      await pass3.safeMint(owner.address);

      const passportID = 0;
      await nationCred.setActiveCitizens([passportID]);

      expect(await n3bi.isEligible(owner.address, passportID)).to.equal(true);
    });
  });
});
