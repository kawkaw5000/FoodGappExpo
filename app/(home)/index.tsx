import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import GetStarted from "./getStarted";
import { Ionicons } from '@expo/vector-icons';
import ChatbotScreen from "@/components/ChatbotScreen";
import ShareModal from "@/components/ShareModal";
import ExerciseSuggestions from "@/components/ExerciseSuggestions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserExperienceService, { UserLevel } from "@/services/UserExperienceService";
import { LevelBadge } from "@/components/LevelBadge";
import { ShareData } from "@/services/SocialSharingService";
import Config from "@/constants/Config";

// WellNū Study: Basic nutrition insights interface
interface NutritionInsight {
  type: 'deficiency' | 'recommendation' | 'achievement';
  message: string;
  priority: 'low' | 'medium' | 'high';
  nutrient?: string;
}

// WellNū Study: Daily nutrition summary interface
interface DailyNutritionSummary {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  fiber: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  goalCalories: number;
}

// WellNū Study: User profile for personalized recommendations
interface UserProfile {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  bodyGoal?: string;
  bmi?: number;
}

// WellNū Study: Educational content interface
interface EducationContent {
  topic: string;
  title: string;
  content: string;
  tips: string[];
  localFoods: string[];
}

// WellNū Study: Meal suggestion interface
interface MealSuggestion {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  ingredients: string[];
  isLocal: boolean;
  nutritionScore: number;
  reason: string;
  cookingTime: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  // Navigation state
  const currentRoute = "/(home)";
  const handleNav = (route: string) => {
    if (route !== currentRoute) router.replace(route as any);
  };

  // Basic app state
  const [getStartedStep, setGetStartedStep] = useState(0);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [exerciseSuggestionsVisible, setExerciseSuggestionsVisible] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  // WellNū Study: Nutrition insights state
  const [nutritionInsights, setNutritionInsights] = useState<NutritionInsight[]>([]);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionSummary | null>(null);
  const [realCalorieData, setRealCalorieData] = useState({ consumed: 362, goal: 1925, remaining: 1563 });
  
  // WellNū Study: Education and personalization state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [currentEducationContent, setCurrentEducationContent] = useState<EducationContent | null>(null);
  
  // WellNū Study: Meal suggestions state
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestion[]>([]);

  // Load user data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadUserLevel();
      loadUserData();
    }, [])
  );

  const loadUserLevel = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userLevel = await UserExperienceService.getUserLevel(userId);
        setUserLevel(userLevel);
      }
    } catch (error) {
      console.error('Error loading user level:', error);
    }
  };
  // ...existing code...
  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        // Fetch real user profile for name
        const response = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          const userInfo = data.userInfo || data;
          setUserName(`${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim());
        } else {
          setUserName('');
        }
        // WellNū Study: Load core features
        loadNutritionInsights(userId);
        loadUserProfile(userId);
        loadPersonalizedMealSuggestions(userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserName('');
    }
  };

  // WellNū Study: Load nutrition insights
  const loadNutritionInsights = async (userId: string) => {
    try {
      await loadRealNutritionData(userId);
    } catch (error) {
      console.error('Error loading nutrition insights:', error);
      loadMockInsights();
    }
  };

  // WellNū Study: Load real nutrition data from user's logged foods
  const loadRealNutritionData = async (userId: string) => {
    try {
      const response = await fetch(`${Config.API_BASE}/api/foodlogging/getUserLogs?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const todayLogs = data.logs || [];
        
        const nutritionTotals = calculateNutritionTotals(todayLogs);
        setDailyNutrition(nutritionTotals);
        
        setRealCalorieData({
          consumed: nutritionTotals.calories,
          goal: nutritionTotals.goalCalories,
          remaining: Math.max(0, nutritionTotals.goalCalories - nutritionTotals.calories)
        });
        
        const insights = generateSmartInsights(nutritionTotals);
        setNutritionInsights(insights);
      }
    } catch (error) {
      console.error('Error loading real nutrition data:', error);
      loadMockInsights();
    }
  };

  // WellNū Study: Calculate nutrition totals from logged foods
  const calculateNutritionTotals = (logs: any[]): DailyNutritionSummary => {
    const totals = logs.reduce((acc, log) => {
      if (log.nutrientData) {
        acc.calories += parseInt(log.nutrientData.calories) || 0;
        acc.protein += parseFloat(log.nutrientData.protein) || 0;
        acc.fats += parseFloat(log.nutrientData.fat) || 0;
        acc.carbs += parseFloat(log.nutrientData.carbohydrates) || 0;
        acc.fiber += parseFloat(log.nutrientData.fiber) || 0;
        acc.calcium += parseFloat(log.nutrientData.calcium) || 0;
        acc.iron += parseFloat(log.nutrientData.iron) || 0;
        acc.vitaminC += parseFloat(log.nutrientData.vitaminC) || 0;
      }
      return acc;
    }, {
      calories: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
      fiber: 0,
      calcium: 0,
      iron: 0,
      vitaminC: 0,
      goalCalories: 1925
    });
    return totals;
  };

  // WellNū Study: Generate smart insights based on real nutrition data
  const generateSmartInsights = (nutrition: DailyNutritionSummary): NutritionInsight[] => {
    if (userProfile) {
      return generatePersonalizedInsights(nutrition, userProfile);
    }

    const insights: NutritionInsight[] = [];
    
    if (nutrition.calories < nutrition.goalCalories * 0.5) {
      insights.push({
        type: 'recommendation',
        message: `You're at ${nutrition.calories} calories today. Consider adding a healthy snack to reach your goal!`,
        priority: 'medium',
        nutrient: 'calories'
      });
    }
    
    if (nutrition.protein < 50) {
      insights.push({
        type: 'deficiency',
        message: 'Your protein intake is low today. Try adding eggs, fish, or beans to your next meal.',
        priority: 'high',
        nutrient: 'protein'
      });
    }
    
    if (nutrition.calories >= nutrition.goalCalories * 0.8 && nutrition.protein >= 50) {
      insights.push({
        type: 'achievement',
        message: 'Great job! You\'re on track with your nutrition goals today! 🎉',
        priority: 'low',
        nutrient: 'overall'
      });
    }
    
    return insights.slice(0, 1);
  };

  // WellNū Study: Fallback mock insights if API fails
  const loadMockInsights = () => {
    const mockInsights: NutritionInsight[] = [
      {
        type: 'recommendation',
        message: 'Try adding more vegetables to reach your fiber goals!',
        priority: 'medium',
        nutrient: 'fiber'
      }
    ];
    setNutritionInsights(mockInsights);
  };

  // WellNū Study: Load user profile for personalized recommendations
  const loadUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const userInfo = data.userInfo || data;
        
        let bmi = undefined;
        if (userInfo.height && userInfo.weight) {
          const heightInMeters = userInfo.height / 100;
          bmi = Math.round((userInfo.weight / (heightInMeters * heightInMeters)) * 10) / 10;
        }

        // Map bodyGoalId to actual goal string
        const getBodyGoalText = (goalId: any): string => {
          switch (goalId) {
            case 1:
            case '1':
              return 'Lose Weight';
            case 2:
            case '2':
              return 'Gain Weight';
            case 3:
            case '3':
              return 'Maintain Weight';
            case 4:
            case '4':
              return 'Build Muscle';
            default:
              return 'General Fitness';
          }
        };

        const profile: UserProfile = {
          age: userInfo.age,
          gender: userInfo.gender,
          weight: userInfo.weight,
          height: userInfo.height,
          bodyGoal: getBodyGoalText(userInfo.bodyGoalId || userInfo.bodyGoal),
          bmi: bmi
        };

        setUserProfile(profile);
        console.log('User Profile Loaded:', profile); // Debug log
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // WellNū Study: Enhanced smart insights with personalized recommendations
  const generatePersonalizedInsights = (nutrition: DailyNutritionSummary, profile: UserProfile): NutritionInsight[] => {
    const insights: NutritionInsight[] = [];
    
    if (profile.bmi && profile.bodyGoal) {
      if (profile.bmi < 18.5 && nutrition.calories < nutrition.goalCalories * 0.7) {
        insights.push({
          type: 'recommendation',
          message: `With a BMI of ${profile.bmi}, consider adding healthy fats like nuts or avocado to gain weight safely.`,
          priority: 'high',
          nutrient: 'calories'
        });
      } else if (profile.bmi > 25 && nutrition.calories > nutrition.goalCalories * 1.2) {
        insights.push({
          type: 'deficiency',
          message: 'You might be exceeding your calorie goal. Try replacing rice with more vegetables.',
          priority: 'medium',
          nutrient: 'calories'
        });
      }
    }

    if (profile.age && profile.age > 50 && nutrition.calcium < 20) {
      insights.push({
        type: 'deficiency',
        message: 'At your age, calcium is important for bone health. Try adding more dairy or green leafy vegetables.',
        priority: 'high',
        nutrient: 'calcium'
      });
    }

    if (nutrition.protein < 30) {
      insights.push({
        type: 'recommendation',
        message: 'Add more protein with Filipino favorites like tinapa, tokwa, or monggo beans.',
        priority: 'medium',
        nutrient: 'protein'
      });
    }

    return insights.slice(0, 1);
  };

  // WellNū Study: Load personalized meal suggestions
  const loadPersonalizedMealSuggestions = async (userId: string) => {
    try {
      const suggestions: MealSuggestion[] = [];

      if (userProfile) {
        if (userProfile.bmi && userProfile.bmi < 18.5) {
          suggestions.push({
            id: '1',
            name: 'Champorado with Dried Fish',
            category: 'breakfast',
            calories: 420,
            protein: 18,
            ingredients: ['Sticky rice', 'Cocoa', 'Milk', 'Tuyo'],
            isLocal: true,
            nutritionScore: 85,
            reason: 'High in calories and protein to help with healthy weight gain',
            cookingTime: 25
          });
        } else {
          suggestions.push({
            id: '2',
            name: 'Malunggay Scrambled Eggs',
            category: 'breakfast',
            calories: 280,
            protein: 22,
            ingredients: ['Eggs', 'Malunggay leaves', 'Tomatoes', 'Onions'],
            isLocal: true,
            nutritionScore: 90,
            reason: 'Rich in iron and vitamins for balanced nutrition',
            cookingTime: 15
          });
        }
        
        if (dailyNutrition && dailyNutrition.protein < 30) {
          suggestions.push({
            id: '3',
            name: 'Tinolang Manok with Extra Sayote',
            category: 'lunch',
            calories: 380,
            protein: 35,
            ingredients: ['Chicken', 'Sayote', 'Malunggay', 'Lemongrass', 'Ginger'],
            isLocal: true,
            nutritionScore: 88,
            reason: 'High protein content to meet daily protein needs',
            cookingTime: 45
          });
        }
        
        suggestions.push({
          id: '4',
          name: 'Grilled Bangus with Pinakbet',
          category: 'dinner',
          calories: 340,
          protein: 28,
          ingredients: ['Bangus', 'Eggplant', 'Okra', 'Sitaw', 'Bagoong'],
          isLocal: true,
          nutritionScore: 92,
          reason: 'Complete local meal with vegetables and lean protein',
          cookingTime: 30
        });
      }
      
      setMealSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating meal suggestions:', error);
    }
  };

  // WellNū Study: Show educational content
  const showEducationalContent = (topic: string) => {
    const educationContent = getEducationalContent(topic);
    setCurrentEducationContent(educationContent);
    setShowEducationModal(true);
  };

  // WellNū Study: Get educational content based on topic
  const getEducationalContent = (topic: string): EducationContent => {
    const contentMap: Record<string, EducationContent> = {
      'protein': {
        topic: 'protein',
        title: 'Understanding Protein',
        content: 'Protein is essential for building and repairing muscles, especially important in Filipino diets. Your body needs protein every day since it cannot store it like fats or carbohydrates.',
        tips: [
          'Aim for protein at every meal',
          'Combine rice with beans for complete protein',
          'Choose lean meats and fish when possible',
          'Don\'t forget plant proteins like tofu and nuts'
        ],
        localFoods: ['Bangus (Milkfish)', 'Tokwa (Tofu)', 'Monggo beans', 'Tinapa (Smoked fish)', 'Itlog (Eggs)', 'Manok (Chicken)']
      },
      'fiber': {
        topic: 'fiber',
        title: 'Fiber for Better Health',
        content: 'Fiber helps with digestion and keeps you feeling full longer. Many Filipinos don\'t get enough fiber, but local vegetables and fruits are great sources.',
        tips: [
          'Eat the skin of fruits like apple and pear',
          'Choose brown rice over white rice',
          'Add vegetables to every meal',
          'Snack on fruits instead of processed foods'
        ],
        localFoods: ['Kangkong', 'Malunggay', 'Sitaw (String beans)', 'Ampalaya', 'Saging (Banana)', 'Kamote (Sweet potato)']
      },
      'vitamins': {
        topic: 'vitamins',
        title: 'Essential Vitamins',
        content: 'Vitamins support your immune system and overall health. The tropical climate in Cebu provides access to vitamin-rich fruits and vegetables year-round.',
        tips: [
          'Eat colorful fruits and vegetables',
          'Get some sunlight for Vitamin D',
          'Include citrus fruits for Vitamin C',
          'Dark leafy greens provide many vitamins'
        ],
        localFoods: ['Calamansi', 'Mango', 'Papaya', 'Malunggay leaves', 'Pechay', 'Carrots']
      }
    };

    return contentMap[topic] || contentMap['protein'];
  };

  // Removed duplicate and invalid userLevel assignment. Use only the userLevel state from backend.
  
  const getShareData = (): ShareData => ({
    calories: realCalorieData.consumed,
    goal: realCalorieData.goal,
    remaining: realCalorieData.remaining,
    protein: dailyNutrition?.protein || 31,
    fats: dailyNutrition?.fats || 27,
    carbs: dailyNutrition?.carbs || 2,
    date: new Date().toLocaleDateString(),
    userName: userName,
    level: userLevel?.level,
    badge: userLevel?.badge,
  });

  const getStartedSteps = [
    {
      title: "Set Your Goal",
      description: "Choose your body goal to personalize your experience.",
      icon: require("../../assets/images/GetStarted Icons/TargetLogo.png"),
    },
    {
      title: "Enter Your Weight",
      description: "Track your weight for better recommendations.",
      icon: require("../../assets/images/GetStarted Icons/WeightLogo.png"),
    },
    {
      title: "Enter Your Height",
      description: "Height helps us calculate your BMI.",
      icon: require("../../assets/images/GetStarted Icons/HeightLogo.png"),
    },
    {
      title: "Start Exercising",
      description: "Add your exercise routines to get started!",
      icon: require("../../assets/images/GetStarted Icons/ExerciseLogo.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateText}>July 15, 2025</Text>
          {userLevel && (
            <View style={styles.userLevelContainer}>
              <LevelBadge
                level={userLevel.level}
                badge={userLevel.badge}
                title={userLevel.title}
                size="small"
              />
              <Text style={styles.userLevelText}>{userLevel.title}</Text>
              <Text style={styles.userLevelText}>{userName}</Text>
              {userProfile?.bmi && (
                <Text style={styles.bmiText}>BMI: {userProfile.bmi}</Text>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setShareModalVisible(true)}>
          <Ionicons name="share-social-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Calorie Summary */}
        <View style={styles.mainSummary}>
          <View style={styles.calorieCircleContainer}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieNumber}>{realCalorieData.consumed}</Text>
              <Text style={styles.calorieLabel}>cal</Text>
            </View>
            <View style={styles.goalContainer}>
              <Text style={styles.goalNumber}>{realCalorieData.goal.toLocaleString()}</Text>
              <Text style={styles.goalLabel}>kcal</Text>
            </View>
            <View style={styles.remainingContainer}>
              <Text style={styles.remainingNumber}>{realCalorieData.remaining.toLocaleString()}</Text>
              <Text style={styles.remainingLabel}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Macros Row */}
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(dailyNutrition?.protein || 31)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(dailyNutrition?.fats || 27)}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(dailyNutrition?.carbs || 2)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
        </View>

        {/* Exercise Section */}
        <View style={styles.exerciseSection}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>Exercise</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.exerciseSuggestionButton}
            onPress={() => setExerciseSuggestionsVisible(true)}
          >
            <View style={styles.exerciseButtonContent}>
              <Ionicons name="fitness" size={24} color="#FCB647" />
              <Text style={styles.exerciseButtonText}>Get Exercise Suggestions</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
            <Text style={styles.exerciseSubtext}>
              Personalized based on your {userProfile?.bodyGoal || 'fitness goals'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* WellNū Study: Smart Nutrition Insights Card */}
        {nutritionInsights.length > 0 && (
          <View style={[
            styles.nutritionInsightsCard,
            nutritionInsights[0].type === 'achievement' && styles.achievementCard,
            nutritionInsights[0].type === 'deficiency' && styles.deficiencyCard
          ]}>
            <View style={styles.insightHeader}>
              <Ionicons 
                name={
                  nutritionInsights[0].type === 'achievement' ? 'trophy' :
                  nutritionInsights[0].type === 'deficiency' ? 'warning' : 'nutrition'
                } 
                size={20} 
                color={
                  nutritionInsights[0].type === 'achievement' ? '#FF9800' :
                  nutritionInsights[0].type === 'deficiency' ? '#FF5722' : '#4CAF50'
                } 
              />
              <Text style={styles.insightTitle}>
                {nutritionInsights[0].type === 'achievement' ? 'Great Progress!' :
                 nutritionInsights[0].type === 'deficiency' ? 'Nutrition Alert' : 'Nutrition Tip'}
              </Text>
              {dailyNutrition && (
                <Text style={styles.insightProgress}>
                  {Math.round((realCalorieData.consumed / realCalorieData.goal) * 100)}%
                </Text>
              )}
            </View>
            <Text style={styles.insightMessage}>{nutritionInsights[0].message}</Text>
            <View style={styles.insightActions}>
              <TouchableOpacity 
                style={[styles.insightDismiss, {
                  backgroundColor: nutritionInsights[0].type === 'achievement' ? '#FF9800' :
                                 nutritionInsights[0].type === 'deficiency' ? '#FF5722' : '#4CAF50'
                }]}
                onPress={() => setNutritionInsights([])}
              >
                <Text style={styles.insightDismissText}>
                  {nutritionInsights[0].type === 'achievement' ? 'Awesome!' : 'Got it!'}
                </Text>
              </TouchableOpacity>
              
              {nutritionInsights[0].nutrient && nutritionInsights[0].nutrient !== 'overall' && (
                <TouchableOpacity 
                  style={styles.learnMoreButton}
                  onPress={() => showEducationalContent(nutritionInsights[0].nutrient!)}
                >
                  <Text style={styles.learnMoreText}>Learn More</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* WellNū Study: Meal Suggestions Preview */}
        {mealSuggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.sectionTitle}>🍽️ Meal Suggestions</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.suggestionPreview}>
              <Text style={styles.suggestionName}>{mealSuggestions[0].name}</Text>
              <Text style={styles.suggestionReason}>{mealSuggestions[0].reason}</Text>
              <Text style={styles.suggestionDetails}>
                {mealSuggestions[0].calories} cal • {mealSuggestions[0].protein}g protein • {mealSuggestions[0].cookingTime} min
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <TouchableOpacity style={styles.chatbotButton} onPress={() => setChatbotVisible(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={chatbotVisible}
        onRequestClose={() => setChatbotVisible(!chatbotVisible)}
      >
        <ChatbotScreen onClose={() => setChatbotVisible(false)} />
      </Modal>

      <ShareModal 
        visible={shareModalVisible} 
        onClose={() => setShareModalVisible(false)} 
        shareData={getShareData()}
      />

      <ExerciseSuggestions 
        visible={exerciseSuggestionsVisible}
        onClose={() => setExerciseSuggestionsVisible(false)}
        bodyGoal={userProfile?.bodyGoal}
        bmi={userProfile?.bmi}
      />

      {/* WellNū Study: Education Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEducationModal}
        onRequestClose={() => setShowEducationModal(false)}
      >
        <View style={styles.educationModalOverlay}>
          <View style={styles.educationModalContainer}>
            <View style={styles.educationHeader}>
              <Text style={styles.educationTitle}>{currentEducationContent?.title}</Text>
              <TouchableOpacity onPress={() => setShowEducationModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.educationContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.educationDescription}>{currentEducationContent?.content}</Text>
              
              <Text style={styles.educationSectionTitle}>💡 Quick Tips</Text>
              {currentEducationContent?.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
              
              <Text style={styles.educationSectionTitle}>🥘 Local Foods Rich in {currentEducationContent?.topic}</Text>
              <View style={styles.localFoodsContainer}>
                {currentEducationContent?.localFoods.map((food, index) => (
                  <View key={index} style={styles.foodChip}>
                    <Text style={styles.foodChipText}>{food}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.educationFooter}>
                <Text style={styles.footerText}>🏥 WellNū Health Guide</Text>
                <Text style={styles.footerSubtext}>Personalized nutrition for Brgy. Looc, Mandaue City</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userLevelText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bmiText: {
    marginLeft: 8,
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 120,
  },
  mainSummary: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  calorieCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#FCB647',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieLabel: {
    fontSize: 14,
    color: 'gray',
  },
  goalContainer: {
    position: 'absolute',
    left: -40,
    top: 40,
    alignItems: 'center',
  },
  goalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  goalLabel: {
    fontSize: 12,
    color: 'gray',
  },
  remainingContainer: {
    position: 'absolute',
    right: -40,
    top: 40,
    alignItems: 'center',
  },
  remainingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  remainingLabel: {
    fontSize: 12,
    color: 'gray',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  macroLabel: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  exerciseSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseSuggestionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  exerciseButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  exerciseSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  mealsSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FCB647',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // WellNū Study: Nutrition insights card styles
  nutritionInsightsCard: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  achievementCard: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  deficiencyCard: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#FF5722',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  insightProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  insightMessage: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
    marginBottom: 10,
  },
  insightActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightDismiss: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  insightDismissText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  learnMoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  learnMoreText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
  },
  // WellNū Study: Suggestions section styles
  suggestionsSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionPreview: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  suggestionReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  suggestionDetails: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // WellNū Study: Education Modal Styles
  educationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  educationModalContainer: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  educationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  educationContent: {
    padding: 20,
  },
  educationDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  educationSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  localFoodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  foodChip: {
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  foodChipText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  educationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
