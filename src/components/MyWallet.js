import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NavBar from './NavBar';

import '../css/App.css';
import '../css/MyWallet.css';

library.add(faCopy, faGlobe);

const formatTransactionValue = (value) => {
  const tikValue = parseFloat(value) / 1e18; // Divide by the TIK decimal factor (1e18)
  const formattedValue = tikValue.toFixed(18); // Format with 18 decimal places
  return `${formattedValue} TIK`;
};


const LookUp = () => {
  const baseURL = 'https://identity-resolver-5ywm7t2p3a-pd.a.run.app';
  const defaultHandle = 'technicallyweb3'; // Default handle
  const [handle, setHandle] = useState(defaultHandle);
  const [userInfo, setUserInfo] = useState({});
  const [balance, setBalance] = useState('Loading balance...');
  const [transactions, setTransactions] = useState([]);

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const getUserInfo = (handle) => {
    const apiUrl = `${baseURL}/user?handle=${handle}`;

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

        setUserInfo({
          tiktokUser,
          linkedWallet
        });
      })
      .catch((error) => {
        console.log('Error fetching user information:', error);
      });
  };

  const handleSendClick = () => {
    const linkedWalletAddress = userInfo?.linkedWallet?.address;
    window.location.href = `/wallet?address=${linkedWalletAddress}`;
  };

  const handleTransactionsClick = () => {
  const handleUrl = `https://polygonscan.com/token/0x359c3ad611e377e050621fb3de1c2f4411684e92?a=${userInfo?.linkedWallet?.address}`;

  window.open(handleUrl, '_blank');
};

  const displayBalance = async () => {
    const userApiUrl = `${baseURL}/user?handle=${handle}`;

    try {
      const userResponse = await fetch(userApiUrl);
      if (!userResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const userData = await userResponse.json();
      const linkedWallet = userData['linked-wallet'];
      const isRegistered = linkedWallet['isRegistered'];

      if (isRegistered) {
        const balanceDec = linkedWallet['balanceDec'];
        setBalance(formatBalance(balanceDec));

        const address = linkedWallet.address;
        const transactionsResponse = await fetchPolygonTransactions(address);
        const transactionsData = await transactionsResponse.json();
        const transactions = transactionsData.result;
        setTransactions(transactions);
      } else {
        setBalance('Wallet not registered');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPolygonTransactions = async (address) => {
    const apiKey = 'NVTYK9HY29VP2C54X24PXZQUS57TPWHCU7'; // Replace with your own API key from Polygon
    const apiUrl = `https://api.polygonscan.com/api?module=account&action=tokentx&contractaddress=0x359c3ad611e377e050621fb3de1c2f4411684e92&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=asc&apikey=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatBalance = (balanceDec) => {
    const formattedBalance = parseFloat(balanceDec).toFixed(6);
    return `${formattedBalance} TIK`;
  };



  useEffect(() => {
  getUserInfo(handle); // Fetch user info with the initial/default handle
  displayBalance();
}, [handle]); // Update whenever the handle changes

  return (
    <div>
      <header>
<div className="user-avatar">
          <img className="avatar" src={userInfo?.tiktokUser?.avatarURL} alt="User Avatar" />
        </div>
</header>

      <div className="my-wallet-container">
        <div className="user-profile">
          <h2>{userInfo?.tiktokUser?.username}</h2>
          <p>@{userInfo?.tiktokUser?.handle}</p>
          <div className="user-stats">
            <div className="stat">
              <div>
                <span className="number">{userInfo?.tiktokUser?.followers}</span>
              </div>
              <div>
                <span className="label">followers</span>
              </div>
            </div>
            <div className="stat">
              <div>
                <span className="number">{userInfo?.tiktokUser?.following}</span>
              </div>
              <div>
                <span className="label">following</span>
              </div>
            </div>
            <div className="stat">
              <div>
                <span className="number">{userInfo?.tiktokUser?.likes}</span>
              </div>
              <div>
                <span className="label">likes</span>
              </div>
            </div>
            <div className="stat">
              <div>
                <span className="number">{userInfo?.tiktokUser?.videos}</span>
              </div>
              <div>
                <span className="label">videos</span>
              </div>
            </div>
          </div>
          <p>
            <span className="label">Bio: </span>
            {userInfo?.tiktokUser?.bio}
          </p>
<div className="social-icons">
  <a href={`https://www.tiktok.com/${handle}`} target="_blank" rel="noopener noreferrer">
    <i className="fab fa-tiktok"></i>
  </a>
  <a href={`https://www.instagram.com/${userInfo?.tiktokUser?.handle}`} target="_blank" rel="noopener noreferrer">
    <i className="fab fa-instagram"></i>
  </a>
 
  <i className="fas fa-copy icon" onClick={() => copyToClipboard(userInfo?.linkedWallet?.address)}></i>
  <a href={`https://polygonscan.com/address/${userInfo?.linkedWallet?.address}`} target="_blank" rel="noopener noreferrer">
    <i className="fas fa-globe"></i>
  </a> 
</div>
          <h2>Wallet Balance</h2>
          <div className="user-balance">{balance}</div>
          <br />
          <button onClick={handleSendClick}>Send TIK</button>
        </div>
        <br />

        
<div className="user-transaction-container">
  <h2>Transactions</h2>
  {transactions.length > 0 ? (
  <div className="user-transaction-container">
    <table className="transaction-table">
      <thead>
        <tr>
          <th>Value</th>
          <th>Timestamp</th>
          <th>From</th>
          <th>To</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr className="user-transaction-row" key={transaction.hash}>
            <td>{formatTransactionValue(transaction.value)}</td>
            <td>{new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString()}</td>
            <td>
              {transaction.from === userInfo?.linkedWallet?.address
                ? userInfo?.tiktokUser?.username
                : transaction.from}
            </td>
            <td>
              {transaction.to === userInfo?.linkedWallet?.address
                ? userInfo?.tiktokUser?.handle
                : userInfo?.tiktokUser?.username}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <p>No transactions found.</p>
)}

          <br />
          <button onClick={handleTransactionsClick}>View All Transactions</button>
        </div>
      </div>

      <br />

      <br />

      <footer>
        <p>
          Made with <span className="heart">&hearts;</span> by{' '}
          <a href="https://michaelh.org" target="_blank" rel="noopener noreferrer">
            MichaelHDesigns
          </a>
        </p>
        <p>
          Data provided by{' '}
          <a href="https://www.tokcount.com/" target="_blank" rel="noopener noreferrer">
            TokCount
          </a>
        </p>
      </footer>
    </div>
  );
};

export { formatTransactionValue };
export default LookUp;