import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VetProfile = ({ route }) => {
  const { vetId } = route.params;
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
  const [services, setServices] = useState('');
  const [timeAvailability, setTimeAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`
        );
        const data = await response.json();

        if (data) {
          setUsername(data.username || '');
          setProfileImage(data.profileImage || '');
          setBio(data.bio || '');
          setServices(data.services || '');
          setTimeAvailability(data.timeAvailability || {});
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch vet data');
      } finally {
        setLoading(false);
      }
    };

    if (vetId) fetchUserData();
  }, [vetId]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'vetId',
                'vetEmail', 
                'vetLoginTime',
                'vetAuthToken',
                'isVetLoggedIn'
              ]);

              await fetch(
                `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    isLoggedIn: false,
                    lastLogoutTime: new Date().toISOString()
                  }),
                }
              );

              navigation.reset({
                index: 0,
                routes: [{ name: 'Select' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Delete profile logic (similar to pet parent profile)
  const handleDeleteProfile = async () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Remove vet data from Firebase
              await fetch(
                `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`,
                { method: 'DELETE' }
              );
              // Remove local storage
              await AsyncStorage.multiRemove([
                'vetId',
                'vetEmail',
                'vetLoginTime',
                'vetAuthToken',
                'isVetLoggedIn'
              ]);
              setLoading(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Select' }],
              });
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          }
        }
      ]
    );
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderSchedule = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        {allDays.map((day) => {
          const slots = timeAvailability[day] || [];
          
          return (
            <View key={day} style={styles.dayScheduleContainer}>
              <Text style={styles.dayText}>{day}</Text>
              {slots.length === 0 ? (
                <Text style={styles.closedText}>Closed</Text>
              ) : (
                <View style={styles.slotsContainer}>
                  {slots.map((slot, index) => (
                    <Text key={index} style={styles.slotText}>
                      {slot.start} - {slot.end}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <>
            <View style={styles.headerSection}>
              <Image
                source={{
                  uri: profileImage || 'https://via.placeholder.com/150',
                }}
                style={styles.profileImage}
              />
              <Text style={styles.nameText}>Dr. {username || 'Unknown Vet'}</Text>
            </View>

            <View style={styles.contentSection}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.sectionContent}>
                  {bio || 'No bio available.'}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                <Text style={styles.sectionContent}>
                  {Array.isArray(services)
                    ? services.map((s, i) => `• ${s}${i < services.length - 1 ? '\n' : ''}`).join(' ')
                    : typeof services === 'string' && services.includes(',')
                      ? services.split(',').map(s => `• ${s.trim()}`).join('\n')
                      : `• ${services || 'No services listed.'}`}
                </Text>
              </View>

              {renderSchedule()}

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditVetProfile', { vetId })}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
               style={styles.deleteButton}
               onPress={handleDeleteProfile}
             >
               <Text style={styles.deleteButtonText}>Delete Profile</Text>
             </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>

             {/* Delete Profile Button */}
            
            </View>
          </>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default VetProfile;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',

  },
  container: {
   
    flex: 1,
    alignItems: 'center',
    paddingBottom: 45,
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentSection: {
    width: '100%',
    padding: 20,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  section: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1e40af',
  },
  sectionContent: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  dayScheduleContainer: {
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  slotsContainer: {
    marginLeft: 12,
  },
  slotText: {
    fontSize: 16,
    color: '#475569',
    marginVertical: 3,
  },
  closedText: {
    fontSize: 16,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginLeft: 12,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#991b1b',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
