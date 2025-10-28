import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/colors";



const ForgetPasswordScreen = ({ navigation }) => { // Add navigation prop
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // Firebase Password Reset Endpoint
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM`;

      // Send the password reset request
      await axios.post(url, {
        requestType: "PASSWORD_RESET",
        email: email,
      });

      // Success message
      Alert.alert("Success", "Password reset link sent to your email.");

      // Navigate back to the login page after 3 seconds
      setTimeout(() => {
        navigation.navigate("Login"); // Replace "Login" with your login screen name
      }, 3000); // 3 seconds delay
    } catch (error) {
      console.error("Error sending reset email:", error.response?.data?.error?.message);
      // Specific error handling
      if (error.response?.data?.error?.message === "EMAIL_NOT_FOUND") {
        Alert.alert("Error", "No account found with this email address.");
      } else {
        Alert.alert("Error", "Failed to send password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email to receive a password reset link.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handlePasswordReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textSecondary} />
        ) : (
          <Text style={styles.resetButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: colors.textTertiary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    color: colors.textSecondary,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ForgetPasswordScreen;