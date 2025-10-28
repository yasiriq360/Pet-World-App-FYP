import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../theme/colors';

const PetLoadingScreen = ({ message = 'Loading...' }) => {
  // Paw print animation component
  const PawPrint = ({ delay = 0, size = 20 }) => (
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 800,
        delay,
        loop: true,
      }}
      style={[styles.pawPrint, { width: size, height: size }]}
    >
      <Text style={[styles.pawEmoji, { fontSize: size * 0.8 }]}>🐾</Text>
    </MotiView>
  );

  // Main pet icon animation
  const PetIcon = () => (
    <MotiView
      from={{ rotate: '0deg', scale: 1 }}
      animate={{ rotate: '360deg', scale: 1.1 }}
      transition={{
        type: 'timing',
        duration: 2000,
        loop: true,
      }}
      style={styles.petIconContainer}
    >
      <LinearGradient
        colors={colors.gradientPrimary}
        style={styles.petIconGradient}
      >
        <Text style={styles.petIcon}>🐕</Text>
      </LinearGradient>
    </MotiView>
  );

  // Hearts floating animation
  const FloatingHeart = ({ delay = 0 }) => (
    <MotiView
      from={{ translateY: 100, opacity: 0 }}
      animate={{ translateY: -100, opacity: [0, 1, 0] }}
      transition={{
        type: 'timing',
        duration: 3000,
        delay,
        loop: true,
      }}
      style={styles.floatingHeart}
    >
      <Text style={styles.heartEmoji}>💝</Text>
    </MotiView>
  );

  return (
    <LinearGradient
      colors={[colors.background, colors.surfaceVariant]}
      style={styles.container}
    >
      {/* Background floating hearts */}
      <FloatingHeart delay={0} />
      <FloatingHeart delay={1000} />
      <FloatingHeart delay={2000} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Pet icon with rotation */}
        <PetIcon />

        {/* Paw prints trail */}
        <View style={styles.pawTrail}>
          <PawPrint delay={0} size={16} />
          <PawPrint delay={200} size={20} />
          <PawPrint delay={400} size={24} />
          <PawPrint delay={600} size={20} />
          <PawPrint delay={800} size={16} />
        </View>

        {/* Loading text with animation */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            type: 'timing',
            duration: 1500,
            loop: true,
          }}
          style={styles.textContainer}
        >
          <Text style={styles.loadingText}>{message}</Text>
        </MotiView>

        {/* Pet care tip */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 1000,
            delay: 500,
          }}
          style={styles.tipContainer}
        >
          <Text style={styles.tipText}>
            💡 Did you know? Regular grooming keeps your pet healthy and happy!
          </Text>
        </MotiView>
      </View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <MotiView
          from={{ translateX: -200 }}
          animate={{ translateX: 200 }}
          transition={{
            type: 'timing',
            duration: 3000,
            loop: true,
          }}
          style={styles.movingPaw}
        >
          <Text style={styles.movingPawEmoji}>🐾</Text>
        </MotiView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  petIconContainer: {
    marginBottom: spacing.xl,
  },
  petIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  petIcon: {
    fontSize: 60,
  },
  pawTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: spacing.xl,
  },
  pawPrint: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawEmoji: {
    color: colors.primary,
  },
  textContainer: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  tipContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginHorizontal: spacing.xl,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  floatingHeart: {
    position: 'absolute',
    left: Math.random() * 300,
    top: '70%',
  },
  heartEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: spacing.xl,
    width: '100%',
    height: 40,
    overflow: 'hidden',
  },
  movingPaw: {
    position: 'absolute',
    bottom: 0,
  },
  movingPawEmoji: {
    fontSize: 24,
    color: colors.textTertiary,
    opacity: 0.4,
  },
});

export default PetLoadingScreen; 