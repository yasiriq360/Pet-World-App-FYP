import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
const VetProfileVerification = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vetId } = route.params;
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('We are verifying your clinic documents. This may take 1-2 business days.');
  const [isLoading, setIsLoading] = useState(true);

  const navigateToNextScreen = () => {
    try {
      navigation.replace('DashboardScreen', { vetId: vetId });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      
      const vetData = await response.json();
      console.log('Received vet data:', vetData);
      
      if (!vetData || !vetData.verified) {
        setVerificationStatus('pending');
      } else {
        const status = vetData.verified;
        console.log('Verification status:', status);
        setVerificationStatus(status);
        
        if (status === 'verified') {
          setMessage('Your profile has been verified! Redirecting to dashboard...');
          navigateToNextScreen();
        } else if (status === 'rejected') {
          setMessage('Your verification was not approved. Please check your email for details.');
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkVerificationStatus();
    
    // Set up interval to check every 5 seconds
    const intervalId = setInterval(checkVerificationStatus, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.infoText, { marginTop: 20 }]}>
          Checking verification status...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Vet Profile</Text>
      <Text style={styles.subHeader}>
        {verificationStatus === 'verified' ? 'Approved' : 'Completed'}
      </Text>

      <View style={styles.checkmarkContainer}>
        <Ionicons name={verificationStatus === 'verified' ? 'checkmark-circle' : verificationStatus === 'rejected' ? 'close-circle' : 'checkmark-circle'} size={80} color={verificationStatus === 'verified' ? 'green' : verificationStatus === 'rejected' ? 'red' : 'green'} />
       
      </View>

      <Text style={styles.statusText}>
        {verificationStatus === 'verified' ? 'APPROVED! Your account is verified.' :
         verificationStatus === 'rejected' ? 'NOT APPROVED' : 
         'COMPLETED! Your account is under review.'}
      </Text>
      
      <Text style={styles.infoText}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
  },
  checkmarkContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 100,
    padding: 40,
    marginVertical: 30,
  },
  checkmark: {
    fontSize: 60,
    color: 'green',
  },
  statusText: {
    textAlign: 'center',
    color: '#555',
    marginVertical: 20,
    fontWeight: 'bold',
    fontSize: 18,
  },
  infoText: {
    textAlign: 'center',
    color: '#555',
    marginHorizontal: 20,
    lineHeight: 22,
  }
});

export default VetProfileVerification;
