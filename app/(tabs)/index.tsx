import React from 'react';
import { StyleSheet, View, Text, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HomeScreenCards from '@/components/Card';
import Header from '@/components/Header';
import { useLocalObservable } from 'mobx-react-lite'; 
import { observer } from 'mobx-react-lite'; 


const HomeScreen: React.FC = observer(() =>   {

  return (
    <SafeAreaView style={styles.container}>
        <Header />
      <HomeScreenCards />
    </SafeAreaView>
  );
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    flexDirection: 'column',
    
  },
  sidebar: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width:"40%",
  },
  listItem: {
    padding: 10,
    marginLeft: 20,
  },
  listItemText: {
    fontSize: 12,
    color: 'black',
  },
});


export default HomeScreen;