import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  // Example user profile state (replace with real data or context as needed)
  const [profile, setProfile] = useState({
    userId: null,
    firstName: "",
    lastName: "",
    age: "",
    weight: "",
    height: "",
    bodyGoal: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://192.168.254.144:5129/api/account/getProfile", {
          credentials: "include"
        });
        const data = await res.json();
        console.log('Profile fetch response:', data);
        // If userInfo is present, use its fields
        const userInfo = data.userInfo || {};
        setProfile({
          userId: data.userId || null,
          firstName: userInfo.firstName || data.firstName || "",
          lastName: userInfo.lastName || data.lastName || "",
          age: userInfo.age ? String(userInfo.age) : (data.age ? String(data.age) : ""),
          weight: userInfo.weight ? String(userInfo.weight) : (data.weight ? String(data.weight) : ""),
          height: userInfo.height ? String(userInfo.height) : (data.height ? String(data.height) : ""),
          bodyGoal: userInfo.bodyGoal || data.bodyGoal || ""
        });
      } catch (e) {
        // Could not fetch profile
      }
    };
    fetchProfile();
  }, []);

  const handleDeleteProfile = async () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete your profile? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            try {
              const response = await fetch("http://192.168.254.144:5129/api/account/deleteAccount", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId: profile.userId || 1 })
              });
              const data = await response.json();
              if (data && data.message && data.message.toLowerCase().includes("success")) {
                Alert.alert("Deleted", "Your profile has been deleted.");
                router.replace("/(login)/loginScreen");
              } else {
                Alert.alert("Error", data.message || "Failed to delete profile.");
              }
            } catch (e) {
              Alert.alert("Error", "Failed to delete profile.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Profile_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>This is the Profile page</Text>
        {/* Profile Info Display */}
        <View style={styles.profileInfoBox}>
          <Text style={styles.profileInfo}><Text style={styles.profileLabel}>First Name:</Text> {profile.firstName || 'NULL'}</Text>
          <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Last Name:</Text> {profile.lastName || 'NULL'}</Text>
          <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Age:</Text> {profile.age || 'NULL'}</Text>
          <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Weight:</Text> {profile.weight ? profile.weight + ' kg' : 'NULL'}</Text>
          <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Height:</Text> {profile.height ? profile.height + ' cm' : 'NULL'}</Text>
          <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Body Goal:</Text> {profile.bodyGoal || 'NULL'}</Text>
        </View>
        <CustomButton
          title="Edit Profile"
          onPress={() => router.push("/(profile)/editProfile")}
          backgroundColor="#333"
          textColor="white"
        />
        <View style={styles.spacer} />
      </View>
      <View style={{ height: 12 }} />
      <View style={{ height: 16 }} />
      <CustomButton
        title="Logout"
        onPress={handleLogout}
        backgroundColor="#FCB647"
        textColor="white"
      />
      <CustomButton
        title="Delete Profile"
        onPress={handleDeleteProfile}
        backgroundColor="#d9534f"
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
  profileInfoBox: {
    width: '90%',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  profileLabel: {
    fontWeight: 'bold',
    color: '#222',
  },
});
