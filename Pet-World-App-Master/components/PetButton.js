import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, shadows } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
const PetButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  icon = null,
  style = {},
  textStyle = {}
}) => {
  const getGradientColors = () => {
    if (disabled) return ['#BDC3C7', '#95A5A6'];
    
    switch (variant) {
      case 'primary': return colors.gradientPrimary;
      case 'secondary': return colors.gradientSecondary;
      case 'warm': return colors.gradientWarm;
      case 'cool': return colors.gradientCool;
      case 'sunset': return colors.gradientSunset;
      case 'accent': return [colors.accent, colors.secondary];
      default: return colors.gradientPrimary;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return styles.buttonSmall;
      case 'large': return styles.buttonLarge;
      case 'medium':
      default: return styles.buttonMedium;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return styles.buttonTextSmall;
      case 'large': return styles.buttonTextLarge;
      case 'medium':
      default: return styles.buttonTextMedium;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getButtonSize(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={[styles.gradient, getButtonSize()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon === 'camera' ? <Ionicons name="camera" size={24} color={colors.surface} /> : icon === 'edit' ? <Ionicons name="pencil" size={24} color={colors.surface} /> : icon === 'delete' ? <Ionicons name="trash" size={24} color={colors.surface} /> : icon}</View>}
            
          <Text style={[styles.buttonText, getTextSize(), textStyle]}>
            
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  buttonSmall: {
    borderRadius: borderRadius.md,
  },
  buttonMedium: {
    borderRadius: borderRadius.lg,
  },
  buttonLarge: {
    borderRadius: borderRadius.xl,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: colors.surface,
    textAlign: 'center',
    ...typography.button,
  },
  buttonTextSmall: {
    ...typography.body2,
    fontWeight: '600',
  },
  buttonTextMedium: {
    ...typography.button,
  },
  buttonTextLarge: {
    ...typography.buttonLarge,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default PetButton; 