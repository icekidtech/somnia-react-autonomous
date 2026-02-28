import { http, createConfig } from 'wagmi';
import { mainnet, arbitrum, polygon, base } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, arbitrum, polygon, base],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});

export const SUPPORTED_CHAINS = [
  { id: mainnet.id, name: 'Ethereum', icon: '⟠' },
  { id: arbitrum.id, name: 'Arbitrum', icon: '🔵' },
  { id: polygon.id, name: 'Polygon', icon: '🟣' },
  { id: base.id, name: 'Base', icon: '🔷' },
] as const;
