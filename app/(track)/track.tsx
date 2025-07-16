import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

interface FoodRecommendation {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  description: string;
}

export default function TrackPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMeal = params.meal as string || "Breakfast";
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [trackedFoods, setTrackedFoods] = useState<FoodRecommendation[]>([]);

  // Filipino food recommendations
  const filipinoFoodRecommendations: FoodRecommendation[] = [
    {
      id: "1",
      name: "Adobong Manok",
      calories: 285,
      protein: 25,
      carbs: 8,
      fats: 18,
      category: "Viand",
      description: "Classic Filipino chicken adobo with soy sauce and vinegar"
    },
    {
      id: "2", 
      name: "Pancit Canton",
      calories: 340,
      protein: 12,
      carbs: 52,
      fats: 11,
      category: "Noodles",
      description: "Stir-fried wheat noodles with vegetables and meat"
    },
    {
      id: "3",
      name: "Sinigang na Baboy",
      calories: 220,
      protein: 18,
      carbs: 15,
      fats: 12,
      category: "Soup",
      description: "Tamarind-based pork soup with vegetables"
    },
    {
      id: "4",
      name: "Fried Rice (Garlic)",
      calories: 280,
      protein: 8,
      carbs: 45,
      fats: 9,
      category: "Rice",
      description: "Filipino-style garlic fried rice"
    },
    {
      id: "5",
      name: "Lumpia Shanghai",
      calories: 45,
      protein: 3,
      carbs: 4,
      fats: 2,
      category: "Appetizer",
      description: "Filipino spring rolls (per piece)"
    },
    {
      id: "6",
      name: "Tinola",
      calories: 180,
      protein: 20,
      carbs: 8,
      fats: 8,
      category: "Soup",
      description: "Ginger-based chicken soup with green papaya"
    },
    {
      id: "7",
      name: "Kare-Kare",
      calories: 350,
      protein: 22,
      carbs: 12,
      fats: 25,
      category: "Viand",
      description: "Oxtail stew in peanut sauce"
    },
    {
      id: "8",
      name: "Bicol Express",
      calories: 320,
      protein: 15,
      carbs: 10,
      fats: 26,
      category: "Viand",
      description: "Spicy pork in coconut milk with chilies"
    }
  ];

  // Reset daily tracking at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      const lastReset = new Date(currentDate);
      
      if (now.getDate() !== lastReset.getDate() || 
          now.getMonth() !== lastReset.getMonth() || 
          now.getFullYear() !== lastReset.getFullYear()) {
        setCurrentDate(now);
        setTrackedFoods([]); // Reset tracked foods for new day
        console.log("Daily tracker reset for new day");
      }
    };

    // Check every minute
    const interval = setInterval(checkForNewDay, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const getMealRecommendations = (mealType: string) => {
    // Filter recommendations based on meal type
    switch (mealType) {
      case "Breakfast":
        return filipinoFoodRecommendations.filter(food => 
          ["Rice", "Soup"].includes(food.category) || 
          food.name.includes("Fried Rice")
        );
      case "Lunch":
        return filipinoFoodRecommendations.filter(food => 
          ["Viand", "Noodles", "Soup", "Rice"].includes(food.category)
        );
      case "Dinner":
        return filipinoFoodRecommendations.filter(food => 
          ["Viand", "Soup", "Rice"].includes(food.category)
        );
      default:
        return filipinoFoodRecommendations;
    }
  };

  const handleAddRecommendation = (food: FoodRecommendation) => {
    setTrackedFoods(prev => [...prev, food]);
    Alert.alert("Added to Tracker", `${food.name} has been added to your daily tracker!`);
  };

  const getCurrentDateString = () => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalCalories = () => {
    return trackedFoods.reduce((total, food) => total + food.calories, 0);
  };

  const recommendations = getMealRecommendations(selectedMeal);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Tracker</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Date and Daily Reset Info */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{getCurrentDateString()}</Text>
          <Text style={styles.dailyResetText}>Daily tracker resets at midnight</Text>
        </View>

        {/* Daily Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{getTotalCalories()}</Text>
            <Text style={styles.progressSubText}>/ {dailyGoal} kcal</Text>
          </View>
          <Text style={styles.progressLabel}>Today's Intake</Text>
        </View>

        {/* Meal Selection */}
        <View style={styles.mealSection}>
          <Text style={styles.sectionTitle}>Recommendations for {selectedMeal}</Text>
          <View style={styles.mealTabs}>
            {["Breakfast", "Lunch", "Dinner"].map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealTab,
                  selectedMeal === meal && styles.activeMealTab
                ]}
                onPress={() => router.setParams({ meal })}
              >
                <Text style={[
                  styles.mealTabText,
                  selectedMeal === meal && styles.activeMealTabText
                ]}>
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filipino Food Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Filipino Food Recommendations</Text>
          {recommendations.map((food) => (
            <View key={food.id} style={styles.foodCard}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodDescription}>{food.description}</Text>
                <Text style={styles.foodCategory}>{food.category}</Text>
                
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{food.calories}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{food.protein}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>{food.carbs}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fats</Text>
                    <Text style={styles.nutritionValue}>{food.fats}g</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddRecommendation(food)}
              >
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tracked Foods Today */}
        {trackedFoods.length > 0 && (
          <View style={styles.trackedSection}>
            <Text style={styles.sectionTitle}>Tracked Today ({trackedFoods.length} items)</Text>
            {trackedFoods.map((food, index) => (
              <View key={`${food.id}-${index}`} style={styles.trackedItem}>
                <Text style={styles.trackedName}>{food.name}</Text>
                <Text style={styles.trackedCalories}>{food.calories} kcal</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 24,
  },
  dateSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  dailyResetText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  progressSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  progressSubText: {
    fontSize: 14,
    color: "#666",
  },
  progressLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  mealSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  mealTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mealTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  activeMealTab: {
    backgroundColor: "#4CAF50",
  },
  mealTabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeMealTabText: {
    color: "#fff",
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  foodCategory: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    padding: 8,
  },
  trackedSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trackedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackedName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  trackedCalories: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
