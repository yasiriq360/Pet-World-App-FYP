import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const LoadingPage = () => {
  // Animation value for rotation
  const rotation = useSharedValue(0);

  // Configure the rotation animation
  rotation.value = withRepeat(
    withTiming(360, { duration: 2000, easing: Easing.linear }),
    -1, // Infinite loop
    false // Don't reverse the animation
  );

  // Animated style for the cat and dog faces
  const catAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { translateX: -50 }, // Move the cat face to the left
    ],
  }));

  const dogAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${-rotation.value}deg` }, // Rotate in the opposite direction
      { translateX: 50 }, // Move the dog face to the right
    ],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
      <View style={styles.animationContainer}>
        {/* Cat Face */}
        <Animated.View style={[styles.catContainer, catAnimatedStyle]}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/616/616430.png' }} // Replace with your cat face image URL
            style={styles.faceImage}
          />
        </Animated.View>

        {/* Dog Face */}
        <Animated.View style={[styles.dogContainer, dogAnimatedStyle]}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' }} // Replace with your dog face image URL
            style={styles.faceImage}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Light gray background
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Dark gray text
    marginBottom: 20,
  },
  animationContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catContainer: {
    position: 'absolute',
  },
  dogContainer: {
    position: 'absolute',
  },
  faceImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular images
  },
});

export default LoadingPage;