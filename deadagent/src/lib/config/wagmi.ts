import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '524dbdf757b3f27f8ccbc2362b08332d';

export const config = getDefaultConfig({
  appName: 'DeadAgent Protocol',
  projectId,
  chains: [sepolia, mainnet],
  ssr: true,
});
