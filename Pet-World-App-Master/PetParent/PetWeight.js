import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import Slider from '@react-native-community/slider';

const PetWeight = ({ navigation, route }) => {
  const { breed, image, petName, size, userId, petDescription, gender } = route.params; // Receive data from previous screen
  const [weight, setWeight] = useState(22.2); // Default weight
  const [isKg, setIsKg] = useState(true); // Default to kg

  const handleContinue = () => {
    // Calculate the weight based on the selected unit
    const weightInSelectedUnit = isKg ? weight : weight * 2.20462;

    console.log('Pet Name:', petName);
    console.log('Breed:', breed);
    console.log('Image URL:', image);
    console.log('Size:', size);
    console.log('Weight:', isKg ? `${weight} kg` : `${(weight * 2.20462).toFixed(1)} lb`);

    // Navigate to the PetDateBirth screen with all data
    navigation.navigate('PetDateBirth', {
      petName,
      breed,
      image,
      size,
      userId,
      petDescription,
      weight: weightInSelectedUnit,
      unit: isKg ? 'kg' : 'lb',
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
      <Text style={styles.label}>What’s your pet’s weight?</Text>
      <Text style={styles.weightText}>
        {isKg ? `${weight.toFixed(1)} kg` : `${(weight * 2.20462).toFixed(1)} lb`}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={100}
        step={0.1}
        value={weight}
        minimumTrackTintColor="#737A5D"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#D3C0A8"
        onValueChange={setWeight}
      />
      <View style={styles.unitToggle}>
        <TouchableOpacity
          style={[styles.unitButton, isKg && styles.activeUnit]}
          onPress={() => setIsKg(true)}
        >
          <Text style={[styles.unitText, isKg && styles.activeUnitText]}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitButton, !isKg && styles.activeUnit]}
          onPress={() => setIsKg(false)}
        >
          <Text style={[styles.unitText, !isKg && styles.activeUnitText]}>lb</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.continueButton, !weight && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!weight}
      >
        <LinearGradient
          colors={weight ? ["#D3C0A8","#E7D5BB"] : ["#E0E0E0", "#E0E0E0"]}
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
    width: '75%', // Adjust for progress
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
  weightText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#737A5D', // Match the text color
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
    // Add shadow for thumb
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  unitToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: '#FFF', // Match the background color
  },
  activeUnit: {
    borderColor: '#737A5D', // Match the active border color
    backgroundColor: '#E8F0FE', // Match the active background color
  },
  unitText: {
    fontSize: 16,
    color: '#666', // Match the text color
  },
  activeUnitText: {
    color: '#737A5D', // Match the active text color
    fontWeight: 'bold',
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

export default PetWeight;