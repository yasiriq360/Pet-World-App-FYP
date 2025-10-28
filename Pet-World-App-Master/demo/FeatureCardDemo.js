import React from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import FeatureCard, { FeatureConfigs } from '../components/FeatureCard';
import { colors, typography, spacing } from '../theme/colors';

const FeatureCardDemo = ({ navigation }) => {
  const handleFeaturePress = (featureName) => {
    Alert.alert("Feature Demo", `You pressed: ${featureName}`);
  };

  // Additional demo feature cards with different icons
  const demoFeatures = [
    {
      iconName: "heart",
      title: "Pet Love",
      description: "Express love for your pets",
      gradientColors: [colors.primary, colors.secondary],
    },
    {
      iconName: "star",
      title: "Favorites",
      description: "Your favorite pet moments",
      gradientColors: colors.gradientSunset,
    },
    {
      iconName: "bell",
      title: "Reminders",
      description: "Never miss important tasks",
      gradientColors: colors.gradientWarm,
    },
    {
      iconName: "settings",
      title: "Settings",
      description: "Customize your experience",
      gradientColors: colors.gradientCool,
    },
    {
      iconName: "image",
      title: "Gallery",
      description: "Pet photos and videos",
      gradientColors: [colors.accent, colors.accentWarm],
    },
    {
      iconName: "trending-up",
      title: "Analytics",
      description: "Track pet health trends",
      gradientColors: colors.gradientSecondary,
    }
  ];

  const allFeatures = [
    ...Object.entries(FeatureConfigs).map(([key, config]) => ({
      ...config,
      id: key
    })),
    ...demoFeatures.map((feature, index) => ({
      ...feature,
      id: `demo-${index}`
    }))
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 Feature Cards Demo</Text>
        <Text style={styles.subtitle}>
          Showcasing all available feature cards with proper Feather icons
        </Text>
      </View>

      <View style={styles.grid}>
        {allFeatures.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            {...feature}
            index={index}
            onPress={() => handleFeaturePress(feature.title)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 All icons are from the Feather icon library
        </Text>
        <Text style={styles.footerSubtext}>
          You can easily create custom feature cards by specifying:
        </Text>
        <Text style={styles.bulletPoint}>• iconName (e.g., 'heart', 'camera')</Text>
        <Text style={styles.bulletPoint}>• title and description</Text>
        <Text style={styles.bulletPoint}>• gradientColors array</Text>
        <Text style={styles.bulletPoint}>• onPress callback function</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  footerSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
});

export default FeatureCardDemo; 