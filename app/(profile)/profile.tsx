import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Profile_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>This is the Profile page</Text>
        <CustomButton
          title="Get Started"
          onPress={() => {/* Add your logic here */}}
          backgroundColor="#FCB647"
          textColor="white"
        />
        <CustomButton
          title="Edit Profile"
          onPress={() => router.push("/(profile)/editProfile")}
          backgroundColor="#333"
          textColor="white"
        />
      </View>
      app/(track)/index.tsx
      <View style={styles.spacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 20 },
  image: { width: 120, height: 120, resizeMode: "contain", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  spacer: { flex: 1 },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  iconButton: { alignItems: "center", flex: 1 },
  icon: { width: 32, height: 32, resizeMode: "contain", marginBottom: 2 },
  iconLabel: { fontSize: 12, color: "#333" },
  iconLabelActive: { color: "#FCB647", fontWeight: "bold" },
});
