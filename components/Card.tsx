
import { fetchLivePricesOfCrypto } from '@/utils/apis';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator,StatusBar } from 'react-native';

const HomeScreenCards: React.FC = () => {
    const [prices, setPrices] = useState({ bitcoin: 0, tether: 0 });
    const [loading,setLoading]=useState(false);

    useEffect(() => {
      const getPrices = async () => {
        setLoading(true);
        const data = await fetchLivePricesOfCrypto();
        if (data) {
            
          setPrices({
            bitcoin: data.bitcoin.usd,
            tether: data.tether.usd
          });
          setLoading(false)
        }
      };
  
      getPrices();
      const interval = setInterval(getPrices, 60000);

      return () => clearInterval(interval);
    }, []);
  

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bitcoin (BTC) Price</Text>
        <Text style={styles.value}>${prices.bitcoin}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Tether (USDT)</Text>
        <Text style={styles.value}> ${prices.tether}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   padding:20
  },
  loadingContainer: {
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#7c3aed',
  },
  value: {
    fontSize: 24,
    color: '#333',
  },
});

export default HomeScreenCards;
