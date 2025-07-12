import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Image } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";

export default function EmptyScan() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Scan_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>Scan your food</Text>
        <Text style={styles.subtitle}>Point your camera to the food or ingredient you want to scan.</Text>
        <View style={styles.scanNowBtn}>
          <CustomButton title="Go to Scan Page" onPress={() => router.push("/(scan)/scan")}/>
        </View>
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
});
