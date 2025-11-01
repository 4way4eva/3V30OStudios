import { promises as fs } from "fs";
import path from "path";
import { ethers, network } from "hardhat";
import { recordScroll, resolveDeployment } from "./utils/manifest";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Activating scroll templates from ${deployer.address} on ${network.name}`);

  const cascadeAddress =
    process.env.CASCADE_ADDRESS || (await resolveDeployment(network.name, "BLEULION_CASCADE"));

  if (!cascadeAddress) {
    throw new Error("Cascade address not configured. Set CASCADE_ADDRESS or deploy cascade on this network.");
  }

  const cascade = await ethers.getContractAt("BLEULION_CASCADE", cascadeAddress);
  const templatesDir = path.resolve(__dirname, "..", "metadata", "scroll_templates");
  const templateFiles = (await fs.readdir(templatesDir)).filter((file) => file.endsWith(".json")).sort();

  for (const file of templateFiles) {
    const templatePath = path.join(templatesDir, file);
    const raw = await fs.readFile(templatePath, "utf8");
    const metadata = JSON.parse(raw) as { name?: string; image?: string; external_url?: string; attributes?: unknown };

    const title = metadata.name || file.replace(/\.json$/i, "");
    const uri = metadata.external_url || metadata.image;

    if (!uri) {
      throw new Error(`Template ${file} is missing an external_url or image field.`);
    }

    const scrollId = await cascade.callStatic.registerScroll(title, uri);
    const tx = await cascade.registerScroll(title, uri);
    await tx.wait();

    await recordScroll(network.name, network.config.chainId as number | undefined, Number(scrollId), {
      title,
      uri,
      active: true,
    });

    console.log(`Activated scroll ${title} -> ${uri} (id ${scrollId.toString()})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
