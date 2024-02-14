import { ethers, run } from "hardhat";

// Sepolia
const passportUtilsAddress = "0x7Ef8C512D39547873A681242EA87881CD2b8B7B7";
const nationCredAddress = "0x0EF98EaE3021B91Cc84E0dd59BAA35cB59981E42";
const amountPerEnrollment = ethers.utils.parseEther("0.0033");

// // Mainnet
// const passportUtilsAddress = "...";
// const nationCredAddress = "0x7794F0Eb1eA812fBcdaBD559551Fb26A79720925";
// const amountPerEnrollment = ethers.utils.parseEther("0.0333");

async function deployContract(name: string, args: Array<any>): Promise<string> {
  const contractFactory = await ethers.getContractFactory(name);

  const contract = await contractFactory.deploy(...args);
  await contract.deployed();
  return contract.address;
}

async function verifyContract(
  contractPath: string,
  contractAddress: string,
  args: Array<any>
) {
  await run("verify:verify", {
    contract: contractPath,
    address: contractAddress,
    constructorArguments: args,
  });
}

async function main() {
  const contractName = "N3BI";
  const contractPath = "contracts/N3BI.sol:N3BI";

  // Constructor Args
  const args = [passportUtilsAddress, nationCredAddress, amountPerEnrollment];

  console.log("Contract is deploying....");
  const contractAddress = await deployContract(contractName, args);
  console.log(`${contractName} deployed to: ${contractAddress}`);

  console.log('Waiting for 30 seconds before verifying...');
  await sleep(30_000);

  console.log("Contract is verifying....");
  await verifyContract(contractPath, contractAddress, args);
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
