import { http, createConfig, createStorage } from 'wagmi';
import { sepolia, arbitrumSepolia, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia, arbitrumSepolia, baseSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: 'sealedml-wallet',
  }),
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}