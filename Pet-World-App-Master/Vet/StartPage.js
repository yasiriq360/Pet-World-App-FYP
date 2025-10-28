import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const StartPage = ({ route, navigation }) => {
  const { vetId } = route.params;
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`);
        const data = await response.json();
        console.log('Fetched data for user:', data);
        if (data && data.username) {
          console.log('Username found:', data.username);
          setUsername(data.username);
        }
      } catch (error) {
        console.log('Error fetching username:', error.message);
      }
    };
    if (vetId) fetchUserData();
  }, [vetId]);

  const handleNavigation = () => {
    navigation.navigate('AddVetProfile', { vetId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.username}>{username || 'User'}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: 'https://png.pngtree.com/png-vector/20220828/ourmid/pngtree-pets-cat-and-dog-vector-png-image_6127516.png',
          }}
          style={styles.image}
        />
      </View>

      <Text style={styles.title}>Uh Oh!</Text>
      <Text style={styles.subtitle}>Looks like you have not created your profile yet!</Text>

      <TouchableOpacity style={styles.button} onPress={handleNavigation}>
        <Text style={styles.buttonText}>Click here to start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    color: '#333',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StartPage;
