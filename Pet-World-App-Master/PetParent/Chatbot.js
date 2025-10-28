import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView  
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { colors } from '../theme/colors';

const GEMINI_API_KEY = 'AIzaSyBPfrNZh-B4cbUG-Rlu6kfx5n6pTbhDKCQ';
const FIREBASE_DB_URL = 'https://pet-world-app123-default-rtdb.firebaseio.com';

// Use a modern, high-quality pet-themed static background photo
const backgroundImage = { uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80' }; // Unsplash: dog and cat
// Change the logo to a new, modern pet-themed logo (replace with your own if you have one)
const logoImage = require('../assets/1.png');

const Chatbot = ({ route }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleTextChange = (text) => {
    // Sanitize input to allow only letters, numbers, and basic punctuation.
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s.,?!'-]/g, '');
    setInputText(sanitizedText);
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${FIREBASE_DB_URL}/Users/${userId}/Chat.json`);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { text: inputText, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    await saveMessagesToFirebase(updatedMessages);

    try {
      const systemInstruction =
        "You are ChatPaw, a highly knowledgeable pet expert specializing exclusively in cats and dogs. " +
        "Your primary role is to provide helpful, accurate, and engaging information related to the care and well-being of these pets. " +
        "Your responses should be warm, friendly, and professional, always encouraging responsible pet ownership.\n\n" +
        "### Guidelines for Responses:\n" +
        "- **Greet users warmly** and encourage them to ask about their pet cat or dog.\n" +
        "- **Stay strictly within the scope of expertise**, covering only:\n" +
        "  - Cat and dog care (daily routines, grooming, general well-being)\n" +
        "  - Behavior (understanding body language, socialization, common behavioral issues)\n" +
        "  - Health (common illnesses, symptoms, veterinary care recommendations)\n" +
        "  - Training (obedience, potty training, behavioral corrections)\n" +
        "  - Breeds (characteristics, temperament, suitability for owners)\n" +
        "  - Nutrition (diet recommendations, safe and unsafe foods, feeding schedules)\n\n" +
        "### Handling Unrelated Questions:\n" +
        "- If asked about **animals other than cats or dogs**, respond with: " +
        "  'I specialize only in cats and dogs. How can I assist you with your pet?'\n" +
        "- If asked about **general knowledge, unrelated topics, or anything beyond your expertise**, reply with: " +
        "  'My expertise is solely in cats and dogs. Let me know how I can help with your furry friend!'\n\n" +
        "### Encouragement:\n" +
        "- Always prompt users to ask specific questions about their cat or dog.\n" +
        "- If a user greets you, respond in a friendly manner while guiding them toward discussing their pet.\n\n" +
        "### User Question:\n" +
        "User input: " + inputText;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: systemInstruction,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let botResponseText = response.data.candidates[0].content.parts[0].text;

      const cleanedBotResponse = botResponseText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#+\s*/g, '')
        .replace(/\n\s*\n/g, '\n')
        .replace(/-\s*/g, '• ')
        .trim();

      const botMessage = { text: cleanedBotResponse, sender: 'bot' };
      const updatedMessagesWithBot = [...updatedMessages, botMessage];
      setMessages(updatedMessagesWithBot);

      await saveMessagesToFirebase(updatedMessagesWithBot);
    } catch (error) {
      console.error('Error fetching response from Gemini:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessagesToFirebase = async (messages) => {
    try {
      await axios.put(`${FIREBASE_DB_URL}/Users/${userId}/Chat.json`, messages);
    } catch (error) {
      console.error('Error saving messages to Firebase:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.logoContainer}>
      <Text style={styles.chatbotText}>ChatPaw</Text>
      <View style={{ height: 16 }} />
      <Image source={logoImage} style={styles.logo} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
          {/* Overlay for better contrast */}
          <View style={styles.overlay} />
          <View style={styles.container}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
                  {item.sender === 'bot' && (
                    <View style={styles.catEars}>
                      <Text style={styles.catEarLeft}>🐱</Text>
                      <Text style={styles.catEarRight}>🐱</Text>
                    </View>
                  )}
                  <View style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                  {item.sender === 'bot' && (
                    <View style={styles.whiskers}>
                      <Text style={styles.whiskerLeft}>╱╱</Text>
                      <Text style={styles.whiskerRight}>╲╲</Text>
                    </View>
                  )}
                </View>
              )}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              contentContainerStyle={[styles.flatListContent, { paddingBottom: 120 }]}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={
                isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : null
              }
            />

            <View style={styles.inputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  ref={textInputRef}
                  style={styles.input}
                  value={inputText}
                  onChangeText={handleTextChange}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  maxLength={1000}
                />
                <Text style={styles.charCounter}>{inputText.length} / 1000</Text>
              </View>
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading} activeOpacity={0.7}>
                <Icon name="send" size={24} color={colors.primary} style={styles.sendIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
  },
  container: {
    flex: 1,
    zIndex: 2,
  },
  chatbotText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 0,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  logo: {
    width: 220,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  flatListContent: {
    paddingBottom: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderTopWidth: 0,
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  textInputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    fontSize: 16,
    opacity: 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    paddingRight: 8,
  },
  sendButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginLeft: 2,
  },
  sendIcon: {
    transform: [{ rotate: '-10deg' }],
  },
  userMessageContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  botMessageContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  userMessage: {
    backgroundColor: 'rgba(0,122,255,0.85)',
    padding: 14,
    borderRadius: 22,
    maxWidth: '80%',
    borderTopRightRadius: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  botMessage: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 14,
    borderRadius: 22,
    maxWidth: '80%',
    position: 'relative',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  catEars: {
    flexDirection: 'row',
    position: 'absolute',
    top: -20,
    left: 10,
  },
  catEarLeft: {
    fontSize: 24,
    transform: [{ rotate: '-30deg' }],
  },
  catEarRight: {
    fontSize: 24,
    transform: [{ rotate: '30deg' }],
    marginLeft: -10,
  },
  whiskers: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -10,
    left: 10,
  },
  whiskerLeft: {
    fontSize: 16,
    transform: [{ rotate: '-20deg' }],
    marginRight: 5,
  },
  whiskerRight: {
    fontSize: 16,
    transform: [{ rotate: '20deg' }],
    marginLeft: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default Chatbot;
