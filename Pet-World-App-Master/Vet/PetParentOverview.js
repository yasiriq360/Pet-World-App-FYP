import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';

function PetParentOverview({ route }) {
  const { userId } = route.params;
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPets() {
      try {
        const url = `https://pet-world-app123-default-rtdb.firebaseio.com/Users/${userId}/Pets.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setPets(data ? Object.values(data) : []);
      } catch (err) {
        setError(err.message);
        setPets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading pets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No pets found for this user.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pet Parent's Pets</Text>
      {pets.map((pet, idx) => (
        <View key={idx} style={styles.petCard}>
          <Text style={styles.petName}>{pet.petName} ({pet.gender})</Text>
          <Image source={{ uri: pet.image }} style={styles.petImage} />
          <Text>Age: {pet.age}</Text>
          <Text>Breed: {pet.breed}</Text>
          <Text>Weight: {pet.weight} {pet.unit}</Text>
          <Text>Description: {pet.petDescription}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  petCard: { marginBottom: 25, padding: 15, borderWidth: 1, borderRadius: 8, borderColor: '#ccc', backgroundColor: '#fafafa' },
  petName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  petImage: { width: '100%', height: 200, marginBottom: 10, borderRadius: 8 },
});

export default PetParentOverview; 