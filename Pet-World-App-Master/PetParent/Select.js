import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from '@expo/vector-icons';

const Select = ({ navigation }) => {
  const handlePetParentPress = () => {
    navigation.navigate("Login");
  };

  const handleVetPress = () => {
    navigation.navigate("VetLogin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/474x/da/0f/16/da0f16bbca901d9e67befe6678e4f5d8.jpg",
        }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.content}
          >
            <Text style={styles.heading}>Welcome to PawCare</Text>
            <Text style={styles.subheading}>Choose your role to continue</Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#8B4513' }]} 
              onPress={handlePetParentPress}
              activeOpacity={0.8}
            >
              <Ionicons name="paw" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Continue as Pet Parent</Text>
              <Text style={styles.buttonSubtext}>Find care for your furry friend</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#FFFFFF' }]}
              onPress={handleVetPress}
              activeOpacity={0.8}
            >
              <Ionicons name="medical" size={24} color="#8B4513" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: '#8B4513' }]}>Continue as Veterinarian</Text>
              <Text style={[styles.buttonSubtext, { color: '#8B4513' }]}>Provide care for pets</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  subheading: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.9
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  buttonSubtext: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  }
});

export default Select;