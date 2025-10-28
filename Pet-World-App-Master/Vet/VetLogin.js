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
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from 'moti';
import PetButton from "../components/PetButton";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/colors";
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if the vet is already logged in
  useEffect(() => {
    const checkLoginState = async () => {
      setIsLoading(true);
      try {
        const vetToken = await AsyncStorage.getItem("vetToken");
        const vetId = await AsyncStorage.getItem("vetId");

        if (vetToken && vetId) {
          // Check the verification status in the database
          try {
            const dbResponse = await fetch(
              `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`
            );
            const data = await dbResponse.json();
            
            if (data && data.verified === "verified") {
              // Check if user has bio
              if (data.bio) {
                // Navigate to the DashboardScreen if the vet has bio
                navigation.replace("DashboardScreen", { vetId });
              } else {
                // Navigate to AddVetProfile if bio is missing
                navigation.replace("AddVetProfile", { vetId });
              }
            } else if (data && data.verified === "unverified") {
              // Navigate to rejection page
              navigation.replace("VetRejected", { 
                vetId,
                idToken: vetToken
              });
            } else {
              // If verification status is not set
              if (!data.bio) {
                // No verification status and no bio - go to profile completion
                navigation.replace("AddVetProfile", { vetId });
              } else {
                // No verification status but has bio - go to verification page
                navigation.replace("VetProfileVerification", { vetId });
              }
            }
          } catch (error) {
            console.error("Error checking vet status:", error);
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auto-login check failed:", error);
        setIsLoading(false);
      }
    };

    checkLoginState();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error.message);
      }

      // Fetch vetId and additional information from Firebase Realtime Database
      let vetId = null;
      let emailVerified = false;
      let isVet = false;
      let verificationStatus = null; // can be "verified", "unverified", or null (pending)
      let hasBio = false;

      try {
        const dbResponse = await fetch(
          "https://pet-world-app123-default-rtdb.firebaseio.com/Vet.json"
        );
        const data = await dbResponse.json();

        for (let key in data) {
          if (data[key].email === email) {
            vetId = key; // Get the unique vetId from the database
            emailVerified = data[key].emailVerified; // Get the emailVerified status
            // Get verification status (directly using "verified" field if it exists)
            verificationStatus = data[key].verified || null; // Get verification status
            hasBio = data[key].bio ? true : false; // Check if user has bio
            isVet = true; // Mark as vet
            break;
          }
        }

        if (!vetId) {
          Alert.alert("Warning", "User authenticated but not found in the database.");
          return;
        }

        // Check if email is verified
        if (!emailVerified) {
          Alert.alert("Error", "Please verify your email before logging in.");
          return;
        }

        // Store login state if "Keep me logged in" is checked
        if (isChecked) {
          await AsyncStorage.setItem("vetToken", result.idToken);
          await AsyncStorage.setItem("vetId", vetId);
        }

        // Handle different scenarios based on verification status and bio
        if (isVet) {
          if (verificationStatus === "verified") {
            if (hasBio) {
              // Scenario 1: Verified and has bio - go to dashboard
              navigation.replace("DashboardScreen", { vetId });
            } else {
              // Scenario 2: Verified but no bio - go to profile completion page
              navigation.replace("AddVetProfile", { vetId });
            }
          } else if (verificationStatus === "unverified") {
            // Scenario 3: Explicitly unverified - navigate to rejection page
            navigation.replace("VetRejected", { 
              vetId,
              idToken: result.idToken 
            });
          } else {
            // If verification status is not set (null/undefined)
            if (!hasBio) {
              // Scenario 4: No verification status and no bio - go to profile completion
              navigation.replace("AddVetProfile", { vetId });
            } else {
              // Scenario 5: No verification status but has bio - go to verification page
              navigation.replace("VetProfileVerification", { vetId });
            }
          }
        } else {
          Alert.alert("Error", "You are not registered as a vet.");
        }
      } catch (dbError) {
        console.error("Database error: ", dbError);
        Alert.alert("Error", "Failed to fetch vet data.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (

      <SafeAreaView style={styles.container}> 
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
          <View style={styles.innerContainer}>
            <Image
              source={{
                uri: "https://i.pinimg.com/474x/da/0f/16/da0f16bbca901d9e67befe6678e4f5d8.jpg",
              }}
              style={styles.image}
            />

            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 1000 }}
              style={styles.contentContainer}
            >
              <Text style={styles.title}>Log in</Text>
              <Text style={styles.subtitle}>
                Welcome Back! Please enter your information below.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Your email"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor={colors.textTertiary}
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
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => navigation.navigate("ForgetPassword")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setIsChecked(!isChecked)}
                >
                  {isChecked && <View style={styles.checkboxChecked} />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>Keep me logged in</Text>
              </View>

              <PetButton
                title="Log in"
                variant="primary"
                size="large"
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              />

              <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate("CreateAccount")}
                >
                  Create Account
                </Text>
              </Text>
            </MotiView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: "25"
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconWrapper: {
    position: "absolute",
    top: 200,
    backgroundColor: colors.surface,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  iconCircle: {
    backgroundColor: colors.primaryLight,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 28,
    color: colors.primary,
  },
  contentContainer: {
    width: "90%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginTop: 50,
    padding: spacing.xl,
    ...shadows.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.textTertiary,
    ...typography.body1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.textTertiary,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: spacing.md,
    ...typography.body1,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  checkboxText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  loginButton: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  footerText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: "center",
  },
  linkText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});

export default LoginScreen;