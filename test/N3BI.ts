import { expect } from "chai";
import { ethers } from "hardhat";

describe("N3BI", function () {
  it("// TODO", async function () {
    const N3BI = await ethers.getContractFactory("N3BI");
    const n3bi = await N3BI.deploy();
    await n3bi.deployed();

    // TODO
    expect(true);
  });
});
