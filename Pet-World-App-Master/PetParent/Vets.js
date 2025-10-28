import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { MotiView } from 'moti';
import { colors } from "../theme/colors";
import { Feather } from '@expo/vector-icons';

const StarRating = ({ rating, size = 16 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Feather
        key={i}
        name="star"
        size={size}
        style={i <= rating ? styles.starFilled : styles.starEmpty}
      />
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

const AllVetsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVets, setFilteredVets] = useState([]);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const response = await fetch("https://pet-world-app123-default-rtdb.firebaseio.com/Vet.json");
        const data = await response.json();
        const vetList = Object.entries(data || {})
          .map(([id, vetData]) => {
            const reviews = vetData.reviews ? Object.values(vetData.reviews) : [];
            const averageRating = reviews.length > 0
              ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
              : 0;
            return {
              vetId: id,
              ...vetData,
              reviewCount: reviews.length,
              averageRating,
            };
          })
          .filter(vet => vet.verified === "verified" && vet.block !== true);
        setVets(vetList);
        setFilteredVets(vetList); 
      } catch (error) {
        console.error("Error fetching vets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVets(vets);
    } else {
      const filtered = vets.filter(vet =>
        vet.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVets(filtered);
    }
  }, [searchQuery, vets]);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 45, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Veterinarian</Text>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : filteredVets.length > 0 ? (
          filteredVets.map((vet) => (
            <MotiView
              key={vet.vetId}
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
              style={styles.card}
            >
              <Image
                source={{ uri: vet.profileImage || "https://via.placeholder.com/100" }}
                style={styles.profileImage}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.name}>Dr. {vet.username || "Unknown"}</Text>
                <View style={styles.ratingContainer}>
                  <StarRating rating={vet.averageRating} />
                  <Text style={styles.reviewText}>({vet.reviewCount} reviews)</Text>
                </View>
                <Text style={styles.bio} numberOfLines={2}>{vet.bio || "No bio provided."}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("VetProfile1", {
                      vetId: vet.vetId,
                      vet: vet,
                      userId: userId,
                    })
                  }
                >
                  <Text style={styles.buttonText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          ))
        ) : (
          <Text style={styles.noVetsText}>No verified vets found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllVetsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: "#ccc",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starFilled: {
    color: '#FFD700',
    marginRight: 2,
  },
  starEmpty: {
    color: '#d3d3d3',
    marginRight: 2,
  },
  reviewText: {
    marginLeft: 5,
    fontSize: 12,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  noVetsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
});
