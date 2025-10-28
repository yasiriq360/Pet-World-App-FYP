# 🎨 Feature Cards Documentation

## Overview

The `FeatureCard` component provides a modern, animated card interface for displaying app features with beautiful gradients and Feather icons. Perfect for dashboards, feature showcases, and navigation menus.

## Basic Usage

```javascript
import FeatureCard, { FeatureConfigs } from '../components/FeatureCard';

// Using pre-defined configurations
<FeatureCard 
  {...FeatureConfigs.careGuide} 
  onPress={handlePress} 
/>

// Custom feature card
<FeatureCard 
  iconName="heart"
  title="Pet Love"
  description="Show love to your pets"
  gradientColors={['#FF6B6B', '#4ECDC4']}
  onPress={handlePress}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `iconName` | string | 'star' | Feather icon name |
| `iconLibrary` | string | 'Feather' | Icon library (currently Feather only) |
| `iconSize` | number | 32 | Size of the icon |
| `title` | string | - | Card title |
| `description` | string | - | Card description |
| `onPress` | function | - | Callback when card is pressed |
| `gradientColors` | array | `colors.gradientPrimary` | Gradient background colors |
| `index` | number | 0 | For staggered animations |

## Pre-defined Configurations

The `FeatureConfigs` object provides ready-to-use configurations:

### Available Configs

- **careGuide**: 📖 Care tips and guides
- **breedIdentification**: 📷 Breed identification
- **healthCheck**: 📊 Health monitoring 
- **vetConnect**: 👨‍⚕️ Vet connections
- **chatbot**: 💬 AI assistance
- **community**: 👥 Pet community
- **appointment**: 📅 Appointments
- **location**: 📍 Location services
- **nutrition**: ☕ Diet guidance
- **training**: 🏆 Pet training
- **emergency**: 📞 Emergency support
- **vaccination**: 🛡️ Vaccine tracking

### Example Usage

```javascript
// Pre-defined feature
<FeatureCard 
  {...FeatureConfigs.breedIdentification}
  index={0}
  onPress={() => navigation.navigate('BreedID')}
/>

// Override specific properties
<FeatureCard 
  {...FeatureConfigs.chatbot}
  title="Custom ChatBot"
  description="My custom description"
  onPress={handleCustomAction}
/>
```

## Popular Feather Icons

### Common Icons
- `camera` - Photo/capture features
- `heart` - Favorites/love
- `user` - Profile/account
- `map-pin` - Location services
- `calendar` - Scheduling/dates
- `message-circle` - Chat/messaging
- `phone` - Contact/calls
- `mail` - Email/messages
- `star` - Ratings/favorites
- `settings` - Configuration
- `home` - Dashboard/main
- `search` - Search functionality

### Action Icons
- `plus` - Add/create
- `edit` - Edit/modify
- `trash` - Delete/remove
- `download` - Download
- `upload` - Upload
- `save` - Save/bookmark
- `share` - Share content

### Status Icons
- `check` - Success/complete
- `x` - Error/cancel
- `alert-circle` - Warning
- `info` - Information
- `shield` - Security/protection
- `lock` - Privacy/security

## Gradient Colors

Use predefined gradient combinations from the theme:

```javascript
import { colors } from '../theme/colors';

// Available gradients
colors.gradientPrimary    // Coral to Turquoise
colors.gradientSecondary  // Blue to Green
colors.gradientWarm       // Yellow to Orange
colors.gradientCool       // Light Green to Teal
colors.gradientSunset     // Orange to Yellow

// Custom gradients
gradientColors={[colors.primary, colors.secondary]}
gradientColors={['#FF6B6B', '#4ECDC4']}
```

## Animation Features

### Entrance Animations
- Cards animate in with scale and opacity
- Icons rotate on entrance for visual appeal
- Staggered delays create smooth sequence

### Usage with Staggered Animation
```javascript
{features.map((feature, index) => (
  <FeatureCard
    key={feature.id}
    {...feature}
    index={index}  // Important for staggered effect
    onPress={() => handlePress(feature)}
  />
))}
```

## Best Practices

### 1. Consistent Spacing
```javascript
// Good: Use theme spacing
<View style={{ padding: spacing.md }}>
  <FeatureCard {...props} />
</View>
```

### 2. Meaningful Icons
```javascript
// Good: Icon matches functionality
<FeatureCard iconName="camera" title="Photo Capture" />

// Bad: Generic icon for specific feature
<FeatureCard iconName="star" title="Photo Capture" />
```

### 3. Grid Layout
```javascript
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  }
});
```

### 4. Responsive Design
Cards automatically adjust to 47% width for 2-column layout on most devices.

## Complete Example

```javascript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import FeatureCard, { FeatureConfigs } from '../components/FeatureCard';
import { colors, spacing } from '../theme/colors';

const Dashboard = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <FeatureCard 
          {...FeatureConfigs.careGuide}
          index={0}
          onPress={() => navigation.navigate('CareGuide')}
        />
        
        <FeatureCard 
          iconName="heart"
          title="Favorites"
          description="Your favorite moments"
          gradientColors={colors.gradientWarm}
          index={1}
          onPress={() => navigation.navigate('Favorites')}
        />
        
        <FeatureCard 
          {...FeatureConfigs.emergency}
          index={2}
          onPress={() => navigation.navigate('Emergency')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
});
```

## Performance Tips

1. **Use index prop** for smooth staggered animations
2. **Predefine configurations** for frequently used cards
3. **Avoid inline functions** in onPress for better performance
4. **Use meaningful keys** when rendering lists of cards

---

🐾 **Happy coding with your Pet World App!** 