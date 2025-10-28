import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

// Reusable profile avatar component
function ProfileAvatar({ uri, size = 40, style }) {
  if (uri && uri !== '' && uri !== 'https://via.placeholder.com/40') {
    return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
  }
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }, style]}>
      <Ionicons name="person" size={size * 0.6} color="#aaa" />
    </View>
  );
}

const ChatListScreen = ({ route }) => {
  const { vetId } = route.params;
  const { setHasUnseenMessages } = useContext(NotificationContext);
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messageListRef = useRef(null);
  const isFocused = useIsFocused();

  // Fetch conversations and update unseen messages
  const fetchData = async () => {
    try {
      const [usersRes, chatRes] = await Promise.all([
        fetch('https://pet-world-app123-default-rtdb.firebaseio.com/Users.json'),
        fetch('https://pet-world-app123-default-rtdb.firebaseio.com/chats.json')
      ]);

      const [usersData, chatData] = await Promise.all([
        usersRes.json(),
        chatRes.json()
      ]);

      if (chatData) {
        const chats = [];
        Object.entries(chatData).forEach(([chatId, messages]) => {
          const ids = chatId.split('_');
          if (!ids.includes(vetId)) return;

          const messageArray = Object.values(messages || {});
          if (messageArray.length === 0) return;

          const latest = messageArray.sort((a, b) => b.timestamp - a.timestamp)[0];
          const otherUserId = ids.find(id => id !== vetId);
          const otherUser = usersData?.[otherUserId] || {};
          chats.push({
            chatId,
            lastMessage: latest.text,
            timestamp: latest.timestamp,
            otherUserId,
            otherUserName: otherUser.username || 'Unknown',
            otherUserProfilePic: otherUser.profileImage || 'https://via.placeholder.com/40',
            unseen: latest.receiverId === vetId && latest.senderId !== vetId && !latest.seenByVet,
          });
        });

        setConversations(chats.sort((a, b) => b.timestamp - a.timestamp));
        setHasUnseenMessages(chats.some(chat => chat.unseen));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch on focus and poll every 2 seconds
  useEffect(() => {
    let interval;
    if (isFocused) {
      fetchData();
      interval = setInterval(fetchData, 2000);
    }
    return () => interval && clearInterval(interval);
  }, [isFocused]);

  // Mark messages as seen when opening chat
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    
    try {
      // Get all messages for this chat
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chat.chatId}.json`
      );
      const data = await response.json();
      
      if (data) {
        // Update each message that was sent to the vet and hasn't been seen
        const updates = {};
        Object.entries(data).forEach(([messageId, message]) => {
          if (message.receiverId === vetId && !message.seenByVet) {
            updates[messageId] = { ...message, seenByVet: true };
          }
        });

        // If there are messages to update
        if (Object.keys(updates).length > 0) {
          await fetch(
            `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chat.chatId}.json`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );
        }
      }
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };

  // Mark messages as read when chat is selected
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!selectedChat) return;
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${selectedChat.chatId}.json`
        );
        const data = await response.json();
        if (data) {
          const updates = {};
          Object.entries(data).forEach(([msgId, msg]) => {
            if (msg.receiverId === vetId && msg.seenByVet === false) {
              updates[msgId] = { ...msg, seenByVet: true };
            }
          });
          if (Object.keys(updates).length > 0) {
            await fetch(
              `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${selectedChat.chatId}.json`,
              {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
              }
            );
          }
        }
      } catch (error) {
        // Ignore errors for marking as read
      }
    };
    if (selectedChat && vetId) {
      markMessagesAsRead();
    }
  }, [selectedChat, vetId]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${selectedChat.chatId}.json`
        );
        const data = await response.json();

        if (data) {
          const msgsArray = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgsArray);
          setTimeout(() => messageListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 50);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedChat) return;

    const newMessage = {
      text: text.trim(),
      senderId: vetId,
      receiverId: selectedChat.otherUserId,
      timestamp: Date.now(),
      seenByVet: true, // Vet's messages are automatically marked as seen
      seenByUser: false, // Mark as unread for the user
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setText('');
    setTimeout(() => messageListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${selectedChat.chatId}.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the message if sending failed
      setMessages(prev => prev.filter(msg => msg.timestamp !== newMessage.timestamp));
    }
  };

  const formatTime = (timestamp) => 
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!selectedChat ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.chatId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chatCard, item.unseen && styles.unseenCard]}
              onPress={() => handleChatSelect(item)}
            >
              <View style={styles.chatCardContent}>
                <View style={styles.chatCardHeader}>
                  <TouchableOpacity onPress={() => navigation.navigate('PetParentOverview', { userId: item.otherUserId })}>
                    <ProfileAvatar uri={item.otherUserProfilePic} size={40} style={styles.profilePic} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('PetParentOverview', { userId: item.otherUserId })}>
                    <Text style={[styles.userName, item.unseen && styles.boldText]}>
                      {item.otherUserName}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                </View>
                <View style={styles.chatCardFooter}>
                  <Text 
                    style={[styles.lastMessage, item.unseen && styles.boldText]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.unseen && <View style={styles.unreadDot} />}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>&larr;</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PetParentOverview', { userId: selectedChat.otherUserId })}>
              <ProfileAvatar uri={selectedChat.otherUserProfilePic} size={40} style={styles.profilePic} />
            </TouchableOpacity>
            <Text style={styles.headerText}>{selectedChat.otherUserName}</Text>
          </View>

          <FlatList
            ref={messageListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.timestamp}_${index}`}
            renderItem={({ item }) => (
              <View style={[
                styles.messageContainer,
                item.senderId === vetId ? styles.myMessage : styles.theirMessage
              ]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => messageListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => messageListRef.current?.scrollToEnd({ animated: false })}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  chatCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  unseenCard: {
    backgroundColor: '#e0f7fa', // Light blue for unseen chats
  },
  chatCardContent: {
    flexDirection: 'column',
  },
  chatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  userName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  chatCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00796B',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: '#00796B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    elevation: 1,
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 10,
    color: '#777',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#00796B',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatListScreen;