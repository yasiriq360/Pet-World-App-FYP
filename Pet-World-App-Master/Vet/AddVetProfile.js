import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator, ScrollView, Modal, FlatList, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { colors } from '../theme/colors';

const CLARIFAI_PAT = '184aa3946ac14be7a403b255c21ef328';
const CLARIFAI_API_URL = "https://api.clarifai.com/v2/models/face-detection/outputs";

// List of common veterinary services
const VET_SERVICES = [
  'General Checkup & Consultation',
  'Vaccinations', 
  'Surgery',
  'Dental Care',
  'Emergency Care',
  'Laboratory Services',
  'X-ray & Imaging',
  'Microchipping',
  'Grooming',
  'Nutrition Counseling',
  'Behavioral Counseling',
  'Parasite Prevention & Control',
  'Boarding'
];

const AddVetProfile = ({ route, navigation }) => {
  const { vetId } = route.params;
  const [bio, setBio] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [image, setImage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const toggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const validateFace = async (imageUri) => {
    try {
      setIsValidating(true);

      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Call Clarifai API directly
      const raw = JSON.stringify({
        "user_app_id": {
          "user_id": "clarifai",
          "app_id": "main"
        },
        "inputs": [
          {
            "data": {
              "image": {
                "base64": base64
              }
            }
          }
        ]
      });

      const requestOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + CLARIFAI_PAT
        },
        body: raw
      };

      const result = await fetch(CLARIFAI_API_URL, requestOptions);
      const data = await result.json();

      if (!result.ok) {
        console.error('Clarifai API error:', data);
        throw new Error('Failed to analyze image');
      }

      const regions = data.outputs?.[0]?.data?.regions || [];

      // No faces detected
      if (regions.length === 0) {
        Alert.alert(
          'No Face Detected',
          'Please upload a clear photo showing your face.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Multiple faces detected
      if (regions.length > 1) {
        Alert.alert(
          'Multiple Faces Detected',
          'Please upload a photo with only your face.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Check confidence score
      const confidence = regions[0].value;
      if (confidence < 0.95) {
        Alert.alert(
          'Low Quality Image',
          'Please upload a clearer photo of your face.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Face validation error:', error);
      Alert.alert(
        'Validation Error',
        'Unable to validate the image. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permissions are required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const isValid = await validateFace(result.assets[0].uri);
        if (isValid) {
          setImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImageToCloudinary = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dag88975y/upload`;
      const formData = new FormData();
      formData.append('file', base64);
      formData.append('upload_preset', 'Pet World App');

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await uploadResponse.json();
      return data.secure_url;
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    if (!vetId) {
      Alert.alert('Error', 'Vet ID not found.');
      return;
    }

    if (!image) {
      Alert.alert('Error', 'Please upload a profile photo.');
      return;
    }

    if (!bio.trim()) {
      Alert.alert('Error', 'Please enter your bio.');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service.');
      return;
    }

    try {
      let imageUrl = image;
      if (image && image.startsWith('file://')) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const profileData = {
        bio,
        services: selectedServices,
        profileImage: imageUrl,
      };

      const response = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      navigation.navigate('Mdocuments', { vetId });
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.serviceItem,
        selectedServices.includes(item) && styles.serviceItemSelected
      ]}
      onPress={() => toggleService(item)}
    >
      <Text style={[
        styles.serviceItemText,
        selectedServices.includes(item) && styles.serviceItemTextSelected
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
       
        {!image && !isValidating && (
          <TouchableOpacity 
            style={styles.cameraIcon} 
            onPress={handleImagePicker}
            disabled={isValidating}
          >
            <Camera size={40} color={colors.primary} />
          </TouchableOpacity>
        )}

        {isValidating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Validating image...</Text>
          </View>
        ) : image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imagePlaceholder}>Tap the camera icon to upload a photo of yourself</Text>
        )}

        <TextInput
          placeholder="Your Bio"
          value={bio}
          onChangeText={setBio}
          style={styles.input}
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />

        <View style={styles.servicesContainer}>
          <Text style={styles.servicesLabel}>Your Services:</Text>
          <TouchableOpacity 
            style={styles.servicePickerButton}
            onPress={() => setShowServiceModal(true)}
          >
            <Text style={styles.servicePickerButtonText}>
              {selectedServices.length > 0 ? 'Edit Services' : 'Select Services'}
            </Text>
          </TouchableOpacity>

          <View style={styles.selectedServicesContainer}>
            {selectedServices.map((service) => (
              <View key={service} style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>{service}</Text>
                <TouchableOpacity onPress={() => toggleService(service)}>
                  <Text style={styles.removeService}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <Modal
          visible={showServiceModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Services</Text>
              <FlatList
                data={VET_SERVICES}
                renderItem={renderServiceItem}
                keyExtractor={item => item}
                style={styles.servicesList}
              />
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowServiceModal(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity 
          style={[
            styles.button, 
            (!bio.trim() || selectedServices.length === 0 || !image || isValidating) && styles.disabledButton
          ]} 
          onPress={handleSaveProfile}
          disabled={!bio.trim() || selectedServices.length === 0 || !image || isValidating}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff', 
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  cameraIcon: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
    textAlignVertical: 'top',
    color: '#000',
  },
  servicesContainer: {
    marginBottom: 20,
  },
  servicesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  servicePickerButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },
  servicePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceTagText: {
    color: '#000',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  removeService: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginTop: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  servicesList: {
    marginBottom: 15,
  },
  serviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceItemSelected: {
    backgroundColor: '#f0f0f0',
  },
  serviceItemText: {
    fontSize: 16,
    color: '#000',
  },
  serviceItemTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
    elevation: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  bottomPadding: {
    height: 45,
  }
});

export default AddVetProfile;