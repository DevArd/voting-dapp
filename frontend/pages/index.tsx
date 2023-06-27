import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useAccount } from 'wagmi';
import Voting from './Voting';

const Home: NextPage = () => {
  const { isConnected } = useAccount();


  return (
    <div className={styles.container}>
      <Head>
        <title>Voting Dapp</title>
        <link href="https://cdn-icons-png.flaticon.com/512/927/927295.png" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        {isConnected ? <>
          <Voting />
        </> : <></>}
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by Arnaud P. with 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
