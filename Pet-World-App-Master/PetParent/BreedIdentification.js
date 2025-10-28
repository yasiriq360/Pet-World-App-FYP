import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {colors} from '../theme/colors'
import { MotiView } from 'moti'; // Import MotiView

const BreedIdentification = ({navigation, route}) => {
  const { userId } = route.params; // Get userId from route parameters
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null); // For Cat/Dog
  const [predictedBreed, setPredictedBreed] = useState(null); // For Breed
  const [predictionConfidence, setPredictionConfidence] = useState(null); // For Confidence

  const FLASK_API_BASE_URL = 'http://10.211.0.23:5000'; // Your Flask API base URL

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        // Clear previous results
        setClassificationResult(null);
        setPredictedBreed(null);
        setPredictionConfidence(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permission to use this feature');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        // Clear previous results
        setClassificationResult(null);
        setPredictedBreed(null);
        setPredictionConfidence(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const classifyImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    setLoading(true);
    setClassificationResult(null);
    setPredictedBreed(null);
    setPredictionConfidence(null);

    const uri = selectedImage;
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // Helper to create a new FormData for each request
    const createFormData = () => {
      const fd = new FormData();
      fd.append('image', {
        uri,
        name: filename,
        type,
      });
      return fd;
    };

    try {
      // Step 1: Classify Cat vs Dog
      console.log('Sending request to classify-cat-dog endpoint...');
      const catDogResponse = await fetch(`${FLASK_API_BASE_URL}/classify-cat-dog`, {
        method: 'POST',
        body: createFormData(),
      });

      // Log the raw response for debugging
      const responseText = await catDogResponse.text();
      console.log('Raw response:', responseText);
      
      // Parse the response as JSON
      let catDogData;
      try {
        catDogData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        Alert.alert('Error', 'Invalid response from server. Check console for details.');
        setLoading(false);
        return;
      }

      // Debug logs to see what the backend returns
      console.log('catDogData:', catDogData);
      
      if (!catDogData.predicted_label) {
        console.error('No predicted_label in response:', catDogData);
        Alert.alert('Error', 'The server response did not contain a prediction label.');
        setLoading(false);
        return;
      }
      
      console.log('catDogData.predicted_label:', catDogData.predicted_label);

      // In the classifyImage function, around line 130-140
      if (catDogResponse.ok) {
        const predictedAnimal = catDogData.predicted_label.toLowerCase(); // Normalize to lowercase
        console.log('predictedAnimal:', predictedAnimal);
        // Remove confidence from display
        setClassificationResult(`${catDogData.predicted_label}`);
      
        if (predictedAnimal === 'dog') {
          console.log('Calling /predict-breed for dog');
          // Step 2: If it's a Dog, predict breed
          const breedResponse = await fetch(`${FLASK_API_BASE_URL}/predict-breed`, {
            method: 'POST',
            body: createFormData(),
          });

          const breedData = await breedResponse.json();

          if (breedResponse.ok) {
            setPredictedBreed(breedData.predicted_breed_label);
            setPredictionConfidence(
              typeof breedData.confidence !== 'undefined' && breedData.confidence !== null
                ? `${(breedData.confidence * 100).toFixed(2)}%`
                : ''
            );
          } else {
            Alert.alert('Breed Prediction Failed', breedData.error || 'An error occurred during breed prediction.');
          }
        } else if (predictedAnimal === 'cat') {
          console.log('Calling /predict-cat-breed for cat');
          // Step 2: If it's a Cat, predict cat breed
          const catBreedResponse = await fetch(`${FLASK_API_BASE_URL}/predict-cat-breed`, {
            method: 'POST',
            body: createFormData(),
          });

          const catBreedData = await catBreedResponse.json();

          if (catBreedResponse.ok) {
            setPredictedBreed(catBreedData.predicted_breed_label);
            setPredictionConfidence(
              typeof catBreedData.confidence !== 'undefined' && catBreedData.confidence !== null
                ? `${(catBreedData.confidence * 100).toFixed(2)}%`
                : ''
            );
          } else {
            Alert.alert('Cat Breed Prediction Failed', catBreedData.error || 'An error occurred during cat breed prediction.');
          }
        } else {
          // If it's neither Dog nor Cat, no breed prediction
          console.error('Unrecognized animal type:', predictedAnimal);
          setPredictedBreed('N/A (Not a Dog or Cat)');
          setPredictionConfidence('N/A');
        }
      } else {
        Alert.alert('Classification Failed', catDogData.error || 'An error occurred during cat/dog classification.');
      }
    } catch (error) {
      console.error('Network error or API not reachable:', error);
      Alert.alert('Error', 'Could not connect to the pet classification API. Please ensure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pet Breed Identification</Text>
        
        <View style={styles.imageSection}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, {backgroundColor: colors.primary}]} onPress={pickImage}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, {backgroundColor: 'white', borderWidth: 1, borderColor: colors.primary}]} onPress={takePhoto}>
            <Text style={[styles.buttonText, {color: colors.primary}]}>Take Photo</Text>
          </TouchableOpacity> 
        </View>

        {selectedImage && (
          <TouchableOpacity 
            style={[styles.classifyButton, loading && styles.disabledButton]}
            onPress={classifyImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Identify Pet and Breed</Text>
            )}
          </TouchableOpacity>
        )}

        {(classificationResult || predictedBreed) && (
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.resultContainer}
          >
            <Text style={styles.resultTitle}>Prediction Results:</Text>
            {classificationResult && (
              <Text style={styles.resultText}>Classification: {classificationResult}</Text>
            )}
            {predictedBreed && (
              <Text style={styles.resultText}>Predicted Breed: {predictedBreed}</Text>
            )}
            {predictionConfidence !== null && predictionConfidence !== '' && (
              <Text style={styles.resultText}>Confidence: {predictionConfidence}</Text>
            )}
          </MotiView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 300,
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#D3C0A8',
    padding: 15,
    borderRadius: 8,
    width: '45%',
  },
  classifyButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
});

export default BreedIdentification;