// ...existing code...
import React, { useState, useEffect, useRef } from "react";
import { View, Text, SafeAreaView, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Button, Modal } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from "../../constants/Config";
import UserExperienceService from "../../services/UserExperienceService";
import XPNotification from "../../components/XPNotification";

export default function ScanPage() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Breakfast");
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  
  // XP Notification states
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpNotificationData, setXPNotificationData] = useState({
    xpGained: 0,
    reason: '',
    isLevelUp: false,
    newLevel: 0,
    isConsecutiveBonus: false,
    consecutiveDays: 0,
  });

  useEffect(() => {
    (async () => {
      const permission = await requestCameraPermission();
      setHasPermission(permission.granted);
    })();
  }, []);

  // Award XP helper function
  const awardXP = async (amount: number, reason: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userLevel = await UserExperienceService.addXP(userId, amount, reason);
        setXPNotificationData({
          xpGained: amount,
          reason,
          isLevelUp: false, // or true if backend returns
          newLevel: userLevel.level,
          isConsecutiveBonus: false, // Set appropriately if backend returns this
          consecutiveDays: 0, // Set appropriately if backend returns this
        });
        setShowXPNotification(true);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  // Scan button handler
  const handleScan = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo.");
      }
      const form = new FormData();
      form.append("file", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const res = await fetch(Config.DESCRIBE_IMAGE_API, {
        method: "POST",
        body: form,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = await res.json();
      if (res.ok && data.description) {
        const name = data.description.split(":").pop()?.trim() || "";
        setFoodName(name);
        
        // Award XP for scanning
        await awardXP(25, 'Food Scanned');
      } else {
        Alert.alert("Detection Failed", "Could not detect food. Please enter manually.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to scan food.");
    } finally {
      setLoading(false);
    }
  };

  // Submit button handler - now shows nutrition first
  const handleSubmit = async () => {
    if (!foodName || !grams) {
      Alert.alert("Missing Info", "Please enter food name and grams.");
      return;
    }
    setLoadingNutrition(true);
    try {
      // Get nutritional information first - format for your Python API
      const nutritionPayload = {
        items: [
          {
            foodName: foodName,
            grams: parseFloat(grams)
          }
        ],
        body_goal: "maintain weight", // You can get this from user profile later
        date: new Date().toISOString()
      };
      console.log("[Nutrition] Outgoing payload:", nutritionPayload);

      const nutritionRes = await fetch(Config.NUTRITION_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nutritionPayload),
      });

      const nutritionRawText = await nutritionRes.text();
      console.log("[Nutrition] Raw response text:", nutritionRawText);
      if (nutritionRes.ok) {
        const nutritionResponse = JSON.parse(nutritionRawText);
        console.log("[Nutrition] Parsed response:", nutritionResponse);
        // Use new backend: always expect foods array
        let foodObj = null;
        if (nutritionResponse.foods && Array.isArray(nutritionResponse.foods) && nutritionResponse.foods.length > 0) {
          foodObj = nutritionResponse.foods[0];
        }
        if (foodObj && (
          Number(foodObj.Calories ?? 0) > 0 ||
          Number(foodObj.Protein ?? 0) > 0 ||
          Number(foodObj.Fat ?? 0) > 0 ||
          Number(foodObj.Carbs ?? 0) > 0
        )) {
          setNutritionData({
            calories: Number(foodObj.Calories ?? 0),
            protein: Number(foodObj.Protein ?? 0),
            fats: Number(foodObj.Fat ?? 0),
            carbs: Number(foodObj.Carbs ?? 0)
          });
          setShowNutritionModal(true);
        } else {
          // Show a temporary alert and do not show modal
          Alert.alert("No nutrition data found for this food.");
          setTimeout(() => setLoadingNutrition(false), 1200);
        }
      } else {
        Alert.alert("Error", "Failed to get nutritional information.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to get nutritional information.");
    } finally {
      if (!loadingNutrition) setLoadingNutrition(false);
    }
  };

  // Actual logging function called from nutrition modal
  const handleConfirmLog = async () => {
    setLoading(true);
    try {
      // Map meal type to category ID for backend
      const foodCategoryId = mealType === "Breakfast" ? 1 : 
                           mealType === "Lunch" ? 2 : 
                           mealType === "Dinner" ? 3 : 1;

      // Use the logScannedFood endpoint which accepts nutrition data directly
      const payload = {
        foodName,
        grams: parseFloat(grams),
        calories: nutritionData?.calories?.toString() || "0",
        protein: nutritionData?.protein?.toString() || "0", 
        fat: nutritionData?.total_fat?.toString() || "0",
        mealType: mealType // Added mealType to match backend
      };
      
      console.log("Scanned Food Payload:", payload);
      
      const res = await fetch(`${Config.API_BASE}/api/foodlogging/logScannedFood`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: 'include', // Important for authentication
        body: JSON.stringify(payload),
      });
      
      console.log("Response status:", res.status);
      const rawResponseText = await res.text();
      console.log("Raw response text:", rawResponseText);
      
      if (res.ok) {
        const responseData = JSON.parse(rawResponseText);
        console.log("Response data:", responseData);
        
        // Add to local recentScans in AsyncStorage
        try {
          const scanEntry = {
            id: Date.now().toString(),
            name: foodName,
            confidence: 100, // or use a real value if available
            calories: Number(nutritionData?.calories || 0),
            scannedDate: new Date().toISOString(),
            // image: photoUri (if available)
          };
          const existing = await AsyncStorage.getItem('recentScans');
          let arr = [];
          if (existing) {
            arr = JSON.parse(existing);
          }
          arr.unshift(scanEntry);
          // Optionally limit to last 10
          if (arr.length > 10) arr = arr.slice(0, 10);
          await AsyncStorage.setItem('recentScans', JSON.stringify(arr));
        } catch (err) {
          console.error('Failed to update recentScans:', err);
        }

        setShowNutritionModal(false);
        setShowSuccess(true);
        setFoodName("");
        setGrams("100");
        setMealType("Breakfast");
        setNutritionData(null);
        
        // Award XP for food logging
        await awardXP(50, 'Food Logged');
        
        // Navigate back to log page after 2 seconds to show the updated logs
        setTimeout(() => {
          setShowSuccess(false);
          router.back();
        }, 2000);
      } else {
        const errorData = JSON.parse(rawResponseText);
        Alert.alert("Error", errorData.error || "Failed to log food.");
      }
    } catch (e) {
      console.error("Error logging food:", e);
      Alert.alert("Error", "Failed to log food.");
    } finally {
      setLoading(false);
    }
  };

  const handleNutritionFetch = async () => {
    setLoadingNutrition(true);
    try {
      const res = await fetch(Config.NUTRITION_API + `?food=${encodeURIComponent(foodName)}&grams=${grams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setNutritionData(data);
        setShowNutritionModal(true);
      } else {
        Alert.alert("Error", "Failed to fetch nutrition data.");
      }
    } catch (e) {
      console.error("Error fetching nutrition data:", e);
      Alert.alert("Error", "Failed to fetch nutrition data.");
    } finally {
      setLoadingNutrition(false);
    }
  };

  // Parse nutrition text response from AI into structured data
  const parseNutritionText = (nutritionText: string) => {
    const nutrition = {
      calories: 0,
      protein: 0,
      total_fat: 0,
      total_carbohydrate: 0,
      cholesterol: 0,
      sodium: 0,
      dietary_fiber: 0,
      sugars: 0,
      vitamin_d: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
      vitamin_a: 0,
      vitamin_c: 0
    };

    if (!nutritionText) return nutrition;

    // Extract values using regex patterns
    const extractValue = (pattern: string) => {
      const patterns = pattern.split('|'); // Handle multiple patterns like "Total Fat|Fat"
      for (const p of patterns) {
        const match = nutritionText.match(new RegExp(p + ':\\s*(\\d+(?:\\.\\d+)?)', 'i'));
        if (match) return parseFloat(match[1]);
      }
      return 0;
    };

    nutrition.calories = extractValue('Calories');
    nutrition.protein = extractValue('Protein');
    nutrition.total_fat = extractValue('Total Fat|Fat'); // Handle both "Total Fat" and "Fat"
    nutrition.total_carbohydrate = extractValue('Total Carbohydrates|Carbohydrates|Carbs');
    nutrition.cholesterol = extractValue('Cholesterol');
    nutrition.sodium = extractValue('Sodium');
    nutrition.dietary_fiber = extractValue('Dietary Fiber');
    nutrition.sugars = extractValue('Sugar');
    nutrition.vitamin_d = extractValue('Vitamin D');
    nutrition.calcium = extractValue('Calcium');
    nutrition.iron = extractValue('Iron');
    nutrition.potassium = extractValue('Potassium');
    nutrition.vitamin_a = extractValue('Vitamin A');
    nutrition.vitamin_c = extractValue('Vitamin C');

    return nutrition;
  };

  if (!cameraPermission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FCB647" />
      </View>
    );
  }
  if (!cameraPermission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.cameraBoxWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraBox}
            facing={cameraType}
            onCameraReady={() => console.log("Camera is ready")}
          />
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          accessibilityLabel="Scan Food"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanButtonText}>Scan Food</Text>
          )}
        </TouchableOpacity>

        {/* Manual Entry Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Food Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Food Name"
            value={foodName}
            onChangeText={setFoodName}
            testID="foodNameInput"
          />
          <Text style={styles.label}>Edible Part (Grams)</Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            value={grams}
            onChangeText={setGrams}
            keyboardType="numeric"
            testID="gramsInput"
          />
          <Text style={styles.label}>Meal</Text>
          <View style={styles.mealRow}>
            {["Breakfast", "Lunch", "Dinner"].map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealButton,
                  mealType === meal && styles.mealButtonSelected,
                ]}
                onPress={() => setMealType(meal)}
                testID={`mealButton-${meal}`}
              >
                <Text
                  style={[
                    styles.mealButtonText,
                    mealType === meal && styles.mealButtonTextSelected,
                  ]}
                >
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            accessibilityLabel="Add to Log"
            testID="submitButton"
          >
            {loadingNutrition ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add to Log</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Nutrition Modal */}
        <Modal visible={showNutritionModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.nutritionContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{foodName}</Text>
                <TouchableOpacity onPress={() => setShowNutritionModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.nutritionContent}>
                <Text style={styles.servingSize}>Edible Portion (grams): {grams}</Text>
                <Text style={styles.mealType}>Meal: {mealType}</Text>
                {loadingNutrition ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Getting nutrition information...</Text>
                  </View>
                ) : nutritionData ? (
                  <>
                    <View style={styles.caloriesSection}>
                      <Text style={styles.caloriesText}>{Number(nutritionData.calories || 0).toFixed(1)} cal</Text>
                    </View>
                    <View style={styles.macrosSection}>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Protein</Text>
                        <Text style={[styles.macroValue, {color: '#FF5722'}]}>{Number(
                          nutritionData.protein ?? nutritionData.Protein ?? 0
                        ).toFixed(1)}g</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Fats</Text>
                        <Text style={[styles.macroValue, {color: '#FF9800'}]}>{Number(
                          nutritionData.fats ?? nutritionData.fat ?? nutritionData.Fat ?? 0
                        ).toFixed(1)}g</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Carbs</Text>
                        <Text style={[styles.macroValue, {color: '#4CAF50'}]}>{Number(
                          nutritionData.carbs ?? nutritionData.carbohydrates ?? nutritionData.Carbs ?? 0
                        ).toFixed(1)}g</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.errorText}>No nutrition data available</Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!nutritionData || loadingNutrition) && styles.disabledButton
                ]}
                onPress={handleConfirmLog}
                disabled={loading || !nutritionData || loadingNutrition}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm & Add to Log</Text>
                )}
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
        
        {showSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Food logged successfully!</Text>
          </View>
        )}


      </ScrollView>
      
      {/* XP Notification */}
      <XPNotification
        visible={showXPNotification}
        xpGained={xpNotificationData.xpGained}
        reason={xpNotificationData.reason}
        isLevelUp={xpNotificationData.isLevelUp}
        newLevel={xpNotificationData.newLevel}
        isConsecutiveBonus={xpNotificationData.isConsecutiveBonus}
        consecutiveDays={xpNotificationData.consecutiveDays}
        onAnimationComplete={() => setShowXPNotification(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nutritionContainer: {
    backgroundColor: "#fff",
    width: "95%",
    height: "85%",
    borderRadius: 15,
    overflow: "hidden",
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { alignItems: "center", paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraBoxWrapper: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FCB647",
    marginTop: 24,
    marginBottom: 16,
  },
  cameraBox: { flex: 1 },
  scanButton: {
    backgroundColor: "#FCB647",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    width: 220,
    alignSelf: "center",
  },
  scanButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  formSection: { width: "90%", maxWidth: 400 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  mealRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  mealButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FCB647",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  mealButtonSelected: { backgroundColor: "#FCB647" },
  mealButtonText: { color: "#FCB647", fontWeight: "bold", fontSize: 16 },
  mealButtonTextSelected: { color: "#fff" },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  successBox: {
    backgroundColor: "#e0ffe0",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  successText: { color: "#388e3c", fontWeight: "bold", fontSize: 16 },
  permissionText: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  nutritionContentSmall: {
    padding: 20,
    flexGrow: 0,
  },
  servingSize: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  mealType: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
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
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    alignItems: "center",
    margin: 20,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF5722",
    textAlign: "center",
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
});