import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';  // Import the useRoute hook
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from 'moti'; // Import MotiView

const AddProfile = ({ navigation }) => {
  const [selectedPet, setSelectedPet] = useState(null);

  // Get the userId from route parameters
  const route = useRoute();
  const { userId } = route.params;

  const handlePetSelection = (pet) => {
    setSelectedPet(pet);
  };

  const handleContinue = () => {
    if (selectedPet === 'Dog') {
      navigation.navigate('SelectDogPet', { selectedPet, userId });  // Pass userId to the next screen
    } else if (selectedPet === 'Cat') {
      navigation.navigate('SelectCatPet', { selectedPet, userId });  // Pass userId to the next screen
    } else {
      alert('Please select a pet type before continuing!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Pet Profile</Text>
        <Text style={styles.headerSubtitle}>Pet Type</Text>
        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>
      </View>

      {/* Pet Selection */}
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1000 }}
        style={styles.selectionContainer}
      >
        <TouchableOpacity
          style={[
            styles.petOption,
            selectedPet === 'Dog' && styles.selectedOption,
          ]}
          onPress={() => handlePetSelection('Dog')}
        >
          <Image
            source={{
              uri: 'https://i.pinimg.com/236x/3e/ba/70/3eba70b7600c637b789ba2f4917de26c.jpg',
            }}
            style={styles.petImage}
          />
          <Text style={styles.petLabel}>DOG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.petOption,
            selectedPet === 'Cat' && styles.selectedOption,
          ]}
          onPress={() => handlePetSelection('Cat')}
        >
          <Image
            source={{
              uri: 'https://i.pinimg.com/236x/f5/88/ba/f588ba1a9c0b4a0c1bcf7c35e50e87d3.jpg',
            }}
            style={styles.petImage}
          />
          <Text style={styles.petLabel}>CAT</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Continue Button */}
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', delay: 200, duration: 1000 }}
        style={[
          styles.addPetButton,
          !selectedPet && styles.disabledButton
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.addPetButton, 
            !selectedPet && styles.disabledButton
          ]} 
          onPress={handleContinue}
          disabled={!selectedPet}
        >
          <LinearGradient 
            colors={selectedPet ? ["#D3C0A8","#E7D5BB"] : ["#E0E0E0", "#E0E0E0"]} 
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progress: {
    width: '30%',
    height: '100%',
    backgroundColor: '#007bff',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  petOption: {
    width: '45%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedOption: {
    borderColor: '#007bff',
  },
  petImage: {
    width: 90,
    height: 90,
    borderRadius: 60,
    marginBottom: 10,
    marginTop: 10,
  },
  petLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addPetButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProfile;