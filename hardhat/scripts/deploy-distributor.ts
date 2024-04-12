import { ethers } from "hardhat";
import { verifyContract, deployContract } from "./helpers.ts";

// Sepolia
const passportUtilsAddress = "0x68ADa619A2b806A2bEc8e3789FfBA206641c22ff";
const nationCredAddress = "0x3C38FBe04C455eFaF762d00c400e1A6589f7269A";
const amountPerEnrollment = ethers.utils.parseEther("0.0033");

// // Mainnet
// const passportUtilsAddress = "0x23Ca3002706b71a440860E3cf8ff64679A00C9d7";
// const nationCredAddress = "0x7794F0Eb1eA812fBcdaBD559551Fb26A79720925";
// const amountPerEnrollment = ethers.utils.parseEther("0.0333");

async function main() {
  const contractName = "BasicIncomeDistributor";
  const contractPath =
    "contracts/BasicIncomeDistributor.sol:BasicIncomeDistributor";

  // Constructor Args
  const args = [passportUtilsAddress, nationCredAddress, amountPerEnrollment];
  console.log("Contract is deploying....");
  const contractAddress = await deployContract(contractName, args);
  await verifyContract(contractPath, contractAddress, args);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
