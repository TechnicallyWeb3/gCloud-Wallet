import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import abi from '../abi/abi.json';

import '../css/App.css';

function Send() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const to = queryParams.get('to');

  const baseURL = 'https://identity-resolver-5ywm7t2p3a-pd.a.run.app';

  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [networkId, setNetworkId] = useState('');
  const [balance, setBalance] = useState(0.00001);
  const [sender, setSender] = useState({});
  const [recipient, setRecipient] = useState({});
  const [amount, setAmount] = useState('');
  const [transaction, setTransaction] = useState({});

  const toInputRef = useRef(null);

  const fetchRecipientInformation = () => {
    const apiUrl = `${baseURL}/user?handle=${to}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const tiktokUser = data['tiktok-user'];
        const linkedWallet = data['linked-wallet'];

        setRecipient({
          tiktokUser,
          linkedWallet
        });
      })
      .catch((error) => {
        console.log('Error fetching user information:', error);
      });
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

  const fetchSenderBalance = async (address) => {
    if (provider && isConnected) {
      try {
        const contractAddress = '0x359c3AD611e377e050621Fb3de1C2f4411684E92';
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // Fetch balance using balanceOf function
        console.log("Fetching balance for ", address)
        const balanceRaw = await contract.balanceOf(address);
        const balanceFormatted = ethers.utils.formatUnits(balanceRaw, 18);
        console.log("Balance", balanceFormatted)
        return balanceFormatted || 0;
      } catch (error) {
        console.error(error);
      }
    }
  };

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
        const senderAddress = accounts[0];
        if (senderAddress) {
          setIsConnected(true);
          console.log("Connected", senderAddress)
          const senderBalance = await fetchSenderBalance(senderAddress);
          setSender({
            address: senderAddress,
            balance: senderBalance
          });
          console.log("Sender", sender);
        }
  
        // Check the network ID and handle network switch/addition
        const networkId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetworkId(networkId);
        if (networkId !== '0x89') { // Network ID for Polygon (change it if using a different network)
          await switchToPolygonNetwork(); // Await the network switching function
        }
      }
    };
  
    const updateSenderBalance = async () => {
      if (isConnected) {
        console.log("Updating Sender balance");
        const senderBalance = await fetchSenderBalance(sender.address);
        setSender(prevSender => ({
          ...prevSender,
          balance: senderBalance
        }));
        setBalance(senderBalance)
      }
    };
  
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setIsConnected(false);
        setSender({});
      } else {
        // User switched to a different account
        const senderAddress = accounts[0];
        setIsConnected(true);
        console.log("Connected", senderAddress)
        const senderBalance = await fetchSenderBalance(senderAddress);
        setSender({
          address: senderAddress,
          balance: senderBalance
        });
        console.log("Sender", sender);
      }
    };
  
    const addAccountsChangedListener = () => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
    };
  
    const removeAccountsChangedListener = () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  
    if (to) {
      fetchRecipientInformation();
    }
  
    if (isConnected) {
      updateSenderBalance();
    }
  
    initializeProvider();
    addAccountsChangedListener();
  
    // Fetch sender balance every 10 seconds
    const interval = setInterval(updateSenderBalance, 10000);
  
    // Cleanup interval and accountsChanged listener on component unmount
    return () => {
      clearInterval(interval);
      removeAccountsChangedListener();
    };
  }, [to, isConnected, sender.address]);
  

  const handleConnect = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const senderAddress = accounts[0];
      setIsConnected(true);
      console.log("Connected", senderAddress)
      const senderBalance = await fetchSenderBalance(senderAddress);
      setSender({
        address: senderAddress,
        balance: senderBalance
      });
      console.log("Sender", sender);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const sendTokens = async () => {
    if (isConnected && amount && recipient) {
      try {
        const signer = provider.getSigner();
        const contractAddress = '0x359c3AD611e377e050621Fb3de1C2f4411684E92';
        const contract = new ethers.Contract(contractAddress, abi, signer);
        
        const recipientAddress = recipient.linkedWallet.address;
        // Convert the amount to a BigNumber
        const amountInWei = ethers.utils.parseUnits(amount, 18); // Adjust the decimal places as per your token's configuration
        
        // Send tokens
        await contract.transfer(recipientAddress, amountInWei);
        console.log('Tokens sent successfully!');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendTokens();
  };

  const handleLookup = (e) => {
    e.preventDefault();
    const toValue = toInputRef.current.value;
    window.location.href = `/send?to=${toValue}`;
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    if (!isNaN(newAmount) && newAmount <= balance) {
      setAmount(newAmount);
    }
  };

  const handleRemoveTo = () => {
    window.location.href = `/send`;
  };

  return (
    <div className="landing" style={{ margin: '50px', padding: '50px' }}>
      <h2>Send TIK</h2>
      <br />
      {!to ? (
        <div>
          <label htmlFor="toInput">To:</label>
          <br />
          <br />
          <input type="text" id="toInput" ref={toInputRef} />
          <button type="submit" onClick={handleLookup}>
            Lookup
          </button>
        </div>
      ) : (
        <div>
          <p>
            To: @{to} <button onClick={handleRemoveTo}>x</button>
          </p>
        </div>
      )}
      <br />
      <br />
      <div>
        <label htmlFor="amountInput">Amount:</label>
        <br />
        <br />
        <input
          type="number"
          id="amountInput"
          step="0.000001"
          min="0"
          max={balance}
          value={amount}
          onChange={handleAmountChange}
        />
      </div>
      {!isConnected ? (
        <button type="button" onClick={handleConnect}>
          Connect
        </button>
      ) : (
        <div>
          <p>{balance} TIK</p>
          <button type="submit" onClick={handleSend}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default Send;