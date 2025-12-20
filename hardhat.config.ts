import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  paths: {
    sources: 'contracts',
    tests: 'test',
    cache: 'node_modules/.cache/hardhat',
    artifacts: 'artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // Base and Celo networks: URLs and accounts controlled via env vars for CI/deploy
    base: {
      url: process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL || '',
      chainId: Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || 8453),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    celo: {
      url: process.env.CELO_RPC_URL || process.env.NEXT_PUBLIC_CELO_RPC_URL || '',
      chainId: Number(process.env.NEXT_PUBLIC_CELO_CHAIN_ID || 42220),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.CELO_BLOCKSCOUT_API_KEY || ''
  }
};

export default config;
