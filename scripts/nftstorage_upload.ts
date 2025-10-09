import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { NFTStorage, File } from "nft.storage";
import mime from "mime";

type Row = { token_id: string; metadata_json_path: string };

async function main() {
  const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY! });
  const rows: Row[] = parse(fs.readFileSync("nft_storage_upload_template.csv"), { columns: true });
  for (const r of rows) {
    const filePath = path.resolve(r.metadata_json_path);
    const cid = await client.storeBlob(new File([fs.readFileSync(filePath)], path.basename(filePath), { type: mime.getType(filePath) || "application/json" }));
    console.log(`${r.token_id},${cid}`);
  }
}

main().catch(console.error);
