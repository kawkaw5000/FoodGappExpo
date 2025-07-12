import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";

interface FoodRecommendation {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
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

export default function TrackPage() {
  const router = useRouter();
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodRecommendation | null>(null);
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const foodRecommendations: FoodRecommendation[] = [
    {
      id: "1",
      name: "Well-marbled ribeye steak",
      calories: 389,
      protein: 95,
      fats: 85,
      carbs: 0,
      nutritionFacts: {
        cholesterol: "300mg",
        sodium: "300mg",
        dietaryFiber: "0g",
        sugar: "0g",
        vitaminD: "0IU",
        calcium: "40mg",
        iron: "14mg",
        potassium: "820mg",
        vitaminA: "0%",
        vitaminC: "0%"
      }
    },
    {
      id: "2", 
      name: "Ham pizza",
      calories: 320,
      protein: 65,
      fats: 45,
      carbs: 25,
      nutritionFacts: {
        cholesterol: "250mg",
        sodium: "450mg",
        dietaryFiber: "2g",
        sugar: "3g",
        vitaminD: "5IU",
        calcium: "120mg",
        iron: "8mg",
        potassium: "520mg",
        vitaminA: "2%",
        vitaminC: "1%"
      }
    },
    {
      id: "3",
      name: "Roasted chicken",
      calories: 280,
      protein: 80,
      fats: 35,
      carbs: 0,
      nutritionFacts: {
        cholesterol: "220mg",
        sodium: "280mg",
        dietaryFiber: "0g",
        sugar: "0g",
        vitaminD: "2IU",
        calcium: "25mg",
        iron: "6mg",
        potassium: "650mg",
        vitaminA: "1%",
        vitaminC: "0%"
      }
    }
  ];

  const handleRecommendFood = async () => {
    setIsLoadingRecommendations(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoadingRecommendations(false);
      setShowRecommendations(true);
    }, 2000);
  };

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
            {foodRecommendations.map((food) => (
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
});
