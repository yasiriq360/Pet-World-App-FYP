import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';

const UserChatScreen = ({ route }) => {
  const { userId, vetId, vet } = route.params;
  const chatId = [userId, vetId].sort().join('_');

  const currentUserId = userId;
  const otherUserId = vetId;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const flatListRef = useRef();
  const abortControllerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chatId}.json`
      );

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      if (data) {
        const msgsArray = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
       
        // Always update messages to ensure real-time sync
        setMessages(msgsArray);
       
        if (msgsArray.length > 0) {
          const latestMessage = msgsArray[msgsArray.length - 1];
          if (latestMessage.timestamp > lastMessageTimestamp) {
            setLastMessageTimestamp(latestMessage.timestamp);
           
            // Scroll to bottom for new messages
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [chatId, lastMessageTimestamp]);

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chatId}.json`
        );

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        if (data) {
          const msgsArray = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgsArray);
          if (msgsArray.length > 0) {
            setLastMessageTimestamp(msgsArray[msgsArray.length - 1].timestamp);
          }
        }
      } catch (error) {
        console.error('Error fetching initial messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialFetch();

    // Clean up any existing polling interval
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [chatId]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        const response = await fetch(
          `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chatId}.json`
        );
        const data = await response.json();
        if (data) {
          const updates = {};
          Object.entries(data).forEach(([msgId, msg]) => {
            if (msg.receiverId === currentUserId && msg.seenByUser === false) {
              updates[msgId] = { ...msg, seenByUser: true };
            }
          });
          if (Object.keys(updates).length > 0) {
            await fetch(
              `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chatId}.json`,
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
    if (chatId && currentUserId) {
      markMessagesAsRead();
    }
  }, [chatId, currentUserId]);

  // Set up polling with useEffect
  useEffect(() => {
    if (!isLoading) {
      // Clear any existing interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      // Start new polling interval
      pollIntervalRef.current = setInterval(fetchMessages, 1000);

      // Cleanup on unmount
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [fetchMessages, isLoading]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const newMessage = {
      text: text.trim(),
      senderId: currentUserId,
      receiverId: otherUserId,
      timestamp: Date.now(),
      seenByVet: false, // Mark as unread for the vet
    };

    try {
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/chats/${chatId}.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      // Immediately add the new message to the state
      setMessages(prev => [...prev, newMessage]);
      setLastMessageTimestamp(newMessage.timestamp);
      setText('');
     
      // Fetch messages immediately after sending
      fetchMessages();
     
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderItem = ({ item }) => {
    const isSender = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: vet.profileImage || 'https://via.placeholder.com/40' }} style={styles.profilePic} />
        <Text style={styles.headerText}>Dr {vet.username || 'Vet'}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item.timestamp}_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          style={styles.flatList}
        />

        <View style={[styles.inputContainer, { marginBottom: keyboardOffset > 0 ? keyboardOffset - (Platform.OS === 'ios' ? 0 : 25) : 0 }]}>
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
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 15,
    backgroundColor: '#00796B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
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
  flatList: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 15, // Extra padding at the bottom
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

export default UserChatScreen;