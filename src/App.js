import React, { useEffect, useState } from 'react';
import './App.css';
import twitterLogo from './assets/twitter-logo.svg';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);

const [characterNFT, setCharacterNFT] = useState(null);

const [isLoading, setIsLoading] = useState(false);
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        /*
         * We set isLoading here because we use return in the next line
         */
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
    /*
     * We release the state property after all the function logic
     */
    setIsLoading(false);
  };

  // Render Methods
  const renderContent = () => {

  if (isLoading) {
    return <LoadingIndicator />;
  }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/b333a140e247134a80af77c516f985ff/tumblr_mlqj4mtRw61qda125o6_r1_250.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
      /*
       * Scenario #2
       */
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
      setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

useEffect(() => {
  /*
   * The function we will call that interacts with out smart contract
   */
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer,
    );

    const txn = await gameContract.checkIfUserHasNFT();
    if (txn.name) {
      console.log('User has character NFT');
      setCharacterNFT(transformCharacterData(txn));
    } else {
      console.log('No character NFT found');
    }
     setIsLoading(false);
  };

  /*
   * We only want to run this, if we have a connected wallet
   */
  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
}, [currentAccount]);

 return (
   <div className="App">
     <div className="container">
       <div className="header-container">
         <p className="header gradient-text">⚔️ Sauron Slayer ⚔️</p>
         <p className="sub-text">Team up to protect the Middle Earth!</p>
         {/* This is where our button and image code used to be!
          *	Remember we moved it into the render method.
          */}
         {renderContent()}
       </div>
       <div className="footer-container">
         <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
         <a
           className="footer-text"
           href={TWITTER_LINK}
           target="_blank"
           rel="noreferrer"
         >{`built with @${TWITTER_HANDLE}`}</a>
       </div>
     </div>
   </div>
 );

};

export default App;
