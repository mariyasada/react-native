import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar,Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const Header: React.FC = () => {

  return (
    <View>
    <View style={styles.header}>
      {/* <Image 
        source={{ uri: "https://ik.imagekit.io/qrhnvir8bf0/tonikroos_E7WAj-58nX.jpg?updatedAt=1673594153933" }} 
        style={styles.image} 
        alt="user_image"
      /> */}
      <Text style={styles.title}>Cryptoexpress Wallet</Text>
    </View>

    </View>
  );
}; 

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: "column",  
    height:screenHeight/5,  
    gap: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  title: {
    color: '#7c3aed',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;
