import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WORD_LIMIT = 50; // Set the word limit

const PetProfile = ({ route, navigation }) => {
  const { breed, image, userId } = route.params;
  const [petName, setPetName] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [gender, setGender] = useState(null);
  const [descriptionError, setDescriptionError] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleDescriptionChange = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const currentWordCount = words.length;

    setPetDescription(text);
    setWordCount(currentWordCount);

    if (currentWordCount > WORD_LIMIT) {
      setDescriptionError(`Word limit of ${WORD_LIMIT} exceeded.`);
    } else {
      setDescriptionError('');
    }
  };

  const handleContinue = () => {
    if (descriptionError) return;
    navigation.navigate('PetSize', {
      breed,
      image,
      petName,
      petDescription,
      gender,
      userId,
    });
  };

  const isButtonDisabled = !petName.trim() || !petDescription.trim() || !gender || !!descriptionError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Add Pet Profile</Text>

        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.petImage} />
        </View>

        <Text style={styles.label}>What’s your pet’s name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Your pet’s name"
          value={petName}
          onChangeText={setPetName}
        />

        <Text style={styles.label}>Describe your pet:</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Enter a short description about your pet"
          value={petDescription}
          onChangeText={handleDescriptionChange}
        />
        <View style={styles.descriptionMeta}>
          <Text style={styles.errorText}>{descriptionError}</Text>
          <Text style={[styles.wordCount, wordCount > WORD_LIMIT && styles.errorText]}>
            {wordCount}/{WORD_LIMIT}
          </Text>
        </View>

        <Text style={styles.label}>Select your pet’s gender:</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'Male' && styles.selectedGender]}
            onPress={() => setGender('Male')}
          >
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'Female' && styles.selectedGender]}
            onPress={() => setGender('Female')}
          >
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, isButtonDisabled && styles.disabledButton]}
          onPress={handleContinue}
          disabled={isButtonDisabled}
        >
          <LinearGradient
            colors={!isButtonDisabled ? ["#D3C0A8", "#E7D5BB"] : ['#E0E0E0', '#E0E0E0']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 5,
  },
  descriptionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  wordCount: {
    color: '#666',
  },
  errorText: {
    color: 'red',
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  selectedGender: {
    borderColor: '#737A5D',
    backgroundColor: '#E8F0FE',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
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
});

export default PetProfile;