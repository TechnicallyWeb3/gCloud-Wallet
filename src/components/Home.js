import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../css/App.css';

import { ethers } from 'ethers';

library.add(faCopy, faGlobe);

const formatTransactionValue = (value) => {
  const tikValue = parseFloat(value) / 1e18; // Divide by the TIK decimal factor (1e18)
  const formattedValue = tikValue.toFixed(18); // Format with 18 decimal places
  return `${formattedValue} TIK`;
};

const Home = () => {
  const [tiktokHandle, setTiktokHandle] = useState('technicallyweb3');
  const [isConnected, setIsConnected] = useState(false);
  const [wasAlerted, setWasAlerted] = useState(false);
  const [provider, setProvider] = useState(null);
  const [networkId, setNetworkId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const loadDefault = async () => {

    if (window.ethereum && window.ethereum.selectedAddress) {
      setIsConnected(true);
      window.location.href = `/profile?handle=${tiktokHandle}`;
    } else {
      setIsConnected(false);
      window.location.href = '/landing';
    }
  };

  const switchToPolygonNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Network ID for Polygon (137 in decimal)
      });
      console.log('You have successfully switched to the Polygon network');
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        console.log('This network is not available in your MetaMask, please add it');
      }
      console.log('Failed to switch to the network');
    }
  };

  const initializeProvider = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this wallet.');
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      // Check if already connected to MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const senderAddress = accounts[0];
      setIsConnected(!!senderAddress); // Update isConnected based on the presence of an account
      setWalletAddress(senderAddress);
      console.log("Connected", senderAddress);

      // Check the network ID and handle network switch/addition
      const networkId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkId(networkId);
      if (networkId !== '0x89') { // Network ID for Polygon (change it if using a different network)
        await switchToPolygonNetwork(); // Await the network switching function
      }
    }
  };

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      window.location.href = `/profile?handle=${tiktokHandle}`;
      console.log("MetaMask not installed")
    } else {
      loadDefault();
      // Add event listener for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        setIsConnected(accounts.length > 0); // Update isConnected based on the presence of an account
        setWalletAddress(accounts[0] || '');
        console.log("Connected", accounts[0]);
      });

      return () => {
        // Cleanup the event listener
        window.ethereum.removeAllListeners('accountsChanged');
      };
    }
  }, []);

  return (
    <div>
      <h2>TikToken Lookup & Send dApp</h2>
    </div>
  );
};

export { formatTransactionValue };
export default Home;