import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import CustomButton from "@/components/buttons/CustomButton";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

  // Request camera permission and show camera
  const handleScanNow = async () => {
    setLoading(true);
    if (!permission || !permission.granted) {
      const perm = await requestPermission();
      setHasPermission(perm.granted);
      setShowCamera(perm.granted);
    } else {
      setHasPermission(true);
      setShowCamera(true);
    }
    setLoading(false);
  };

  // Simulate scan/capture
  const handleCapture = async () => {
    setIsScanning(true);
    // Simulate a scan delay
    setTimeout(() => {
      setIsScanning(false);
      setShowCamera(false);
      setScanComplete(true);
    }, 1200);
  };

  // Reset to scan again
  const handleNext = () => {
    setScanComplete(false);
  };

  // Initial state: show Scan Now button
  if (!showCamera && !scanComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Image source={require("../../assets/images/Dashboard Icons/Scan_Highlight.png")} style={styles.image} />
          <Text style={styles.title}>Scan your food</Text>
          <Text style={styles.subtitle}>Point your camera to the food or ingredient you want to scan.</Text>
          <View style={styles.scanNowBtn}><CustomButton
            title={loading ? "Requesting..." : "Scan Now"}
            onPress={handleScanNow}
          /></View>
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

  // Scan complete state
  if (scanComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          {/* Fallback icon if reference image is missing */}
          <Image source={require("../../assets/images/Dashboard Icons/Scan_Highlight.png")} style={styles.successIcon} />
          <Text style={styles.successTitle}>Food scanned!</Text>
          <Text style={styles.successSubtitle}>Food successfully scanned. Press "Next" to see food content.</Text>
          <View style={styles.nextBtn}><CustomButton title="Next" onPress={handleNext} /></View>
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
});
