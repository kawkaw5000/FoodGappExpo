import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  // Determine which icon is highlighted
  const currentRoute = "/(home)";

  const handleNav = (route: string) => {
    if (route !== currentRoute) router.replace(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Home_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>Welcome to the Main Dashboard!</Text>
        <CustomButton
          title="Get Started"
          onPress={() => {/* Add your logic here */}}
          backgroundColor="#FCB647"
          textColor="white"
        />
        <CustomButton
          title="Edit Profile"
          onPress={() => router.push({ pathname: "/(profile)/editProfile" })}
          backgroundColor="#333"
          textColor="white"
        />
      </View>
      <View style={styles.spacer} />
      {/* <CustomButton
        title="Logout"
        onPress={handleLogout}
        backgroundColor="#FCB647"
        textColor="white"
      /> */}
      <View style={{ height: 12 }} />
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
    marginBottom: 20,
    color: "#333",
  },
  spacer: {
    flex: 1,
  },
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
  iconButton: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 2,
  },
  iconLabel: {
    fontSize: 12,
    color: "#333",
  },
  iconLabelActive: {
    color: "#FCB647",
    fontWeight: "bold",
  },
});
