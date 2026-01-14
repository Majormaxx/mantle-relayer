import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mantleSepolia } from '@/config/chains';

// WalletConnect Project ID - Replace with your own in production
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo';

export const wagmiConfig = getDefaultConfig({
  appName: 'Mantle Gasless Relayer',
  projectId,
  chains: [mantleSepolia],
  transports: {
    [mantleSepolia.id]: http(mantleSepolia.rpcUrls.default.http[0]),
  },
  ssr: true,
});

// Export chain for convenience
export { mantleSepolia };
