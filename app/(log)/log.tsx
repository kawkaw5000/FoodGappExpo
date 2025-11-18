import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function LogPage() {
  const router = useRouter();

  const handleAddFood = (meal: string) => {
    // Navigate to the scan page when "Add Food" is pressed
    router.push('/(scan)/scan'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{Number(0).toFixed(2)} / {Number(2000).toFixed(2)}</Text>
            <Text style={styles.progressSubText}>kcal</Text>
          </View>
        </View>

        <View style={styles.mealSection}>
          <Text style={styles.mealTitle}>Breakfast</Text>
          {/* This area will list the food items later */}
          <TouchableOpacity style={styles.addFoodButton} onPress={() => handleAddFood('Breakfast')}>
            <Text style={styles.addFoodButtonText}>Add Food</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealSection}>
          <Text style={styles.mealTitle}>Lunch</Text>
          {/* This area will list the food items later */}
          <TouchableOpacity style={styles.addFoodButton} onPress={() => handleAddFood('Lunch')}>
            <Text style={styles.addFoodButtonText}>Add Food</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealSection}>
          <Text style={styles.mealTitle}>Dinner</Text>
          {/* This area will list the food items later */}
          <TouchableOpacity style={styles.addFoodButton} onPress={() => handleAddFood('Dinner')}>
            <Text style={styles.addFoodButtonText}>Add Food</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 45, // Add more top padding for status bar
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSubText: {
    fontSize: 16,
    color: 'gray',
  },
  mealSection: {
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    backgroundColor: '#FFFFFF',
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
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addFoodButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
