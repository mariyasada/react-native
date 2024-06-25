import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { walletStore } from '@/store/walletStore';
import { importWallet } from '@/utils/apis';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const Wallet: React.FC = observer(() => {
  const [privateKey, setPrivateKey] = useState('');
  const [network, setNetwork] = useState<'bitcoin' | 'polygon'>('bitcoin'); 
  const [loading, setLoading] = useState(false);

  const handleImportWallet = async () => {
    setLoading(true);
    try {
      if(privateKey ==="") alert("please enter value in private key field");
      else{
      const walletAddress = await importWallet(network, privateKey);
      console.log(`${network} wallet imported successfully:`, walletAddress);
      setLoading(false);
      }
    } catch (error) {
      console.error('Error importing wallet:', error);
      walletStore.setError('Failed to import wallet');
      setLoading(false);
    }
    finally{
        setLoading(false);
    }
  };

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
      {walletStore.error && <Text style={styles.error}>{walletStore.error}</Text>}
      {network === 'bitcoin' && walletStore.bitcoinWalletAddress && (
        <Text style={styles.success}>Bitcoin Wallet imported successfully: {walletStore.bitcoinWalletAddress}</Text>
      )}
      {network === 'polygon' && walletStore.polygonWalletAddress && (
        <Text style={styles.success}>Polygon Wallet imported successfully: {walletStore.polygonWalletAddress}</Text>
      )}
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
