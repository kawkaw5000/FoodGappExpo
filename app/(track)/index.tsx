import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../constants/Config';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, Platform } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import ExerciseSuggestions from '../../components/ExerciseSuggestions';
import { calculateBMI, getCalorieRecommendations } from '../../utils/bmiCalculator';
import { WellNuAlertService } from '../../services/WellNuAlertService';

// User profile interface matching Home page
interface UserProfile {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  bodyGoal?: string;
  bmi?: number;
}

// Backend food item shape (capitalized keys from Python service)
interface FoodRecommendation {
  NutrientLogId?: string;
  FoodId?: string;
  Calories: number;
  Protein: number;
  Fat: number;
  Carbs: number;
  // Allow any extra fields without breaking
  [key: string]: any;
}

interface MealPlan {
  id: string;
  day: string;
  meals: {
    breakfast: FoodRecommendation;
    lunch: FoodRecommendation;
    dinner: FoodRecommendation;
    snack: FoodRecommendation;
  };
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
}

// Enhanced nutrition summary interface for daily tracking
interface DailyNutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  totalSugars: number; // Add sugar tracking
  goalCalories: number;
  goalProtein: number;
  goalFats: number;
  goalCarbs: number;
  goalSugars: number; // Add sugar goal tracking (WHO: <50g/day)
  caloriesProgress: number;
  proteinProgress: number;
  fatsProgress: number;
  carbsProgress: number;
  sugarsProgress: number; // Add sugar progress tracking
}

// Nutrition insight for notifications and alerts
interface NutritionInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
  icon: string;
}

// Interface for logged food items from the log API
interface LoggedFood {
  id: string;
  foodId?: number;
  foodLogId?: number;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  sugars: number; // Make sugar required since we're now using it
  meal: string;
  grams?: number;
  loggedDate?: string; // Date when food was logged
  cholesterol?: number;
  sodium?: number;
  fiber?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  vitaminA?: number;
  vitaminC?: number;
  nutrientLogId?: number;
  micronutrients?: string; // Add micronutrients field
}

export default function TrackPage() {
  // Daily log state
  // Daily log (currently unused since we rely on generated meal plan per day)
  const [dailyLogs, setDailyLogs] = useState<{ [day: string]: FoodRecommendation[] }>({});
  const router = useRouter();
  const [isLoadingMealPlan, setIsLoadingMealPlan] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<MealPlan[]>([]);
  const [mealPlanError, setMealPlanError] = useState<string | null>(null);
  // Removed food recommendations, nutrition details, and confirmation state
  // Get today's day name in lowercase
  function getTodayName() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  // Filter logged foods for today's date (more inclusive to handle different time zones)
  const getTodaysLoggedFoods = (): LoggedFood[] => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    return loggedFoods.filter(food => {
      if (!food.loggedDate) return false;
      
      try {
        const foodDate = new Date(food.loggedDate);
        return foodDate >= todayStart && foodDate < todayEnd;
      } catch (error) {
        // If date parsing fails, check string format
        const foodDateStr = food.loggedDate.split('T')[0];
        const todayStr = now.toISOString().split('T')[0];
        return foodDateStr === todayStr;
      }
    });
  };

  // Format date without time for cleaner display
  const formatLoggedDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
      
      if (isToday) {
        return 'Today';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Invalid date';
    }
  };
  // Removed currentDay state - now using getTodayName() directly
  // Removed Weekly View state
  // Removed grocery list state
  const [showMealPrepTips, setShowMealPrepTips] = useState(false);
  
  // Exercise suggestions state
  const [exerciseSuggestionsVisible, setExerciseSuggestionsVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // (Removed standalone food recommendations state)
  const [profile, setProfile] = useState<{ userId: number; weight?: number; height?: number } | null>(null);

  // Calorie goal (dynamic based on user profile)
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);

  // Get personalized calorie goal based on user profile and body goal (same as home page)
  const calculatePersonalizedCalorieGoal = (profile: UserProfile | null): number => {
    if (profile && profile.weight && profile.height && profile.age && profile.gender !== undefined) {
      const currentBMI = calculateBMI(profile.weight, profile.height);
      const genderNumber = typeof profile.gender === 'string' ? 
        (profile.gender.toLowerCase() === 'male' ? 0 : profile.gender.toLowerCase() === 'female' ? 1 : 2) : 
        profile.gender;
      
      const calorieRecs = getCalorieRecommendations({
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        gender: genderNumber,
        activityLevel: 'moderate'
      }, currentBMI);

      // Map body goal to appropriate calorie target
      switch (profile.bodyGoal) {
        case 'Lose Weight':
          return Math.round(calorieRecs.goals.loseWeight.calories);
        case 'Gain Weight':
          return Math.round(calorieRecs.goals.gainWeight.calories);
        case 'Maintain Weight':
          return Math.round(calorieRecs.goals.maintain.calories);
        case 'Build Muscle':
          return Math.round(calorieRecs.goals.gainWeight.calories); // Muscle building needs surplus
        default:
          return Math.round(calorieRecs.goals.maintain.calories);
      }
    }
    return 2000; // Fallback if no profile data
  };

  const getPersonalizedCalorieGoal = (): number => {
    return calculatePersonalizedCalorieGoal(userProfile);
  };

  // Nutrition tracking state (moved from Log tab)
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [nutritionInsights, setNutritionInsights] = useState<NutritionInsight[]>([]);
  const [showInsights, setShowInsights] = useState(true);
  const [loadingNutritionData, setLoadingNutritionData] = useState(false);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const profileRes = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(userId)}`);
        if (profileRes.ok) {
          const data = await profileRes.json();
          const userInfo = data.userInfo || data;
          setProfile({
            userId: userInfo.userId,
            weight: userInfo.weight,
            height: userInfo.height
          });
        }
      } catch (err) {
        // Handle error silently
      }
    };
    fetchProfile();
  }, []);



  // Load user profile for exercise suggestions
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        
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

          // Map bodyGoalId to actual goal string (CORRECTED MAPPING)
          const getBodyGoalText = (goalId: any): string => {
            switch (goalId) {
              case 1:
              case '1':
                return 'Lose Weight';
              case 2:
              case '2':
                return 'Maintain Weight';  // FIXED: Was incorrectly "Gain Weight"
              case 3:
              case '3':
                return 'Gain Weight';      // FIXED: Was incorrectly "Maintain Weight"
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
          
          // Update calorie goal based on profile
          const personalizedGoal = calculatePersonalizedCalorieGoal(profile);
          setCalorieGoal(personalizedGoal);
          
          console.log('Track Page - User Profile Loaded:', profile); // Debug log
          console.log('Track Page - Personalized Calorie Goal:', personalizedGoal); // Debug log
        }
      } catch (error) {
        console.error('Track Page - Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  // Nutrition calculation functions (moved from Log tab)
  
  // Calculate daily nutrition summary
  const calculateDailySummary = (foods: LoggedFood[]): DailyNutritionSummary => {
    console.log("Calculating daily summary from foods:", foods.map(f => ({
      name: f.name,
      calories: f.calories,
      protein: f.protein,
      fats: f.fats,
      carbs: f.carbs,
      sugars: f.sugars
    })));
    
    const totals = foods.reduce((acc, food) => ({
      totalCalories: acc.totalCalories + food.calories,
      totalProtein: acc.totalProtein + food.protein,
      totalFats: acc.totalFats + food.fats,
      totalCarbs: acc.totalCarbs + food.carbs,
      totalSugars: acc.totalSugars + (food.sugars || 0), // Include sugar tracking
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalFats: 0,
      totalCarbs: 0,
      totalSugars: 0, // Initialize sugar total
    });
    
    console.log("Calculated totals:", totals);

    // Daily goals (can be made dynamic based on user profile)
    const goals = {
      goalCalories: calorieGoal || 2000,
      goalProtein: 150,
      goalFats: 65,
      goalCarbs: 250,
      goalSugars: 50, // WHO recommendation: <50g/day
    };

    return {
      ...totals,
      ...goals,
      caloriesProgress: Math.min((totals.totalCalories / goals.goalCalories) * 100, 100),
      proteinProgress: Math.min((totals.totalProtein / goals.goalProtein) * 100, 100),
      fatsProgress: Math.min((totals.totalFats / goals.goalFats) * 100, 100),
      carbsProgress: Math.min((totals.totalCarbs / goals.goalCarbs) * 100, 100),
      sugarsProgress: Math.min((totals.totalSugars / goals.goalSugars) * 100, 100), // Add sugar progress
    };
  };

  // Generate nutrition insights based on daily summary
  const generateNutritionInsights = async (summary: DailyNutritionSummary): Promise<NutritionInsight[]> => {
    const insights: NutritionInsight[] = [];

    // Calorie insights
    if (summary.caloriesProgress < 50) {
      insights.push({
        type: 'warning',
        message: `You're at ${Math.round(summary.caloriesProgress)}% of your daily calorie goal. Consider adding a healthy snack!`,
        icon: '⚠️'
      });
    } else if (summary.caloriesProgress > 100) {
      insights.push({
        type: 'info',
        message: `You've exceeded your calorie goal by ${Math.round(summary.caloriesProgress - 100)}%. Try lighter options for your next meal.`,
        icon: '📊'
      });
    } else if (summary.caloriesProgress >= 80) {
      insights.push({
        type: 'success',
        message: `Great job! You're on track with ${Math.round(summary.caloriesProgress)}% of your calorie goal completed.`,
        icon: '🎯'
      });
    }

    // Protein insights
    if (summary.proteinProgress < 60) {
      insights.push({
        type: 'warning',
        message: `Your protein intake is at ${Math.round(summary.proteinProgress)}%. Add some eggs, fish, or beans to boost protein.`,
        icon: '🥚'
      });
    } else if (summary.proteinProgress >= 90) {
      insights.push({
        type: 'success',
        message: `Excellent protein intake! You've reached ${Math.round(summary.proteinProgress)}% of your goal.`,
        icon: '💪'
      });
    }

    // Sugar insights with WellNu Alert Service integration (WHO guidelines: <50g/day)
    const checkSugarAlerts = async () => {
      try {
        const alertService = WellNuAlertService.getInstance();
        const sugarAlert = await alertService.generateSugarAlert(summary.totalSugars);
        
        if (sugarAlert && sugarAlert.priority === 'high') {
          // Critical sugar alert
          insights.push({
            type: 'warning',
            message: `🚨 CRITICAL: ${Math.round(summary.totalSugars)}g sugar consumed! WHO limit is 50g/day.`,
            icon: '🚨'
          });
        } else if (summary.sugarsProgress > 75) {
          // Warning level (75-100%)
          insights.push({
            type: 'info',
            message: `⚠️ You're at ${Math.round(summary.sugarsProgress)}% of your daily sugar limit. Watch your sweet intake!`,
            icon: '🍭'
          });
        } else if (summary.sugarsProgress < 25) {
          // Good level (<25%)
          insights.push({
            type: 'success',
            message: `✅ Excellent! You're keeping sugar low at ${Math.round(summary.sugarsProgress)}% of daily limit.`,
            icon: '✅'
          });
        }
      } catch (error) {
        console.error('Error checking sugar alerts:', error);
        // Fallback to simple insights
        if (summary.sugarsProgress > 100) {
          insights.push({
            type: 'warning',
            message: `⚠️ High sugar intake! You've consumed ${Math.round(summary.totalSugars)}g (${Math.round(summary.sugarsProgress)}%). WHO recommends <50g/day.`,
            icon: '🍭'
          });
        }
      }
    };
    
    // Execute sugar alert check
    await checkSugarAlerts();

    // Balance insights
    const isBalanced = summary.proteinProgress >= 70 && summary.fatsProgress >= 50 && summary.carbsProgress >= 50 && summary.sugarsProgress <= 75;
    if (isBalanced && summary.caloriesProgress >= 80 && summary.caloriesProgress <= 110) {
      insights.push({
        type: 'success',
        message: 'Your nutrition is well-balanced today! Keep up the great work.',
        icon: '🌟'
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights to include sugar alerts
  };

  // Fetch logged foods and calculate nutrition data
  const fetchNutritionData = async () => {
    setLoadingNutritionData(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`${Config.API_BASE}/api/foodlogging/getUserLogs?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log("Track tab - Raw API response:", data);
      
      if (response.ok && data.logs) {
        console.log("Track tab - Using food data from database (Food table)");
        
        // Transform backend data to frontend format - using same logic as Log tab
        const transformedLogs = data.logs
          .filter((log: any) => log.nutrientData) // Only include logs with nutrition data
          .map((log: any) => {
            console.log("Track tab - Processing log:", log);
            console.log("Track tab - Nutrient data:", log.nutrientData);
            console.log("Track tab - Available date fields:", {
              nutrientUpdatedAt: log.nutrientData?.updatedAt,
              logUpdatedAt: log.updatedAt,
              nutrientCreatedAt: log.nutrientData?.createdAt,
              logCreatedAt: log.createdAt,
              loggedDate: log.loggedDate,
              dateLogged: log.dateLogged
            });
            
            // Determine food name with multiple fallbacks (same as Log tab):
            const foodName = log.foodData?.FoodName
              || log.foodName
              || log.nutrientData?.food?.FoodName
              || `Food Entry ${log.foodId}`;
            
            // Debug sugar extraction
            const extractedSugar = parseFloat(log.nutrientData.sugars || log.nutrientData.Sugar || log.nutrientData.sugar) || 0;
            console.log("Track tab - Sugar extraction:", {
              sugars: log.nutrientData.sugars,
              Sugar: log.nutrientData.Sugar,
              sugar: log.nutrientData.sugar,
              extractedSugar: extractedSugar
            });

            return {
              id: log.foodLogId.toString(),
              foodId: log.foodId,
              foodLogId: log.foodLogId,
              name: foodName,
              // Use the exact field names from NutrientLog table (same as Log tab)
              calories: parseInt(log.nutrientData.calories) || 0,
              protein: parseFloat(log.nutrientData.protein) || 0,
              fats: parseFloat(log.nutrientData.fat) || 0, // 'fat' not 'fats'
              carbs: parseFloat(log.nutrientData.carbs || log.nutrientData.carbohydrates || log.nutrientData.total_carbohydrate) || 0,
              meal: log.mealType || 'Breakfast',
              grams: parseFloat(log.nutrientData.foodGramAmount) || 100,
              // Add logged date - prioritize updatedAt from NutrientLog table for accuracy
              loggedDate: log.nutrientData?.updatedAt || log.updatedAt || log.nutrientData?.createdAt || log.createdAt || log.loggedDate || log.dateLogged || new Date().toISOString().split('T')[0],
              // Additional nutrition data - extract real values from backend
              cholesterol: parseFloat(log.nutrientData.cholesterol) || 0,
              sodium: parseFloat(log.nutrientData.sodium) || 0,
              fiber: parseFloat(log.nutrientData.fiber) || 0,
              sugars: extractedSugar, // Use extracted sugar value
              vitaminD: parseFloat(log.nutrientData.vitaminD) || 0,
              calcium: parseFloat(log.nutrientData.calcium) || 0,
              iron: parseFloat(log.nutrientData.iron) || 0,
              potassium: parseFloat(log.nutrientData.potassium) || 0,
              vitaminA: parseFloat(log.nutrientData.vitaminA) || 0,
              vitaminC: parseFloat(log.nutrientData.vitaminC) || 0,
              micronutrients: log.nutrientData.micronutrients || log.nutrientData.MicroNutrients || "",
              nutrientLogId: log.nutrientData.nutrientLogId,
            };
          });

          console.log("Track tab - Transformed logs:", transformedLogs);
          setLoggedFoods(transformedLogs);
          
          // Calculate nutrition summary and insights
          if (transformedLogs.length > 0) {
            // Filter for today's foods for more accurate daily summary
            const todaysFoods = transformedLogs.filter((food: LoggedFood) => {
              if (!food.loggedDate) return false;
              try {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const foodDate = new Date(food.loggedDate);
                return foodDate >= todayStart && foodDate < todayEnd;
              } catch (error) {
                const foodDateStr = food.loggedDate.split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                return foodDateStr === todayStr;
              }
            });
            
            console.log("All logged foods:", transformedLogs.length);
            console.log("Today's foods for calculation:", todaysFoods.length);
            
            const summary = calculateDailySummary(todaysFoods);
            setDailySummary(summary);
            
            // Generate insights with sugar alerts (async)
            generateNutritionInsights(summary).then(insights => {
              setNutritionInsights(insights);
            }).catch(error => {
              console.error('Error generating nutrition insights:', error);
              setNutritionInsights([]);
            });
          } else {
            setDailySummary(null);
            setNutritionInsights([]);
          }
        } else {
          console.error('Track tab - Failed to fetch logs:', data);
          setLoggedFoods([]);
        }
      } catch (error) {
        console.error('Track tab - Error fetching logs:', error);
        setLoggedFoods([]);
      } finally {
        setLoadingNutritionData(false);
      }
    };

  // Load nutrition data when component mounts
  useEffect(() => {
    fetchNutritionData();
  }, [calorieGoal]);

  // Refresh data when screen comes into focus (e.g., returning from log page)
  useFocusEffect(
    React.useCallback(() => {
      console.log("Track tab - Screen focused, refreshing nutrition data");
      fetchNutritionData();
    }, [])
  );

  // Fetch recommendations and today's meal plan

  const resolvePythonBase = () => Config.PYTHON_BASE || Config.BASE_URL;

  const fetchTodaysMealPlan = async () => {
    setMealPlanError(null);
    setIsLoadingMealPlan(true);
    try {
      if (!profile || profile.weight == null || profile.height == null) {
        throw new Error('Profile incomplete: set height & weight in profile screen.');
      }
      
      // Get current day name
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[today.getDay()];
      
      console.log(`[MealPlan] Generating meal plan for ${currentDay}, ${today.toLocaleDateString()}`);
      
      const payload = { weight: profile.weight, height_cm: profile.height, max_results: 4 };
      const base = resolvePythonBase();
  const url = `${base}${Config.MEALPLAN_ENDPOINT || '/get_food_recommendations'}`;
      console.log('[MealPlan] POST', url, payload);

      // Quick preflight health check (3s timeout) to fail fast on network issues
      try {
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 3000);
  const healthRes = await fetch(`${base}${Config.HEALTH_ENDPOINT || '/health'}`, { signal: healthController.signal });
        clearTimeout(healthTimeout);
        if (!healthRes.ok) console.warn('[MealPlan] Health check HTTP', healthRes.status);
      } catch (preErr) {
        console.warn('[MealPlan] Health check failed (likely network / IP / server down):', preErr);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
      } catch (e: any) {
        if (e.name === 'AbortError') throw new Error('Request timed out (60s). Is the Python server running?');
        throw e;
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${txt.slice(0,140)}`);
      }
      let data: any;
      try { 
        data = await response.json(); 
        console.log('[MealPlan] DEBUG - Full response from Python service:', JSON.stringify(data, null, 2));
        console.log('[MealPlan] DEBUG - Response type:', typeof data);
        console.log('[MealPlan] DEBUG - Response keys:', data ? Object.keys(data) : 'null/undefined');
        console.log('[MealPlan] DEBUG - Has foods property:', data && 'foods' in data);
        console.log('[MealPlan] DEBUG - foods type:', data && data.foods ? typeof data.foods : 'missing');
        console.log('[MealPlan] DEBUG - foods isArray:', data && data.foods ? Array.isArray(data.foods) : 'no foods property');
      } catch { 
        throw new Error('Response is not valid JSON.'); 
      }
  if (!data || !Array.isArray(data.foods)) throw new Error('Response missing foods array.');
      const foods: FoodRecommendation[] = data.foods;
      if (foods.length < 4) throw new Error('Not enough food items returned (need at least 4).');

      // Create today's meal plan with the 4 food recommendations
      const [breakfast, lunch, dinner, snack] = foods;
      const todaysMealPlan: MealPlan = {
        id: `today-${currentDay.toLowerCase()}`,
        day: currentDay,
        meals: { breakfast, lunch, dinner, snack },
        totalCalories: (breakfast.Calories||0)+(lunch.Calories||0)+(dinner.Calories||0)+(snack.Calories||0),
        totalProtein: (breakfast.Protein||0)+(lunch.Protein||0)+(dinner.Protein||0)+(snack.Protein||0),
        totalFats: (breakfast.Fat||0)+(lunch.Fat||0)+(dinner.Fat||0)+(snack.Fat||0),
        totalCarbs: (breakfast.Carbs||0)+(lunch.Carbs||0)+(dinner.Carbs||0)+(snack.Carbs||0),
      };
      
      console.log(`[MealPlan] Generated meal plan for ${currentDay}:`, todaysMealPlan);
      setWeeklyMealPlan([todaysMealPlan]);
      setShowMealPlan(true);
    } catch (e: any) {
      console.error('[MealPlan] ERROR', e);
      setMealPlanError(e.message || 'Unknown error');
      Alert.alert('Meal Plan Error', e.message || 'Failed to fetch meal plan');
    } finally {
      setIsLoadingMealPlan(false);
    }
  };

  const handleGenerateMealPlan = fetchTodaysMealPlan;

  // Fetch meal plan only on button click

  // ...existing code...

  // ...existing code...

  // Removed day change handler - now always shows today

  // Removed grocery list generator

  // Removed Weekly View handler

  // Meal prep tips toggle
  const handleMealPrepTips = () => {
    setShowMealPrepTips(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Daily Calorie Intake Summary - Consistent with Home Page */}
        <View style={styles.calorieSummaryContainer}>
          <View style={styles.trackHeaderContainer}>
            <Text style={styles.calorieSummaryTitle}>🔥 Daily Calorie Intake</Text>
            {userProfile?.bodyGoal && (
              <View style={styles.bodyGoalBadge}>
                <Text style={styles.bodyGoalBadgeText}>{userProfile.bodyGoal}</Text>
              </View>
            )}
          </View>
          {loadingNutritionData ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <View style={styles.calorieDisplayContainer}>
              {/* Left Side - Current Intake */}
              <View style={styles.currentIntakeContainer}>
                <Text style={styles.intakeNumber}>{Math.round(dailySummary?.totalCalories || 0)}</Text>
                <Text style={styles.intakeLabel}>Current</Text>
                <Text style={styles.intakeUnit}>cal</Text>
              </View>
              
              {/* Middle - Progress Circle */}
              <View style={styles.progressBadgeContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercentage}>
                    {Math.round(dailySummary?.caloriesProgress || 0)}%
                  </Text>
                </View>
              </View>
              
              {/* Right Side - Goal Calories */}
              <View style={styles.goalIntakeContainer}>
                <Text style={styles.goalNumber}>{calorieGoal.toLocaleString()}</Text>
                <Text style={styles.goalLabel}>Goal</Text>
                <Text style={styles.goalUnit}>kcal</Text>
              </View>
            </View>
          )}
        </View>

        {/* Enhanced Nutrition Summary (always visible) */}
        <View style={styles.dailyNutritionSummary}>
          <Text style={styles.nutritionSummaryTitle}>📊 Daily Nutrition Summary</Text>
          <Text style={styles.nutritionNote}>📝 Go to the Log tab to add your meals</Text>
          
          {/* First Row - Primary Macros */}
          <View style={styles.nutritionMacroGrid}>
            <View style={styles.nutritionMacroCard}>
              <Text style={styles.nutritionMacroLabel}>Protein</Text>
              <Text style={styles.nutritionMacroValue}>{Math.round(dailySummary?.totalProtein || 0)}g</Text>
              <View style={styles.nutritionProgressBar}>
                <View style={[styles.nutritionProgressFill, { width: `${dailySummary?.proteinProgress || 0}%`, backgroundColor: '#4CAF50' }]} />
              </View>
              <Text style={styles.nutritionProgressText}>{Math.round(dailySummary?.proteinProgress || 0)}%</Text>
            </View>

            <View style={styles.nutritionMacroCard}>
              <Text style={styles.nutritionMacroLabel}>Fats</Text>
              <Text style={styles.nutritionMacroValue}>{Math.round(dailySummary?.totalFats || 0)}g</Text>
              <View style={styles.nutritionProgressBar}>
                <View style={[styles.nutritionProgressFill, { width: `${dailySummary?.fatsProgress || 0}%`, backgroundColor: '#FF9800' }]} />
              </View>
              <Text style={styles.nutritionProgressText}>{Math.round(dailySummary?.fatsProgress || 0)}%</Text>
            </View>
          </View>

          {/* Second Row - Carbs & Sugars */}
          <View style={styles.nutritionMacroGrid}>
            <View style={styles.nutritionMacroCard}>
              <Text style={styles.nutritionMacroLabel}>Carbs</Text>
              <Text style={styles.nutritionMacroValue}>{Math.round(dailySummary?.totalCarbs || 0)}g</Text>
              <View style={styles.nutritionProgressBar}>
                <View style={[styles.nutritionProgressFill, { width: `${dailySummary?.carbsProgress || 0}%`, backgroundColor: '#2196F3' }]} />
              </View>
              <Text style={styles.nutritionProgressText}>{Math.round(dailySummary?.carbsProgress || 0)}%</Text>
            </View>

            <View style={styles.nutritionMacroCard}>
              <Text style={styles.nutritionMacroLabel}>Sugars</Text>
              <Text style={styles.nutritionMacroValue}>{Math.round(dailySummary?.totalSugars || 0)}g</Text>
              <View style={styles.nutritionProgressBar}>
                <View style={[styles.nutritionProgressFill, { 
                  width: `${dailySummary?.sugarsProgress || 0}%`, 
                  backgroundColor: (dailySummary?.sugarsProgress || 0) > 75 ? '#F44336' : '#9C27B0' // Red if >75%, purple otherwise
                }]} />
              </View>
              <Text style={styles.nutritionProgressText}>{Math.round(dailySummary?.sugarsProgress || 0)}%</Text>
            </View>
          </View>
        </View>

        {/* Nutrition Insights (moved from Log tab) */}
        {nutritionInsights.length > 0 && showInsights && (
          <View style={styles.insightsContainer}>
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>💡 Nutrition Insights</Text>
              <TouchableOpacity onPress={() => setShowInsights(false)}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
            
            {nutritionInsights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, 
                insight.type === 'success' && styles.successCard,
                insight.type === 'warning' && styles.warningCard,
                insight.type === 'info' && styles.infoCard
              ]}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={styles.insightMessage}>{insight.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Today's Logged Foods Section */}
        <View style={styles.todaysLoggedSection}>
          <Text style={styles.sectionTitle}>🍽️ Today's Logged Foods ({getTodaysLoggedFoods().length})</Text>
          {(() => {
            const todaysFoods = getTodaysLoggedFoods();
            console.log("Track tab - All logged foods:", loggedFoods);
            console.log("Track tab - Today's foods:", todaysFoods);
            console.log("Track tab - Today's date:", new Date().toISOString().split('T')[0]);
            
            if (todaysFoods.length === 0) {
              return (
                <View style={styles.emptyLoggedFoods}>
                  <Text style={styles.emptyLoggedText}>No foods logged today yet</Text>
                  <Text style={styles.emptyLoggedSubtext}>Go to the Log tab to add your meals!</Text>
                </View>
              );
            }
            
            return todaysFoods.map(food => (
              <View key={food.id} style={styles.loggedFoodItem}>
                <View style={styles.loggedFoodHeader}>
                  <Text style={styles.loggedFoodName}>{food.name}</Text>
                  <Text style={styles.loggedFoodMeal}>{food.meal}</Text>
                </View>
                <View style={styles.loggedFoodNutrition}>
                  <Text style={styles.loggedFoodCalories}>{food.calories} kcal</Text>
                  <View style={styles.loggedFoodMacros}>
                    <Text style={styles.loggedMacroText}>P: {food.protein}g</Text>
                    <Text style={styles.loggedMacroText}>F: {food.fats}g</Text>
                    <Text style={styles.loggedMacroText}>C: {food.carbs}g</Text>
                    <Text style={styles.loggedMacroText}>S: {food.sugars || 0}g</Text>
                  </View>
                </View>
                <Text style={styles.loggedFoodDate}>
                  Updated: {formatLoggedDate(food.loggedDate)}
                </Text>
              </View>
            ));
          })()}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Food Recommendations & Nutrition</Text>
          <Text style={styles.subtitle}>Get personalized food recommendations and detailed nutrition information</Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.mealPlanButton} onPress={handleGenerateMealPlan}>
            <Text style={styles.mealPlanButtonText}>Generate Today's Meal Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Planning Tools */}
        <View style={styles.enhancedTools}>
          <TouchableOpacity style={styles.toolButton} onPress={handleMealPrepTips}>
            <Text style={styles.toolButtonText}>👨‍🍳 Meal Prep Tips</Text>
          </TouchableOpacity>
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

        {/* Current Day Meal Plan (derived from weeklyMealPlan) */}
        <View style={styles.mealPlanSection}>
          <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
          <View style={styles.daySelector}>
            <Text style={styles.currentDayText}>{getTodayName().charAt(0).toUpperCase() + getTodayName().slice(1)}</Text>
          </View>
          <View style={styles.mealPlanDetails}>
            {(() => {
              // Since we now generate only today's plan, just take the first (and only) plan
              const plan = weeklyMealPlan[0];
              if (!plan) return <Text style={styles.noMealText}>Generate today's meal plan to see meals.</Text>;
              const entries = [
                { label: 'Breakfast', item: plan.meals.breakfast },
                { label: 'Lunch', item: plan.meals.lunch },
                { label: 'Dinner', item: plan.meals.dinner },
                { label: 'Snack', item: plan.meals.snack },
              ];
              return entries.map((e, idx) => (
                <View key={e.label+idx} style={styles.dailyPlan}>
                  <Text style={styles.foodName}>{e.label}: {e.item.FoodId || e.item.NutrientLogId || 'Food'}</Text>
                  <Text style={styles.foodCalories}>{e.item.Calories} kcal</Text>
                  <View style={styles.nutritionSummary}>
                    <Text style={styles.summaryText}>Protein: {e.item.Protein}g</Text>
                    <Text style={styles.summaryText}>Fat: {e.item.Fat}g</Text>
                    <Text style={styles.summaryText}>Carbs: {e.item.Carbs}g</Text>
                  </View>
                </View>
              ));
            })()}
          </View>
        </View>

        {/* Disclaimer at the bottom */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: This app uses third-party APIs to provide nutritional and dietary information. The recommendations and information presented are for reference only and should not be considered as comprehensive or personalized dietary advice. Please consult a qualified health professional for tailored nutrition guidance. Use of this app is at your own risk.
          </Text>
        </View>
      </ScrollView>

      {/* Loading modal for meal plan generation */}
      <Modal visible={isLoadingMealPlan} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Generating meal plan...</Text>
          </View>
        </View>
      </Modal>

      {mealPlanError && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText} numberOfLines={3}>Debug: {mealPlanError}</Text>
        </View>
      )}

  {/* Removed food recommendations, nutrition details, and confirmation modals */}

  {/* Removed Weekly View Modal */}

      {/* Removed Grocery List Modal */}

      {/* Meal Prep Tips Modal */}
      <Modal visible={showMealPrepTips} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>👨‍🍳 Meal Prep Tips</Text>
            <TouchableOpacity onPress={() => setShowMealPrepTips(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.mealPrepContent}>
            <View style={styles.tipSection}>
              <Text style={styles.tipSectionTitle}>🍚 Rice Preparation</Text>
              <Text style={styles.tipText}>• Cook rice in bulk and store in refrigerator for up to 3 days</Text>
              <Text style={styles.tipText}>• Add a little oil to prevent sticking when reheating</Text>
            </View>
            
            <View style={styles.tipSection}>
              <Text style={styles.tipSectionTitle}>🥬 Vegetable Prep</Text>
              <Text style={styles.tipText}>• Wash and chop vegetables on Sunday for the week</Text>
              <Text style={styles.tipText}>• Store cut vegetables in airtight containers</Text>
              <Text style={styles.tipText}>• Keep leafy greens fresh with paper towels</Text>
            </View>
            
            <View style={styles.tipSection}>
              <Text style={styles.tipSectionTitle}>🍖 Protein Planning</Text>
              <Text style={styles.tipText}>• Marinate meats overnight for better flavor</Text>
              <Text style={styles.tipText}>• Cook proteins in batches and freeze portions</Text>
              <Text style={styles.tipText}>• Use different cooking methods to avoid monotony</Text>
            </View>
            
            <View style={styles.tipSection}>
              <Text style={styles.tipSectionTitle}>🥘 Filipino Meal Prep</Text>
              <Text style={styles.tipText}>• Adobo and sinigang taste better the next day</Text>
              <Text style={styles.tipText}>• Prepare ulam (main dishes) that reheat well</Text>
              <Text style={styles.tipText}>• Cook extra and transform leftovers into new dishes</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Exercise Suggestions Modal */}
      <ExerciseSuggestions 
        visible={exerciseSuggestionsVisible}
        onClose={() => setExerciseSuggestionsVisible(false)}
        bodyGoal={userProfile?.bodyGoal}
        bmi={userProfile?.bmi}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  actionSection: {
    marginVertical: 30,
  },
  recommendButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  recommendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  mealPlanButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  mealPlanButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  mealPlanSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  daySelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dayChangeText: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "600",
    paddingHorizontal: 10,
  },
  currentDayText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  mealPlanDetails: {
    // flex: 1,
  },
  dailyPlan: {
    marginBottom: 30,
  },
  mealTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  mealItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  nutritionSummary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
  },
  disclaimer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
  },
  debugBanner: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#f99',
    borderRadius: 8,
    padding: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#900'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  cancelText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  backText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  recommendationsList: {
    flex: 1,
    padding: 20,
  },
  foodItem: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  foodCalories: {
    fontSize: 14,
    color: "#666",
  },
  nutritionContainer: {
    flex: 1,
    padding: 20,
  },
  nutritionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  servingSize: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  caloriesSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  caloriesText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  macrosSection: {
    marginBottom: 20,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  macroLabel: {
    fontSize: 16,
    color: "#333",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  nutrientsSection: {
    marginBottom: 30,
  },
  nutrientsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  nutrientLabel: {
    fontSize: 14,
    color: "#666",
  },
  nutrientValue: {
    fontSize: 14,
    color: "#333",
  },
  logFoodButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  logFoodButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  confirmationContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
  // Enhanced Tools Styles
  enhancedTools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  toolButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  // Weekly View Styles
  weeklyContent: {
    padding: 20,
  },
  weeklyDayCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  weeklyDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  weeklyMeals: {
    paddingLeft: 8,
    // Removed Weekly View button and handler
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  noMealText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  // Grocery List Styles
  groceryContent: {
    padding: 20,
  },
  grocerySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  groceryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groceryItemText: {
    fontSize: 16,
    color: '#333',
  },
  groceryTips: {
    marginTop: 30,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  groceryTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  groceryTip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  // Meal Prep Tips Styles
  mealPrepContent: {
    padding: 20,
  },
  tipSection: {
    marginBottom: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  tipSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  calorieSummaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  calorieSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  calorieSummaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  calorieProgressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  calorieProgressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  // New consistent calorie display styles
  calorieDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  currentIntakeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  intakeNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  intakeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  intakeUnit: {
    fontSize: 10,
    color: '#999',
  },
  progressBadgeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#FCB647',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  goalIntakeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  goalNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  goalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  goalUnit: {
    fontSize: 10,
    color: '#999',
  },
  // Body goal display styles
  trackHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  bodyGoalBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bodyGoalBadgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  
  // Exercise Section Styles
  exerciseSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  exerciseHeader: {
    marginBottom: 16,
  },
  exerciseSuggestionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 14,
    color: '#666',
    marginLeft: 36,
  },
  
  // Daily Nutrition Summary Styles (moved from Log tab)
  dailyNutritionSummary: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  nutritionSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  nutritionNote: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  nutritionMacroGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  nutritionMacroCard: {
    width: "47%",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  nutritionMacroLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nutritionMacroValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  nutritionProgressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    width: "100%",
    marginBottom: 4,
  },
  nutritionProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  nutritionProgressText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Nutrition Insights Styles (moved from Log tab)
  insightsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  insightsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dismissText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  insightCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  successCard: {
    backgroundColor: "#F0F9FF",
    borderLeftColor: "#10B981",
  },
  warningCard: {
    backgroundColor: "#FFFBEB",
    borderLeftColor: "#F59E0B",
  },
  infoCard: {
    backgroundColor: "#F0F9FF",
    borderLeftColor: "#3B82F6",
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  insightMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },
  
  // Today's Logged Foods Styles
  todaysLoggedSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyLoggedFoods: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyLoggedText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  emptyLoggedSubtext: {
    fontSize: 14,
    color: "#999",
  },
  loggedFoodItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  loggedFoodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  loggedFoodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  loggedFoodMeal: {
    fontSize: 12,
    backgroundColor: "#4CAF50",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    textAlign: "center",
  },
  loggedFoodNutrition: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  loggedFoodCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  loggedFoodMacros: {
    flexDirection: "row",
    gap: 12,
  },
  loggedMacroText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  loggedFoodDate: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  micronutrientsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  micronutrientsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  micronutrientsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
