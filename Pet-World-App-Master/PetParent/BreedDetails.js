import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Restore static breed data imports
const catBreedData = require("./breed.json");
const dogBreedData = require("./dog_breed_details.json");

function BreedDetails({ route }) {
  const { userId } = route.params;
  const navigation = useNavigation();

  const [userPets, setUserPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // Add state for breed data
  const [catBreeds, setCatBreeds] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [breedLoading, setBreedLoading] = useState(true);
  const [breedError, setBreedError] = useState(null);
  const [filteredCatBreeds, setFilteredCatBreeds] = useState([]);
  const [filteredDogBreeds, setFilteredDogBreeds] = useState([]);

  // State to track which pet card is expanded
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing!");
      setLoading(false);
      return;
    }

    async function fetchUserPets() {
      try {
        const url = `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data) {
          setUserPets([]);
          setLoading(false);
          return;
        }

        const petsArray = Object.values(data);
        setUserPets(petsArray);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setUserPets([]);
        setLoading(false);
      }
    }

    fetchUserPets();
  }, [userId]);

  // Fetch breed data from APIs and filter for user's pets
  useEffect(() => {
    async function fetchBreedsAndFilter() {
      try {
        setBreedLoading(true);
        const [catRes, dogRes] = await Promise.all([
          fetch("https://api.thecatapi.com/v1/breeds"),
          fetch("https://api.thedogapi.com/v1/breeds"),
        ]);
        if (!catRes.ok || !dogRes.ok) throw new Error("Failed to fetch breed data");
        const catData = await catRes.json();
        const dogData = await dogRes.json();
        setCatBreeds(catData);
        setDogBreeds(dogData);

        // Only filter if userPets is available and not loading
        if (userPets && userPets.length > 0) {
          // Get unique breed names from userPets (case-insensitive)
          const userBreedNames = Array.from(new Set(userPets.map(pet => pet.breed.trim().toLowerCase())));
          // Flexible partial matching for filtering
          const filteredCats = catData.filter(breed =>
            userBreedNames.some(userBreed =>
              breed.name.trim().toLowerCase().includes(userBreed) ||
              userBreed.includes(breed.name.trim().toLowerCase())
            )
          );
          const filteredDogs = dogData.filter(breed =>
            userBreedNames.some(userBreed =>
              breed.name.trim().toLowerCase().includes(userBreed) ||
              userBreed.includes(breed.name.trim().toLowerCase())
            )
          );
          setFilteredCatBreeds(filteredCats);
          setFilteredDogBreeds(filteredDogs);
        } else {
          setFilteredCatBreeds([]);
          setFilteredDogBreeds([]);
        }
        setBreedLoading(false);
      } catch (err) {
        setBreedError(err.message);
        setBreedLoading(false);
      }
    }
    // Only fetch if userPets is loaded
    if (userPets !== null) {
      fetchBreedsAndFilter();
    }
  }, [userPets]);

  const formatContent = (content) => {
    if (!content) return "No information available.";
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.map((item) => `• ${item}`).join("\n");
    if (typeof content === "object") {
      return Object.entries(content)
        .map(([key, value]) => {
          if (value === undefined || value === null) {
            return `${capitalize(key)}: No information available.`;
          } else if (Array.isArray(value)) {
            const arrStr = value.map((i) => `    • ${i}`).join("\n");
            return `${capitalize(key)}:\n${arrStr}`;
          } else if (typeof value === "object") {
            const objStr = formatContent(value)
              .split("\n")
              .map((line) => "    " + line)
              .join("\n");
            return `${capitalize(key)}:\n${objStr}`;
          } else {
            return `${capitalize(key)}: ${value}`;
          }
        })
        .join("\n");
    }
    return String(content);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).replace(/\_/g, " ");

  const openModal = (title, content) => {
    const formatted = formatContent(content);
    setModalTitle(title);
    setModalContent(formatted);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContent("");
    setModalTitle("");
  };

  if (loading || breedLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading {loading ? "pets" : "breed information"}...</Text>
      </View>
    );
  }

  if (error || breedError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "red" }}>Error: {error || breedError}</Text>
      </View>
    );
  }

  if (!userPets || userPets.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No pets found for this user.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {userPets.map((pet, index) => {
          // Try both filtered cat and dog breeds from API (flexible matching)
          const breedInfoApi =
            (filteredCatBreeds && filteredCatBreeds.find(breed =>
              breed.name.trim().toLowerCase().includes(pet.breed.trim().toLowerCase()) ||
              pet.breed.trim().toLowerCase().includes(breed.name.trim().toLowerCase())
            )) ||
            (filteredDogBreeds && filteredDogBreeds.find(breed =>
              breed.name.trim().toLowerCase().includes(pet.breed.trim().toLowerCase()) ||
              pet.breed.trim().toLowerCase().includes(breed.name.trim().toLowerCase())
            ));

          // If not found in API, try local JSON (flexible matching)
          const breedInfoLocal =
            (catBreedData.cat_breeds && catBreedData.cat_breeds.find(breed =>
              breed.name.trim().toLowerCase().includes(pet.breed.trim().toLowerCase()) ||
              pet.breed.trim().toLowerCase().includes(breed.name.trim().toLowerCase())
            )) ||
            (dogBreedData.dog_breeds && dogBreedData.dog_breeds.find(breed =>
              breed.name.trim().toLowerCase().includes(pet.breed.trim().toLowerCase()) ||
              pet.breed.trim().toLowerCase().includes(breed.name.trim().toLowerCase())
            ));

          // Use API info if available, else local JSON
          const breedInfo = breedInfoApi || breedInfoLocal;

          // Map API or local breed info to expected structure for modal buttons
          let mappedBreedInfo = null;
          if (breedInfo) {
            if (breedInfo.temperament || breedInfo.description || breedInfo.origin || breedInfo.basic_information) {
              mappedBreedInfo = {
                basic_information: breedInfo.description || breedInfo.basic_information || breedInfo.bred_for || breedInfo.alt_names || "No information available.",
                physical_characteristics: breedInfo.weight ? (breedInfo.weight.metric ? `Weight: ${breedInfo.weight.metric}` : (breedInfo.weight.imperial ? `Weight: ${breedInfo.weight.imperial}` : undefined)) : breedInfo.physical_characteristics,
                personality_and_behavior: breedInfo.temperament || breedInfo.personality_and_behavior,
                social_compatibility: breedInfo.origin ? `Origin: ${breedInfo.origin}` : breedInfo.social_compatibility,
                health_profile: breedInfo.life_span ? `Life Span: ${breedInfo.life_span}` : breedInfo.health_profile,
                grooming_and_maintenance: breedInfo.grooming || breedInfo.grooming_and_maintenance,
                environmental_needs: breedInfo.country_code ? `Country Code: ${breedInfo.country_code}` : breedInfo.environmental_needs,
                training_and_mental_stimulation: breedInfo.training || breedInfo.training_and_mental_stimulation,
                potential_challenges: breedInfo.challenges || breedInfo.potential_challenges,
                sleep_patterns_and_habits: breedInfo.sleep || breedInfo.sleep_patterns_and_habits,
              };
            }
          }

          // Helper to format attribute value
          const formatApiValue = (key, value) => {
            if (!value) return "No information available.";
            if (typeof value === "object") {
              if (value.metric && value.imperial) {
                return `Metric: ${value.metric}\nImperial: ${value.imperial}`;
              }
              return JSON.stringify(value, null, 2);
            }
            return value;
          };

          // If breedInfo is from API, show dynamic buttons
          const isApiBreed = !!breedInfoApi && breedInfo === breedInfoApi;

          // List of API attributes to show as buttons
          const apiAttributes = [
            { key: "weight", label: "Weight" },
            { key: "height", label: "Height" },
            { key: "bred_for", label: "Bred For" },
            { key: "breed_group", label: "Breed Group" },
            { key: "life_span", label: "Life Span" },
            { key: "temperament", label: "Temperament" },
            { key: "origin", label: "Origin" },
            { key: "description", label: "Description" },
            { key: "history", label: "History" },
          ];

          return (
            <View
              key={index}
              style={styles.petCard}
            >
              <Text style={styles.petName}>
                {pet.petName} ({pet.gender})
              </Text>
              <Image source={{ uri: pet.image }} style={styles.petImage} />
              <Text>Age: {pet.age}</Text>
              <Text>Breed: {pet.breed}</Text>
              <Text>
                Weight: {pet.weight} {pet.unit}
              </Text>
              <Text>Description: {pet.petDescription}</Text>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: expandedIndex === index ? '#B8860B' : '#007AFF', marginTop: 10 }]}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{expandedIndex === index ? 'Hide Breed Details' : 'Show Breed Details'}</Text>
              </TouchableOpacity>

              {/* Show breed attribute buttons only if expanded and breedInfo exists */}
              {expandedIndex === index && breedInfo && (
                <View style={styles.buttonContainer}>
                  {isApiBreed
                    ? apiAttributes.map(attr =>
                        breedInfo[attr.key] ? (
                          <TouchableOpacity
                            key={attr.key}
                            style={styles.button}
                            onPress={() => openModal(attr.label, formatApiValue(attr.key, breedInfo[attr.key]))}
                          >
                            <Text style={{ color: '#fff' }}>{attr.label}</Text>
                          </TouchableOpacity>
                        ) : null
                      )
                    : mappedBreedInfo && (
                        <>
                          {mappedBreedInfo.basic_information && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Basic Information", mappedBreedInfo.basic_information)}
                            >
                              <Text style={{ color: '#fff' }}>Basic Info</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.physical_characteristics && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Physical Characteristics", mappedBreedInfo.physical_characteristics)}
                            >
                              <Text style={{ color: '#fff' }}>Physical</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.personality_and_behavior && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Personality and Behavior", mappedBreedInfo.personality_and_behavior)}
                            >
                              <Text style={{ color: '#fff' }}>Personality</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.social_compatibility && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Social Compatibility", mappedBreedInfo.social_compatibility)}
                            >
                              <Text style={{ color: '#fff' }}>Social</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.health_profile && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Health Profile", mappedBreedInfo.health_profile)}
                            >
                              <Text style={{ color: '#fff' }}>Health</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.grooming_and_maintenance && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Grooming and Maintenance", mappedBreedInfo.grooming_and_maintenance)}
                            >
                              <Text style={{ color: '#fff' }}>Grooming</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.environmental_needs && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Environmental Needs", mappedBreedInfo.environmental_needs)}
                            >
                              <Text style={{ color: '#fff' }}>Environment</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.training_and_mental_stimulation && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Training and Mental Stimulation", mappedBreedInfo.training_and_mental_stimulation)}
                            >
                              <Text style={{ color: '#fff' }}>Training</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.potential_challenges && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Potential Challenges", mappedBreedInfo.potential_challenges)}
                            >
                              <Text style={{ color: '#fff' }}>Challenges</Text>
                            </TouchableOpacity>
                          )}
                          {mappedBreedInfo.sleep_patterns_and_habits && (
                            <TouchableOpacity
                              style={styles.button}
                              onPress={() => openModal("Sleep Patterns and Habits", mappedBreedInfo.sleep_patterns_and_habits)}
                            >
                              <Text style={{ color: '#fff' }}>Sleep</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal for Breed Info */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text>{modalContent}</Text>
              <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={closeModal}>
                <Text>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Ask AI Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Chatbot", { userId })}
      >
        <Text style={styles.fabText}>Ask AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  petCard: {
    marginBottom: 25,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  petImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 10,
    backgroundColor: "#8B4513",
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    maxHeight: "80%",
    width: "85%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default BreedDetails;
