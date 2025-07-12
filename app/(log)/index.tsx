import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

interface LoggedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  meal: string;
}

export default function LogPage() {
  const router = useRouter();
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([
    // Sample logged foods - this would come from storage/database in real app
    {
      id: "1",
      name: "Chicken Breast",
      calories: 165,
      protein: 31,
      fats: 3.6,
      carbs: 0,
      meal: "Lunch"
    },
    {
      id: "2",
      name: "Brown Rice",
      calories: 111,
      protein: 2.6,
      fats: 0.9,
      carbs: 23,
      meal: "Lunch"
    },
    {
      id: "3",
      name: "Greek Yogurt",
      calories: 100,
      protein: 15,
      fats: 0,
      carbs: 6,
      meal: "Breakfast"
    }
  ]);

  const handleAddFood = (meal: string) => {
    // Navigate to the scan page when "Add Food" is pressed
    router.push("/(scan)/scan");
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
          <View key={food.id} style={styles.foodItem}>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodCalories}>{food.calories} kcal</Text>
            </View>
            <View style={styles.macros}>
              <Text style={styles.macroText}>P: {food.protein}g</Text>
              <Text style={styles.macroText}>F: {food.fats}g</Text>
              <Text style={styles.macroText}>C: {food.carbs}g</Text>
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addFoodButton} onPress={() => handleAddFood(mealName)}>
          <Text style={styles.addFoodButtonText}>+ Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{getTotalCalories()} / 2000</Text>
            <Text style={styles.progressSubText}>kcal</Text>
          </View>
        </View>

        {["Breakfast", "Lunch", "Dinner", "Snacks"].map(renderMealSection)}
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
});
