const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const envOrKnownDeployment = (value: string | undefined, deployment: string) =>
  value && value !== ZERO_ADDRESS ? value : deployment;

// Contract addresses for different networks. Sepolia includes the audited public
// deployment so hosted builds still point at a real chain when env vars are absent.
export const CONTRACT_ADDRESSES = {
  // Ethereum Sepolia
  ethereumSepolia: {
    modelRegistry: envOrKnownDeployment(process.env.NEXT_PUBLIC_MODEL_REGISTRY_ETH, '0x1693D5B9F4865859A97322447eaB5151187499F1'),
    sealedMLInference: envOrKnownDeployment(process.env.NEXT_PUBLIC_SEALED_ML_ETH, '0x9a40477EBbB85F2f82C4F9FB7809a2Bd11542760'),
    resultManager: envOrKnownDeployment(process.env.NEXT_PUBLIC_RESULT_MANAGER_ETH, '0xBc5364271B67C30d8d7a4608ED772D9fa5cB8740'),
    accessControl: envOrKnownDeployment(process.env.NEXT_PUBLIC_ACCESS_CONTROL_ETH, '0x99C49AE558FeCD440f0e8df5B7c2787415f21B82'),
  },
  // Arbitrum Sepolia
  arbitrumSepolia: {
    modelRegistry: envOrKnownDeployment(process.env.NEXT_PUBLIC_MODEL_REGISTRY_ARB, ZERO_ADDRESS),
    sealedMLInference: envOrKnownDeployment(process.env.NEXT_PUBLIC_SEALED_ML_ARB, ZERO_ADDRESS),
    resultManager: envOrKnownDeployment(process.env.NEXT_PUBLIC_RESULT_MANAGER_ARB, ZERO_ADDRESS),
    accessControl: envOrKnownDeployment(process.env.NEXT_PUBLIC_ACCESS_CONTROL_ARB, ZERO_ADDRESS),
  },
  // Base Sepolia
  baseSepolia: {
    modelRegistry: envOrKnownDeployment(process.env.NEXT_PUBLIC_MODEL_REGISTRY_BASE, ZERO_ADDRESS),
    sealedMLInference: envOrKnownDeployment(process.env.NEXT_PUBLIC_SEALED_ML_BASE, ZERO_ADDRESS),
    resultManager: envOrKnownDeployment(process.env.NEXT_PUBLIC_RESULT_MANAGER_BASE, ZERO_ADDRESS),
    accessControl: envOrKnownDeployment(process.env.NEXT_PUBLIC_ACCESS_CONTROL_BASE, ZERO_ADDRESS),
  },
} as const;

export type NetworkName = keyof typeof CONTRACT_ADDRESSES;
export type ContractAddresses = (typeof CONTRACT_ADDRESSES)[NetworkName];

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

const CHAIN_TO_NETWORK: Record<number, NetworkName> = {
  [SUPPORTED_CHAINS.ethereumSepolia.id]: 'ethereumSepolia',
  [SUPPORTED_CHAINS.arbitrumSepolia.id]: 'arbitrumSepolia',
  [SUPPORTED_CHAINS.baseSepolia.id]: 'baseSepolia',
};

export function getContractAddresses(chainId: number): ContractAddresses | null {
  if (chainId === SUPPORTED_CHAINS.ethereumSepolia.id) {
    return CONTRACT_ADDRESSES.ethereumSepolia;
  }
  if (chainId === SUPPORTED_CHAINS.arbitrumSepolia.id) {
    return CONTRACT_ADDRESSES.arbitrumSepolia;
  }
  if (chainId === SUPPORTED_CHAINS.baseSepolia.id) {
    return CONTRACT_ADDRESSES.baseSepolia;
  }
  return null;
}

export function getSupportedChain(chainId: number) {
  return Object.values(SUPPORTED_CHAINS).find((chain) => chain.id === chainId);
}

export function getPrimaryChain() {
  return SUPPORTED_CHAINS.ethereumSepolia;
}

export function getExplorerTxUrl(chainId: number | undefined, txHash: string | undefined) {
  if (!txHash) return undefined;
  const chain = getSupportedChain(chainId ?? SUPPORTED_CHAINS.ethereumSepolia.id) ?? getPrimaryChain();
  return `${chain.blockExplorer}/tx/${txHash}`;
}

export function isConfiguredAddress(address: string) {
  return address !== ZERO_ADDRESS;
}

export function hasConfiguredDeployment(addresses: ContractAddresses | null | undefined): addresses is ContractAddresses {
  return Boolean(
    addresses &&
    isConfiguredAddress(addresses.modelRegistry) &&
    isConfiguredAddress(addresses.sealedMLInference) &&
    isConfiguredAddress(addresses.resultManager)
  );
}

export function getConfiguredChainIds() {
  return Object.entries(CHAIN_TO_NETWORK)
    .filter(([, network]) => hasConfiguredDeployment(CONTRACT_ADDRESSES[network]))
    .map(([chainId]) => Number(chainId));
}
