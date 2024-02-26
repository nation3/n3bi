import { ethers, run, network } from "hardhat";
export async function verifyContract(
  contractPath: string,
  contractAddress: string,
  args: Array<any>
) {
  if (network.name === "hardhat") {
    return;
  }
  console.log("Waiting for 30 seconds before verifying...");
  await sleep(30_000);

  console.log("Contract is verifying....");
  await run("verify:verify", {
    contract: contractPath,
    address: contractAddress,
    constructorArguments: args,
  });
}

export async function deployContract(
  name: string,
  args: Array<any>
): Promise<string> {
  console.log("Contract is deploying....");
  const contractFactory = await ethers.getContractFactory(name);

  const contract = await contractFactory.deploy(...args);
  await contract.deployed();
  console.log(`${name} deployed to: ${contract.address}`);
  return contract.address;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
