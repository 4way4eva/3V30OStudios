import { promises as fs } from "fs";
import path from "path";
import { ethers, network } from "hardhat";
import { resolveDeployment } from "./utils/manifest";

interface VaultHashEntry {
  vaultId: string;
  merkleRoot: string;
  reportUri: string;
}

interface VaultHashRegistry {
  registryVersion: string;
  description?: string;
  entries: VaultHashEntry[];
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Submitting watchtower audits as ${deployer.address} on ${network.name}`);

  const watchtowerAddress =
    process.env.BLEU_WATCHTOWER || (await resolveDeployment(network.name, "BLEU_WATCHTOWER"));

  if (!watchtowerAddress) {
    throw new Error("BLEU_WATCHTOWER address not configured. Set BLEU_WATCHTOWER or deploy governance bundle.");
  }

  const registryPath = path.resolve(__dirname, "..", "metadata", "vault_hash_registry.json");
  const registryRaw = await fs.readFile(registryPath, "utf8");
  const registry = JSON.parse(registryRaw) as VaultHashRegistry;

  console.log(`Registry version ${registry.registryVersion}`);

  const watchtower = await ethers.getContractAt("BLEU_WATCHTOWER", watchtowerAddress);

  for (const entry of registry.entries) {
    const tx = await watchtower.recordVaultRoot(entry.vaultId, entry.merkleRoot, entry.reportUri);
    await tx.wait();
    console.log(`Recorded audit for vault ${entry.vaultId} with root ${entry.merkleRoot}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
