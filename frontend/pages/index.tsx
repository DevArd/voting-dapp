import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import VotingStepper from './component/VotingStepper';
import AddProposal from './component/AddProposal';
import AddVoter from './component/AddVoter';
import SetVote from './component/SetVote';
import GetWinningProposal from './component/GetWinningProposal';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Voting Dapp</title>
        <link href="https://cdn-icons-png.flaticon.com/512/927/927295.png" rel="icon" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        <VotingStepper />
        <AddProposal />
        <AddVoter />
        <SetVote />
        <GetWinningProposal />
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
