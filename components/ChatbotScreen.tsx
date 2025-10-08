import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';
import Config from '../constants/Config';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [showQuestions, setShowQuestions] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyChatsUsed, setDailyChatsUsed] = useState(0);
  const [canChat, setCanChat] = useState(true);

  // Check daily chat limit on component mount
  useEffect(() => {
    checkDailyChatLimit();
  }, []);

  const checkDailyChatLimit = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastChatDate = await AsyncStorage.getItem('lastChatDate');
      const chatCount = await AsyncStorage.getItem('dailyChatCount');
      
      if (lastChatDate === today) {
        const count = parseInt(chatCount || '0');
        setDailyChatsUsed(count);
        setCanChat(count < 10);
      } else {
        // New day, reset counter
        setDailyChatsUsed(0);
        setCanChat(true);
        await AsyncStorage.setItem('lastChatDate', today);
        await AsyncStorage.setItem('dailyChatCount', '0');
      }

      // Set welcome message based on chat availability
      const remainingChats = Math.max(0, 10 - (lastChatDate === today ? parseInt(chatCount || '0') : 0));
      const welcomeMessage = remainingChats > 0 
        ? `Hi! I'm your WellNu AI assistant powered by Google Gemini. I can help you with nutrition questions, meal planning, and fitness advice. You have ${remainingChats} free chats remaining today. How can I help you?`
        : `Hi! You've used all 10 free chats for today. Your chat limit will reset tomorrow. In the meantime, try our meal planning and food tracking features!`;
      
      setMessages([{ from: 'bot', text: welcomeMessage, isWelcome: true }]);
    } catch (error) {
      console.error('Error checking chat limit:', error);
      setMessages([{ from: 'bot', text: 'Hi! I\'m your WellNu AI assistant. How can I help you today?', isWelcome: true }]);
    }
  };
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

  // AI Chat Function using Backend Google Gemini
  const sendMessageToAI = async (userMessage: string) => {
    // Check daily limit first
    if (!canChat) {
      Alert.alert(
        'Daily Limit Reached', 
        'You\'ve used all 10 free chats for today. Your limit will reset tomorrow at midnight.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Add user message first
      setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
      
      // Check if question is health-related first
      if (!isHealthRelated(userMessage)) {
        setMessages(prev => [...prev, { from: 'bot', text: "I'm WellNu, your nutrition and fitness assistant! 🥗💪 I can only help with questions about food, nutrition, meal planning, exercise, and healthy living. Please ask me something related to your health and wellness journey!" }]);
        setIsLoading(false);
        return;
      }

      // Get user ID for conversation context
      const userId = await AsyncStorage.getItem('userId') || 'anonymous';

      // Log the request details just before sending
      const url = `${Config.PYTHON_BASE}/api/chat`;
      console.log(`[CHATBOT] Sending POST request to: ${url}`);
      console.log(`[CHATBOT] Body:`, JSON.stringify({ message: userMessage, userId: userId }, null, 2));

      // Call your backend Gemini API (use Python backend, not ASP.NET)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { from: 'bot', text: data.response }]);
        
        // Update daily chat counter
        await updateChatCounter();
      } else {
        throw new Error('No response from AI');
      }
      
    } catch (error) {
      console.error('AI Chat Error:', error);
      // Fallback to smart local responses if backend fails
      const fallbackResponse = getSmartAIResponse(userMessage);
      setMessages(prev => [...prev, { from: 'bot', text: fallbackResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatCounter = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newCount = dailyChatsUsed + 1;
      
      await AsyncStorage.setItem('dailyChatCount', newCount.toString());
      await AsyncStorage.setItem('lastChatDate', today);
      
      setDailyChatsUsed(newCount);
      setCanChat(newCount < 10);

      // Show remaining chats warning
      const remaining = 10 - newCount;
      if (remaining === 1) {
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'bot', text: `⚠️ You have ${remaining} free chat remaining today. Make it count!` }]);
        }, 1000);
      } else if (remaining === 0) {
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'bot', text: `✋ That was your last free chat for today! Your limit resets tomorrow. Keep exploring our meal planning and nutrition tracking features!` }]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating chat counter:', error);
    }
  };

  // Smart AI Response Generator (works offline)
  const getSmartAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Advanced pattern matching for more natural responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your WellNu nutrition assistant. I can help you with meal planning, nutrition advice, Filipino recipes, and fitness tips. What would you like to know?";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! I'm here to help you on your health and wellness journey. Feel free to ask me anything about nutrition or fitness!";
    }
    
    // Multi-keyword detection for better responses
    if ((lowerMessage.includes('lose') || lowerMessage.includes('weight loss')) && lowerMessage.includes('fast')) {
      return "For safe and sustainable weight loss, aim for 1-2 pounds per week. Focus on balanced Filipino meals like grilled fish with vegetables, limit processed foods, and stay active. Quick fixes often lead to regaining weight. Would you like specific meal suggestions?";
    }
    
    if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy')) {
      return "During pregnancy, focus on nutrient-rich Filipino foods like malunggay, fish, eggs, and fresh fruits. Avoid raw fish and limit caffeine. Always consult your doctor for personalized nutrition advice during pregnancy.";
    }
    
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('diabetic')) {
      return "For diabetes management, choose brown rice over white rice, include fiber-rich vegetables like ampalaya and malunggay, opt for lean proteins like fish, and limit sugary foods. Monitor portion sizes and eat regular meals.";
    }
    
    if (lowerMessage.includes('hypertension') || lowerMessage.includes('high blood pressure')) {
      return "To manage blood pressure, reduce sodium by limiting processed foods and bagoong, increase potassium with bananas and leafy greens, choose herbs and spices over salt for flavoring, and maintain a healthy weight.";
    }
    
    if (lowerMessage.includes('muscle') && (lowerMessage.includes('build') || lowerMessage.includes('gain'))) {
      return "To build muscle, eat protein-rich foods like fish, chicken, eggs, and beans with each meal. Include strength training exercises, get adequate rest, and ensure you're eating enough calories to support muscle growth.";
    }
    
    // Use the existing fallback system for other cases
    return getFallbackResponse(message);
  };

  // Check if question is health/nutrition related
  const isHealthRelated = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const healthKeywords = [
      'food', 'foods', 'nutrition', 'calorie', 'calories', 'protein', 'fat', 'carb', 'carbs', 
      'vitamin', 'mineral', 'diet', 'meal', 'meals', 'eat', 'eating', 'recipe', 'cook', 'cooking',
      'exercise', 'workout', 'fitness', 'weight', 'lose', 'gain', 'health', 'healthy',
      'sugar', 'diabetes', 'blood', 'pressure', 'cholesterol', 'body', 'muscle',
      'rice', 'chicken', 'fish', 'vegetable', 'fruit', 'adobo', 'sinigang', 'pinakbet',
      'bangus', 'tilapia', 'kangkong', 'ampalaya', 'mango', 'banana', 'wellnu', 'app',
      // Add more common words that might be in health questions
      'breakfast', 'lunch', 'dinner', 'snack', 'good', 'best', 'should', 'can', 'what',
      'how', 'why', 'when', 'where', 'recommend', 'suggestion', 'advice', 'help',
      'hungry', 'full', 'portion', 'serving', 'gram', 'cup', 'tablespoon'
    ];
    
    return healthKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Fallback responses for common nutrition questions
  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Check if question is off-topic
    if (!isHealthRelated(message)) {
      return "I'm WellNu, your nutrition and fitness assistant! 🥗💪 I can only help with questions about food, nutrition, meal planning, exercise, and healthy living. Please ask me something related to your health and wellness journey!";
    }
    
    if (lowerMessage.includes('calorie') || lowerMessage.includes('calories')) {
      return 'For healthy weight management, focus on balanced meals with lean proteins, vegetables, and whole grains. Filipino favorites like grilled fish, pinakbet, and brown rice are great choices!';
    }
    if (lowerMessage.includes('protein')) {
      return 'Great protein sources include fish (bangus, tilapia), chicken breast, eggs, and legumes like munggo. Aim for protein at every meal!';
    }
    if (lowerMessage.includes('meal plan') || lowerMessage.includes('diet')) {
      return 'A balanced Filipino meal plan includes: rice/quinoa, lean protein (fish/chicken), vegetables (kangkong, ampalaya), and fruits (mango, banana). Try our meal planning feature!';
    }
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return 'Combine cardio (walking, dancing) with strength training. Even 30 minutes of daily activity helps! Check our exercise suggestions feature.';
    }
    if (lowerMessage.includes('weight') || lowerMessage.includes('lose')) {
      return 'Focus on creating a small calorie deficit through balanced eating and regular activity. Sustainable weight loss is 1-2 lbs per week.';
    }
    if (lowerMessage.includes('sugar') || lowerMessage.includes('diabetes')) {
      return 'Limit added sugars and choose complex carbs like brown rice. Include fiber-rich vegetables and monitor portion sizes.';
    }
    if (lowerMessage.includes('app') || lowerMessage.includes('wellnu') || lowerMessage.includes('feature')) {
      return 'WellNu helps you track nutrition, plan meals, scan foods, and reach fitness goals! Try our meal planning, food logging, and exercise suggestion features.';
    }
    
    if (lowerMessage.includes('fiber') || lowerMessage.includes('digestion')) {
      return 'Great fiber sources include brown rice, oats, fruits like guava and apple, and vegetables like kangkong and malunggay. Fiber helps with digestion and keeps you feeling full longer!';
    }
    
    if (lowerMessage.includes('heart') || lowerMessage.includes('cardiovascular')) {
      return 'For heart health, include omega-3 rich fish like bangus and tuna, limit saturated fats, eat plenty of vegetables and fruits, and stay physically active with regular exercise.';
    }
    
    if (lowerMessage.includes('energy') || lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
      return 'For sustained energy, eat balanced meals with complex carbs (brown rice, oats), lean proteins, and healthy fats. Stay hydrated, get enough sleep, and consider iron-rich foods if you feel constantly tired.';
    }
    
    if (lowerMessage.includes('snack') || lowerMessage.includes('hungry')) {
      return 'Healthy Filipino snacks include fresh fruits (banana, mango), nuts, boiled sweet potato, or greek yogurt with berries. Choose snacks with protein and fiber to keep you satisfied longer!';
    }
    
    return 'I can help you with nutrition, meal planning, Filipino healthy recipes, exercise tips, and wellness advice. What specific area would you like guidance on?';
  };

  const handleSendMessage = () => {
    if (inputText.trim() && canChat && !isLoading) {
      setShowQuestions(false); // Hide FAQ buttons after first message
      sendMessageToAI(inputText.trim());
      setInputText('');
    }
  };

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
          style={[styles.textInput, !canChat && styles.textInputDisabled]}
          placeholder={canChat ? "Ask me about nutrition, meals, or fitness..." : "Daily limit reached - Try tomorrow!"}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
          multiline={false}
          returnKeyType="send"
          editable={canChat && !isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (isLoading || !canChat) && styles.sendButtonDisabled
          ]} 
          onPress={handleSendMessage}
          disabled={isLoading || !canChat}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : !canChat ? (
            <Ionicons name="lock-closed" size={20} color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Chat limit indicator */}
      <View style={styles.chatLimitIndicator}>
        <Text style={styles.chatLimitText}>
          Daily chats: {dailyChatsUsed}/10 free chats used
        </Text>
        {!canChat && (
          <Text style={styles.chatLimitWarning}>
            ⏰ Resets tomorrow at midnight
          </Text>
        )}
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
  sendButtonDisabled: {
    opacity: 0.6,
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  chatLimitIndicator: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  chatLimitText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chatLimitWarning: {
    fontSize: 11,
    color: '#ff6b6b',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default ChatbotScreen;
