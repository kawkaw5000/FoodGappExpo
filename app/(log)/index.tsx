import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../../constants/Config";

interface LoggedFood {
  id: string;
  foodId?: number;
  foodLogId?: number;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  meal: string;
  grams?: number;
  cholesterol?: number;
  sodium?: number;
  fiber?: number;
  sugars?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  vitaminA?: number;
  vitaminC?: number;
  nutrientLogId?: number;
}

// Enhanced nutrition summary interface
interface DailyNutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  goalCalories: number;
  goalProtein: number;
  goalFats: number;
  goalCarbs: number;
  caloriesProgress: number;
  proteinProgress: number;
  fatsProgress: number;
  carbsProgress: number;
}

// Nutrition insight for the log page
interface NutritionInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
  icon: string;
}

export default function LogPage() {
  const router = useRouter();
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedFood, setSelectedFood] = useState<LoggedFood | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  
  // Enhanced nutrition tracking states
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [nutritionInsights, setNutritionInsights] = useState<NutritionInsight[]>([]);
  const [showInsights, setShowInsights] = useState(true);

  // Load user ID from storage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        } else {
          // If no userId in storage, use a default one for testing
          setUserId(1);
        }
      } catch (error) {
        console.error('Error loading user ID:', error);
        setUserId(1); // Default fallback
      }
    };
    loadUserId();
  }, []);

  // Fetch user logs from API
  const fetchUserLogs = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${Config.API_BASE}/api/foodlogging/getUserLogs?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log("Raw API response:", data);
      
      if (response.ok && data.logs) {
        console.log("Using food data from database (Food table)");
        
        // Transform backend data to frontend format - now using foodData from database
        const transformedLogs = data.logs
          .filter((log: any) => log.nutrientData) // Only include logs with nutrition data
          .map((log: any) => {
            console.log("Processing log:", log);
            console.log("Nutrient data:", log.nutrientData);
            
            // Determine food name with multiple fallbacks:
            // 1) foodData from joined Food table: log.foodData?.FoodName
            // 2) top-level foodName provided by backend: log.foodName
            // 3) nested nutrientData.food?.FoodName (some serializers include nested food)
            // 4) fallback to generic "Food Entry {foodId}"
            const foodName = log.foodData?.FoodName
              || log.foodName
              || log.nutrientData?.food?.FoodName
              || `Food Entry ${log.foodId}`;
            
            return {
              id: log.foodLogId.toString(),
              foodId: log.foodId, // include FoodId for modal and debugging
              name: foodName,
              // Use the exact field names from your NutrientLog table
              calories: parseInt(log.nutrientData.calories) || 0, // lowercase 'c'
              protein: parseFloat(log.nutrientData.protein) || 0, // lowercase 'p'
              fats: parseFloat(log.nutrientData.fat) || 0, // 'fat' not 'fats'
              carbs: 0, // Not in your NutrientLog table yet
              meal: log.mealType || 'Breakfast', // Use mealType from backend response
              grams: parseFloat(log.nutrientData.foodGramAmount) || 100, // camelCase
              // Additional nutrition data for the modal - using exact database field names
              cholesterol: 0, // Not in your current table structure
              sodium: 0, // Not in your current table structure
              fiber: 0, // Not in your current table structure
              sugars: 0, // Not in your current table structure
              vitaminD: 0, // Not in your current table structure
              calcium: 0, // Not in your current table structure
              iron: 0, // Not in your current table structure
              potassium: 0, // Not in your current table structure
              vitaminA: 0, // Not in your current table structure
              vitaminC: 0, // Not in your current table structure
              nutrientLogId: log.nutrientData.nutrientLogId // camelCase
            };
          });
        
        console.log("Transformed logs:", transformedLogs);
        setLoggedFoods(transformedLogs);
      } else {
        console.error('Failed to fetch logs:', data);
        setLoggedFoods([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLoggedFoods([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily nutrition summary
  const calculateDailySummary = (foods: LoggedFood[]): DailyNutritionSummary => {
    const totals = foods.reduce((acc, food) => ({
      totalCalories: acc.totalCalories + food.calories,
      totalProtein: acc.totalProtein + food.protein,
      totalFats: acc.totalFats + food.fats,
      totalCarbs: acc.totalCarbs + food.carbs,
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalFats: 0,
      totalCarbs: 0,
    });

    // Daily goals (can be made dynamic based on user profile)
    const goals = {
      goalCalories: 2000,
      goalProtein: 150,
      goalFats: 65,
      goalCarbs: 250,
    };

    return {
      ...totals,
      ...goals,
      caloriesProgress: Math.min((totals.totalCalories / goals.goalCalories) * 100, 100),
      proteinProgress: Math.min((totals.totalProtein / goals.goalProtein) * 100, 100),
      fatsProgress: Math.min((totals.totalFats / goals.goalFats) * 100, 100),
      carbsProgress: Math.min((totals.totalCarbs / goals.goalCarbs) * 100, 100),
    };
  };

  // Generate nutrition insights based on daily summary
  const generateNutritionInsights = (summary: DailyNutritionSummary): NutritionInsight[] => {
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

    // Balance insights
    const isBalanced = summary.proteinProgress >= 70 && summary.fatsProgress >= 50 && summary.carbsProgress >= 50;
    if (isBalanced && summary.caloriesProgress >= 80 && summary.caloriesProgress <= 110) {
      insights.push({
        type: 'success',
        message: 'Your nutrition is well-balanced today! Keep up the great work.',
        icon: '🌟'
      });
    }

    return insights.slice(0, 2); // Limit to 2 insights
  };

  // Update summary and insights when foods change
  useEffect(() => {
    if (loggedFoods.length > 0) {
      const summary = calculateDailySummary(loggedFoods);
      setDailySummary(summary);
      
      const insights = generateNutritionInsights(summary);
      setNutritionInsights(insights);
    } else {
      setDailySummary(null);
      setNutritionInsights([]);
    }
  }, [loggedFoods]);

  // Refresh data when screen comes into focus (e.g., returning from scan page)
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchUserLogs();
      }
    }, [userId])
  );

  const handleAddFood = (meal: string) => {
    // Navigate to the scan page when "Add Food" is pressed
    router.push("/(scan)/scan");
  };

  const handleFoodPress = (food: LoggedFood) => {
    setSelectedFood(food);
    setShowNutritionModal(true);
  };

  const handleDeleteFood = async (food: LoggedFood) => {
    Alert.alert(
      "Delete Food Log",
      `Are you sure you want to delete "${food.name}" from your log?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${Config.API_BASE}/api/foodlogging/deleteLog/${food.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include'
              });

              if (response.ok) {
                Alert.alert("Success", "Food log deleted successfully!");
                setShowNutritionModal(false);
                fetchUserLogs(); // Refresh the logs
              } else {
                const errorText = await response.text();
                console.error("Delete error response:", errorText);
                Alert.alert("Error", "Failed to delete food log: " + errorText);
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete food log");
            }
          }
        }
      ]
    );
  };


  const getTotalCalories = () => {
    return loggedFoods.reduce((total, food) => total + food.calories, 0);
  };

  const getFoodsForMeal = (mealName: string) => {
    return loggedFoods.filter(food => food.meal === mealName);
  };

  const renderMealSection = (mealName: string) => {
    const mealFoods = getFoodsForMeal(mealName);
    const mealCalories = mealFoods.reduce((total, food) => total + food.calories, 0);

    return (
      <View key={mealName} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{mealName}</Text>
          <Text style={styles.mealCalories}>{mealCalories} kcal</Text>
        </View>

        {mealFoods.map((food) => (
          <TouchableOpacity key={food.id} style={styles.foodItem} onPress={() => handleFoodPress(food)}>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, !food.name || food.name.startsWith('Food Entry') ? { color: 'red', fontWeight: 'bold' } : null]}>
                {food.name}
                {!food.name || food.name.startsWith('Food Entry') ? ' (Name missing from backend)' : ''}
              </Text>
              <Text style={styles.foodCalories}>{food.calories} kcal</Text>
            </View>
            <View style={styles.macros}>
              <Text style={styles.macroText}>P: {food.protein}g</Text>
              <Text style={styles.macroText}>F: {food.fats}g</Text>
              <Text style={styles.macroText}>C: {food.carbs}g</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addFoodButton} onPress={() => handleAddFood(mealName)}>
          <Text style={styles.addFoodButtonText}>+ Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your food logs...</Text>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{getTotalCalories()} / 2000</Text>
              <Text style={styles.progressSubText}>kcal</Text>
            </View>
          </View>

          {/* Enhanced Nutrition Summary */}
          {dailySummary && (
            <View style={styles.nutritionSummary}>
              <Text style={styles.summaryTitle}>📊 Daily Nutrition Summary</Text>
              
              <View style={styles.macroGrid}>
                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{Math.round(dailySummary.totalProtein)}g</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${dailySummary.proteinProgress}%`, backgroundColor: '#4CAF50' }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(dailySummary.proteinProgress)}%</Text>
                </View>

                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>{Math.round(dailySummary.totalFats)}g</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${dailySummary.fatsProgress}%`, backgroundColor: '#FF9800' }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(dailySummary.fatsProgress)}%</Text>
                </View>

                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{Math.round(dailySummary.totalCarbs)}g</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${dailySummary.carbsProgress}%`, backgroundColor: '#2196F3' }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(dailySummary.carbsProgress)}%</Text>
                </View>
              </View>
            </View>
          )}

          {/* Nutrition Insights */}
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

          {["Breakfast", "Lunch", "Dinner", "Snacks"].map(renderMealSection)}
        </ScrollView>
      )}
      
      {/* Nutrition Details Modal */}
      <Modal visible={showNutritionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.nutritionContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFood?.name}</Text>
              <TouchableOpacity onPress={() => setShowNutritionModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.nutritionContent}>
              <View style={styles.servingSection}>
                <Text style={styles.servingText}>Serving Size: {selectedFood?.grams || 100}g</Text>
                <Text style={styles.mealTypeText}>Meal: {selectedFood?.meal}</Text>
              </View>
              
              <View style={styles.caloriesSection}>
                <Text style={styles.caloriesText}>{selectedFood?.calories || 0} cal</Text>
              </View>
              
              <View style={styles.macrosSection}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={[styles.macroValue, {color: '#FF5722'}]}>{selectedFood?.protein || 0}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={[styles.macroValue, {color: '#FF9800'}]}>{selectedFood?.fats || 0}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={[styles.macroValue, {color: '#4CAF50'}]}>{selectedFood?.carbs || 0}g</Text>
                </View>
              </View>
              
              <Text style={styles.nutritionFactsTitle}>Log Information</Text>
              <View style={styles.nutritionFacts}>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientName}>Food Log ID</Text>
                  <Text style={styles.nutrientValue}>FoodLogId: {selectedFood?.id}</Text>
                  <Text style={styles.nutrientValue}>FoodId: {selectedFood?.foodId ?? 'N/A'}</Text>
                </View>
                {selectedFood?.nutrientLogId && (
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientName}>Nutrient Log ID</Text>
                    <Text style={styles.nutrientValue}>{selectedFood.nutrientLogId}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => selectedFood && handleDeleteFood(selectedFood)}
              >
                <Text style={styles.deleteButtonText}>Delete Food Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  progressSubText: {
    fontSize: 16,
    color: "gray",
  },
  mealSection: {
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  foodItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  foodInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  foodCalories: {
    fontSize: 14,
    color: "#666",
  },
  macros: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addFoodButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    marginTop: 10,
  },
  addFoodButtonText: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  nutritionContainer: {
    backgroundColor: "#fff",
    width: "90%",
    height: "70%",
    borderRadius: 15,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#f8f8f8",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  cancelText: {
    fontSize: 16,
    color: "#FF5722",
    fontWeight: "600",
  },
  nutritionContent: {
    flex: 1,
    padding: 20,
  },
  servingSection: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  servingText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  caloriesSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  macrosSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  macroItem: {
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  nutritionFactsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  nutritionFacts: {
    marginBottom: 20,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  nutrientName: {
    fontSize: 14,
    color: "#666",
  },
  nutrientValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  deleteButton: {
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  nutritionSummary: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  macroGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginTop: 8,
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  insightsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  },
  insightSuccess: {
    borderLeftColor: "#4CAF50",
  },
  insightWarning: {
    borderLeftColor: "#FF9800",
  },
  insightInfo: {
    borderLeftColor: "#2196F3",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
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
    fontSize: 24,
    marginBottom: 8,
  },
  insightMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
