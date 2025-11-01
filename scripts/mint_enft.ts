import { promises as fs } from "fs";
import path from "path";
import { ethers, network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import { resolveDeployment } from "./utils/manifest";

interface LedgerEntry {
  tokenId: number;
  template: string;
  metadataUri?: string;
  recipient?: string;
  amount?: number;
  recursionSalt?: string;
  recursionHash?: string;
}

interface CeremonialLedger {
  ceremony: string;
  description?: string;
  mints: LedgerEntry[];
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Executing ceremonial mint as ${deployer.address} on ${network.name}`);

  const enftAddress =
    process.env.BLEU_ENFT_MINT || (await resolveDeployment(network.name, "BLEU_ENFT_MINT"));

  if (!enftAddress) {
    throw new Error("BLEU_ENFT_MINT address not configured. Set BLEU_ENFT_MINT or deploy treasury bundle.");
  }

  const ledgerPath = path.resolve(__dirname, "..", "metadata", "ceremonial_ledger.json");
  const ledgerRaw = await fs.readFile(ledgerPath, "utf8");
  const ledger = JSON.parse(ledgerRaw) as CeremonialLedger;

  console.log(`Ceremony: ${ledger.ceremony}`);

  const enft = await ethers.getContractAt("BLEU_ENFT_MINT", enftAddress);

  for (const entry of ledger.mints) {
    const templatePath = path.resolve(
      __dirname,
      "..",
      "metadata",
      "scroll_templates",
      entry.template
    );
    const templateRaw = await fs.readFile(templatePath, "utf8");
    const metadata = JSON.parse(templateRaw) as { name?: string; image?: string; external_url?: string };

    const title = metadata.name ?? `Scroll ${entry.template}`;
    const uri = entry.metadataUri || metadata.external_url || metadata.image;

    if (!uri) {
      throw new Error(`Ledger entry for token ${entry.tokenId} is missing a metadata URI.`);
    }

    const recipient = entry.recipient || deployer.address;
    const amount = entry.amount ?? 1;
    const recursionHash =
      entry.recursionHash || keccak256(toUtf8Bytes(`${entry.recursionSalt ?? title}:${uri}`));

    await enft.callStatic.mintCeremonial(recipient, entry.tokenId, amount, recursionHash, title, uri);
    const tx = await enft.mintCeremonial(recipient, entry.tokenId, amount, recursionHash, title, uri);
    await tx.wait();

    console.log(
      `Minted token ${entry.tokenId} to ${recipient} with recursion hash ${recursionHash} using template ${entry.template}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
