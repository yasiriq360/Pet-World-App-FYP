import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NotificationContext } from '../context/NotificationContext';

const DashboardScreen = ({ route }) => {
  const { vetId } = route.params;
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { hasUnseenMessages } = useContext(NotificationContext);
  const isFocused = useIsFocused();
  const [hasUnseen, setHasUnseen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let interval;
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/Vet/${vetId}.json`
        );
        const data = await response.json();
        if (data && data.username) {
          setUsername(data.username);
        }
        if (data && data.block === true) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      } catch (error) {
        console.log('Error fetching username:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (vetId) {
      fetchUserData();
      interval = setInterval(fetchUserData, 2000);
    }
    return () => interval && clearInterval(interval);
  }, [vetId, isFocused]);

  // Poll for unseen messages in real time
  useEffect(() => {
    let interval;
    const checkUnseen = async () => {
      try {
        const chatsRes = await fetch('https://pet-world-app123-default-rtdb.firebaseio.com/chats.json');
        const chatsData = await chatsRes.json();
        if (chatsData) {
          let foundUnseen = false;
          Object.entries(chatsData).forEach(([chatId, messages]) => {
            const ids = chatId.split('_');
            if (!ids.includes(vetId)) return;
            const messageArray = Object.values(messages || {});
            if (messageArray.length === 0) return;
            // Check for unseen messages for the vet
            if (messageArray.some(msg => msg.receiverId === vetId && msg.seenByVet === false)) {
              foundUnseen = true;
            }
          });
          setHasUnseen(foundUnseen);
        } else {
          setHasUnseen(false);
        }
      } catch (e) {
        setHasUnseen(false);
      }
    };
    if (vetId) {
      checkUnseen();
      interval = setInterval(checkUnseen, 2000);
    }
    return () => interval && clearInterval(interval);
  }, [vetId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  if (isBlocked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#d32f2f', marginBottom: 16, textAlign: 'center' }}>
          You are blocked by the admin.\nContact admin using email below
        </Text>
        <Text style={{ fontSize: 18, color: '#333', marginTop: 8, textAlign: 'center' }}>admin@gmail.com</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Dashboard</Text>
          {/* <NotificationBell /> */}
        </View>

        <View style={styles.cardContainer}>
          {/* Profile Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Management</Text>
            <View style={styles.cardRow}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('VetProfile', { vetId })}
              >
                <Image
                  source={{ uri: 'https://img.freepik.com/premium-vector/doctor-profile-with-medical-service-icon_617655-48.jpg' }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardLabel}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('EditVetProfile', { vetId })}
              >
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1827/1827933.png' }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardLabel}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Schedule Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule Management</Text>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('VetTimeAvailability', { vetId })}
            >
              <Image
                source={{ uri: 'https://media.istockphoto.com/id/1356078176/video/animation-calendar-with-check-mark-on-blue-background-approved-or-schedule-date-4k-video.jpg?s=640x640&k=20&c=r4NJDsQ_3IdCA-twpKdnK-kfOKUjJRpqA1UfCTxvM-4=' }}
                style={styles.cardImage}
              />
              <Text style={styles.cardLabel}>Update Schedule</Text>
            </TouchableOpacity>
          </View>

          {/* Location Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Management</Text>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('VetLocationScreen', { vetId })}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1180/1180058.png' }}
                style={styles.cardImage}
              />
              <Text style={styles.cardLabel}>Set Clinic Location</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communication</Text>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ChatListScreen', { vetId })}
            >
              <View style={styles.chatCardContent}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/134/134914.png' }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardLabel}>View Chats</Text>
                {hasUnseen && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>New</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 45,
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#00796B',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  chatCardContent: {
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
