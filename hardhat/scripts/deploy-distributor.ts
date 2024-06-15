import { ethers } from "hardhat";
import { verifyContract, deployContract } from "./helpers.ts";

// Sepolia
const passportUtilsAddress = "0x68ADa619A2b806A2bEc8e3789FfBA206641c22ff";
const nationCredAddress = "0x3C38FBe04C455eFaF762d00c400e1A6589f7269A";
const amountPerEnrollment = ethers.utils.parseEther("0.0033");
const ownerAddress = "0xFBB66BC799308435eD2a0e0C0ac3ad1D46749B7b";


// // Mainnet
// const passportUtilsAddress = "0x23Ca3002706b71a440860E3cf8ff64679A00C9d7";
// const nationCredAddress = "0x7794F0Eb1eA812fBcdaBD559551Fb26A79720925";
// const amountPerEnrollment = ethers.utils.parseEther("0.0333");
// const ownerAddress = "0x5afEb7F3259A25EB21287e3A917BeE3d4dE58dAf"


async function main() {
  const contractName = "BasicIncomeDistributor";
  const contractPath =
    "contracts/BasicIncomeDistributor.sol:BasicIncomeDistributor";

  // Constructor Args
  const args = [ownerAddress, passportUtilsAddress, nationCredAddress, amountPerEnrollment];
  const contractAddress = await deployContract(contractName, args);
  await verifyContract(contractPath, contractAddress, args);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
