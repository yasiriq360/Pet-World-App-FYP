import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute } from '@react-navigation/native';  // Import the useRoute hook
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const MainPage = ({ navigation }) => {
  // Get the userId from route parameters
  const route = useRoute();
  const { userId } = route.params;

  const [username, setUsername] = useState("User"); // Default to "User" if username is not fetched yet

  // Fetch username from Firebase
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        if (userData && userData.username) {
          setUsername(userData.username); // Set the fetched username
        } else {
          console.log("No username found in user data.");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    if (userId) {
      fetchUsername(); // Fetch username only if userId is available
    }
  }, [userId]); // Run this effect whenever userId changes


  return (
    <SafeAreaWrapper backgroundColor="#F9F9F9">
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {username}</Text> {/* Display userId */}
        <View style={styles.headerIcons}>
        </View>
      </View>

      {/* Illustration and Message */}
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://i.pinimg.com/236x/6d/24/ad/6d24ad5616ddd4dc783fa9972be7c746.jpg",
          }}
          style={styles.image}
        />
        <Text style={styles.title}>Uh Oh!</Text>
        <Text style={styles.message}>
          Looks like you have no profiles set up at this moment, add your pet now
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Decision", { userId })}  // Pass userId to AddProfile screen
      >
        <Text style={styles.buttonText}>Click here to start</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerIcons: {
    flexDirection: "row",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 30,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MainPage;
