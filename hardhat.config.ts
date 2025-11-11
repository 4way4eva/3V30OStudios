import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

// Use DEPLOYER_PRIVATE_KEY with fallback to PRIVATE_KEY for backwards compatibility
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    // ===================================================================
    // TESTNETS - ALWAYS TEST HERE FIRST
    // ===================================================================
    
    // Ethereum Sepolia Testnet (RECOMMENDED DEFAULT)
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL || process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 11155111,
    },
    
    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.POLYGON_RPC_URL || process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 80001,
    },
    
    // Avalanche Fuji Testnet
    fuji: {
      url: process.env.AVALANCHE_RPC_URL || process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 43113,
    },
    
    // BSC Testnet
    bscTestnet: {
      url: process.env.BSC_RPC_URL || process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 97,
    },
    
    // BLEUChain Testnet (if available)
    bleuchain: {
      url: process.env.BLEUCHAIN_RPC_URL || "http://127.0.0.1:8545",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 999999, // Placeholder - update with actual chain ID
    },
    
    // ===================================================================
    // MAINNETS - USE WITH CAUTION, HARDWARE WALLET RECOMMENDED
    // ===================================================================
    
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/demo",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 1,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 137,
      gasPrice: 50000000000, // 50 gwei
    },
    avalanche: {
      url: process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 43114,
      gasPrice: 25000000000, // 25 gwei
    },
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 56,
      gasPrice: 5000000000, // 5 gwei
    },
    cronos: {
      url: process.env.CRONOS_RPC_URL || "https://evm.cronos.org",
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
      chainId: 25,
      gasPrice: 5000000000000, // 5000 gwei
    },
    
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "cronos",
        chainId: 25,
        urls: {
          apiURL: "https://api.cronoscan.com/api",
          browserURL: "https://cronoscan.com"
        }
      }
    ]
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 40000,
  },
};

export default config;
