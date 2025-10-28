import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from 'moti';
import PetLoadingScreen from "../components/PetLoadingScreen";
import PetProfileCard from "../components/PetProfileCard";
import FeatureCard, { FeatureConfigs } from "../components/FeatureCard";
import PetButton from "../components/PetButton";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/colors";

const Functionality = ({ navigation }) => {
  const [petData, setPetData] = useState([]);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to control loading page visibility
  const [hasUnread, setHasUnread] = useState(false);
  const route = useRoute();
  const { userId } = route.params;

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const userResponse = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}.json`
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      console.log("Fetched User Data:", userData);

      if (userData && userData.username) {
        setUsername(userData.username);
      } else {
        Alert.alert("No Data", "No user data found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "An error occurred while fetching user data.");
    }
  };

  // Function to fetch pet data
  const fetchPetData = async () => {
    try {
      console.log(`Fetching pet data for userId: ${userId}`);

      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pet data");
      }

      const data = await response.json();
      console.log("Fetched Pet Data:", data);

      if (data) {
        const petsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPetData(petsArray);
      } else {
        setPetData([]);
        Alert.alert("No Data", "No pets found for this user.");
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      Alert.alert("Error", "An error occurred while fetching pet data.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchPetData();
    }
  }, [userId]);

  // Poll for pet data every 1 second
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchPetData();
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  // Poll for unread messages
  useEffect(() => {
    let interval;
    const checkUnread = async () => {
      try {
        const [chatsRes] = await Promise.all([
          fetch('https://pet-world-app123-default-rtdb.firebaseio.com/chats.json'),
        ]);
        const chatsData = await chatsRes.json();
        if (chatsData) {
          let foundUnread = false;
          Object.entries(chatsData).forEach(([chatId, messages]) => {
            const ids = chatId.split('_');
            if (!ids.includes(userId)) return;
            const messageArray = Object.values(messages || {});
            if (messageArray.length === 0) return;
            // Check for unread messages from vet to user
            const vetId = ids.find(id => id !== userId);
            if (messageArray.some(msg => msg.receiverId === userId && msg.senderId === vetId && msg.seenByUser === false)) {
              foundUnread = true;
            }
          });
          setHasUnread(foundUnread);
        } else {
          setHasUnread(false);
        }
      } catch (e) {
        setHasUnread(false);
      }
    };
    if (userId) {
      checkUnread();
      interval = setInterval(checkUnread, 2000);
    }
    return () => interval && clearInterval(interval);
  }, [userId]);

  // Function to handle refresh button press

  const handleChatListPress = () => {
    navigation.navigate("ChatHistory", { userId }); // navigate to your chat list screen
  };
  

  const handleProfilePress = () => {
    setIsLoading(true); // Show loading page
    setTimeout(() => {
      setIsLoading(false); // Hide loading page
      navigation.navigate("UserProfile", { userId }); // Navigate to UserProfile
    }, 2000); // 2 seconds delay
  };

  const handlePetProfilePress = (petId) => {
    setIsLoading(true); // Show loading page
    setTimeout(() => {
      setIsLoading(false); // Hide loading page
      navigation.navigate("PetProfileScreen", { petId, userId }); // Navigate to PetProfile
    }, 2000); // 2 seconds delay
  };

  const handleChatBotPress = () => {
    setIsLoading(true); // Show loading page
    setTimeout(() => {
      setIsLoading(false); // Hide loading page
      navigation.navigate("Chatbot", { userId }); // Navigate to Chatbot page
    }, 2000); // 2 seconds delay
  };
  const handleVetPress = () => {
    setIsLoading(true); // Show loading page
    setTimeout(() => {
      setIsLoading(false); // Hide loading page
      navigation.navigate("Vets", { userId }); // Navigate to NearbyVets page
    }, 2000); // 2 seconds delay
  };
  const handleBreedPress = () => {
    setIsLoading(true); // Show loading page
    setTimeout(() => {
      setIsLoading(false); // Hide loading page
      navigation.navigate("BreedDetails", { userId }); // Navigate to Chatbot page
    }, 2000); // 2 seconds delay

  };

  return (

    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      {isLoading ? (
        <PetLoadingScreen message="Loading your pet world..." />
      ) : (
        <ScrollView >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              {(username || "Pet Owner").split('').map((char, idx) => (
                <MotiView
                  key={char + idx}
                  from={{ scale: 1 }}
                  animate={{ scale: 1.15 }}
                  transition={{
                    type: 'timing',
                    duration: 400,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: idx * 60,
                  }}
                >
                  <Text style={styles.username}>{char === ' ' ? '\u00A0' : char}</Text>
                </MotiView>
              ))}
            </View>
            <View style={styles.headerButtons}>


  <TouchableOpacity onPress={handleChatListPress} style={styles.chatButton}>
    <LinearGradient colors={["#9EC6B8", "#B4D7C9"]} style={styles.iconContainer}>
      <Feather name="message-square" size={24} color="#fff" />
      {hasUnread && (
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: 'red',
          borderWidth: 2,
          borderColor: '#fff',
        }} />
      )}
    </LinearGradient>
  </TouchableOpacity>

  <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
    <LinearGradient colors={["#D3C0A8", "#E7D5BB"]} style={styles.iconContainer}>
      <Feather name="user" size={24} color="#fff" />
    </LinearGradient>
  </TouchableOpacity>
</View>
          </View>

          {petData.length > 0 ? (
            petData.map((pet, index) => (
              <PetProfileCard
                key={pet.id}
                pet={pet}
                index={index}
                onPress={() => handlePetProfilePress(pet.id)}
              />
            ))
          ) : (
            <View style={styles.noPetsContainer}>
              <Text style={styles.noPetsEmoji}>🐾</Text>
              <Text style={styles.noPetsText}>No pets yet!</Text>
              <Text style={styles.noPetsSubtext}>Add your first furry friend to get started</Text>
              <PetButton
                title="Add Pet"
                variant="primary"
                onPress={() => navigation.navigate("Decision", { userId })}
                style={styles.addPetButton}
              />
            </View>
          )}

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Explore Features</Text>
            <View style={styles.featuresGrid}>
              <FeatureCard
                {...FeatureConfigs.careGuide}
                index={0}
                onPress={handleBreedPress}
              />

              <FeatureCard
                {...FeatureConfigs.breedIdentification}
                index={1}
                onPress={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    navigation.navigate("BreedIdentification", { userId });
                  }, 2000);
                }}
              />

              <FeatureCard
                {...FeatureConfigs.healthCheck}
                title="Skin Disease ID"
                description="Identify skin diseases and their criticalness"
                index={2}
                onPress={() => navigation.navigate("SkinDiseaseRecognition", { userId })}
              />

              <FeatureCard
                {...FeatureConfigs.vetConnect}
                title="Vet Consult"
                description="Connect with veterinarians"
                index={3}
                onPress={handleVetPress}
              />

              <FeatureCard
                {...FeatureConfigs.location}
                index={4}
                onPress={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    navigation.navigate("NearbyVets", { userId });
                  }, 2000);
                }}
              />

              <FeatureCard
                {...FeatureConfigs.chatbot}
                title="ChatPaw"
                index={5}
                onPress={handleChatBotPress}
              />

            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: "45"
  },
 
  header: {
    margin: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  
  refreshButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
   
  },
  profileButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  username: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  noPetsContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  noPetsEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  noPetsText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  noPetsSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addPetButton: {
    minWidth: 120,
  },
  featuresContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
});

export default Functionality;