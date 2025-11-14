require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const { DEPLOY_PRIVATE_KEY, SEPOLIA_RPC_URL, MUMBAI_RPC_URL, FUJI_RPC_URL, BSC_RPC_URL, CRONOS_RPC_URL } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: DEPLOY_PRIVATE_KEY ? [DEPLOY_PRIVATE_KEY] : []
    },
    mumbai: {
      url: MUMBAI_RPC_URL || "",
      accounts: DEPLOY_PRIVATE_KEY ? [DEPLOY_PRIVATE_KEY] : []
    },
    fuji: {
      url: FUJI_RPC_URL || "",
      accounts: DEPLOY_PRIVATE_KEY ? [DEPLOY_PRIVATE_KEY] : []
    },
    bscTestnet: {
      url: BSC_RPC_URL || "",
      accounts: DEPLOY_PRIVATE_KEY ? [DEPLOY_PRIVATE_KEY] : []
    },
    cronosTestnet: {
      url: CRONOS_RPC_URL || "",
      accounts: DEPLOY_PRIVATE_KEY ? [DEPLOY_PRIVATE_KEY] : []
    }
  }
};