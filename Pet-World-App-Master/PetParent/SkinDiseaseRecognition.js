import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { colors } from "../theme/colors";

const diseaseInfo = {
  "scabies": { Severity: "Critical", icon: "🔴", notes: "Zoonotic, contagious" },
  "demodicosis": { Severity: "Critical", icon: "🔴", notes: "Severe if generalized" },
  "Ringworm": { Severity: "Critical", icon: "🔴", notes: "Zoonotic, fungal" },
  "flea_allergy": { Severity: "Moderate", icon: "🟠", notes: "Allergic, needs flea control" },
  "Jamur": { Severity: "Moderate", icon: "🟠", notes: "Variable Severity" },
  "dermatitis": { Severity: "Mild", icon: "🟡", notes: "Very broad category" },
};

const SkinDiseaseRecognition = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your photo library to upload images.");
      }
    })();
  }, []);

  const pickImage = async () => {
    setLoading(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
    setLoading(false);
  };

  const analyzeImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      const response = await axios({
        method: "POST",
        url: "http://10.211.0.23:5000/detect-skin-disease",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update the processed image URL to include the full server path
      const imageUrl = `http://10.211.0.23:5000/static/last_output.jpg`;
      setProcessedImage(imageUrl);
      setDetections(response.data.detections);
      
      // Add this console log to debug
      console.log('Processed image URL:', imageUrl);
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Error", "Failed to analyze image. Please ensure your Flask server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {processedImage ? (
        <View style={styles.resultContainer}>
          <Image
            source={{ uri: processedImage }}
            style={styles.previewImage}
            resizeMode="contain"
            onError={(error) => {
              console.error('Image loading error:', error.nativeEvent.error);
            }}
          />
          {detections.map((detection, index) => {
            // Clean up the label by removing dashes and trimming whitespace
            const cleanLabel = detection.label.replace(/-/g, '').trim();
            const disease = diseaseInfo[cleanLabel] || { 
              Severity: "Unknown", 
              icon: "❓", 
              notes: "Invalid or unknown class" 
            };
            return (
              <View key={index} style={styles.diseaseContainer}>
                <Text style={styles.diseaseText}>
                  {disease.icon} {detection.label}
                </Text>
                <Text style={styles.severityText}>
                  Severity: {disease.Severity}
                </Text>
                <Text style={styles.notesText}>
                  {disease.notes}
                </Text>
              </View>
            );
          })}
          <TouchableOpacity style={styles.button} onPress={() => {
            setProcessedImage(null);
            setDetections([]);
          }}>
            <Text style={styles.buttonText}>Analyze Another Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>Upload a clear photo of the affected area</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  uploadButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionText: {
    color: "#333",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0', // Add this to make it visible while loading
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#A4AC86",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  diseaseContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diseaseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  severityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default SkinDiseaseRecognition;