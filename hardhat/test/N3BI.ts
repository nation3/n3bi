import { expect } from "chai";
import { ethers } from "hardhat";

describe("N3BI", function () {
  it("Should deploy contract", async function () {
    const N3BI = await ethers.getContractFactory("N3BI");
    const incomeTokenAddress = ethers.constants.AddressZero;
    const n3bi = await N3BI.deploy(incomeTokenAddress);
    await n3bi.deployed();

    expect(n3bi.address).to.not.equal(undefined);
    expect(n3bi.address.length).to.equal(42);

    const incomeTokenAddressAfterDeployment = await n3bi.incomeToken();
    expect(incomeTokenAddressAfterDeployment).to.not.equal(undefined);
    expect(incomeTokenAddressAfterDeployment).to.equal(incomeTokenAddress);
  });

  describe("isEligible", function () {
    it("address is not a passport holder", async function () {
      const [owner] = await ethers.getSigners();

      const N3BI = await ethers.getContractFactory("N3BI");
      const incomeTokenAddress = ethers.constants.AddressZero;
      const n3bi = await N3BI.deploy(incomeTokenAddress);
      await n3bi.deployed();

      expect(await n3bi.isEligible(owner.address)).to.equal(false);
    });
  });
});
