import { ethers } from 'ethers';
import abi from '../abi/abi.json';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

import '../css/App.css';

const Wallet = () => {
  const [provider, setProvider] = useState(null);
  const [accountAddress, setAccountAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [linkedAddress, setLinkedAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this wallet.');
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Check if already connected to MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const address = accounts[0];
        if (address) {
          setAccountAddress(address);
          setIsConnected(true);
          await fetchBalance(); // Fetch balance once connected
        }
      }
    };

    initializeProvider();
  }, []);

  const connectToMetaMask = async () => {
    try {
      // Request account access from MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];
      setAccountAddress(address);
      setIsConnected(true);
      await fetchBalance(); // Fetch balance once connected
    } catch (error) {
      console.error(error);
    }
  };

  const sendTokens = async () => {
  if (provider && amount && recipient) {
    try {
      const signer = provider.getSigner();
      const contractAddress = '0x359c3AD611e377e050621Fb3de1C2f4411684E92';
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Convert the amount to a BigNumber
      const amountInWei = ethers.utils.parseUnits(amount, 18); // Adjust the decimal places as per your token's configuration

      // Send tokens
      await contract.transfer(recipient, amountInWei);
      console.log('Tokens sent successfully!');
    } catch (error) {
      console.error(error);
    }
  }
};

const fetchLinkedAddress = async () => {
  setLinkedAddress('');
};

  const fetchBalance = async () => {
    if (provider && accountAddress) {
      try {
        const contractAddress = '0x359c3AD611e377e050621Fb3de1C2f4411684E92';
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // Fetch balance using balanceOf function
        const balanceRaw = await contract.balanceOf(accountAddress);
        const balanceFormatted = ethers.utils.formatUnits(balanceRaw, 18); // Adjust the decimal places as per your token's configuration
        setBalance(balanceFormatted);
      } catch (error) {
        console.error(error);
      }
    }
  };


  return (
    <div className="wallet-container">
      <h1>Tik Token Wallet</h1>
      {!isConnected && <button className="connect-button" onClick={connectToMetaMask}>Connect to MetaMask</button>}
      {isConnected && (
        <>
          <div className="account-address">Connected Account: {accountAddress}</div>
          <div className="balance">Balance: {balance} TIK</div>
          <br />
          <button className="refresh-button" onClick={fetchBalance}>Refresh Balance</button>
        </>
      )}
      <br />
      <h2>Send Tokens</h2>
      <label htmlFor="recipient">Recipient Address:</label>
      <input
        className="recipient-input"
        type="text"
        id="recipient"
        value={recipient}
        onChange={(e) => {
          setRecipient(e.target.value);
          setLinkedAddress(''); // Reset linked address when recipient input changes
        }}
        onBlur={fetchLinkedAddress} // Fetch linked address when input loses focus
      />
      {linkedAddress && (
        <div className="linked-address">Linked Address: {linkedAddress}</div>
      )}
      <label htmlFor="amount">Amount:</label>
      <input className="amount-input" type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <br />
      {isConnected && <button className="send-button" onClick={sendTokens}>Send</button>}
    </div>
  );
};

export default Wallet;