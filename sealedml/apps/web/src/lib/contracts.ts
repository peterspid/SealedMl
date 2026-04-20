// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Ethereum Sepolia
  ethereumSepolia: {
    modelRegistry: process.env.NEXT_PUBLIC_MODEL_REGISTRY_ETH || '0x0000000000000000000000000000000000000000',
    sealedMLInference: process.env.NEXT_PUBLIC_SEALED_ML_ETH || '0x0000000000000000000000000000000000000000',
    resultManager: process.env.NEXT_PUBLIC_RESULT_MANAGER_ETH || '0x0000000000000000000000000000000000000000',
    accessControl: process.env.NEXT_PUBLIC_ACCESS_CONTROL_ETH || '0x0000000000000000000000000000000000000000',
  },
  // Arbitrum Sepolia
  arbitrumSepolia: {
    modelRegistry: process.env.NEXT_PUBLIC_MODEL_REGISTRY_ARB || '0x0000000000000000000000000000000000000000',
    sealedMLInference: process.env.NEXT_PUBLIC_SEALED_ML_ARB || '0x0000000000000000000000000000000000000000',
    resultManager: process.env.NEXT_PUBLIC_RESULT_MANAGER_ARB || '0x0000000000000000000000000000000000000000',
    accessControl: process.env.NEXT_PUBLIC_ACCESS_CONTROL_ARB || '0x0000000000000000000000000000000000000000',
  },
  // Base Sepolia
  baseSepolia: {
    modelRegistry: process.env.NEXT_PUBLIC_MODEL_REGISTRY_BASE || '0x0000000000000000000000000000000000000000',
    sealedMLInference: process.env.NEXT_PUBLIC_SEALED_ML_BASE || '0x0000000000000000000000000000000000000000',
    resultManager: process.env.NEXT_PUBLIC_RESULT_MANAGER_BASE || '0x0000000000000000000000000000000000000000',
    accessControl: process.env.NEXT_PUBLIC_ACCESS_CONTROL_BASE || '0x0000000000000000000000000000000000000000',
  },
} as const;

export type NetworkName = keyof typeof CONTRACT_ADDRESSES;

export const SUPPORTED_CHAINS = {
  ethereumSepolia: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
  },
  arbitrumSepolia: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
  },
  baseSepolia: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia.publicnode.com',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
  },
} as const;

export function getContractAddresses(chainId: number) {
  if (chainId === SUPPORTED_CHAINS.ethereumSepolia.id) {
    return CONTRACT_ADDRESSES.ethereumSepolia;
  }
  if (chainId === SUPPORTED_CHAINS.arbitrumSepolia.id) {
    return CONTRACT_ADDRESSES.arbitrumSepolia;
  }
  if (chainId === SUPPORTED_CHAINS.baseSepolia.id) {
    return CONTRACT_ADDRESSES.baseSepolia;
  }
  return CONTRACT_ADDRESSES.ethereumSepolia; // default
}
