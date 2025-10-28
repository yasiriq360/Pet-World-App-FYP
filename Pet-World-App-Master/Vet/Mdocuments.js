import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const Mdocuments = ({ route }) => {
  const { vetId } = route.params;
  const navigation = useNavigation();
  const [isUploading, setIsUploading] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [fname, setFname] = useState('');

  const handleContinue = async () => {
    if (!vetId) {
      Alert.alert('Error', 'Vet ID not found.');
      return;
    }
    if (!regNo || !name || !fname) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }
    try {
      setIsUploading(true);
      // Call backend for PVMC verification
      const verifyResponse = await fetch('http://10.211.0.23:5000/verify-vet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_no: regNo, name, fname })
      });
      const verifyResult = await verifyResponse.json();
      const PVMC = verifyResult.PVMC === true;
      // Store PVMC in Firebase
      const vetUpdate = {
        PVMC: PVMC,
        block:false
      };
      const vetResponse = await fetch(`https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vetUpdate),
      });
      if (!vetResponse.ok) {
        throw new Error('Failed to update Firebase');
      }
      if (PVMC) {
        Alert.alert('Success', 'Vet is verified!', [
          { text: 'OK', onPress: () => navigation.navigate('Cdocuments', { vetId }) }
        ]);
      } else {
        Alert.alert('Not Verified', 'Vet is not verified.');
      }
    } catch (error) {
      console.error('Error verifying vet:', error);
      Alert.alert('Error', 'Failed to verify vet. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const canContinue = regNo && name && fname && !isUploading;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Add Vet Profile</Text>
        <Text style={styles.subHeader}>Profile Verification</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        {/* Registration Number Field */}
        <TextInput
          style={styles.input}
          placeholder="Registration Number"
          value={regNo}
          onChangeText={setRegNo}
          keyboardType="numeric"
          editable={!isUploading}
        />
        {/* Name Field */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          editable={!isUploading}
        />
        {/* Father's Name Field */}
        <TextInput
          style={styles.input}
          placeholder="Father's Name"
          value={fname}
          onChangeText={setFname}
          editable={!isUploading}
        />
        {isUploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.uploadingText}>Verifying vet...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, !canContinue && styles.disabledButton]} 
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    width: '50%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  input: {
    width: '80%',
    height: 44,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
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

export default Mdocuments;