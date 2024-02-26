import { ethers } from "hardhat";
import { verifyContract, deployContract } from "./helpers.ts";

// Sepolia
const passportUtilsAddress = "0x7Ef8C512D39547873A681242EA87881CD2b8B7B7";
const nationCredAddress = "0x0EF98EaE3021B91Cc84E0dd59BAA35cB59981E42";
const amountPerEnrollment = ethers.utils.parseEther("0.0033");

// // Mainnet
// const passportUtilsAddress = "...";
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
