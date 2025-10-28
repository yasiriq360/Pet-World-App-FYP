import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useIsFocused } from '@react-navigation/native';

const ChatHistory = ({ navigation, route }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = route.params;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchChats();
    }
  }, [isFocused]);

  const fetchChats = async () => {
    try {
      // Fetch vet info and all chats in parallel
      const [vetsRes, chatsRes] = await Promise.all([
        fetch('https://pet-world-app123-default-rtdb.firebaseio.com/Vet.json'),
        fetch('https://pet-world-app123-default-rtdb.firebaseio.com/chats.json'),
      ]);
      const [vetsData, chatsData] = await Promise.all([
        vetsRes.json(),
        chatsRes.json(),
      ]);
      if (chatsData) {
        const chats = [];
        Object.entries(chatsData).forEach(([chatId, messages]) => {
          const ids = chatId.split('_');
          if (!ids.includes(userId)) return; // Only include chats where user is a participant

          const messageArray = Object.values(messages || {});
          if (messageArray.length === 0) return;

          // Find the latest message
          const latest = messageArray.sort((a, b) => b.timestamp - a.timestamp)[0];
          // Find the vetId (the other participant who is not the user)
          const vetId = ids.find(id => id !== userId);
          const vet = vetsData?.[vetId] || {};

          // Skip blocked vets or if vet data is not found
          if (vet.block === true || !vet.username) return;

          // Check for unread messages from vet to user
          const hasUnread = messageArray.some(
            msg => msg.receiverId === userId && msg.senderId === vetId && msg.seenByUser === false
          );

          chats.push({
            id: chatId,
            vetId,
            vetName: vet.username || 'Veterinarian',
            vetProfilePic: vet.profileImage || 'https://via.placeholder.com/40',
            lastMessage: latest.text,
            lastMessageTime: latest.timestamp,
            unread: hasUnread,
          });
        });
        setChats(chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime));
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractVetId = (chatId, userId) => {
    return chatId.replace(userId, '');
  };

  const handleChatPress = (vetId, vet) => {
    navigation.navigate('ChatScreen', { userId, vetId, vet });
  };

  const renderChatItem = ({ item }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 1000 }}
    >
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item.vetId, { vetId: item.vetId, username: item.vetName, profileImage: item.vetProfilePic })}
      >
        <LinearGradient
          colors={['#D3C0A8', '#E7D5BB']}
          style={styles.chatItemGradient}
        >
          <Image
            source={{ uri: item.vetProfilePic }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 15 }}
          />
          <View style={styles.chatInfo}>
            <Text style={styles.vetName}>{item.vetName}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            <Text style={styles.timestamp}>
              {item.lastMessageTime
                ? new Date(item.lastMessageTime).toLocaleString()
                : ''}
            </Text>
          </View>
          {item.unread && (
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: 'red', marginLeft: 10 }} />
          )}
          <Feather name="chevron-right" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#00796B" />
      <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Loading chats...</Text>
    </View>
  );

  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/5d/9c/3b/5d9c3bc727522ffdb01d9a33a77a4506.jpg',
      }}
      style={styles.background}
    >
      <View style={styles.container}>
        {chats.length > 0 ? (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
          />
        ) : (
          <View style={styles.noChatsContainer}>
            <Text style={styles.noChatsText}>No chat history found</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  chatList: {
    padding: 15,
  },
  chatItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  chatItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between',
  },
  chatInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#fff',
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
});

export default ChatHistory;
