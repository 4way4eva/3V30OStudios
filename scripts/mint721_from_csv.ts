import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type Row = { token_id: string; metadata_cid: string };

async function main() {
  const CONTRACT = "0xYOUR_721_ADDRESS";
  const RECIPIENT = "0xYOUR_WALLET";

  const csvPath = path.resolve("nft_storage_upload_template.csv"); // your CSV
  const rows: Row[] = parse(fs.readFileSync(csvPath), { columns: true, skip_empty_lines: true });

  const ids: bigint[] = [];
  const uris: string[] = [];

  for (const r of rows) {
    const id = BigInt(r.token_id.trim());
    const uri = `ipfs://${r.metadata_cid.trim()}`;
    ids.push(id);
    uris.push(uri);
  }

  const nft = await ethers.getContractAt("EV0L721", CONTRACT);
  // Mint in chunks to avoid block gas limits
  const CHUNK = 50;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const idsChunk = ids.slice(i, i + CHUNK);
    const urisChunk = uris.slice(i, i + CHUNK);
    const tx = await nft.safeMintBatch(RECIPIENT, idsChunk.map(v => Number(v)), urisChunk);
    console.log("mint chunk tx:", tx.hash);
    await tx.wait();
  }
  console.log("done");
}

main().catch(e => { console.error(e); process.exit(1); });
