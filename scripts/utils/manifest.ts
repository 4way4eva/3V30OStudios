import { promises as fs } from "fs";
import path from "path";

export interface DeploymentRecord {
  [name: string]: string;
}

export interface VaultRecord {
  name: string;
  asset: string;
  merkleRoot: string;
}

export interface ScrollRecord {
  title: string;
  uri: string;
  active: boolean;
}

export interface NetworkEntry {
  chainId: number;
  deployments: DeploymentRecord;
  vaults: { [id: string]: VaultRecord };
  scrolls: { [id: string]: ScrollRecord };
}

export interface NetworkManifest {
  networks: { [name: string]: NetworkEntry };
}

const manifestPath = path.resolve(__dirname, "..", "..", "config", "network_manifest.json");

const defaultManifest: NetworkManifest = {
  networks: {},
};

async function ensureManifestDirectory(): Promise<void> {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
}

export async function loadManifest(): Promise<NetworkManifest> {
  try {
    const contents = await fs.readFile(manifestPath, "utf8");
    return JSON.parse(contents) as NetworkManifest;
  } catch (error) {
    return { ...defaultManifest };
  }
}

export async function saveManifest(manifest: NetworkManifest): Promise<void> {
  await ensureManifestDirectory();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

function networkTemplate(chainId: number | undefined): NetworkEntry {
  return {
    chainId: chainId ?? 0,
    deployments: {},
    vaults: {},
    scrolls: {},
  };
}

export async function recordDeployment(
  networkName: string,
  chainId: number | undefined,
  deployment: DeploymentRecord
): Promise<void> {
  const manifest = await loadManifest();
  const entry = manifest.networks[networkName] ?? networkTemplate(chainId);
  entry.chainId = chainId ?? entry.chainId;
  entry.deployments = { ...entry.deployments, ...deployment };
  manifest.networks[networkName] = entry;
  await saveManifest(manifest);
}

export async function recordScroll(
  networkName: string,
  chainId: number | undefined,
  scrollId: number,
  record: ScrollRecord
): Promise<void> {
  const manifest = await loadManifest();
  const entry = manifest.networks[networkName] ?? networkTemplate(chainId);
  entry.chainId = chainId ?? entry.chainId;
  entry.scrolls = { ...entry.scrolls, [scrollId.toString()]: record };
  manifest.networks[networkName] = entry;
  await saveManifest(manifest);
}

export async function recordVault(
  networkName: string,
  chainId: number | undefined,
  vaultId: string,
  record: VaultRecord
): Promise<void> {
  const manifest = await loadManifest();
  const entry = manifest.networks[networkName] ?? networkTemplate(chainId);
  entry.chainId = chainId ?? entry.chainId;
  entry.vaults = { ...entry.vaults, [vaultId]: record };
  manifest.networks[networkName] = entry;
  await saveManifest(manifest);
}

export async function resolveDeployment(
  networkName: string,
  contractName: string
): Promise<string | undefined> {
  const manifest = await loadManifest();
  return manifest.networks[networkName]?.deployments?.[contractName];
}
