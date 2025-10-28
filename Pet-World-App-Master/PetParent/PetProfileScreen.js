import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { MotiView } from 'moti';
import { colors } from "../theme/colors";

const PetProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, petId } = route.params;
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets/${petId}.json`
        );
        const data = await response.json();

        if (data) {
          setPet({ ...data, petId });
        } else {
          console.error("Pet data not found.");
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [userId, petId]);

  const handleDeletePet = async () => {
    Alert.alert(
      "Delete Pet Profile",
      "Are you sure you want to delete this pet profile?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets/${petId}.json`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                Alert.alert("Success", "Pet profile deleted successfully.");
                navigation.goBack();
              } else {
                Alert.alert("Error", "Failed to delete pet profile.");
              }
            } catch (error) {
              console.error("Error deleting pet profile:", error);
              Alert.alert("Error", "An error occurred while deleting the pet profile.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>No pet profile found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000 }}
          style={[styles.aboutSection, { marginTop: 30 }]}
        >
          <Image source={{ uri: pet.image }} style={styles.petImage} />
          <Text style={styles.petName}>{pet.petName}</Text>
          <Text style={styles.petBreed}>
            {pet.breed} | {pet.size}
          </Text>

          <Text style={styles.sectionTitle}>Appearance and Distinctive Signs</Text>
          <Text style={styles.appearanceDetails}>
            {pet.petDescription || "No distinctive signs provided."}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Size:</Text>
            <Text style={styles.value}>{pet.size}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>
              {pet.weight ? String(pet.weight).slice(0, 3) : ''} {pet.unit}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{pet.gender}</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 1000 }}
          style={[styles.datesSection, { marginTop: 30 }]}
        >
          <Text style={styles.sectionTitle}>Important Dates</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Birthday:</Text>
            <Text style={styles.value}>{pet.birthDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{pet.age} years</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 1000 }}
          style={{ marginTop: 30 }}
        >
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditPetProfile", {
                userId: userId,
                petId: pet.petId,
              })
            }
          >
            <View style={[styles.editButtonGradient, { backgroundColor: colors.primary }]}>
              <Feather name="edit" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 600, duration: 1000 }}
          style={{ marginTop: 20, marginBottom: 30 }}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePet}
          >
            <View style={[styles.deleteButtonGradient, { backgroundColor: colors.error }]}>
              <Feather name="trash-2" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete Profile</Text>
            </View>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 45
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#fff",
  },
  aboutSection: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  petImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 15,
    borderWidth: 5,
    borderColor: colors.primary,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
    alignSelf: "center",
  },
  appearanceDetails: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  value: {
    fontSize: 16,
    color: "#757575",
  },
  datesSection: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  editButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  editButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
  },
  deleteButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  deleteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
  },
});

export default PetProfileScreen;