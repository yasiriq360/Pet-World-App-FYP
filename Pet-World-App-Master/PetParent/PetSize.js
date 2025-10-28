import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const PetSize = ({ navigation, route }) => {
  const [selectedSize, setSelectedSize] = useState(null); // No default size
  const { breed, image, petName, userId, petDescription, gender } = route.params; // Receive data from the previous screen

  const handleContinue = () => {
    console.log('Pet Name:', petName);
    console.log('Breed:', breed);
    console.log('Image URL:', image);
    console.log('Selected Size:', selectedSize);

    // Navigate to the next screen (PetWeight) with all data
    navigation.navigate('PetWeight', {
      petName,
      breed,
      image,
      userId,
      size: selectedSize,
      petDescription,
      gender,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Pet Profile</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressFill}></View>
      </View>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.petImage} />
      </View>
      <Text style={styles.label}>What’s your pet’s size?</Text>
      <View style={styles.sizeOptions}>
        <TouchableOpacity
          style={[
            styles.sizeOption,
            selectedSize === 'Small' && styles.selectedOption,
          ]}
          onPress={() => setSelectedSize('Small')}
        >
          <Text style={styles.sizeText}>Small</Text>
          <Text style={styles.sizeRange}>under 14kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sizeOption,
            selectedSize === 'Medium' && styles.selectedOption,
          ]}
          onPress={() => setSelectedSize('Medium')}
        >
          <Text style={styles.sizeText}>Medium</Text>
          <Text style={styles.sizeRange}>14-25kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sizeOption,
            selectedSize === 'Large' && styles.selectedOption,
          ]}
          onPress={() => setSelectedSize('Large')}
        >
          <Text style={styles.sizeText}>Large</Text>
          <Text style={styles.sizeRange}>over 25kg</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.continueButton, !selectedSize && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!selectedSize}
      >
        <LinearGradient
          colors={selectedSize ? ["#D3C0A8","#E7D5BB"] : ["#E0E0E0", "#E0E0E0"]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5', // Match the background color
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333', // Match the text color
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginVertical: 10,
  },
  progressFill: {
    width: '50%', // Adjust for progress
    height: '100%',
    backgroundColor: '#737A5D', // Match the progress bar color
    borderRadius: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#666', // Match the text color
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  sizeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#FFF', // Match the background color
  },
  selectedOption: {
    borderColor: '#737A5D', // Match the selected border color
    backgroundColor: '#E8F0FE', // Match the selected background color
  },
  sizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', // Match the text color
  },
  sizeRange: {
    fontSize: 12,
    color: '#666', // Match the text color
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5, // Disabled button opacity
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
});

export default PetSize;