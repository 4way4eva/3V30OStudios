import { ethers, network } from "hardhat";
import { recordDeployment, resolveDeployment } from "./utils/manifest";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying governance bundle from ${deployer.address} on ${network.name}`);

  const cascadeAddress =
    process.env.CASCADE_ADDRESS || (await resolveDeployment(network.name, "BLEULION_CASCADE"));

  if (!cascadeAddress) {
    throw new Error("Cascade address not configured. Set CASCADE_ADDRESS or deploy cascade on this network.");
  }

  console.log(`Using BLEULION_CASCADE at ${cascadeAddress}`);

  const watchtower = await ethers.deployContract("BLEU_WATCHTOWER", [cascadeAddress]);
  await watchtower.waitForDeployment();
  const watchtowerAddress = await watchtower.getAddress();
  console.log(`BLEU_WATCHTOWER deployed at ${watchtowerAddress}`);

  const governance = await ethers.deployContract("BLEU_GOV_SCROLL", [
    deployer.address,
    cascadeAddress,
    watchtowerAddress,
  ]);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log(`BLEU_GOV_SCROLL deployed at ${governanceAddress}`);

  try {
    const cascade = await ethers.getContractAt("BLEULION_CASCADE", cascadeAddress);
    const tx = await cascade.setVaultRegistrar(watchtowerAddress);
    await tx.wait();
    console.log("Assigned BLEU_WATCHTOWER as vault registrar");
  } catch (error) {
    console.warn("Unable to assign watchtower as vault registrar automatically", error);
  }

  await recordDeployment(network.name, network.config.chainId as number | undefined, {
    BLEU_WATCHTOWER: watchtowerAddress,
    BLEU_GOV_SCROLL: governanceAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
