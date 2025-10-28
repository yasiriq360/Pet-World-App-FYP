import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

const EditVetProfile = ({ route }) => {
  const { vetId } = route.params;
  const navigation = useNavigation();

  const [bio, setBio] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    const fetchVetData = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`
        );
        const data = await response.json();
        
        if (data) {
          setBio(data.bio || '');
          setSelectedServices(Array.isArray(data.services) ? data.services : []);
        }
      } catch (error) {
        console.log('Error fetching vet data:', error.message);
        Alert.alert('Error', 'Failed to load vet profile');
      } finally {
        setLoading(false);
      }
    };

    fetchVetData();
  }, [vetId]);

  const toggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio,
            services: selectedServices,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Error updating profile:', error.message);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={6}
          value={bio}
          onChangeText={setBio}
          placeholder="Enter your bio"
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Services</Text>
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
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  servicePickerButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceTagText: {
    color: '#374151',
    fontSize: 14,
    marginRight: 6,
  },
  removeService: {
    color: '#374151',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  servicesList: {
    marginBottom: 15,
  },
  serviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  serviceItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  serviceItemText: {
    fontSize: 16,
    color: '#374151',
  },
  serviceItemTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditVetProfile; 