import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Modal,
  TextInput,
  SafeAreaView  
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PetButton from "../components/PetButton";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/colors";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [petCount, setPetCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      console.log(`Fetching user data for userId: ${userId}`);

      // Fetch user data
      const userResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      console.log("Fetched User Data:", userData);

      // Fetch pet data
      const petsResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`
      );

      if (!petsResponse.ok) {
        throw new Error("Failed to fetch pet data");
      }

      const petsData = await petsResponse.json();
      const petCount = petsData ? Object.keys(petsData).length : 0;

      // Fetch subscription data
      const subscriptionResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Subscription.json`
      );

      if (!subscriptionResponse.ok) {
        throw new Error("Failed to fetch subscription data");
      }

      const subscriptionData = await subscriptionResponse.json();
      let userSubscription = null;
      let subscriptionKey = null;
      if (subscriptionData) {
        // Find the latest active or most recent subscription
        const entries = Object.entries(subscriptionData);
        // Prefer active, else most recent
        const active = entries.find(([_, sub]) => sub.subscriptionStatus === "active");
        if (active) {
          subscriptionKey = active[0];
          userSubscription = { ...active[1], id: active[0] };
        } else if (entries.length > 0) {
          // fallback: most recent by subscriptionDate
          entries.sort((a, b) => new Date(b[1].subscriptionDate) - new Date(a[1].subscriptionDate));
          subscriptionKey = entries[0][0];
          userSubscription = { ...entries[0][1], id: entries[0][0] };
        }
      }
      setSubscription(userSubscription);
      // Set user data, pet count, and subscription
      setUserData(userData);
      setPetCount(petCount);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "An error occurred while fetching data.");
    }
  };

  const handleAddPet = async () => {
    try {
      // Step 1: Fetch user data from Firebase
      const userResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`
      );
      const userData = await userResponse.json();

      if (!userData) {
        throw new Error("User data not found.");
      }

      // Step 2: Get the current numberOfPets from Firebase
      const numberOfPets = userData.numberOfPets || 0; // Default to 0 if numberOfPets doesn't exist

      // Step 3: Determine pet limit based on subscription
      let petLimit = 2; // Default for non-subscribers

      if (isSubscriptionActive()) {
        if (subscription.planName === "Basic Plan") {
          petLimit = 5; // Basic Plan allows up to 5 pets
        } else if (
          subscription.planName === "Premium Plan" ||
          subscription.planName === "Annual Plan"
        ) {
          petLimit = Infinity; // Premium and Annual Plans allow unlimited pets
        }
      }

      console.log(`User Plan: ${subscription?.planName || "No Plan"}`);
      console.log(`Current Pet Count: ${petCount}`);
      console.log(`Pet Limit: ${petLimit}`);

      // Step 4: Check if the user can add more pets
      if (numberOfPets >= petLimit && petLimit !== Infinity) {
        Alert.alert(
          "Upgrade Required",
          "You have reached your pet limit. Upgrade your subscription to add more pets.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => navigation.navigate("Subscription", { userId }),
            },
          ]
        );
      } else {
        navigation.navigate("Decision", { userId });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data. Please try again.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("Logout Cancelled"),
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userId");
            navigation.replace("Select");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "An error occurred while logging out.");
          }
        },
      },
    ]);
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete your profile? Your account will be deleted after 30 days.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Set the account deletion time to 30 days from now
              const deletionDate = new Date();
              deletionDate.setDate(deletionDate.getDate() + 30); // Adding 30 days

              // Store the deletion date in AsyncStorage or Firebase
              await AsyncStorage.setItem("deletionDate", deletionDate.toISOString());

              // Optionally, you can also save the deletion date in Firebase
              const userProfile = {
                deletionDate: deletionDate.toISOString(),
              };

              const response = await fetch(
                `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`,
                {
                  method: "PATCH", // Use PATCH to update the user's profile with the deletion date
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(userProfile),
                }
              );

              if (!response.ok) {
                throw new Error("Failed to schedule profile deletion");
              }

              // Log out the user after scheduling the deletion
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userId");

              // Navigate to login page
              navigation.replace("Login");

              // Show confirmation message
              Alert.alert(
                "Profile Deletion Scheduled",
                "Your profile will be deleted in 30 days. If you change your mind, you can log in again before the deletion date."
              );
            } catch (error) {
              console.error("Error scheduling profile deletion:", error);
              if (error.message.includes("Network request failed")) {
                Alert.alert("Connection Error", "Cannot delete profile due to a poor internet connection.");
              } else {
                Alert.alert("Error", "An error occurred while scheduling the profile deletion.");
              }
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSaveUsername = async () => {
    const trimmedUsername = newUsername.trim();

    const scriptRegex = /[<>]/;
    if (scriptRegex.test(trimmedUsername)) {
      Alert.alert("Invalid Input", "Scripts or HTML tags are not allowed in the username.");
      return;
    }

    if (!trimmedUsername) {
      Alert.alert("Invalid Input", "Username cannot be empty.");
      return;
    }

    if (trimmedUsername === userData.username) {
      setIsEditingUsername(false);
      Alert.alert("Saved", "Your profile is up to date.");
      return;
    }

    try {
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      setUserData((prevData) => ({ ...prevData, username: trimmedUsername }));
      setIsEditingUsername(false);
      Alert.alert("Success", "Username updated successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", "An error occurred while updating the username.");
    }
  };

  // Firebase Auth REST API endpoint for password reset
  const FIREBASE_API_KEY = 'AIzaSyCYfabEdc3IHq9FmQ1SvHV_jAnq1T-sIiM';
  const FIREBASE_PASSWORD_RESET_URL = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;

  // Password reset handler
  const handlePasswordReset = async () => {
    if (!userData?.email) {
      Alert.alert('Error', 'No email found for this user.');
      return;
    }
    try {
      const response = await fetch(FIREBASE_PASSWORD_RESET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: userData.email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Password Reset', 'Check your email for password reset instructions.', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login', { userId }),
          },
        ]);
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to send password reset email.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    }
  };

  // Add handleUnsubscribe function
  const handleUnsubscribe = async () => {
    if (!subscription || !subscription.id) {
      Alert.alert("Error", "No active subscription found.");
      return;
    }
    Alert.alert(
      "Unsubscribe",
      "Are you sure you want to unsubscribe? You will keep your benefits until the end of your current period.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsubscribe",
          style: "destructive",
          onPress: async () => {
            try {
              let endDate = new Date(subscription.subscriptionEndDate || new Date());
              if (!subscription.subscriptionEndDate && subscription.subscriptionDate) {
                endDate = new Date(subscription.subscriptionDate);
                if (subscription.planName === "Annual Plan") {
                  endDate.setFullYear(endDate.getFullYear() + 1);
                } else {
                  endDate.setMonth(endDate.getMonth() + 1);
                }
              }
              await fetch(
                `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Subscription/${subscription.id}.json`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    subscriptionStatus: "cancelled",
                    subscriptionEndDate: endDate.toISOString(),
                  }),
                }
              );
              setSubscription((prev) => ({
                ...prev,
                subscriptionStatus: "cancelled",
                subscriptionEndDate: endDate.toISOString(),
              }));
              Alert.alert("Unsubscribed", "You will keep your benefits until " + endDate.toDateString());
            } catch (error) {
              Alert.alert("Error", "Failed to unsubscribe. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Helper to check if subscription is active
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    if (subscription.subscriptionStatus === "active" || !subscription.subscriptionStatus) return true;
    if (
      subscription.subscriptionStatus === "cancelled" &&
      new Date(subscription.subscriptionEndDate) > new Date()
    ) {
      return true;
    }
    return false;
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 45 }}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/36/02/58/360258589661f845ffea9408259ffad7.jpg",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={2}
      >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {userData ? (
          <View>
            <View style={styles.profileContent}>
              {/* Profile Header */}
              <View style={styles.headerCard}>
                <LinearGradient colors={colors.gradientPrimary} style={styles.headerGradient}>
                  <View style={styles.headerIconContainer}>
                    <MaterialCommunityIcons name="account-circle" size={40} color={colors.surface} />
                  </View>
                  <Text style={styles.headerUsername}>{userData.username}</Text>
                  <Text style={styles.headerSubtitle}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.surface} /> {userData.accountType}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setNewUsername(userData.username);
                      setIsEditingUsername(true);
                    }}
                    style={styles.editButton}
                  >
                    <Feather name="edit-2" size={16} color={colors.surface} />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {/* Info Cards Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <LinearGradient colors={colors.gradientSecondary} style={styles.card}>
                    <View style={styles.cardIconContainer}>
                      <MaterialCommunityIcons name="email-outline" size={24} color={colors.surface} />
                    </View>
                    <Text style={styles.cardTitle}>Email</Text>
                    <Text style={styles.cardValue} numberOfLines={1} ellipsizeMode="tail">
                      {userData.email}
                    </Text>
                  </LinearGradient>
                </View>

                <View style={styles.infoCard}>
                  <LinearGradient colors={colors.gradientWarm} style={styles.card}>
                    <View style={styles.cardIconContainer}>
                      <FontAwesome5 name="paw" size={24} color={colors.surface} />
                    </View>
                    <Text style={styles.cardTitle}>Pets</Text>
                    <Text style={styles.cardValue}>{petCount}</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Subscription Card */}
              <View>
                <LinearGradient colors={colors.gradientCool} style={styles.subscriptionCard}>
                  <View style={styles.subscriptionHeader}>
                    <MaterialCommunityIcons name="crown" size={28} color={colors.surface} />
                    <Text style={styles.subscriptionTitle}>Subscription Plan</Text>
                  </View>
                  {subscription ? (
                    <View style={styles.subscriptionContent}>
                      {subscription.subscriptionStatus === "cancelled" && new Date(subscription.subscriptionEndDate) <= new Date() ? (
                        // Subscription is cancelled and expired
                        <Text style={styles.subscriptionPlan}>
                          <Ionicons name="close-circle" size={20} color={colors.error} /> Unsubscribed
                        </Text>
                      ) : subscription.subscriptionStatus === "cancelled" ? (
                        // Subscription is cancelled but still active
                        <>
                          <Text style={styles.subscriptionPlan}>
                            <Ionicons name="alert-circle" size={20} color={colors.warning} /> {subscription.planName} (Unsubscribed)
                          </Text>
                          <Text style={styles.subscriptionDescription}>
                            Your benefits continue until: {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                          </Text>
                          <Text style={styles.subscriptionPrice}>{subscription.planPrice}</Text>
                          <Text style={styles.subscriptionDescription}>{subscription.planDescription}</Text>
                        </>
                      ) : (
                        // Subscription is active
                        <>
                          <Text style={styles.subscriptionPlan}>
                            <Ionicons name="star" size={20} color={colors.surface} /> {subscription.planName}
                          </Text>
                          <Text style={styles.subscriptionPrice}>{subscription.planPrice}</Text>
                          <Text style={styles.subscriptionDescription}>{subscription.planDescription}</Text>
                        </>
                      )}
                      {/* Unsubscribe button if eligible */}
                      {isSubscriptionActive() && subscription.subscriptionStatus !== "cancelled" && (
                        <PetButton
                          title="Unsubscribe"
                          variant="sunset"
                          size="small"
                          onPress={handleUnsubscribe}
                          style={styles.unsubscribeButton}
                          icon={<Feather name="x-circle" size={20} color={colors.surface} />}
                        />
                      )}
                    </View>
                  ) : (
                    <View style={styles.subscriptionContent}>
                      <Text style={styles.subscriptionPlan}>
                        <Ionicons name="flash-outline" size={20} color={colors.surface} /> Free Plan
                      </Text>
                      <Text style={styles.subscriptionDescription}>
                        Upgrade to unlock premium features
                      </Text>
                      <PetButton
                        title="Upgrade Now"
                        variant="accent"
                        size="small"
                        onPress={() => navigation.navigate("Subscription", { userId })}
                        style={styles.upgradeButton}
                        icon={<Ionicons name="arrow-up-circle" size={20} color={colors.surface} />}
                      />
                    </View>
                  )}
                </LinearGradient>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={40} color={colors.surface} />
            <Text style={styles.loadingText}>Loading user data...</Text>
          </View>
        )}

        {/* Modal for editing username */}
        <Modal
          visible={isEditingUsername}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsEditingUsername(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                <MaterialCommunityIcons name="account-edit" size={24} color={colors.primary} /> Edit Username
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new username"
                value={newUsername}
                onChangeText={setNewUsername}
                autoFocus={true}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditingUsername(false)}
                >
                  <Feather name="x" size={20} color={colors.error} />
                  <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveUsername}
                >
                  <Feather name="check" size={20} color={colors.success} />
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Enhanced Buttons */}
        <View style={styles.buttonContainer}>
          <PetButton
            title="Add New Pet"
            variant="primary"
            size="large"
            onPress={handleAddPet}
            style={styles.actionButton}
            icon={<FontAwesome5 name="plus-circle" size={20} color={colors.surface} />}
          />
           <PetButton
            title="Reset Password"
            variant="accent"
            size="large"
            onPress={handlePasswordReset}
            style={styles.actionButton}
            icon={<Feather name="lock" size={20} color={colors.surface} />}
          />

          <PetButton
            title="Delete Profile"
            variant="sunset"
            size="large"
            onPress={handleDeleteProfile}
            style={styles.actionButton}
            icon={<MaterialCommunityIcons name="account-remove" size={20} color={colors.surface} />}
          />

          <PetButton
            title="Logout"
            variant="warm"
            size="large"
            onPress={handleLogout}
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            icon={<Ionicons name="log-out" size={20} color={colors.surface} />}
          />

         
        </View>
      </ScrollView>
    </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  profileContent: {
    padding: spacing.lg,
  },
  // Header Card Styles
  headerCard: {
    marginBottom: spacing.xl,
  },
  headerGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  headerIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.round,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerUsername: {
    ...typography.h1,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    color: colors.surface,
    marginLeft: spacing.xs,
    ...typography.button,
    fontWeight: '600',
  },
  // Info Grid Styles
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  infoCard: {
    width: '48%',
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  cardValue: {
    ...typography.h3,
    color: colors.surface,
    fontWeight: '700',
  },
  // Subscription Card Styles
  subscriptionCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subscriptionTitle: {
    ...typography.h3,
    color: colors.surface,
    marginLeft: spacing.sm,
    fontWeight: '700',
  },
  subscriptionContent: {
    alignItems: 'flex-start',
  },
  subscriptionPlan: {
    ...typography.h2,
    color: colors.surface,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subscriptionPrice: {
    ...typography.h4,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  subscriptionDescription: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  upgradeButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  unsubscribeButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.errorLight,
  },
  // Button Container
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loadingText: {
    ...typography.h3,
    color: colors.surface,
    textAlign: "center",
    marginTop: spacing.md,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.xl,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...typography.body1,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  modalButtonText: {
    ...typography.button,
    marginLeft: spacing.xs,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: colors.errorLight,
  },
  saveButton: {
    backgroundColor: colors.successLight,
  },
  cancelButtonText: {
    color: colors.error,
  },
  saveButtonText: {
    color: colors.success,
  },
});

export default UserProfile;