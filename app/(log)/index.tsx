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

// Food logging focused - nutrition tracking moved to Track tab

export default function LogPage() {
  const router = useRouter();
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedFood, setSelectedFood] = useState<LoggedFood | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  
  // Focused on food logging only - nutrition tracking moved to Track tab

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
            console.log("Available date fields:", {
              nutrientUpdatedAt: log.nutrientData?.updatedAt,
              logUpdatedAt: log.updatedAt,
              nutrientCreatedAt: log.nutrientData?.createdAt,
              logCreatedAt: log.createdAt,
              loggedDate: log.loggedDate,
              dateLogged: log.dateLogged
            });
            
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
              carbs: parseFloat(log.nutrientData.carbs || log.nutrientData.carbohydrates || log.nutrientData.total_carbohydrate) || 0,
              meal: log.mealType || 'Breakfast', // Use mealType from backend response
              grams: parseFloat(log.nutrientData.foodGramAmount) || 100, // camelCase
              // Add logged date - prioritize updatedAt from NutrientLog table for accuracy
              loggedDate: log.nutrientData?.updatedAt || log.updatedAt || log.nutrientData?.createdAt || log.createdAt || log.loggedDate || log.dateLogged || new Date().toISOString().split('T')[0],
              // Additional nutrition data for the modal - extract from available data
              cholesterol: parseFloat(log.nutrientData.cholesterol) || 0,
              sodium: parseFloat(log.nutrientData.sodium) || 0,
              fiber: parseFloat(log.nutrientData.fiber) || 0,
              sugars: parseFloat(log.nutrientData.sugars || log.nutrientData.Sugar || log.nutrientData.sugar) || 0,
              vitaminD: parseFloat(log.nutrientData.vitaminD) || 0,
              calcium: parseFloat(log.nutrientData.calcium) || 0,
              iron: parseFloat(log.nutrientData.iron) || 0,
              potassium: parseFloat(log.nutrientData.potassium) || 0,
              vitaminA: parseFloat(log.nutrientData.vitaminA) || 0,
              vitaminC: parseFloat(log.nutrientData.vitaminC) || 0,
              micronutrients: log.nutrientData.microNutrients || log.nutrientData.MicroNutrients || log.nutrientData.micronutrients || "",
              nutrientLogId: log.nutrientData.nutrientLogId, // camelCase
            };
          })
          .map((food: any) => {
            // Debug micronutrients data
            console.log("Food micronutrients debug:", {
              name: food.name,
              micronutrients: food.micronutrients,
              hasMicronutrients: !!(food.micronutrients && food.micronutrients.trim())
            });
            return food;
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

  // Nutrition tracking moved to Track tab - Log tab focuses on food logging only

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




  const getFoodsForMeal = (mealName: string) => {
    return loggedFoods.filter(food => food.meal === mealName);
  };

  const renderMealSection = (mealName: string) => {
    const mealFoods = getFoodsForMeal(mealName);

    return (
      <View key={mealName} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{mealName}</Text>
        </View>

        {mealFoods.map((food) => (
          <TouchableOpacity key={food.id} style={styles.foodItem} onPress={() => handleFoodPress(food)}>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, !food.name || food.name.startsWith('Food Entry') ? { color: 'red', fontWeight: 'bold' } : null]}>
                {food.name}
                {!food.name || food.name.startsWith('Food Entry') ? ' (Name missing from backend)' : ''}
              </Text>
            </View>
            <View style={styles.macros}>
              <Text style={styles.macroText}>P: {food.protein}g</Text>
              <Text style={styles.macroText}>F: {food.fats}g</Text>
              <Text style={styles.macroText}>C: {food.carbs}g</Text>
              <Text style={styles.macroText}>S: {food.sugars || 0}g</Text>
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
          {/* Focused on food logging only - nutrition tracking moved to Track tab */}
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
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Sugar</Text>
                  <Text style={[styles.macroValue, {color: '#9C27B0'}]}>{selectedFood?.sugars || 0}g</Text>
                </View>
              </View>
              
              {/* Micronutrients Section - matches scan popup style */}
              <View style={styles.micronutrientsSection}>
                <Text style={styles.micronutrientsLabel}>Micronutrients:</Text>
                {selectedFood?.micronutrients && selectedFood.micronutrients.trim() ? (
                  <Text style={styles.micronutrientsText}>{selectedFood.micronutrients}</Text>
                ) : (
                  <Text style={styles.micronutrientsPlaceholder}>No micronutrient data available for this food</Text>
                )}
              </View>
              
              <Text style={styles.nutritionFactsTitle}>Log Information</Text>
              <View style={styles.nutritionFacts}>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutrientName}>Last Updated</Text>
                  <Text style={styles.nutrientValue}>
                    {formatLoggedDate(selectedFood?.loggedDate)}
                  </Text>
                </View>

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

  macros: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
  },
  macroText: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 35,
    textAlign: "center",
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
  micronutrientsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 8,
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
    fontStyle: 'italic',
  },
  micronutrientsPlaceholder: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    fontStyle: 'italic',
    opacity: 0.7,
  },

  // Nutrition tracking styles removed - moved to Track tab
});
