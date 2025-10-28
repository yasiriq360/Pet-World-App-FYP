import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { colors, typography, borderRadius, shadows, spacing } from '../theme/colors';

const PetProfileCard = ({ pet, onPress, index = 0 }) => {
  const getPetTypeEmoji = (breed) => {
    // Simple logic to determine if it's a dog or cat based on breed
    const dogBreeds = ['golden retriever', 'labrador', 'bulldog', 'german shepherd', 'beagle', 'poodle', 'husky'];
    const catBreeds = ['persian', 'siamese', 'maine coon', 'british shorthair', 'ragdoll', 'bengal'];
    
    const breedLower = breed?.toLowerCase() || '';
    
    if (dogBreeds.some(dog => breedLower.includes(dog))) {
      return '🐕';
    } else if (catBreeds.some(cat => breedLower.includes(cat))) {
      return '🐱';
    }
    
    // Default based on common naming patterns
    return breedLower.includes('cat') ? '🐱' : '🐕';
  };

  const formatAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age}y`;
  };

  function formatWeight(weight) {
    if (weight === undefined || weight === null || isNaN(Number(weight))) return '0';
    const num = Number(weight);
    const str = String(num);
    if (!str.includes('.')) {
      // Integer: just show first 3 digits
      return str.slice(0, 3);
    }
    // Decimal: show up to 2 digits after the point, but total 3 digits (excluding dot)
    const [intPart, decPart] = str.split('.');
    if (intPart.length >= 3) {
      return intPart.slice(0, 3);
    }
    // intPart.length < 3
    const needed = 3 - intPart.length;
    return intPart + '.' + (decPart + '00').slice(0, needed);
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ 
        type: 'timing', 
        duration: 600,
        delay: index * 100 
      }}
      style={styles.cardContainer}
    >
      <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <View style={styles.petImageContainer}>
            <Image source={{ uri: pet.image }} style={styles.petImage} />
            <View style={styles.petTypeIndicator}>
              <Text style={styles.petTypeText}>
                {getPetTypeEmoji(pet.breed)}
              </Text>
            </View>
          </View>
          
          <View style={styles.petInfo}>
            <Text style={styles.petName} numberOfLines={1} ellipsizeMode="tail">
              {pet.petName || 'Unnamed Pet'}
            </Text>
            <Text style={styles.petBreed} numberOfLines={1} ellipsizeMode="tail">
              {pet.breed || 'Mixed Breed'}
            </Text>
            <View style={styles.petDetails}>
              <Text style={styles.petDetailText}>
                {pet.size || 'Medium'} • {formatWeight(pet.weight)} {pet.unit || 'kg'} • {formatAge(pet.birthDate)}
              </Text>
            </View>
            {pet.gender && (
              <View style={styles.genderContainer}>
                <Text style={styles.genderText}>
                  {pet.gender === 'male' ? '♂️' : '♀️'} {pet.gender}
                </Text>
              </View>
            )}
          </View>
          
          <View style={[styles.actionButton, { backgroundColor: colors.accentWarm }]}>
            <Feather name="chevron-right" size={20} color={colors.surface} />
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  touchable: {
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surface + '20', // 20% opacity
  },
  petImageContainer: {
    position: 'relative',
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  petTypeIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.accent,
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  petTypeText: {
    fontSize: 12,
  },
  petInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  petName: {
    ...typography.h4,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  petBreed: {
    ...typography.body2,
    color: colors.surface + 'E6', // 90% opacity
    marginBottom: spacing.xs,
  },
  petDetails: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  petDetailText: {
    ...typography.caption,
    color: colors.surface + 'CC', // 80% opacity
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderText: {
    ...typography.caption,
    color: colors.surface + 'E6', // 90% opacity
    fontWeight: '600',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PetProfileCard; 