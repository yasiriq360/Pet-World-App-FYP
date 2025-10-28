import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import PetButton from '../components/PetButton';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';

const EditPetProfile = ({ route, navigation }) => {
  const { userId, petId } = route.params;

  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState(route.params?.weight ? String(route.params.weight) : '');
  const [petDescription, setPetDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets/${petId}.json`
        );
        const petData = await response.json();

        if (petData) {
          setPetName(petData.petName || '');
          setBreed(petData.breed || '');
          setWeight(petData.weight !== undefined && petData.weight !== null ? String(petData.weight) : '');
          setPetDescription(petData.petDescription || '');
          setImage(petData.image || '');
        } else {
          Alert.alert('Error', 'Pet data not found.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch pet data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [userId, petId]);

  const validateImage = async (imageUri) => {
    try {
      setValidating(true);
      
      // Create form data for the API requests
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'pet_image.jpg'
      });

      // First try Dog API
      try {
        const dogApiResponse = await fetch('https://api.thedogapi.com/v1/images/upload', {
          method: 'POST',
          headers: {
            'x-api-key': 'live_TZ9NfkvzCOvjCO9IaENHry2ueXhaxi4xcoTThAojdTlgLca6wV33U4Rbo0gEA3VP'
          },
          body: formData
        });

        const dogData = await dogApiResponse.json();
        
        // Log the response for debugging
        
        if (dogApiResponse.ok && dogData.id) {
          return true;
        }
      } catch (dogError) {
        // If dog API fails, continue to cat API
      }

      // Try Cat API if dog API didn't succeed
      try {
        const catApiResponse = await fetch('https://api.thecatapi.com/v1/images/upload', {
          method: 'POST',
          headers: {
            'x-api-key': 'live_YOdZiNGRUmTpgfshWc4lB5KviAoqR47uV5H4RJOY75dO6VDluRqR4s5aer5BC28l'
          },
          body: formData
        });

        const catData = await catApiResponse.json();
        
        // Log the response for debugging
        
        if (catApiResponse.ok && catData.id) {
          return true;
        }
      } catch (catError) {
        // If both APIs fail
      }

      // If neither API successfully validated the image
      Alert.alert(
        'Image Validation',
        'The image could not be validated as a cat or dog photo. Please try another image.',
        [{ text: 'OK' }]
      );
      return false;

    } catch (error) {
      Alert.alert(
        'Error',
        'There was a problem validating the image: ' + error.message,
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setValidating(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const isValid = await validateImage(result.assets[0].uri);
        if (isValid) {
          setImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
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
      Alert.alert(
        'Upload Error',
        'Failed to upload image. Please try again.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  };

  const handleSave = async () => {
    if (!petName.trim()) {
      Alert.alert('Error', 'Please enter a pet name');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = image;
      if (image && image.startsWith('file://')) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets/${petId}.json`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            petName,
            weight,
            petDescription,
            image: imageUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update pet profile');
      }

      Alert.alert(
        'Success',
        'Pet profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update pet profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView backgroundColor="transparent">
        <LinearGradient colors={colors.gradientPrimary} style={styles.gradientContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.surface} />
            <Text style={styles.loadingText}>Loading pet profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
   <SafeAreaView style={{flex: 1, backgroundColor: colors.background, paddingBottom: 45}}>
     
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1000 }}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={{ position: 'relative', width: '100%' }}>
           
            <Text style={styles.header}>Edit Pet Profile</Text>
          </View>

          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            style={styles.imageContainer}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={image ? { uri: image } : require('../assets/snack-icon.png')}
                style={styles.petImage}
              />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={24} color={colors.surface} />
              </View>
            </View>
            <PetButton
              title="Change Photo"
              variant="accent"
              size="medium"
              onPress={pickImage}
              style={styles.changeImageButton}
            />
          </MotiView>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pet Name</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="Enter pet name"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="Enter breed"
              placeholderTextColor="#666"
              editable={false} // Breed is not editable
            />

            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={text => {
                // Only allow up to 3 digits, and only numbers
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 3);
                setWeight(filtered);
              }}
              placeholder="Enter weight"
              placeholderTextColor="#666"
              keyboardType="numeric"
              maxLength={3}
            />

            <Text style={styles.label}>Pet Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={petDescription}
              onChangeText={setPetDescription}
              placeholder="Enter pet description"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>

          <PetButton
            title={loading || validating ? "Saving..." : "Save Changes"}
            variant="primary"
            size="large"
            onPress={handleSave}
            disabled={loading || validating}
            style={styles.saveButton}
          />
        </ScrollView>
      </MotiView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.surface,
    marginTop: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,

    paddingBottom: spacing.xl,
  },
  header: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.round,
    padding: spacing.sm,
  },
  imageContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  petImage: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.round,
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadows.lg,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    padding: spacing.sm,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  changeImageButton: {
    marginTop: spacing.sm,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    width: '100%',
    ...shadows.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
  
    minWidth: 200,
  },
});

export default EditPetProfile;