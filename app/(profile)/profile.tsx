import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import Config from "@/constants/Config";

const dashboardIcons = [
  { name: "Log", icon: require("../../assets/images/Dashboard Icons/Food_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Food_Highlight.png"), route: "/(log)" },
  { name: "Track", icon: require("../../assets/images/Dashboard Icons/Track_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Track_Highlight.png"), route: "/(track)" },
  { name: "Home", icon: require("../../assets/images/Dashboard Icons/Home_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Home_Highlight.png"), route: "/(home)" },
  { name: "Scan", icon: require("../../assets/images/Dashboard Icons/Scan_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Scan_Highlight.png"), route: "/(scan)" },
  { name: "Profile", icon: require("../../assets/images/Dashboard Icons/Profile_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Profile_Highlight.png"), route: "/(profile)" },
];

export default function ProfilePage() {
  const router = useRouter();
  const currentRoute = "/(profile)";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract fetchProfile so it can be called on demand
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
      const userInfoId = await AsyncStorage.getItem('userInfoId');
      console.log('ProfilePage: userId:', userId, 'userInfoId:', userInfoId); // Debug log
      if (!userId) {
        setError("No userId found. Please log in again.");
        setLoading(false);
        return;
      }
      let url = `${Config.Account_API}/api/account/getProfile?userId=${encodeURIComponent(userId)}`;
      if (userInfoId) url += `&userInfoId=${encodeURIComponent(userInfoId)}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('ProfilePage: backend response data:', data); // Debug log
      const userInfo = data.userInfo || data;
      setProfile(userInfo);
    } catch (err: any) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleNav = (route: string) => {
    if (route !== currentRoute) router.replace({ pathname: route as any });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Profile_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>This is the Profile page</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          <View style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 12, minWidth: 250, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", width: 110 }}>First Name:</Text>
              <Text>{profile && profile.firstName ? profile.firstName : "NULL"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", width: 110 }}>Last Name:</Text>
              <Text>{profile && profile.lastName ? profile.lastName : "NULL"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", width: 110 }}>Age:</Text>
              <Text>{profile && profile.age !== undefined && profile.age !== null && profile.age !== "" ? profile.age : "NULL"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", width: 110 }}>Weight:</Text>
              <Text>{profile && profile.weight !== undefined && profile.weight !== null && profile.weight !== "" ? profile.weight : "NULL"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", width: 110 }}>Height:</Text>
              <Text>{profile && profile.height !== undefined && profile.height !== null && profile.height !== "" ? profile.height : "NULL"}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold", width: 110 }}>Body Goal:</Text>
              <Text>{profile && profile.bodyGoalId !== undefined && profile.bodyGoalId !== null && profile.bodyGoalId !== "" ? profile.bodyGoalId : "NULL"}</Text>
            </View>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <CustomButton
            title="Edit Profile"
            onPress={() => router.push("../(profile)/editProfile")}
            backgroundColor="#333"
            textColor="white"
          />
        </View>
        <CustomButton
          title="Get Started"
          onPress={() => {/* Add your logic here */}}
          backgroundColor="#FCB647"
          textColor="white"
        />
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
