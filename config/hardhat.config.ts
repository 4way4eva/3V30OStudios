import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

function defaultAccounts(): string[] {
  const key = process.env.PRIVATE_KEY;
  return key ? [key] : [];
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://sepolia.infura.io/v3/YOUR_KEY",
      accounts: defaultAccounts(),
    },
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-mainnet.infura.io/v3/YOUR_KEY",
      accounts: defaultAccounts(),
    },
    avalanche: {
      url: process.env.AVALANCHE_RPC || "https://api.avax.network/ext/bc/C/rpc",
      accounts: defaultAccounts(),
    },
  },
};

export default config;
