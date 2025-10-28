import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows, spacing } from '../theme/colors';

/**
 * FeatureCard Component
 * 
 * @param {string} iconName - Feather icon name (e.g., 'camera', 'heart', 'user', 'map-pin')
 * @param {string} iconLibrary - Icon library to use (currently supports 'Feather')
 * @param {number} iconSize - Size of the icon (default: 32)
 * @param {string} title - Card title
 * @param {string} description - Card description
 * @param {function} onPress - Callback function when card is pressed
 * @param {array} gradientColors - Array of colors for gradient background
 * @param {number} index - Index for staggered animations
 * 
 * Popular Feather icons: 
 * 'camera', 'heart', 'user', 'map-pin', 'calendar', 'message-circle', 
 * 'phone', 'mail', 'star', 'settings', 'home', 'search', 'plus',
 * 'edit', 'trash', 'download', 'upload', 'book', 'shield', 'award'
 */
const FeatureCard = ({
  iconName,
  iconLibrary = 'Feather',
  iconSize = 32,
  title,
  description,
  onPress,
  gradientColors = colors.gradientPrimary,
  index = 0
}) => {
  // Render the appropriate icon based on library
  const renderIcon = () => {
    if (iconLibrary === 'Feather' && iconName) {
      return <Feather name={iconName} size={iconSize} color={colors.surface} />;
    }
    // Default fallback icon
    return <Feather name="star" size={iconSize} color={colors.surface} />;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
        delay: index * 50
      }}
      style={styles.container}
    >
      <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.featureGradient, { backgroundColor: colors.accentEarth }]}>
          <View style={styles.featureContent}>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'timing',
                duration: 300,
                delay: index * 50 + 100
              }}
              style={styles.featureIconContainer}
            >
              <View style={styles.featureIconBackground}>
                {renderIcon()}
              </View>
            </MotiView>
            <Text style={styles.featureTitle} numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>
            {description && (
              <Text style={styles.featureDescription} numberOfLines={3} ellipsizeMode="tail">
                {description}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

    </MotiView>
  );
};

/**
 * Usage Examples:
 * 
 * // Using pre-defined configurations
 * <FeatureCard {...FeatureConfigs.careGuide} onPress={handlePress} />
 * 
 * // Creating custom feature card
 * <FeatureCard 
 *   iconName="heart"
 *   title="Pet Love"
 *   description="Show love to your pets"
 *   gradientColors={['#FF6B6B', '#4ECDC4']}
 *   onPress={handlePress}
 * />
 * 
 * // Custom icon size and colors
 * <FeatureCard 
 *   iconName="star"
 *   iconSize={40}
 *   title="Favorites"
 *   gradientColors={colors.gradientSunset}
 *   onPress={handlePress}
 * />
 */

// Pre-defined feature configurations for common app features
export const FeatureConfigs = {
  careGuide: {
    title: "Care Guide",
    description: "Complete pet care tips and guides",
    gradientColors: colors.gradientWarm,
    iconName: "book-open",
    iconSize: 32
  },
  breedIdentification: {
    title: "Breed ID",
    description: "Identify your pet's breed instantly",
    gradientColors: colors.gradientSecondary,
    iconName: "camera",
    iconSize: 32
  },
  healthCheck: {
    title: "Health Monitor",
    description: "Track your pet's health status",
    gradientColors: colors.gradientCool,
    iconName: "activity",
    iconSize: 32
  },
  vetConnect: {
    title: "Find Vets",
    description: "Connect with nearby veterinarians",
    gradientColors: [colors.accent, colors.primary],
    iconName: "user-check",
    iconSize: 32
  },
  chatbot: {
    title: "Pet Assistant",
    description: "24/7 AI pet care support",
    gradientColors: colors.gradientSunset,
    iconName: "message-circle",
    iconSize: 32
  },
  community: {
    title: "Pet Community",
    description: "Connect with other pet parents",
    gradientColors: [colors.secondary, colors.accentWarm],
    iconName: "users",
    iconSize: 32
  },
  appointment: {
    title: "Appointments",
    description: "Schedule vet appointments",
    gradientColors: [colors.accent, colors.accentEarth],
    iconName: "calendar",
    iconSize: 32
  },
  location: {
    title: "Find Vets",
    description: "Locate nearby veterinarians",
    gradientColors: [colors.primary, colors.accentEarth],
    iconName: "map-pin",
    iconSize: 32
  },
  nutrition: {
    title: "Nutrition",
    description: "Diet and feeding guidance",
    gradientColors: colors.gradientWarm,
    iconName: "coffee",
    iconSize: 32
  },
  training: {
    title: "Training",
    description: "Pet training tips and tricks",
    gradientColors: colors.gradientCool,
    iconName: "award",
    iconSize: 32
  },
  emergency: {
    title: "Emergency",
    description: "24/7 emergency support",
    gradientColors: [colors.error, colors.warning],
    iconName: "phone-call",
    iconSize: 32
  },
  vaccination: {
    title: "Vaccines",
    description: "Track vaccination schedules",
    gradientColors: colors.gradientSecondary,
    iconName: "shield",
    iconSize: 32
  }
};

const styles = StyleSheet.create({
  container: {
    width: '47%',
    marginBottom: spacing.md,
  },
  featureCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  featureGradient: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  featureIconContainer: {
    marginBottom: spacing.md,
  },
  featureIconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',

  },

  featureTitle: {
    ...typography.h4,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  featureDescription: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default FeatureCard; 