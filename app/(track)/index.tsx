import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../constants/Config';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";

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
  const [currentDay, setCurrentDay] = useState(getTodayName());
  // Removed Weekly View state
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [showMealPrepTips, setShowMealPrepTips] = useState(false);

  // (Removed standalone food recommendations state)
  const [profile, setProfile] = useState<{ userId: number; weight?: number; height?: number } | null>(null);

  // Daily Calorie Intake state
  const [dailyCalorieIntake, setDailyCalorieIntake] = useState<number | null>(null);
  const [calorieGoal, setCalorieGoal] = useState<number>(2000); // You can make this dynamic if needed
  const [loadingCalorieIntake, setLoadingCalorieIntake] = useState<boolean>(false);

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

  // Fetch daily calorie intake
  useEffect(() => {
    const fetchDailyIntake = async () => {
      setLoadingCalorieIntake(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const response = await fetch(`${Config.API_BASE}/api/foodlogging/getDailyIntake?userId=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          setDailyCalorieIntake(data.calorieIntake ?? 0);
        } else {
          setDailyCalorieIntake(null);
        }
      } catch (err) {
        setDailyCalorieIntake(null);
      } finally {
        setLoadingCalorieIntake(false);
      }
    };
    fetchDailyIntake();
  }, []);

  // Fetch recommendations and weekly meal plan

  const resolvePythonBase = () => Config.PYTHON_BASE || Config.BASE_URL;

  const fetchWeeklyMealPlan = async () => {
    setMealPlanError(null);
    setIsLoadingMealPlan(true);
    try {
      if (!profile || profile.weight == null || profile.height == null) {
        throw new Error('Profile incomplete: set height & weight in profile screen.');
      }
      const payload = { weight: profile.weight, height_cm: profile.height, max_results: 28 };
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
      const timeout = setTimeout(() => controller.abort(), 10000);
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
      } catch (e: any) {
        if (e.name === 'AbortError') throw new Error('Request timed out (10s). Is the Python server running?');
        throw e;
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${txt.slice(0,140)}`);
      }
      let data: any;
      try { data = await response.json(); } catch { throw new Error('Response is not valid JSON.'); }
  if (!data || !Array.isArray(data.foods)) throw new Error('Response missing foods array.');
      const foods: FoodRecommendation[] = data.foods;
      if (foods.length < 4) throw new Error('Not enough food items returned (need at least 4).');

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const mealPlan: MealPlan[] = [];
      for (let i = 0; i < 7; i++) {
        const dayMeals = foods.slice(i * 4, (i + 1) * 4);
        if (dayMeals.length < 4) break; // stop if incomplete day
        const [breakfast, lunch, dinner, snack] = dayMeals;
        mealPlan.push({
          id: `day-${i}`,
          day: days[i],
          meals: { breakfast, lunch, dinner, snack },
          totalCalories: (breakfast.Calories||0)+(lunch.Calories||0)+(dinner.Calories||0)+(snack.Calories||0),
          totalProtein: (breakfast.Protein||0)+(lunch.Protein||0)+(dinner.Protein||0)+(snack.Protein||0),
          totalFats: (breakfast.Fat||0)+(lunch.Fat||0)+(dinner.Fat||0)+(snack.Fat||0),
          totalCarbs: (breakfast.Carbs||0)+(lunch.Carbs||0)+(dinner.Carbs||0)+(snack.Carbs||0),
        });
      }
      if (mealPlan.length === 0) throw new Error('Could not build a single full day (need 4 items per day).');
      setWeeklyMealPlan(mealPlan);
      setShowMealPlan(true);
    } catch (e: any) {
      console.error('[MealPlan] ERROR', e);
      setMealPlanError(e.message || 'Unknown error');
      Alert.alert('Meal Plan Error', e.message || 'Failed to fetch meal plan');
    } finally {
      setIsLoadingMealPlan(false);
    }
  };

  const handleGenerateMealPlan = fetchWeeklyMealPlan;

  // Fetch meal plan only on button click

  // ...existing code...

  // ...existing code...

  const handleDayChange = (direction: 'prev' | 'next') => {
    setCurrentDay(prevDay => {
      const currentIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(prevDay);
      const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0) return 'monday';
      if (newIndex > 6) return 'sunday';
      return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][newIndex];
    });
  };

  // Generate grocery list from meal plan
  const generateGroceryList = () => {
    const ingredients: string[] = [];
    weeklyMealPlan.forEach(plan => {
      const meals = [plan.meals.breakfast, plan.meals.lunch, plan.meals.dinner, plan.meals.snack];
      meals.forEach(meal => {
        const name = (meal.FoodId || meal.NutrientLogId || '').toString().toLowerCase();
        if (!name) return;
        if (name.includes('rice')) ingredients.push('Rice');
        if (name.includes('chicken') || name.includes('manok')) ingredients.push('Chicken');
        if (name.includes('beef') || name.includes('tapa')) ingredients.push('Beef');
        if (name.includes('fish') || name.includes('bangus')) ingredients.push('Fresh Fish');
        if (name.includes('egg')) ingredients.push('Eggs');
        if (name.includes('vegetable') || name.includes('pinakbet')) ingredients.push('Mixed Vegetables');
        if (name.includes('tomato')) ingredients.push('Tomatoes');
        if (name.includes('onion')) ingredients.push('Onions');
        if (name.includes('garlic')) ingredients.push('Garlic');
        if (name.includes('ginger')) ingredients.push('Ginger');
        if (name.includes('soy')) ingredients.push('Soy Sauce');
        if (name.includes('vinegar')) ingredients.push('Vinegar');
        if (name.includes('oil')) ingredients.push('Cooking Oil');
      });
    });
    
    // Remove duplicates and add common staples
    const uniqueIngredients = [...new Set(ingredients)];
    uniqueIngredients.push('Salt', 'Black Pepper', 'Sugar', 'Cooking Oil');
    
    setGroceryItems(uniqueIngredients);
    setShowGroceryList(true);
  };

  // Removed Weekly View handler

  // Meal prep tips toggle
  const handleMealPrepTips = () => {
    setShowMealPrepTips(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Daily Calorie Intake Summary */}
        <View style={styles.calorieSummaryContainer}>
          <Text style={styles.calorieSummaryTitle}>🔥 Daily Calorie Intake</Text>
          {loadingCalorieIntake ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <>
              <Text style={styles.calorieSummaryValue}>
                {dailyCalorieIntake ?? 0} / {calorieGoal} kcal
              </Text>
              <View style={styles.calorieProgressBarBg}>
                <View
                  style={[
                    styles.calorieProgressBarFill,
                    { width: `${Math.min(((dailyCalorieIntake ?? 0) / calorieGoal) * 100, 100)}%` }
                  ]}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Food Recommendations & Nutrition</Text>
          <Text style={styles.subtitle}>Get personalized food recommendations and detailed nutrition information</Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.mealPlanButton} onPress={handleGenerateMealPlan}>
            <Text style={styles.mealPlanButtonText}>Generate Meal Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Planning Tools */}
        <View style={styles.enhancedTools}>
          <TouchableOpacity style={styles.toolButton} onPress={generateGroceryList}>
            <Text style={styles.toolButtonText}>🛒 Grocery List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={handleMealPrepTips}>
            <Text style={styles.toolButtonText}>👨‍🍳 Meal Prep Tips</Text>
          </TouchableOpacity>
        </View>

        {/* Current Day Meal Plan (derived from weeklyMealPlan) */}
        <View style={styles.mealPlanSection}>
          <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
          <View style={styles.daySelector}>
            <TouchableOpacity onPress={() => handleDayChange('prev')}>
              <Text style={styles.dayChangeText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.currentDayText}>{currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}</Text>
            <TouchableOpacity onPress={() => handleDayChange('next')}>
              <Text style={styles.dayChangeText}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mealPlanDetails}>
            {(() => {
              const plan = weeklyMealPlan.find(p => p.day.toLowerCase() === currentDay);
              if (!plan) return <Text style={styles.noMealText}>{weeklyMealPlan.length? 'No plan for this day.' : 'Generate a meal plan to see meals.'}</Text>;
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

      {/* Grocery List Modal */}
      <Modal visible={showGroceryList} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🛒 Weekly Grocery List</Text>
            <TouchableOpacity onPress={() => setShowGroceryList(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.groceryContent}>
            <Text style={styles.grocerySubtitle}>Based on your weekly meal plan:</Text>
            {groceryItems.map((item, index) => (
              <View key={index} style={styles.groceryItem}>
                <Text style={styles.groceryItemText}>• {item}</Text>
              </View>
            ))}
            <View style={styles.groceryTips}>
              <Text style={styles.groceryTipsTitle}>💡 Shopping Tips:</Text>
              <Text style={styles.groceryTip}>• Buy fresh vegetables from local markets for better prices</Text>
              <Text style={styles.groceryTip}>• Stock up on rice and cooking oil in bulk</Text>
              <Text style={styles.groceryTip}>• Choose seasonal fruits for better nutrition and cost</Text>
              <Text style={styles.groceryTip}>• Buy meat and fish fresh on the day you plan to cook</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
});
