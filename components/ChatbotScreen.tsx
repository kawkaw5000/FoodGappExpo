import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

interface Message {
  from: string;
  text: string;
  isWelcome?: boolean;
  isAction?: boolean;
  action?: () => void;
}

interface FAQ {
  question: string;
  answer: string;
  action?: () => void;
}

const ChatbotScreen = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Hi, how can I help you?', isWelcome: true }
  ]);
  const [showQuestions, setShowQuestions] = useState(true);
  const [inputText, setInputText] = useState('');
  const faqs: FAQ[] = [
    {
      question: 'How do I scan a food item?',
      answer: 'You can scan food by taking a picture or entering manually. Would you like me to take you to the scan page?',
      action: () => {
        router.push('/(scan)');
        onClose();
      }
    },
    {
      question: 'How can I track my meals?',
      answer: 'You can track meals in the food log. Would you like me to take you there?',
      action: () => {
        router.push('/(log)');
        onClose();
      }
    },
    {
      question: 'Where can I see my daily summary?',
      answer: 'Your daily summary is on the home screen showing calories and macros.',
      action: () => {
        router.push('/(home)');
        onClose();
      }
    },
    {
        question: 'How do I set my fitness goals?',
        answer: 'You can set fitness goals in your profile. Would you like me to take you there?',
        action: () => {
          router.push('/(profile)');
          onClose();
        }
    }
  ];

  const handleQuestionSelect = (faq: FAQ) => {
    const newMessages: Message[] = [
      ...messages,
      { from: 'user', text: faq.question },
      { from: 'bot', text: faq.answer }
    ];
    setMessages(newMessages);
    
    // If there's an action (navigation), show a "Take me there" button
    if (faq.action) {
      setTimeout(() => {
        const actionMessage: Message = {
          from: 'bot',
          text: 'Take me there',
          isAction: true,
          action: faq.action
        };
        setMessages(prev => [...prev, actionMessage]);
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chat support</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.chatHeader}>
        <View style={styles.profileContainer}>
          <View style={styles.profileIcon}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.profileName}>Wellnu Chatbot</Text>
        </View>
      </View>
      
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index}>
            {message.isWelcome && (
              <View style={styles.welcomeContainer}>
                <View style={styles.welcomeBubble}>
                  <Text style={styles.welcomeText}>{message.text}</Text>
                </View>
              </View>
            )}
            {!message.isWelcome && (
              <View style={message.from === 'bot' ? styles.chatBubbleBot : styles.chatBubbleUser}>
                <Text style={styles.chatText}>{message.text}</Text>
              </View>
            )}
            {message.isAction && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={message.action}
              >
                <Text style={styles.actionButtonText}>Take me there →</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
      
      {showQuestions && (
        <View style={styles.questionsContainer}>
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.questionButton} 
              onPress={() => handleQuestionSelect(faq)}
            >
              <Text style={styles.questionButtonText}>{faq.question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatHeader: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeBubble: {
    backgroundColor: '#FCB647',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  questionsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  questionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  questionButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBubbleUser: {
    backgroundColor: '#dcf8c6',
    padding: 12,
    borderRadius: 18,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    marginBottom: 10,
    marginLeft: 50,
  },
  chatBubbleBot: {
    backgroundColor: '#f1f0f0',
    padding: 12,
    borderRadius: 18,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    marginBottom: 10,
    marginRight: 50,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 15,
    marginLeft: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
