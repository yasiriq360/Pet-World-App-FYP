import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
const VetRejected = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vetId, idToken } = route.params;

  useEffect(() => {
    const deleteAccount = async () => {
      try {
        // Wait 5 seconds to display the message before deleting
        setTimeout(async () => {
          try {
            // Delete from Firebase Authentication
            const deleteAuthResponse = await fetch(
              "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  idToken: idToken,
                }),
              }
            );

            // Delete from Realtime Database
            const deleteDbResponse = await fetch(
              `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`,
              {
                method: "DELETE",
              }
            );

            // Clear any stored data
            await AsyncStorage.removeItem("vetToken");
            await AsyncStorage.removeItem("vetId");

            // Navigate to login screen
            navigation.replace("VetLogin");
          } catch (deleteError) {
            console.error("Error deleting account:", deleteError);
            // Still redirect to login, but show error
            alert("Error deleting account. Please contact support.");
            navigation.replace("VetLogin");
          }
        }, 5000);
      } catch (error) {
        console.error("Error in deletion process:", error);
      }
    };

    deleteAccount();
  }, [vetId, idToken, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account Verification</Text>
      <Text style={styles.subHeader}>Rejected</Text>

      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={80} color={colors.primary} />
      </View>

      <Text style={styles.statusText}>
        Your account verification has been rejected
      </Text>
      
      <Text style={styles.infoText}>
        Your account does not meet our verification requirements and will be deleted.
        Please contact support if you believe this is an error.
      </Text>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ff3b30" />
        <Text style={styles.loadingText}>Deleting account...</Text>
      </View>
    </View>
  );
};

export default VetRejected;

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
  iconContainer: {
    backgroundColor: '#ffeeee',
    borderRadius: 100,
    padding: 40,
    marginVertical: 30,
  },
  icon: {
    fontSize: 60,
    color: '#ff3b30',
  },
  statusText: {
    textAlign: 'center',
    color: '#ff3b30',
    marginVertical: 20,
    fontWeight: 'bold',
    fontSize: 18,
  },
  infoText: {
    textAlign: 'center',
    color: '#555',
    marginHorizontal: 20,
    lineHeight: 22,
    marginBottom: 30,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#888',
  }
}); 