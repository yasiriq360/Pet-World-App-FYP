import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

const ValidationCodeScreen = ({ route, navigation }) => {
  const { userId } = route.params; // Get the userId passed from previous screen
  const [code, setCode] = useState(["", "", "", ""]);

  const handleCodeChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleConfirm = () => {
    // Handle confirm logic
    console.log("Entered Code:", code.join(""));

    // Pass userId to the Login screen when navigating
    navigation.navigate("Login", { userId }); // Passing userId to Login screen
  };

  const handleResend = () => {
    // Handle resend logic
    console.log("Resend code");
  };

  return (
    <View style={styles.container}>
      {/* Top Image */}
      <Image
        source={{
          uri: "https://i.pinimg.com/474x/da/0f/16/da0f16bbca901d9e67befe6678e4f5d8.jpg", // Replace with your actual image URL
        }}
        style={styles.image}
      />

      {/* Validation Text Section */}
      <Text style={styles.title}>Validation Code</Text>
      <Text style={styles.subtitle}>
        Check your email inbox and enter the validation code here
      </Text>

      {/* Code Input Section */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleCodeChange(value, index)}
          />
        ))}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendText}>Did not receive the code? Resend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  confirmButton: {
    width: "80%",
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendText: {
    fontSize: 14,
    color: "#007BFF",
    marginTop: 10,
  },
});

export default ValidationCodeScreen;
