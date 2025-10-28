import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { colors } from '../theme/colors';
const uploadToGoFile = async (fileUri) => {
  try {
    // Create form data for the file
    const formData = new FormData();
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    
    formData.append('file', {
      uri: fileUri,
      type: 'application/pdf',
      name: fileUri.split('/').pop()
    });

    // Upload to GoFile
    const response = await fetch('https://upload.gofile.io/uploadFile', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    
    if (result.status !== 'ok') {
      throw new Error('Upload to GoFile failed');
    }

    return result.data.downloadPage; // Return the download URL
  } catch (error) {
    console.error('Error uploading to GoFile:', error);
    throw error;
  }
};

const Cdocuments = ({ route }) => {
  const { vetId } = route.params;
  const navigation = useNavigation();
  const [document, setDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.assets && result.assets.length > 0) {
        const selectedDoc = result.assets[0];
        
        // Check file size (5MB limit)
        if (selectedDoc.size > 5 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select a PDF file smaller than 5MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Verify file type
        if (!selectedDoc.mimeType || !selectedDoc.mimeType.toLowerCase().includes('pdf')) {
          Alert.alert(
            'Invalid File Type',
            'Please select a valid PDF file.',
            [{ text: 'OK' }]
          );
          return;
        }

        setDocument(selectedDoc);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const handleContinue = async () => {
    if (!vetId) {
      Alert.alert('Error', 'Vet ID not found.');
      return;
    }

    if (!document) {
      Alert.alert('Error', 'Please upload your clinic documents.');
      return;
    }

    try {
      setIsUploading(true);

      // Upload to GoFile
      const downloadUrl = await uploadToGoFile(document.uri);

      // Update Firebase with metadata and download URL
      const response = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Clinic documents": {
            name: document.name,
            type: document.mimeType,
            size: document.size,
            uploadDate: new Date().toISOString(),
            downloadUrl: downloadUrl,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update Firebase');
      }

      navigation.navigate('VetProfileVerification', { vetId });
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Vet Profile</Text>
      <Text style={styles.subHeader}>Profile Verification</Text>

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <TouchableOpacity 
        style={styles.documentContainer} 
        onPress={handleDocumentPicker}
        disabled={isUploading}
      >
        <FileText size={30} color={colors.primary} />
        {document ? (
          <Text style={styles.documentName} numberOfLines={1}>
            {document.name}
          </Text>
        ) : (
          <Text style={styles.uploadText}>Tap to upload clinic PDF</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.instruction}>
        Upload your clinic registration or ownership documents (PDF format, max 5MB)
      </Text>

      {isUploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.uploadingText}>Uploading document...</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.button, !document && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!document || isUploading}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  subHeader: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 30,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  documentContainer: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: 10,
  },
  documentName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    maxWidth: 130,
    textAlign: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  uploadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  uploadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Cdocuments;