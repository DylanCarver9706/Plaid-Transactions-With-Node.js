import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

function PlaidAuth({publicToken}) {
  const [transactionsData, setTransactionsData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      let accessToken = await axios.post("http://localhost:5000/exchange_public_token", {public_token: publicToken});
      console.log("access token ", accessToken.data);
      const transactions = await axios.post("http://localhost:5000/transactions/get", {access_token: accessToken.data.accessToken});
      console.log("transactions ", transactions.data.transactions);
      setTransactionsData(transactions.data.transactions);
    }
    fetchData();
  }, [publicToken]);

  return (
    <div>
      <span>{publicToken}</span>
      <div>
        <h2>Transactions:</h2>
        <ul>
          {transactionsData.map((transaction, index) => (
            <li key={index}>
              <strong>Name:</strong> {transaction.name} <br />
              <strong>Amount:</strong> {transaction.amount} <br />
              <strong>Authorized Date:</strong> {transaction.authorized_date} <br />
              <hr />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function App() {
  const [linkToken, setLinkToken] = useState();
  const [publicToken, setPublicToken] = useState();


  useEffect(() => {
    async function fetch() {
      const response = await axios.post("http://localhost:5000/create_link_token")
      setLinkToken(response.data.link_token)
    }
    fetch()
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      setPublicToken(public_token)
      console.log("success", public_token, metadata)
      // send public_token to server
    },
  });
  
  return publicToken ? (<PlaidAuth publicToken={publicToken}/>) : (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
}

export default App;
