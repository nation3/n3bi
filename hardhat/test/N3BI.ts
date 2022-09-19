import { expect } from "chai";
import { ethers } from "hardhat";

describe("N3BI", function () {
  it("Should deploy contract", async function () {
    const N3BI = await ethers.getContractFactory("N3BI");
    const incomeTokenAddress = "0x0000000000000000000000000000000000000000";
    const n3bi = await N3BI.deploy(incomeTokenAddress);
    await n3bi.deployed();

    expect(n3bi.address).to.not.equal(undefined);
    expect(n3bi.address.length).to.equal(42);

    const incomeTokenAddressAfterDeployment = await n3bi.incomeToken();
    expect(incomeTokenAddressAfterDeployment).to.not.equal(undefined);
    expect(incomeTokenAddressAfterDeployment).to.equal(incomeTokenAddress);
  });
});
