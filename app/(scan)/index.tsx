import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import Config from "@/constants/Config";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<any>(null);

  // Request camera permission and show camera
  const handleScanNow = async () => {
    if (!permission || !permission.granted) {
      const perm = await requestPermission();
      setHasPermission(perm.granted);
      setShowCamera(perm.granted);
    } else {
      setHasPermission(true);
      setShowCamera(true);
    }
  };

  // Simulate scan/capture
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsScanning(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "scanned.jpg",
        type: "image/jpeg",
      } as any);
      const response = await fetch(Config.DESCRIBE_IMAGE_API, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const result = await response.json();
      console.log("Flask result:", result);
      alert(`Detected food: ${result.description}`);
      setShowCamera(false);
      setIsScanning(false);
    } catch (err) {
      console.error("Capture failed:", err);
      alert("Failed to scan. Try again.");
    } finally {
      setIsScanning(false);
      setShowCamera(false);
    }
  };

  // Initial state: show Scan Now button
  if (!showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Image source={require("../../assets/images/Dashboard Icons/Scan_Highlight.png")} style={styles.image} />
          <Text style={styles.title}>Scan your food</Text>
          <Text style={styles.subtitle}>Point your camera to the food or ingredient you want to scan.</Text>
          <View style={styles.scanNowBtn}>
            <CustomButton title={permission?.granted ? (isScanning ? "Scanning..." : "Scan Now") : "Enable Camera"} onPress={handleScanNow} />
          </View>
          <Text style={{ marginTop: 16, color: '#FCB647', textDecorationLine: 'underline' }} onPress={() => router.push('/(scan)/manualEntry')}>
            Specific food?
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Camera preview state
  if (showCamera && hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraContainer}>
          {/* Camera and overlay are absolutely positioned in a relative container */}
          <View style={styles.cameraBoxWrapper}>
            <CameraView ref={cameraRef} style={styles.cameraBox} facing={"back"} />
            <View style={styles.overlayBox} pointerEvents="none" />
          </View>
          <Text style={styles.cameraTitle}>Food scanning</Text>
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} disabled={isScanning}>
            <Text style={styles.captureBtnText}>{isScanning ? "Scanning..." : "Capture"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If permission denied
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Camera access denied</Text>
          <Text style={styles.subtitle}>Please enable camera permissions in your device settings.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Loading fallback
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FCB647" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FCB647",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  scanNowBtn: {
    width: "100%",
    marginTop: 10,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  cameraBoxWrapper: {
    position: "relative",
    width: 260,
    height: 260,
    marginTop: 40,
    alignSelf: "center",
  },
  cameraBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 260,
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 1,
  },
  overlayBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#FCB647",
    borderRadius: 20,
    zIndex: 2,
  },
  cameraTitle: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#FCB647",
    zIndex: 3,
  },
  captureBtn: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignSelf: "center",
    backgroundColor: "#FCB647",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    zIndex: 3,
  },
  captureBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  successIcon: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  nextBtn: {
    width: "100%",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
    textAlign: "center",
  },
  modalInput: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 16,
  },
});
