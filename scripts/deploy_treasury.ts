import { ethers, network } from "hardhat";
import { recordDeployment, resolveDeployment } from "./utils/manifest";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying treasury contracts from ${deployer.address} on ${network.name}`);

  const cascadeAddress =
    process.env.CASCADE_ADDRESS || (await resolveDeployment(network.name, "BLEULION_CASCADE"));

  if (!cascadeAddress) {
    throw new Error("Cascade address not configured. Set CASCADE_ADDRESS or deploy cascade on this network.");
  }

  const bleuToken = await ethers.deployContract("BLEUToken");
  await bleuToken.waitForDeployment();
  const bleuTokenAddress = await bleuToken.getAddress();
  console.log(`BLEUToken deployed at ${bleuTokenAddress}`);

  const baseUri = process.env.BLEU1155_BASE_URI || "ipfs://BLEULION_SCROLLS/{id}.json";
  const evo1155 = await ethers.deployContract("EV0L1155", [baseUri]);
  await evo1155.waitForDeployment();
  const evo1155Address = await evo1155.getAddress();
  console.log(`EV0L1155 deployed at ${evo1155Address}`);

  const enftMint = await ethers.deployContract("BLEU_ENFT_MINT", [cascadeAddress, evo1155Address]);
  await enftMint.waitForDeployment();
  const enftMintAddress = await enftMint.getAddress();
  console.log(`BLEU_ENFT_MINT deployed at ${enftMintAddress}`);

  try {
    const tx = await evo1155.transferOwnership(enftMintAddress);
    await tx.wait();
    console.log("Transferred EV0L1155 ownership to BLEU_ENFT_MINT");
  } catch (error) {
    console.warn("Unable to transfer EV0L1155 ownership automatically", error);
  }

  try {
    const cascade = await ethers.getContractAt("BLEULION_CASCADE", cascadeAddress);
    const registrarTx = await cascade.setScrollRegistrar(enftMintAddress);
    await registrarTx.wait();
    console.log("Assigned BLEU_ENFT_MINT as scroll registrar");
  } catch (error) {
    console.warn("Unable to set scroll registrar automatically", error);
  }

  await recordDeployment(network.name, network.config.chainId as number | undefined, {
    BLEUToken: bleuTokenAddress,
    EV0L1155: evo1155Address,
    BLEU_ENFT_MINT: enftMintAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
