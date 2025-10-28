import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import icons from Expo

const VetProfileUpload = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { vetId } = route.params;
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            await uploadImageToCloudinary(result.assets[0].uri);
        }
    };

    const uploadImageToCloudinary = async (uri) => {
        try {
            setUploading(true);
            const response = await fetch(uri);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('file', blob);
            formData.append('upload_preset', 'Pet World App'); // Replace with your Cloudinary preset

            const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dag88975y/image/upload';
            const uploadResponse = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await uploadResponse.json();
            setImage(data.secure_url);
            await saveImageToFirebase(data.secure_url);
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Error', 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const saveImageToFirebase = async (imageUrl) => {
        try {
            await fetch(
                `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`, 
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imageUrl }),
                }
            );
            Alert.alert('Success', 'Profile updated successfully.');
        } catch (error) {
            console.error('Error updating Firebase:', error);
            Alert.alert('Error', 'Failed to update profile.');
        }
    };

    const handleDone = () => {
        navigation.navigate('VetDashboard', { vetId });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload Profile Picture</Text>
            {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons name="person-circle-outline" size={100} color="#ccc" />
                </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Upload Picture'}</Text>
            </TouchableOpacity>
            {uploading && <ActivityIndicator size="large" color="#0000ff" />}
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#3498db',
    },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderWidth: 2,
        borderColor: '#ccc',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '80%',
        justifyContent: 'center',
    },
    uploadText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    doneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        width: '80%',
        justifyContent: 'center',
    },
    doneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default VetProfileUpload;