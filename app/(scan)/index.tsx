import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback } from "react";

const dashboardIcons = [
  { name: "Log", icon: require("../../assets/images/Dashboard Icons/Food_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Food_Highlight.png"), route: "/(log)" },
  { name: "Track", icon: require("../../assets/images/Dashboard Icons/Track_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Track_Highlight.png"), route: "/(track)" },
  { name: "Home", icon: require("../../assets/images/Dashboard Icons/Home_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Home_Highlight.png"), route: "/(home)" },
  { name: "Scan", icon: require("../../assets/images/Dashboard Icons/Scan_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Scan_Highlight.png"), route: "/(scan)" },
  { name: "Profile", icon: require("../../assets/images/Dashboard Icons/Profile_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Profile_Highlight.png"), route: "/(profile)" },
];

export default function ScanScreen() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  const currentRoute = "/(scan)";

  const handleNav = (route: string) => {
    if (route !== currentRoute) router.replace({ pathname: route as any });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Scan_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>This is the Scan page</Text>
      </View>
      <View style={styles.spacer} />
      <View style={styles.bottomBar}>
        {dashboardIcons.map((item) => (
          <TouchableOpacity key={item.name} style={styles.iconButton} onPress={() => handleNav(item.route)}>
            <Image source={item.route === currentRoute ? item.highlight : item.icon} style={styles.icon} />
            <Text style={[styles.iconLabel, item.route === currentRoute && styles.iconLabelActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <CustomButton
        title="Logout"
        onPress={handleLogout}
        backgroundColor="#FCB647"
        textColor="white"
      />
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
