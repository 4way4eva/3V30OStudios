import { ethers, network } from "hardhat";
import { recordDeployment } from "./utils/manifest";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying BLEULION_CASCADE from ${deployer.address} to ${network.name}`);

  const cascade = await ethers.deployContract("BLEULION_CASCADE");
  await cascade.waitForDeployment();
  const cascadeAddress = await cascade.getAddress();

  console.log(`BLEULION_CASCADE deployed at ${cascadeAddress}`);

  await recordDeployment(network.name, network.config.chainId as number | undefined, {
    BLEULION_CASCADE: cascadeAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
