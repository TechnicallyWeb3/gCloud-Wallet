import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from './NavBar';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const apiKey = 'NVTYK9HY29VP2C54X24PXZQUS57TPWHCU7'; // Replace with your own API key from Polygon

  useEffect(() => {
    const fetchTransactions = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const handle = urlParams.get('recipient');

      if (handle) {
        try {
          // Fetch user information from the API based on the handle
          const response = await axios.get(`https://identity-resolver-5ywm7t2p3a-pd.a.run.app/user?handle=${handle}`);
          const linkedWallet = response.data['linked-wallet'];

          // Check if the user's wallet is registered and has an address
          if (linkedWallet.isRegistered && linkedWallet.address) {
            const address = linkedWallet.address;
            const polygonResponse = await fetchPolygonTransactions(address);
            const data = await polygonResponse.json();
            const transactions = data.result;
            setTransactions(transactions);
          } else {
            console.log('User does not have a registered wallet or linked address.');
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchTransactions();
  }, []);

  const fetchPolygonTransactions = async (address) => {
    try {
      const apiUrl = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${apiKey}`;
      const response = await axios.get(apiUrl);
      return response;
    } catch (error) {
      throw new Error('Error fetching Polygon transactions');
    }
  };

  return (
    <div className="transactions-container">
      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((transaction, index) => (
            <li key={index} className="transaction-item">
              <div className="hash">Hash: {transaction.hash}</div>
              <div className="timestamp">
                Timestamp: {new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Transactions;