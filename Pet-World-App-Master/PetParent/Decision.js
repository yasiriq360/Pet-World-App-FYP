import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";

const AddPetDetails = ({ route, navigation }) => {
  // Fetch the userId from route.params
  const { userId } = route.params;

  const handleAutoPress = () => {
    // Navigate to Auto page with userId
    navigation.navigate("ImageUpload", { userId });
  };

  const handleManualPress = () => {
    // Navigate to Manual page with userId
    navigation.navigate("AddProfile", { userId });
  };

  return (
    <ImageBackground
      source={{
        uri: "https://i.pinimg.com/474x/da/0f/16/da0f16bbca901d9e67befe6678e4f5d8.jpg",
      }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.heading}>Add Pet Details</Text>

        <TouchableOpacity style={styles.button} onPress={handleAutoPress}>
          <Text style={styles.buttonText}>Auto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleManualPress}>
          <Text style={styles.buttonText}>Manual</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Adds a dark transparent overlay
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddPetDetails;
