import { walletStore } from '@/store/walletStore';
import axios from 'axios';
import Web3 from 'web3';




//fetching live prices
const API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// src/utils/api.ts
const API_ENDPOINTS = {
  bitcoin: {
    importWallet: 'https://api.blockcypher.com/v1/btc/main/addrs', // This is for generating addresses, not directly importing
    sendTransaction: 'https://api.blockcypher.com/v1/btc/main/txs/send',
    getTransactionHistory: 'https://api.blockcypher.com/v1/btc/main/addrs/{address}/full',
    getTransactionStatus: 'https://api.blockcypher.com/v1/btc/main/txs/{txhash}',
    getTransactionFee: 'https://api.blockcypher.com/v1/btc/main',
  },
  polygon: {
    importWallet: 'use Web3.js to manage wallet import', // Web3.js is used for this, not an endpoint
    sendTransaction: 'https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID', // Using Infura endpoint for sending transactions
    getTransactionHistory: 'https://api.polygonscan.com/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&sort=asc&apikey=YOUR_API_KEY',
    getTransactionStatus: 'https://api.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash={txhash}&apikey=YOUR_API_KEY',
    getTransactionFee: 'https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=YOUR_API_KEY',
  },
};

export const fetchLivePricesOfCrypto = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        ids: 'bitcoin,tether',
        vs_currencies: 'usd'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching live prices:', error);
    return null;
  }
}



export const importWallet = async (network: 'bitcoin' | 'polygon', privateKey: string) => {
  try {
    let walletAddress;
    if (network === 'bitcoin') {
      // For Bitcoin, we assume using BlockCypher to get an address
      const response = await axios.post(API_ENDPOINTS.bitcoin.importWallet, { privateKey }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
     
      walletAddress = response.data.address;
      console.log("Bitcoin wallet address from API:", walletAddress);
    } else if (network === 'polygon') {
      const web3 = new Web3();
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      walletAddress = account.address;
      console.log("Polygon wallet address from Web3.js:", walletAddress);
    } else {
      throw new Error('Unsupported network');
    }
    // Update wallet address in the MobX store
    walletStore.setWalletAddress(network, walletAddress);

    return walletAddress;
  } catch (error) {
    console.error('Error importing wallet:', error);
    throw error;
  }
};


export const sendTransaction = async (
  network: 'bitcoin' | 'polygon',
  walletAddress: string,
  receiver: string,
  amount: string
) => {
  try {
    const response = await axios.post(API_ENDPOINTS[network].sendTransaction, {
      walletAddress,
      receiver,
      amount,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { transactionId, status, fee, link } = response.data;
    return { id: transactionId, receiver, amount, status, fee, link };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export const getTransactionHistory = async (
//   network: 'bitcoin' | 'polygon',
//   walletAddress: string
// ) => {
//   try {
//     const response = await axios.get(`${API_ENDPOINTS[network].getTransactionHistory}?address=${walletAddress}`);
//     const transactions = response.data;
//     return transactions.map(({ id, receiver, amount, status, fee, link }) => ({
//       id,
//       receiver,
//       amount,
//       status,
//       fee,
//       link,
//     }));
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// export const getTransactionStatus = async (
//   network: 'bitcoin' | 'polygon',
//   transactionId: string
// ) => {
//   try {
//     const response = await axios.get(`${API_ENDPOINTS[network].getTransactionStatus}?txid=${transactionId}`);
//     const { status } = response.data;
//     return status;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// export const getTransactionFee = async (
//   network: 'bitcoin' | 'polygon',
//   transactionId: string
// ) => {
//   try {
//     const response = await axios.get(`${API_ENDPOINTS[network].getTransactionFee}?txid=${transactionId}`);
//     const { fee } = response.data;
//     return fee;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
