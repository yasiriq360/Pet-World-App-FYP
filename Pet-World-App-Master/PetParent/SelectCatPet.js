import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const petBreeds = require('./CatBreeds.json'); // Ensure the correct path to your JSON file

const SelectPet = ({ navigation }) => {
  const route = useRoute();
  const { userId } = route.params || {}; // Fetch userId from previous screen
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredBreeds, setFilteredBreeds] = useState(petBreeds);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = petBreeds.filter(breed => breed.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredBreeds(filtered);
  };

  const renderBreedItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.breedItem,
        selectedBreed?.name === item.name && styles.selectedBreed,
      ]}
      onPress={() => setSelectedBreed(item)}
    >
      <Image source={{ uri: item.image }} style={styles.breedImage} />
      <Text style={styles.breedText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pet Profile</Text>
      <Text style={styles.subtitle}>Breed</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search breed..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredBreeds}
        renderItem={renderBreedItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, !selectedBreed && styles.disabledButton]}
        onPress={() => {
          if (selectedBreed) {
            navigation.navigate('PetProfile', {
              breed: selectedBreed.name,
              image: selectedBreed.image,
              userId: userId,
            });
          }
        }}
        disabled={!selectedBreed}
      >
        <LinearGradient
          colors={selectedBreed ? ["#D3C0A8","#E7D5BB"] : ["#E0E0E0", "#E0E0E0"]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ImageUpload', { userId })}>
        <Text style={styles.unknownText}>I don't know</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  listContainer: {
    justifyContent: 'center',
  },
  breedItem: {
    flex: 1,
    margin: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  selectedBreed: {
    borderColor: '#007BFF',
    backgroundColor: '#E8F0FE',
  },
  breedImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  breedText: {
    fontSize: 16,
    color: '#333',
  },
  continueButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unknownText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
});

export default SelectPet;