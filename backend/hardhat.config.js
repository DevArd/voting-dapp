require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require('hardhat-docgen');
require("hardhat-gas-reporter");

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || ""
const HARDHAT_PRIVATE_KEY = process.env.HARDHAT_PRIVATE_KEY || ""
const INFURA_API_KEY = process.env.INFURA_API_KEY || ""
const ETHERSCAN = process.env.ETHERSCAN || ""

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [HARDHAT_PRIVATE_KEY],
      chainId: 31337
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN
    }
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20"
      }
    ],
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yulDetails: {
            optimizerSteps: "u",
          },
        },
      },
    },
  }
};