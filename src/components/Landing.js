import React, {useEffect, useState, useContext} from 'react';
import {AppContext} from '../AppContext.js'; // Replace '../' with the correct path to the AppContext file
import {ethers} from 'ethers';

function Landing() {
  const [tiktokHandle, setTiktokHandle] = useState('technicallyweb3');
  const [wasAlerted, setWasAlerted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [networkId, setNetworkId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this wallet.');
        setWasAlerted(true)
      } else {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const senderAddress = accounts[0];
        if (!!senderAddress) window.location.href = `/profile?handle=${tiktokHandle}`;
      }
    } catch (error) {
      console.log('Failed to connect MetaMask wallet:', error);
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
      if (!wasAlerted) {
        alert('Please install MetaMask to use this wallet.');
        setWasAlerted(true)
      }
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
      if (!wasAlerted) {
        alert('Please install MetaMask to use this wallet.');
        setWasAlerted(true)
      }
    } else {
      initializeProvider();

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
  }, [wasAlerted, isConnected]);

  // Access the appContext from the useContext hook
  const appContext = useContext(AppContext);

  return (

    <div className="landing" style={{ margin: '50px', padding: '50px' }}>
      {!isConnected ? (
        <div>
          <button style={{ position: 'absolute', top: '5px', right: '5px' }} onClick={() => window.location.href = '/profile?handle=technicallyweb3'}>X</button>
          <div style={{ 'background-color': '#f44336', color: '#fff', padding: '10px', 'font-family': 'Arial, sans-serif', 'font-size': '16px' }}>
            <strong>Important:</strong> This app is currently in beta version.
            <br />
            Please exercise caution when connecting wallets with significant value.
            <br />
            We recommend using this app with wallets that do not contain substantial funds.
          </div>
          <label htmlFor="walletInput" style={{ marginBottom: '5px' }}>
            Connect Web3 Wallet:
          </label>
          <br />
          <br />
          <p style={{ fontSize: '15px' }}>Required to try out all wallet features including sending TIK. If you're just looking to check it out try searching or <a href='/profile?handle=technicallyweb3'>closing this popup</a>.</p>
          <br />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </button>
          </div>
          <br />
        </div>
      ) : (
        <>
          <div>
            <button style={{ position: 'absolute', top: '5px', right: '5px' }} onClick={() => window.location.href = '/'}>X</button>
            <div style={{ 'background-color': '#f44336', color: '#fff', padding: '10px', 'font-family': 'Arial, sans-serif', 'font-size': '16px' }}>
              <strong>Important:</strong> This app is currently in beta version.
              <br />
              Please exercise caution when connecting wallets with significant value.
              <br />
              We recommend using this app with wallets that do not contain substantial funds.
            </div>

            <br />
            <label htmlFor="walletInput" style={{ marginBottom: '5px' }}>
              Connected:
            </label>
            <p style={{ fontSize: '15px' }}>{walletAddress}</p>
          </div>
          <br />
          <button type="button" onClick={() => window.location.href = '/send'} >
            Send TIK
          </button>
        </>
      )}


    </div>
  );
}

export { Landing };
export default Landing;