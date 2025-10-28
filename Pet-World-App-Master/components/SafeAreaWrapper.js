import React from 'react';
import { SafeAreaView, StatusBar, Platform, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * SafeAreaWrapper Component
 * 
 * A reusable wrapper that handles safe areas consistently across all screens
 * Properly handles status bar on Android and safe areas on iOS
 * 
 * @param {ReactNode} children - Child components to wrap
 * @param {string} backgroundColor - Background color (defaults to theme background)
 * @param {string} statusBarStyle - Status bar style ('light-content' or 'dark-content')
 * @param {boolean} statusBarHidden - Whether to hide status bar
 * @param {object} style - Additional styles to apply
 */
const SafeAreaWrapper = ({ 
  children, 
  backgroundColor = colors.background,
  statusBarStyle = 'dark-content',
  statusBarHidden = false,
  style = {} 
}) => {
  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        hidden={statusBarHidden}
        translucent={false}
      />
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor },
          style
        ]}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default SafeAreaWrapper; 