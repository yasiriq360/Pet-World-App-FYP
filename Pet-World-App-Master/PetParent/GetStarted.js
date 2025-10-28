import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import PetButton from '../components/PetButton';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';

const GetStarted = ({ navigation }) => {
  return (
    <SafeAreaWrapper backgroundColor={colors.background}>
      <View style={styles.container}>
      {/* Top Image */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 1000 }}
      >
        <Image
          source={{
            uri: 'https://i.pinimg.com/474x/da/0f/16/da0f16bbca901d9e67befe6678e4f5d8.jpg',
          }}
          style={styles.image}
        />
      </MotiView>

      {/* Content */}
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 800, delay: 300 }}
        style={styles.contentContainer}
      >
        {/* Icon */}
        <MotiView
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: 1, rotate: '360deg' }}
          transition={{ type: 'timing', duration: 600, delay: 500 }}
          style={styles.iconContainer}
        >
          <Text style={styles.iconText}>🐾</Text>
        </MotiView>

        {/* Divider */}
        <View style={styles.divider}>
          <MotiView
            from={{ width: 0 }}
            animate={{ width: 30 }}
            transition={{ type: 'timing', duration: 800, delay: 700 }}
            style={styles.activeLine}
          />
          <View style={styles.inactiveLine} />
        </View>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 900 }}
        >
          <Text style={styles.title}>Personalized Pet Profiles</Text>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 1100 }}
        >
          <Text style={styles.description}>
            Create personalized profiles for each of your beloved pets on Pet
            World. Share their name, breed, and age while connecting with a
            vibrant community.
          </Text>
        </MotiView>

        {/* Button */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 1300 }}
        >
          <PetButton
            title="Get started"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('CreateAccount')}
            style={styles.button}
          />
        </MotiView>

        {/* Login Link */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 1500 }}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}>
              Log in here!
            </Text>
          </Text>
        </MotiView>
      </MotiView>
    </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '50%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginTop: -50,
    padding: spacing.lg,
    ...shadows.lg,
  },
  iconContainer: {
    alignSelf: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  divider: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  activeLine: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  inactiveLine: {
    width: 80,
    height: 2,
    backgroundColor: colors.textTertiary,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginVertical: spacing.md,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body1,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  button: {
    marginVertical: spacing.md,
  },
  loginText: {
    ...typography.body2,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default GetStarted;
