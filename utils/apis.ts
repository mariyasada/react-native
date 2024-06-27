import { walletStore } from '@/store/walletStore';
import axios from 'axios';
import Web3 from 'web3';

// Fetching live prices
const API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// src/utils/api.ts
const API_ENDPOINTS = {
  bitcoin: {
    generateAddress: `https://api.blockcypher.com/v1/btc/test3/addrs?token=${process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN}&bech32=false`,
    createWallet: `https://api.blockcypher.com/v1/btc/test3/wallets?token=${process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN}`,
    sendTransaction: `https://api.blockcypher.com/v1/btc/test3/txs/new`,
    sendTransactionSign: `https://api.blockcypher.com/v1/btc/test3/txs/send?token=${process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN}`,
    getTransactionHistory: `https://api.blockcypher.com/v1/btc/test3/addrs/{address}/full?token=${process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN}`,
    getTransactionStatus: `https://api.blockcypher.com/v1/btc/test3/txs/{txhash}?token=${process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN}`,
    getTransactionFee: `https://api.blockcypher.com/v1/btc/test3?token=${process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN}`,
  },
  polygon: {
    importWallet: 'use Web3.js to manage wallet import',
    sendTransaction: `https://api-testnet.polygonscan.com/api?module=transaction&action=sendtx`,
    getTransactionHistory: 'https://api-testnet.polygonscan.com/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&sort=asc&apikey=YOUR_API_KEY',
    getTransactionStatus: 'https://api-testnet.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash={txhash}&apikey=YOUR_API_KEY',
    getTransactionFee: 'https://api-testnet.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=YOUR_API_KEY',
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
};

export const importWallet = async (network: 'bitcoin' | 'polygon', privateKey: string) => {
  try {
    let walletAddress;
    let data;
    if (network === 'bitcoin') {
      // For Bitcoin, we assume using BlockCypher to get an address
      const response = await axios.post(API_ENDPOINTS.bitcoin.generateAddress, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      walletAddress = response.data.address;
      if (walletAddress) {
        const walletData = await axios.post(API_ENDPOINTS.bitcoin.createWallet, {
          name: "mariyaswallet",
          addresses: [walletAddress]
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        data = walletData.data;
      }

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
    walletStore.setWalletData(network, data);

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
  amount: string,
  privateKey: string
) => {
  try {
    if (network === 'bitcoin') {
      // Convert BTC to satoshis
      const satoshis = Math.round(parseFloat(amount) * 1e8);
      const senderAddress = walletAddress || "muNhUX3o2DmXqWM4j9yrrUeuL3Uta6imEH";
      const response = await axios.post(API_ENDPOINTS.bitcoin.sendTransaction, {
        inputs: [{ addresses: [senderAddress] }],
        outputs: [{ addresses: [receiver], value: satoshis }]
      });

      console.log(response,"check response")

      const { tx } = response.data;
      const transactionId = tx.hash;
      const status = "pending"; // initial status
      const fee = tx.fees;
      const link = `https://live.blockcypher.com/btc/tx/${transactionId}`;

      walletStore.addTransaction({ network, id: transactionId, receiver, amount, status, fee, link });
      return { id: transactionId, receiver, amount, status, fee, link };

    } else if (network === 'polygon') {
      let url=`${API_ENDPOINTS.polygon.sendTransaction}&txhash=${privateKey}&apikey=${process.env.EXPO_PUBLIC_POLYSCAN_KEY}`
      const web3 = new Web3(new Web3.providers.HttpProvider(url));

     

      const transaction = {
        to: receiver,
        value: web3.utils.toWei(amount, 'ether'), // Assuming amount is in USDT and USDT uses the same decimal places as Ether
        gas: 21000,
        from: walletAddress,
      };

      const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

      console.log(signedTransaction,receipt,'check transaction')
      const transactionId = receipt.transactionHash;
      const status = receipt.status ? 'success' : 'failed';
      const fee = receipt.gasUsed * parseFloat(web3.utils.fromWei(receipt.effectiveGasPrice.toString(), 'ether'));
      const link = `https://polygonscan.com/tx/${transactionId}`;
     

      walletStore.addTransaction({ network, id: transactionId, receiver, amount, status, fee, link });
      return { id: transactionId, receiver, amount, status, fee, link };
      
    } else {
      throw new Error('Unsupported network');
    }
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
//     const endpoint = API_ENDPOINTS[network].getTransactionHistory.replace('{address}', walletAddress);
//     const response = await axios.get(endpoint);
//     const transactions = response.data.txs || response.data.result;
//     return transactions.map(({ hash, to, value, fee, block_height }) => ({
//       id: hash,
//       receiver: to,
//       amount: value,
//       status: block_height > 0 ? 'completed' : 'pending',
//       fee,
//       link: network === 'bitcoin' ? `https://live.blockcypher.com/btc/tx/${hash}` : `https://polygonscan.com/tx/${hash}`,
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
//     const endpoint = API_ENDPOINTS[network].getTransactionStatus.replace('{txhash}', transactionId);
//     const response = await axios.get(endpoint);
//     return response.data.confirmations > 0 ? 'completed' : 'pending';
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// export const getTransactionFee = async (network: 'bitcoin' | 'polygon') => {
//   try {
//     const response = await axios.get(API_ENDPOINTS[network].getTransactionFee);
//     return network === 'bitcoin' ? response.data.low_fee_per_kb : response.data.result.SafeGasPrice;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
