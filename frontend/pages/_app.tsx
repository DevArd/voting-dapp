'use client';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia, hardhat, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
// import { infuraProvider } from 'wagmi/providers/infura';
// import * as dotenv from 'dotenv';
// dotenv.config();

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    hardhat,
    sepolia,
    goerli
  ],
  [
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Voting Dapp',
  projectId: '58c04492c719d703985bce45898088b9',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
  webSocketPublicClient
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
