import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Modal
} from "react-native";
import { MotiView } from 'moti';
import { colors } from "../theme/colors";
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import policyText from '../constants/policyText';

const CreateAccountScreen = ({ navigation }) => {
  const [accountType, setAccountType] = useState("Pet Parent");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [idToken, setIdToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const validateUsername = (input) => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/;
    if (!regex.test(input)) {
      setUsernameError("Username must contain at least one alphabet and can include digits.");
    } else {
      setUsernameError("");
    }
    setUsername(input);
  };

  const handleCreateAccount = async () => {
    if (usernameError) {
      Alert.alert("Error", usernameError);
      return;
    }

    if (!email || !password || !username || !acceptTerms) {
      Alert.alert("Error", "Please fill in all fields and accept the terms.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    try {
      const authResponse = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true,
          }),
        }
      );

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        Alert.alert("Error", authData.error.message);
        return;
      }

      setIdToken(authData.idToken);
      setUserId(authData.localId);

      const userData = {
        userId: authData.localId,
        email,
        username,
        accountType,
        acceptTerms,
        emailVerified: false,
      };

      // Corrected account type handling
      if (accountType === "Pet Parent") {
        await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${authData.localId}.json`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );
      } else if (accountType === "Vet") {
        await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${authData.localId}.json`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );
      }

      await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken: authData.idToken,
          }),
        }
      );

      Alert.alert(
        "Verify Your Email",
        "A verification email has been sent. Please verify your email and then log in."
      );

      setTimeout(() => {
        if (accountType === "Vet") {
          navigation.navigate("VetLogin");
        } else {
          navigation.navigate("Login");
        }
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create account. Please try again."
      );
    }
  };

  const checkEmailVerification = async () => {
    if (!idToken || !userId) return;

    try {
      const userInfoResponse = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: idToken,
          }),
        }
      );

      const userInfo = await userInfoResponse.json();

      if (!userInfoResponse.ok) {
        throw new Error(userInfo.error.message);
      }

      if (userInfo.users && userInfo.users[0].emailVerified) {
        await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailVerified: true }),
          }
        );

        if (accountType === "Vet") {
          await fetch(
            `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${userId}.json`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ emailVerified: true }),
            }
          );
        }
      }
    } catch (error) {
      console.error("Error checking email verification:", error);
    }
  };

  useEffect(() => {
    if (idToken && userId) {
      const interval = setInterval(() => {
        checkEmailVerification();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [idToken, userId]);

  useEffect(() => {
    // Load the privacy policy text from the file
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 45 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image
            source={{
              uri: "https://i.pinimg.com/474x/da/0f/16/da0f16bbca901d9e67befe6678e4f5d8.jpg",
            }}
            style={styles.image}
          />

          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="user-alt" size={28} color="#007bff" />
            </View>
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.contentContainer}
          >
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Welcome! Please enter your information below and get started.
            </Text>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={validateUsername}
              />
            </View>
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password (min 8 characters)"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setAccountType("Pet Parent")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    accountType === "Pet Parent" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Pet Parent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setAccountType("Vet")}
              >
                <View
                  style={[
                    styles.radioCircle,
                    accountType === "Vet" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Vet</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={1}
            >

              <Modal
  visible={showPolicyModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowPolicyModal(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <ScrollView>
        <Text style={styles.modalText}>{policyText}</Text>
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setShowPolicyModal(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

              <View
                style={[
                  styles.checkbox,
                  acceptTerms && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                {acceptTerms && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
             <Text style={styles.checkboxText}>
                    I accept 
              <Text
              style={styles.policyLink}
              onPress={() => setShowPolicyModal(true)}
            >
              {" Terms and Conditions"}
            </Text>
          </Text>

            </TouchableOpacity>

            <LinearGradient colors={colors.gradientPrimary} style={styles.createButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <TouchableOpacity

                onPress={handleCreateAccount}

              >
                <Text style={styles.createButtonText}>Create account</Text>
              </TouchableOpacity>
            </LinearGradient>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                Login here
              </Text>
            </Text>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",

  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  iconWrapper: {
    position: "absolute",
    top: 200,
    backgroundColor: "white",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconCircle: {
    backgroundColor: "#e6f2ff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  policyLink: {
  color: colors.primary,
  textDecorationLine: "underline",
  fontWeight: "bold",
},
modalContainer: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},
modalContent: {
  backgroundColor: "white",
  borderRadius: 10,
  width: "90%",
  maxHeight: "80%",
  padding: 20,
},
modalText: {
  fontSize: 14,
  color: "#333",
},
closeButton: {
  marginTop: 15,
  backgroundColor: colors.primary,
  paddingVertical: 10,
  borderRadius: 5,
  alignItems: "center",
},
closeButtonText: {
  color: "white",
  fontWeight: "bold",
  fontSize: 16,
},
  contentContainer: {
    flex: 1,
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: -50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    height: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingRight: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  createButton: {
    width: "100%",
    height: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",

  },
  checkboxText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 15,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default CreateAccountScreen;
