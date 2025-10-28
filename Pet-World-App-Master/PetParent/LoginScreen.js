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
import PetLoadingScreen from "../components/PetLoadingScreen";
import PetButton from "../components/PetButton";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/colors";
import { Ionicons } from '@expo/vector-icons';
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkLoginState = async () => {
      setIsLoading(true);
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");

        if (userToken && userId) {
          const response = await fetch(
            "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                idToken: userToken,
              }),
            }
          );

          const result = await response.json();
          if (response.ok && result.users[0].emailVerified) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Functionality", params: { userId } }],
            });
          } else {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userId");
          }
        }
      } catch (error) {
        console.error("Auto-login check failed:", error);
      } finally {
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

      const authResponse = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const authData = await authResponse.json();
      if (!authResponse.ok) throw new Error(authData.error.message);

      const userInfoResponse = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: authData.idToken,
          }),
        }
      );

      const userInfo = await userInfoResponse.json();
      if (!userInfoResponse.ok) throw new Error(userInfo.error.message);

      if (!userInfo.users[0].emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
        return;
      }

      let userId = null;
      let accountType = null;
      let hasPets = false;

      const usersResponse = await fetch(
        "https://pet-world-app123-default-rtdb.firebaseio.com/Users.json"
      );
      const usersData = await usersResponse.json();

      for (const key in usersData) {
        if (usersData[key].email === email) {
          userId = key;
          accountType = usersData[key].accountType || "Pet Parent";

          const petsResponse = await fetch(
            `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`
          );
          const petsData = await petsResponse.json();
          hasPets = petsData && Object.keys(petsData).length > 0;
          break;
        }
      }

      if (!userId) {
        const vetResponse = await fetch(
          "https://pet-world-app123-default-rtdb.firebaseio.com/Vet.json"
        );
        const vetData = await vetResponse.json();

        for (const key in vetData) {
          if (vetData[key].email === email) {
            userId = key;
            accountType = vetData[key].accountType || "Vet";
            break;
          }
        }
      }

      if (!userId) {
        Alert.alert("Error", "User not found in database.");
        return;
      }

      if (isChecked) {
        await AsyncStorage.setItem("userToken", authData.idToken);
        await AsyncStorage.setItem("userId", userId);
      }

      if (accountType === "Vet") {
        navigation.reset({
          index: 0,
          routes: [{ name: "VetDashboard", params: { userId } }],
        });
      } else {
        const destination = hasPets ? "Functionality" : "MainPage";
        navigation.reset({
          index: 0,
          routes: [{ name: destination, params: { userId } }],
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "An error occurred during login. Please try again."
      );
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
