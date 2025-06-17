import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import Config from "@/constants/Config";

export default function ManualEntryScreen() {
  const { food: foodParam } = useLocalSearchParams();
  const [food, setFood] = useState(typeof foodParam === 'string' ? foodParam : "");
  const [grams, setGrams] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [lastNutrition, setLastNutrition] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!food.trim() || !grams.trim() || isNaN(Number(grams)) || Number(grams) <= 0) {
      Alert.alert("Error", "Please enter a valid food and grams.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        date: new Date().toISOString(),
        body_goal: "lose weight", // You can make this dynamic if needed
        items: [
          {
            foodName: food.trim(),
            grams: parseInt(grams, 10)
          }
        ]
      };
      const response = await fetch(Config.BASE_URL + "/get_nutritional_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setLoading(false);
      if (data && data.nutritional_info) {
        setLastNutrition(data.nutritional_info);
        setShowSaveButton(true);
        Alert.alert("Nutritional Info", data.nutritional_info);
      } else {
        Alert.alert("Error", "No nutritional info returned.");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", "Failed to fetch nutritional info.");
    }
  };

  const handleSaveToLog = () => {
    Alert.alert("Saved!", "This food has been saved to your log (dummy action).");
    setShowSaveButton(false);
    setFood("");
    setGrams("");
    setLastNutrition("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Manual Food Entry</Text>
        <TextInput
          style={styles.input}
          placeholder="Food name"
          value={food}
          onChangeText={setFood}
        />
        <TextInput
          style={styles.input}
          placeholder="Grams"
          value={grams}
          onChangeText={text => setGrams(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <CustomButton title={loading ? "Submitting..." : "Submit"} onPress={handleSubmit} />
        {showSaveButton && (
          <View style={{ marginTop: 16, width: '100%' }}>
            <CustomButton title="Save to Log" onPress={handleSaveToLog} />
          </View>
        )}
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#FCB647', textDecorationLine: 'underline' }}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCB647',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 16,
  },
});
