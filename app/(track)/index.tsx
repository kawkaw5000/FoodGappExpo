import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";

interface FoodRecommendation {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cuisine: 'filipino' | 'international';
  healthScore: number;
  nutritionFacts: {
    cholesterol: string;
    sodium: string;
    dietaryFiber: string;
    sugar: string;
    vitaminD: string;
    calcium: string;
    iron: string;
    potassium: string;
    vitaminA: string;
    vitaminC: string;
  };
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
  const router = useRouter();
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingMealPlan, setIsLoadingMealPlan] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodRecommendation | null>(null);
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<'all' | 'filipino' | 'international'>('all');
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<MealPlan[]>([]);
  const [currentDay, setCurrentDay] = useState('monday');
  const [showWeeklyView, setShowWeeklyView] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [showMealPrepTips, setShowMealPrepTips] = useState(false);

  const foodRecommendations: FoodRecommendation[] = [
    // Filipino Breakfast
    {
      id: "1",
      name: "Tapsilog (Beef Tapa, Garlic Rice, Fried Egg)",
      calories: 520,
      protein: 35,
      fats: 28,
      carbs: 35,
      type: 'breakfast',
      cuisine: 'filipino',
      healthScore: 75,
      nutritionFacts: {
        cholesterol: "280mg",
        sodium: "450mg",
        dietaryFiber: "2g",
        sugar: "3g",
        vitaminD: "8IU",
        calcium: "80mg",
        iron: "12mg",
        potassium: "420mg",
        vitaminA: "8%",
        vitaminC: "2%"
      }
    },
    {
      id: "2",
      name: "Adobong Manok (Chicken Adobo)",
      calories: 340,
      protein: 28,
      fats: 18,
      carbs: 12,
      type: 'lunch',
      cuisine: 'filipino',
      healthScore: 85,
      nutritionFacts: {
        cholesterol: "220mg",
        sodium: "380mg",
        dietaryFiber: "1g",
        sugar: "8g",
        vitaminD: "2IU",
        calcium: "45mg",
        iron: "8mg",
        potassium: "580mg",
        vitaminA: "3%",
        vitaminC: "5%"
      }
    },
    {
      id: "3",
      name: "Sinigang na Baboy (Pork in Tamarind Soup)",
      calories: 280,
      protein: 22,
      fats: 15,
      carbs: 18,
      type: 'dinner',
      cuisine: 'filipino',
      healthScore: 90,
      nutritionFacts: {
        cholesterol: "180mg",
        sodium: "420mg",
        dietaryFiber: "4g",
        sugar: "6g",
        vitaminD: "1IU",
        calcium: "65mg",
        iron: "10mg",
        potassium: "720mg",
        vitaminA: "12%",
        vitaminC: "25%"
      }
    },
    {
      id: "4",
      name: "Halo-Halo",
      calories: 220,
      protein: 8,
      fats: 6,
      carbs: 35,
      type: 'snack',
      cuisine: 'filipino',
      healthScore: 70,
      nutritionFacts: {
        cholesterol: "25mg",
        sodium: "80mg",
        dietaryFiber: "3g",
        sugar: "28g",
        vitaminD: "15IU",
        calcium: "120mg",
        iron: "2mg",
        potassium: "280mg",
        vitaminA: "15%",
        vitaminC: "20%"
      }
    },
    // International Options
    {
      id: "5",
      name: "Greek Yogurt with Berries",
      calories: 180,
      protein: 15,
      fats: 8,
      carbs: 18,
      type: 'breakfast',
      cuisine: 'international',
      healthScore: 95,
      nutritionFacts: {
        cholesterol: "20mg",
        sodium: "60mg",
        dietaryFiber: "5g",
        sugar: "15g",
        vitaminD: "25IU",
        calcium: "200mg",
        iron: "1mg",
        potassium: "320mg",
        vitaminA: "8%",
        vitaminC: "30%"
      }
    },
    {
      id: "6",
      name: "Grilled Salmon with Quinoa",
      calories: 420,
      protein: 32,
      fats: 18,
      carbs: 28,
      type: 'lunch',
      cuisine: 'international',
      healthScore: 98,
      nutritionFacts: {
        cholesterol: "80mg",
        sodium: "220mg",
        dietaryFiber: "4g",
        sugar: "2g",
        vitaminD: "45IU",
        calcium: "60mg",
        iron: "6mg",
        potassium: "680mg",
        vitaminA: "5%",
        vitaminC: "8%"
      }
    }
  ];

  // Generate weekly meal plan
  const generateWeeklyMealPlan = (): MealPlan[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealPlan: MealPlan[] = [];

    days.forEach((day, index) => {
      const breakfast = foodRecommendations.filter(f => f.type === 'breakfast')[index % 2];
      const lunch = foodRecommendations.filter(f => f.type === 'lunch')[index % 2];
      const dinner = foodRecommendations.filter(f => f.type === 'dinner')[0];
      const snack = foodRecommendations.filter(f => f.type === 'snack')[0];

      if (breakfast && lunch && dinner && snack) {
        mealPlan.push({
          id: `day-${index}`,
          day,
          meals: { breakfast, lunch, dinner, snack },
          totalCalories: breakfast.calories + lunch.calories + dinner.calories + snack.calories,
          totalProtein: breakfast.protein + lunch.protein + dinner.protein + snack.protein,
          totalFats: breakfast.fats + lunch.fats + dinner.fats + snack.fats,
          totalCarbs: breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs,
        });
      }
    });

    return mealPlan;
  };

  useEffect(() => {
    setWeeklyMealPlan(generateWeeklyMealPlan());
  }, []);

  const handleRecommendFood = async () => {
    setIsLoadingRecommendations(true);
    setTimeout(() => {
      setIsLoadingRecommendations(false);
      setShowRecommendations(true);
    }, 2000);
  };

  const handleGenerateMealPlan = async () => {
    setIsLoadingMealPlan(true);
    setTimeout(() => {
      setIsLoadingMealPlan(false);
      setShowMealPlan(true);
    }, 2500);
  };

  const getFilteredRecommendations = () => {
    return foodRecommendations.filter(food => {
      const mealTypeMatch = selectedMealType === 'all' || food.type === selectedMealType;
      const cuisineMatch = selectedCuisine === 'all' || food.cuisine === selectedCuisine;
      return mealTypeMatch && cuisineMatch;
    });
  };

  const filteredRecommendations = getFilteredRecommendations();

  const handleSelectFood = (food: FoodRecommendation) => {
    setSelectedFood(food);
    setShowNutritionDetails(true);
  };

  const handleAddSelectedFood = () => {
    setShowNutritionDetails(false);
    setShowRecommendations(false);
    setShowConfirmation(true);
    
    // Hide confirmation after 2 seconds
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedFood(null);
    }, 2000);
  };

  const handleCancelRecommendations = () => {
    setShowRecommendations(false);
    setShowNutritionDetails(false);
    setSelectedFood(null);
  };

  const handleDayChange = (direction: 'prev' | 'next') => {
    setCurrentDay(prevDay => {
      const currentIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(prevDay);
      const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0) return 'monday';
      if (newIndex > 6) return 'sunday';
      return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][newIndex];
    });
  };

  // Generate grocery list from weekly meal plan
  const generateGroceryList = () => {
    const ingredients: string[] = [];
    weeklyMealPlan.forEach(plan => {
      // Extract ingredients from meal names (simplified)
      const meals = [plan.meals.breakfast, plan.meals.lunch, plan.meals.dinner, plan.meals.snack];
      meals.forEach(meal => {
        // Simple ingredient extraction based on common Filipino foods
        if (meal.name.includes('Rice')) ingredients.push('Rice');
        if (meal.name.includes('Chicken') || meal.name.includes('Manok')) ingredients.push('Chicken');
        if (meal.name.includes('Beef') || meal.name.includes('Tapa')) ingredients.push('Beef');
        if (meal.name.includes('Fish') || meal.name.includes('Bangus')) ingredients.push('Fresh Fish');
        if (meal.name.includes('Egg')) ingredients.push('Eggs');
        if (meal.name.includes('Vegetable') || meal.name.includes('Pinakbet')) ingredients.push('Mixed Vegetables');
        if (meal.name.includes('Tomato')) ingredients.push('Tomatoes');
        if (meal.name.includes('Onion')) ingredients.push('Onions');
        if (meal.name.includes('Garlic')) ingredients.push('Garlic');
        if (meal.name.includes('Ginger')) ingredients.push('Ginger');
        if (meal.name.includes('Soy')) ingredients.push('Soy Sauce');
        if (meal.name.includes('Vinegar')) ingredients.push('Vinegar');
        if (meal.name.includes('Oil')) ingredients.push('Cooking Oil');
      });
    });
    
    // Remove duplicates and add common staples
    const uniqueIngredients = [...new Set(ingredients)];
    uniqueIngredients.push('Salt', 'Black Pepper', 'Sugar', 'Cooking Oil');
    
    setGroceryItems(uniqueIngredients);
    setShowGroceryList(true);
  };

  // Handle weekly view toggle
  const handleWeeklyView = () => {
    setShowWeeklyView(true);
  };

  // Handle meal prep tips
  const handleMealPrepTips = () => {
    setShowMealPrepTips(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Recommendations & Nutrition</Text>
          <Text style={styles.subtitle}>Get personalized food recommendations and detailed nutrition information</Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.recommendButton} onPress={handleRecommendFood}>
            <Text style={styles.recommendButtonText}>Get Food Recommendations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mealPlanButton} onPress={handleGenerateMealPlan}>
            <Text style={styles.mealPlanButtonText}>Generate Meal Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Planning Tools */}
        <View style={styles.enhancedTools}>
          <TouchableOpacity style={styles.toolButton} onPress={handleWeeklyView}>
            <Text style={styles.toolButtonText}>📅 Weekly View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={generateGroceryList}>
            <Text style={styles.toolButtonText}>🛒 Grocery List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={handleMealPrepTips}>
            <Text style={styles.toolButtonText}>👨‍🍳 Meal Prep Tips</Text>
          </TouchableOpacity>
        </View>

        {/* Meal Plan Section */}
        <View style={styles.mealPlanSection}>
          <Text style={styles.sectionTitle}>Weekly Meal Plan</Text>
          <View style={styles.daySelector}>
            <TouchableOpacity onPress={() => handleDayChange('prev')}>
              <Text style={styles.dayChangeText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.currentDayText}>{currentDay.charAt(0).toUpperCase() + currentDay.slice(1)}</Text>
            <TouchableOpacity onPress={() => handleDayChange('next')}>
              <Text style={styles.dayChangeText}>→</Text>
            </TouchableOpacity>
          </View>

          {isLoadingMealPlan ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Generating meal plan...</Text>
            </View>
          ) : (
            <View style={styles.mealPlanDetails}>
              {weeklyMealPlan.filter(plan => plan.day.toLowerCase() === currentDay).map(plan => (
                <View key={plan.id} style={styles.dailyPlan}>
                  <Text style={styles.mealTime}>Breakfast</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.foodName}>{plan.meals.breakfast.name}</Text>
                    <Text style={styles.foodCalories}>{plan.meals.breakfast.calories} kcal</Text>
                  </View>

                  <Text style={styles.mealTime}>Lunch</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.foodName}>{plan.meals.lunch.name}</Text>
                    <Text style={styles.foodCalories}>{plan.meals.lunch.calories} kcal</Text>
                  </View>

                  <Text style={styles.mealTime}>Dinner</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.foodName}>{plan.meals.dinner.name}</Text>
                    <Text style={styles.foodCalories}>{plan.meals.dinner.calories} kcal</Text>
                  </View>

                  <Text style={styles.mealTime}>Snack</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.foodName}>{plan.meals.snack.name}</Text>
                    <Text style={styles.foodCalories}>{plan.meals.snack.calories} kcal</Text>
                  </View>

                  <View style={styles.nutritionSummary}>
                    <Text style={styles.summaryText}>Total Calories: {plan.totalCalories} kcal</Text>
                    <Text style={styles.summaryText}>Protein: {plan.totalProtein}g</Text>
                    <Text style={styles.summaryText}>Fats: {plan.totalFats}g</Text>
                    <Text style={styles.summaryText}>Carbs: {plan.totalCarbs}g</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Disclaimer at the bottom */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: This app uses third-party APIs to provide nutritional and dietary information. The recommendations and information presented are for reference only and should not be considered as comprehensive or personalized dietary advice. Please consult a qualified health professional for tailored nutrition guidance. Use of this app is at your own risk.
          </Text>
        </View>
      </ScrollView>

      {/* Loading Modal */}
      <Modal visible={isLoadingRecommendations} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Finding food recommendations...</Text>
          </View>
        </View>
      </Modal>

      {/* Food Recommendations Modal */}
      <Modal visible={showRecommendations} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Recommended Foods</Text>
            <TouchableOpacity onPress={handleCancelRecommendations}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.recommendationsList}>
            {filteredRecommendations.map((food) => (
              <TouchableOpacity 
                key={food.id} 
                style={styles.foodItem} 
                onPress={() => handleSelectFood(food)}
              >
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodCalories}>{food.calories} kcal</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Nutrition Details Modal */}
      <Modal visible={showNutritionDetails} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNutritionDetails(false)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nutrition Details</Text>
            <View style={{ width: 50 }} />
          </View>
          
          {selectedFood && (
            <ScrollView style={styles.nutritionContainer}>
              <Text style={styles.nutritionTitle}>{selectedFood.name}</Text>
              <Text style={styles.servingSize}>Serving size: {selectedFood.calories}g</Text>
              
              <View style={styles.caloriesSection}>
                <Text style={styles.caloriesText}>{selectedFood.calories} calories</Text>
              </View>

              <View style={styles.macrosSection}>
                <Text style={styles.macrosTitle}>Macronutrients</Text>
                <View style={styles.macroRow}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{selectedFood.protein}g</Text>
                </View>
                <View style={styles.macroRow}>
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>{selectedFood.fats}g</Text>
                </View>
                <View style={styles.macroRow}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{selectedFood.carbs}g</Text>
                </View>
              </View>

              <View style={styles.nutrientsSection}>
                <Text style={styles.nutrientsTitle}>Other Nutrients</Text>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Cholesterol</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.cholesterol}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Sodium</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.sodium}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Dietary Fiber</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.dietaryFiber}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Sugar</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.sugar}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Vitamin D</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.vitaminD}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Calcium</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.calcium}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Iron</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.iron}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Potassium</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.potassium}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Vitamin A</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.vitaminA}</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>Vitamin C</Text>
                  <Text style={styles.nutrientValue}>{selectedFood.nutritionFacts.vitaminC}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.logFoodButton} onPress={handleAddSelectedFood}>
                <Text style={styles.logFoodButtonText}>Add to Log</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>✓ Food added to log successfully!</Text>
          </View>
        </View>
      </Modal>

      {/* Weekly View Modal */}
      <Modal visible={showWeeklyView} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Weekly Meal Plan Overview</Text>
            <TouchableOpacity onPress={() => setShowWeeklyView(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.weeklyContent}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const dayPlan = weeklyMealPlan.find(plan => plan.day.toLowerCase() === day.toLowerCase());
              return (
                <View key={day} style={styles.weeklyDayCard}>
                  <Text style={styles.weeklyDayTitle}>{day}</Text>
                  {dayPlan ? (
                    <View style={styles.weeklyMeals}>
                      <Text style={styles.weeklyMealText}>🌅 {dayPlan.meals.breakfast.name}</Text>
                      <Text style={styles.weeklyMealText}>☀️ {dayPlan.meals.lunch.name}</Text>
                      <Text style={styles.weeklyMealText}>🌙 {dayPlan.meals.dinner.name}</Text>
                      <Text style={styles.weeklyMealText}>🍿 {dayPlan.meals.snack.name}</Text>
                      <Text style={styles.weeklyTotalText}>Total: {dayPlan.totalCalories} kcal</Text>
                    </View>
                  ) : (
                    <Text style={styles.noMealText}>No meal plan for this day</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
  },
  weeklyMealText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  weeklyTotalText: {
    fontSize: 14,
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
});
