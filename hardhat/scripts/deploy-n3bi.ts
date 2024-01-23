import { ethers, run } from "hardhat";

// Mainnet
// const passportUtilsAddress = "...";
// const nationCredAddress = "0x7794F0Eb1eA812fBcdaBD559551Fb26A79720925";

// Goerli
// const passportUtilsAddress = "0xdBBCE0e796d10C95D23b4AAfCD19DEf268502A5b";
// const nationCredAddress = "0x12ee4FE795CD3C42422CC7CE8b9446c27BdA531f";

// Sepolia
const passportUtilsAddress = "0x4C72e8f37a2652BA6eEE956Ab30Ff21C3514cb5a";
const nationCredAddress = "0x0EF98EaE3021B91Cc84E0dd59BAA35cB59981E42";

const amountPerEnrollment = ethers.utils.parseEther("0.012");

async function deployContract(name: string, args: Array<any>): Promise<string> {
  const contractFactory = await ethers.getContractFactory(name);

  const contract = await contractFactory.deploy(...args);
  await contract.deployed();
  return contract.address
}

async function verifyContract(contractAddress: string, args: Array<any>) {
  await run("verify:verify", {
    address: contractAddress,
    constructorArguments: args
  });
}
async function main() {
  const contractName = "N3BI"
  const args = [passportUtilsAddress, nationCredAddress, amountPerEnrollment]
  const contractAddress = await deployContract(contractName, args)
  console.log(`${contractName} deployed to: ${contractAddress}`);
  console.log('Contract is verifying....')
  await verifyContract(contractAddress, args)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
