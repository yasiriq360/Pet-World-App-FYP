import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NotificationContext } from '../context/NotificationContext';

const NotificationBell = ({ size = 24, color = '#FFFFFF' }) => {
  const { hasUnseenMessages } = useContext(NotificationContext);

  return (
    <View style={styles.container}>
      <Icon name="notifications-outline" size={size} color={color} />
      {hasUnseenMessages && <View style={styles.dot} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    borderWidth: 1,
    borderColor: '#FFF',
  },
});

export default NotificationBell; 