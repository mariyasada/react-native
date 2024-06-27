import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { walletStore } from '@/store/walletStore';
import { importWallet,sendTransaction } from '@/utils/apis';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';


const Wallet: React.FC = observer(() => {
  const [privateKey, setPrivateKey] = useState<string|undefined>('');
  const [network, setNetwork] = useState<'bitcoin' | 'polygon'>('bitcoin'); 
  const [loading, setLoading] = useState(false);
  const [transactionLoading, settranscationLoading] = useState(false);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');

  const handleImportWallet = async () => {
    setLoading(true);
   
    try {   
      const walletAddress = await importWallet(network, privateKey);
      console.log(`${network} wallet imported successfully:`, walletAddress);
      setLoading(false);
    } catch (error) {
      console.error('Error importing wallet:', error);
      walletStore.setError('Failed to import wallet');
      setLoading(false);
    }
    finally{
        setLoading(false);
    }
  };

  const handleSendTransaction = async () => {
   
    try {
      if(receiver==="" && amount==="") alert("please enter value in both field");
      else{
        settranscationLoading(true);
      let walletAddress=network==="bitcoin"? walletStore.bitcoinWalletAddress:walletStore.polygonWalletAddress
      const { id, status, fee, link } = await sendTransaction(network,walletAddress, receiver, amount,privateKey);
      console.log(`${network} transaction sent successfully:`, id);
      settranscationLoading(false);
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      walletStore.setError('Failed to send transaction');
      settranscationLoading(false);
    }
    finally{
      setLoading(false);
}
  };

  useEffect(()=>{
   if(network==="bitcoin"){
    setPrivateKey(process.env.EXPO_PUBLIC_BITCOIN_PRIVATE_KEY)
   }
   else{
     setPrivateKey(process.env.EXPO_PUBLIC_POLYGON_PRIVATE_KEY)
   }
  },[network])

//   const generatePrivatekey=()=>{
//       const testnet = bitcoin.networks.testnet;

//     // Generate a random keypair
//     const keyPair = bitcoin.ECPair.makeRandom({ network: testnet });
//     const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet });
//     const privateKey = keyPair.toWIF();

//     console.log('Address:', address);
//     console.log('Private Key:', privateKey);
// }


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Import Wallet</Text>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={network === 'bitcoin' ? [styles.switchButton, styles.activeButton] : styles.switchButton}
          onPress={() => setNetwork('bitcoin')}
        >
          <Text style={styles.buttonText}>Bitcoin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={network === 'polygon' ? [styles.switchButton, styles.activeButton] : styles.switchButton}
          onPress={() => setNetwork('polygon')}
        >
          <Text style={styles.buttonText}>Polygon</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Enter Private Key"
        value={privateKey}
        onChangeText={(text) => setPrivateKey(text)}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={handleImportWallet}
        style={[styles.button, { backgroundColor: loading ? '#ccc' : '#007bff' }]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Importing...' : 'Import Wallet'}</Text>
      </TouchableOpacity>
      {network === 'bitcoin' && walletStore.bitcoinWalletAddress && (
        <Text style={styles.success}>Bitcoin Wallet imported successfully: {walletStore.bitcoinWalletAddress}</Text>
      )}
      {network === 'polygon' && walletStore.polygonWalletAddress && (
        <Text style={styles.success}>Polygon Wallet imported successfully: {walletStore.polygonWalletAddress}</Text>
      )}
       <Text style={styles.header}>Send Transaction</Text>
      <TextInput
        placeholder="Receiver Address"
        value={receiver}
        onChangeText={(text) => setReceiver(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={handleSendTransaction}
        style={[styles.button, { backgroundColor: transactionLoading? '#ccc' : '#007bff' }]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{transactionLoading? 'Sending...' : 'Send Transaction'}</Text>
      </TouchableOpacity>
      {walletStore.error && <Text style={styles.error}>{walletStore.error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    margin:"auto",
    width:"60%",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color:"white"
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  switchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    width: '100%',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor:"white"
  },
  button: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  success: {
    color: 'green',
    marginTop: 10,
  },
});

export default Wallet;
