import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking, StatusBar, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Import MapView conditionally to prevent crashes
let MapView, Marker;
try {
  const mapModule = require('react-native-maps');
  MapView = mapModule.default;
  Marker = mapModule.Marker;
} catch (error) {
  console.log("Error loading react-native-maps:", error);
}

const VetLocationScreen = ({ route }) => {
  const { vetId } = route.params;
  const navigation = useNavigation();
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });
  const [savedLocation, setSavedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
        
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}/location.json`
        );
        const data = await response.json();
        
        if (data) {
          setSavedLocation(data);
          setLocation(data);
        } else if (status === 'granted') {
          getCurrentLocation();
        }
      } catch (error) {
        console.log('Error fetching location data:', error);
        Alert.alert('Error', 'Failed to load location data');
      } finally {
        setLoading(false);
      }
    })();
  }, [vetId]);

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to get your current location',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Settings', 
            onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()
          }
        ]
      );
      return;
    }

    try {
      setGettingLocation(true);
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
      
    } catch (error) {
      console.log('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      
      const locationToSave = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: location.latitudeDelta || 0.01,
        longitudeDelta: location.longitudeDelta || 0.01
      };
      
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}/location.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationToSave),
        }
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      setSavedLocation(locationToSave);
      Alert.alert('Success', 'Your clinic location has been saved');
    } catch (error) {
      console.log('Error saving location:', error);
      Alert.alert('Error', 'Failed to save your location');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Nominatim response:', data); // Debug log
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      } else {
        Alert.alert('Not found', 'Could not find the specified location.');
      }
    } catch (error) {
      console.log('Search error:', error); // Debug log
      Alert.alert('Error', 'Failed to search for location.');
    } finally {
      setSearching(false);
    }
  };

  const renderMap = () => {
    if (!MapView) {
      setMapError(true);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Map not available</Text>
        </View>
      );
    }
    
    try {
      return (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={location}
            region={location}
            onPress={(e) => {
              setLocation({
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              });
            }}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Clinic Location"
                description="Your clinic is located here"
                pinColor={colors.primary}
                draggable
                onDragEnd={(e) => {
                  setLocation({
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  });
                }}
              />
            )}
          </MapView>
          <Text style={styles.mapInstructions}>
            Tap anywhere on the map or drag the marker to set your location
          </Text>
        </View>
      );
    } catch (error) {
      console.log("Error rendering map:", error);
      setMapError(true);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error displaying map</Text>
        </View>
      );
    }
  };

  const handleLocationInput = () => {
    Alert.prompt(
      "Enter Coordinates",
      "Please enter your clinic's coordinates (latitude,longitude)",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: (coordinates) => {
            if (coordinates) {
              try {
                const [lat, lng] = coordinates.split(",").map(coord => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                  setLocation({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  });
                } else {
                  Alert.alert("Invalid format", "Please enter valid coordinates (e.g., 37.7749,-122.4194)");
                }
              } catch (e) {
                Alert.alert("Error", "Please enter coordinates in format: latitude,longitude");
              }
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Clinic Location</Text>
        <View style={{ width: 28 }} />
      </View>
      
      {/* Search Bar */}
      {/* End Search Bar */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.instructions}>
            Set your clinic's exact location so pet owners can find you easily
          </Text>
          
          {mapError ? (
            <View style={styles.mapFallbackContainer}>
              <Text style={styles.mapFallbackText}>
                Map is not available. You can still set your coordinates manually.
              </Text>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleLocationInput}
              >
                <Text style={styles.manualButtonText}>Enter Coordinates Manually</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {renderMap()}
              
              <TouchableOpacity 
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}
                disabled={gettingLocation}
              >
                <Ionicons name="locate" size={20} color="#fff" />
                <Text style={styles.currentLocationButtonText}>
                  {gettingLocation ? 'Getting location...' : 'Use Current Location'}
                </Text>
                {gettingLocation && (
                  <ActivityIndicator size="small" color="#fff" style={{marginLeft: 5}} />
                )}
              </TouchableOpacity>
            </>
          )}
          
          <View style={styles.locationInfo}>
            {location && (
              <>
                <Text style={styles.coordinatesLabel}>Selected Location</Text>
                <View style={styles.coordinatesContainer}>
                  <Text style={styles.coordinates}>
                    Lat: {location.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.coordinates}>
                    Long: {location.longitude.toFixed(6)}
                  </Text>
                </View>
              </>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!location || 
                  (savedLocation && 
                    location.latitude === savedLocation.latitude && 
                    location.longitude === savedLocation.longitude)
                ) ? styles.disabledButton : null
              ]}
              onPress={handleSaveLocation}
              disabled={!location || (
                savedLocation && 
                location.latitude === savedLocation.latitude && 
                location.longitude === savedLocation.longitude
              )}
            >
              <Text style={styles.saveButtonText}>
                {!savedLocation ? 'Save Location' : 'Update Location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={handleLocationInput}
            >
              <Text style={styles.manualInputButtonText}>
                Enter Coordinates Manually
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  instructions: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  mapContainer: {
    height: 360,
    width: '100%',
    marginBottom: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    marginBottom: 20,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  locationInfo: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  coordinatesLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  coordinatesContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  coordinates: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualInputButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  manualInputButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
  },
  mapFallbackContainer: {
    margin: 24,
    padding: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    alignItems: 'center',
  },
  mapFallbackText: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  currentLocationButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  currentLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  mapInstructions: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 24,
    lineHeight: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    // marginRight: 8, // Remove margin if button is gone
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VetLocationScreen;