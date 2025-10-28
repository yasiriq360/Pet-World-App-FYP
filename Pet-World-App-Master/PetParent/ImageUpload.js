import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker"; // For gallery functionality
import { Camera } from "expo-camera"; // For camera functionality

const ImageUpload = ({ route, navigation }) => {
  const { userId } = route.params;
  const [photo, setPhoto] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null); // Camera permission state
  const [isCameraOpen, setIsCameraOpen] = useState(false); // To toggle camera view
  const cameraRef = useRef(null); // Ref for the camera component
  // New state for loading and results
  const [loading, setLoading] = useState(false);
  const [classifiedAnimal, setClassifiedAnimal] = useState(null);
  const [identifiedBreed, setIdentifiedBreed] = useState(null);
  const [catDogConfidence, setCatDogConfidence] = useState(null);
  const [breedConfidence, setBreedConfidence] = useState(null);

  const FLASK_API_BASE_URL = 'http://10.211.0.23:5000';

  // Request permissions for accessing the gallery and camera
  useEffect(() => {
    (async () => {
      // Request gallery permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== "granted") {
        Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
      }

      // Request camera permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === "granted");
    })();
  }, []);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri); // Set the selected image URI
      // Reset previous results
      setClassifiedAnimal(null);
      setIdentifiedBreed(null);
      setCatDogConfidence(null);
      setBreedConfidence(null);
      // Process image for identification
      processImageAndIdentify(result.assets[0].uri);
    }
  };

  // Function to take a picture using the camera
  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photoData = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
        setPhoto(photoData.uri);
        setIsCameraOpen(false);
        // Reset previous results
        setClassifiedAnimal(null);
        setIdentifiedBreed(null);
        setCatDogConfidence(null);
        setBreedConfidence(null);
        // Process image for identification
        processImageAndIdentify(photoData.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo');
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to process image and identify pet type and breed
  const processImageAndIdentify = async (imageUri) => {
    setLoading(true);
    setClassifiedAnimal(null);
    setIdentifiedBreed(null);
    setCatDogConfidence(null);
    setBreedConfidence(null);
    const uri = imageUri;
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
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
      // Step 1: Cat/Dog classification
      const catDogResponse = await fetch(`${FLASK_API_BASE_URL}/classify-cat-dog`, {
        method: 'POST',
        body: createFormData(),
      });
      const responseText = await catDogResponse.text();
      let catDogData;
      try {
        catDogData = JSON.parse(responseText);
      } catch (parseError) {
        Alert.alert('Error', 'Invalid response from server. Check console for details.');
        setLoading(false);
        return;
      }
      if (!catDogData.predicted_label) {
        Alert.alert('Error', 'The server response did not contain a prediction label.');
        setLoading(false);
        return;
      }
      const predictedAnimal = catDogData.predicted_label.toLowerCase();
      setClassifiedAnimal(catDogData.predicted_label);
      setCatDogConfidence(
        typeof catDogData.confidence !== 'undefined' && catDogData.confidence !== null
          ? `${(catDogData.confidence * 100).toFixed(2)}%`
          : ''
      );
      if (predictedAnimal === 'dog') {
        // Step 2: Dog breed identification
        const breedResponse = await fetch(`${FLASK_API_BASE_URL}/predict-breed`, {
          method: 'POST',
          body: createFormData(),
        });
        const breedData = await breedResponse.json();
        if (breedResponse.ok) {
          setIdentifiedBreed(breedData.predicted_breed_label);
          setBreedConfidence(
            typeof breedData.confidence !== 'undefined' && breedData.confidence !== null
              ? `${(breedData.confidence * 100).toFixed(2)}%`
              : ''
          );
        } else {
          setIdentifiedBreed('Breed prediction failed');
          setBreedConfidence('N/A');
        }
      } else if (predictedAnimal === 'cat') {
        // Step 2: Cat breed identification
        const catBreedResponse = await fetch(`${FLASK_API_BASE_URL}/predict-cat-breed`, {
          method: 'POST',
          body: createFormData(),
        });
        const catBreedData = await catBreedResponse.json();
        if (catBreedResponse.ok) {
          setIdentifiedBreed(catBreedData.predicted_breed_label);
          setBreedConfidence(
            typeof catBreedData.confidence_score !== 'undefined' && catBreedData.confidence_score !== null
              ? `${(catBreedData.confidence_score * 100).toFixed(2)}%`
              : ''
          );
        } else {
          setIdentifiedBreed('Cat breed prediction failed');
          setBreedConfidence('N/A');
        }
      } else {
        setIdentifiedBreed('N/A (Not a Dog or Cat)');
        setBreedConfidence('N/A');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to the pet classification API. Please ensure it is running.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the "Continue" button press
  const handleContinue = () => {
    if (!photo) {
      Alert.alert("Error", "Please select or capture an image before continuing.");
      return;
    }
    // Navigate to the next screen with userId, photo, classifiedAnimal, and identifiedBreed
    navigation.navigate("PetProfile", {
      userId,
      image: photo,
      breed: identifiedBreed,
      classifiedAnimal,
    });
  };

  // Render the camera view if the camera is open
  if (isCameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.captureButtonText}>Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCameraOpen(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pet Profile</Text>
      <Text style={styles.subtitle}>Pet Type</Text>
      <View style={styles.progressBar}>
        <View style={styles.progress}></View>
      </View>

      <View style={styles.imagePicker}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.cameraIcon}>📷</Text>
        )}
      </View>

      <Text style={styles.uploadText}>Upload or Capture Picture</Text>
      <Text style={styles.helperText}>
        Don’t know your pet? Upload or capture your pet's picture so that we can identify it.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={pickImage} disabled={loading}>
          <Text style={styles.buttonText}>Upload from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => setIsCameraOpen(true)} disabled={loading}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={loading || !photo || !classifiedAnimal}>
        <Text style={styles.continueText}>{loading ? 'Processing...' : 'Continue'}</Text>
      </TouchableOpacity>
      {classifiedAnimal && (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold' }}>Predicted Breed: {identifiedBreed}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  progress: {
    width: "25%",
    height: "100%",
    backgroundColor: "#FDC055",
    borderRadius: 2,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  cameraIcon: {
    fontSize: 30,
    color: "#999",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ImageUpload;