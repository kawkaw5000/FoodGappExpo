import React, { useState, useEffect, useRef } from "react";
import { View, Text, SafeAreaView, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Button } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../../constants/Config";

export default function ScanPage() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("100");
  const [mealType, setMealType] = useState("Breakfast");
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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
      } else {
        Alert.alert("Detection Failed", "Could not detect food. Please enter manually.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to scan food.");
    } finally {
      setLoading(false);
    }
  };

  // Submit button handler
  const handleSubmit = async () => {
    if (!foodName || !grams) {
      Alert.alert("Missing Info", "Please enter food name and grams.");
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const payload = {
        foodName,
        grams: parseFloat(grams),
        mealType,
        userId: userId ? parseInt(userId) : undefined,
      };
      const res = await fetch(Config.LOG_FOOD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowSuccess(true);
        setFoodName("");
        setGrams("100");
        setMealType("Breakfast");
      } else {
        Alert.alert("Error", "Failed to log food.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to log food.");
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.label}>Grams</Text>
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
            <Text style={styles.submitButtonText}>Add to Log</Text>
          </TouchableOpacity>
        </View>
        {showSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Food logged successfully!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
