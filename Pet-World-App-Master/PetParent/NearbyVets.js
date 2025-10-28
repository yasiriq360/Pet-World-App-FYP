import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';
import Slider from '@react-native-community/slider';

const NearbyVets = ({ route, navigation }) => {
  const { userId } = route.params;
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchDistance, setSearchDistance] = useState(10); // default 10km

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to find nearby vets.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
    }
  };

  // Fetch vets and filter by distance
  const fetchNearbyVets = async () => {
    try {
      const response = await fetch(
        'https://pet-world-app123-default-rtdb.firebaseio.com/Vet.json'
      );
      const data = await response.json();

      if (data && userLocation) {
        const nearbyVets = Object.entries(data)
          .map(([id, vet]) => ({
            id,
            ...vet,
            distance: vet.location ? 
              calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                parseFloat(vet.location.latitude),
                parseFloat(vet.location.longitude)
              ) : Infinity
          }))
          .filter(vet => 
            vet.distance <= searchDistance && 
            vet.verified === 'verified' &&
            vet.location && 
            vet.location.latitude && 
            vet.location.longitude
          )
          .sort((a, b) => a.distance - b.distance);

        setVets(nearbyVets);
      } else {
        setVets([]);
      }
    } catch (error) {
      console.error('Error fetching vets:', error);
      Alert.alert('Error', 'Failed to fetch nearby vets. Please try again.');
      setVets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyVets();
    }
  }, [userLocation, searchDistance]);

  const handleRefresh = () => {
    setLoading(true);
    getUserLocation();
  };

  const handleVetPress = (vet) => {
    navigation.navigate('VetProfile1', {
      vet, // send the full vet object
      vetId: vet.id,
      userId: userId,
      distance: vet.distance
    });
  };

  const openMaps = (vet) => {
    if (!vet.location) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${vet.location.latitude},${vet.location.longitude}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
        Alert.alert('Error', 'Could not open maps application');
      })
      .catch(() => Alert.alert('Error', 'Could not open maps application'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}
        >
          <Text style={styles.title}>Nearby Vets</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={24} color={colors.surface} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Slider for adjusting search distance */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Search Radius: <Text style={{fontWeight:'bold'}}>{searchDistance} km</Text></Text>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={searchDistance}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.accent}
            thumbTintColor={colors.primary}
            onValueChange={value => setSearchDistance(value)}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding nearby vets...</Text>
          </View>
        ) : vets.length === 0 ? (
          <View style={styles.noVetsContainer}>
            <Feather name="map-pin" size={60} color={colors.primary} style={styles.noVetsIcon} />
            <Text style={styles.noVetsText}>No vets found within {searchDistance}km of your location.</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {Array.isArray(vets) && vets.map((vet) => (
              <MotiView
                key={vet.id}
                from={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 1000 }}
              >
                <TouchableOpacity
                  style={styles.vetCard}
                  onPress={() => handleVetPress(vet)}
                >
                  <Image
                    source={{ uri: vet.profileImage || 'https://via.placeholder.com/150' }}
                    style={styles.vetImage}
                  />
                  <View style={styles.vetInfo}>
                    <Text style={styles.vetName}>Dr. {vet.username}</Text>
                    <View style={styles.distanceContainer}>
                      <Feather name="map-pin" size={14} color={colors.primary} />
                      <Text style={styles.distance}>{vet.distance.toFixed(1)} km away</Text>
                    </View>
                    <Text style={styles.specialties}>
                      {vet.bio || 'General Veterinarian'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => openMaps(vet)}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      style={styles.directionGradient}
                    >
                      <Feather name="navigation" size={20} color={colors.surface} />
                    </LinearGradient>
                  </TouchableOpacity>
                </TouchableOpacity>
              </MotiView>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.surface,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textSecondary,
  },
  noVetsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noVetsIcon: {
    marginBottom: 20,
  },
  noVetsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  vetCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    margin: 10,
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  vetImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  vetInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  vetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distance: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  specialties: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  directionsButton: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  directionGradient: {
    padding: 10,
    borderRadius: 20,
  },
  sliderContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: colors.background,
  },
  sliderLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 5,
  },
});

export default NearbyVets;