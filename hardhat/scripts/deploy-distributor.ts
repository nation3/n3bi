import dotenv from "dotenv";
import { ethers } from "hardhat";
import { deployContract, verifyContract } from "./helpers.ts";

dotenv.config();

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
  const contractOwner =
    process.env.CONTRACT_OWNER || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with `CONTRACT_OWNER`

  // Constructor Args
  const args = [
    contractOwner,
    passportUtilsAddress,
    nationCredAddress,
    amountPerEnrollment,
  ];

  const contractAddress = await deployContract(contractName, args);
  await verifyContract(contractPath, contractAddress, args);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
