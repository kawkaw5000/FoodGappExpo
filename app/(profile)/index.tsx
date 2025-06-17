import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/constants/Config';

export default function ProfileScreen() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  
  // Example user profile state (replace with real data or context as needed)
  const [profile, setProfile] = useState({
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
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          Alert.alert("Error", "No userId found. Please log in again.");
          return;
        }
        // Use centralized API config
        const res = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(storedUserId)}`);
        if (!res.ok) {
          const errorText = await res.text();
          Alert.alert("Error", "Failed to get profile: " + errorText);
          return;
        }
        const user = await res.json();
        setProfile({
          firstName: user.firstName ?? "NULL",
          lastName: user.lastName ?? "NULL",
          age: user.age != null ? String(user.age) : "NULL",
          weight: user.weight != null ? String(user.weight) : "NULL",
          height: user.height != null ? String(user.height) : "NULL",
          bodyGoal: user.bodyGoalId != null ? String(user.bodyGoalId) : "NULL"
        });
      } catch (e) {
        console.log('get info fetch error:', e);
        Alert.alert("Error", "Failed to get profile.");
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
              const response = await fetch(`${Config.Account_API}/deleteAccount`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              const text = await response.text();
              let data;
              try {
                data = text ? JSON.parse(text) : null;
              } catch (err) {
                console.log('Delete profile: failed to parse response:', text);
                data = { message: text };
              }
              if (data && data.message && data.message.toLowerCase().includes("success")) {
                Alert.alert("Deleted", "Your profile has been deleted.");
                router.replace("/(login)/loginScreen");
              } else {
                console.log('Delete profile: backend response:', data);
                Alert.alert("Error", (data && data.message) || "Failed to delete profile.");
              }
            } catch (e) {
              console.log('Delete profile: fetch error:', e);
              Alert.alert("Error", "Failed to delete profile.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.centered}>
          <Image source={require("../../assets/images/Dashboard Icons/Profile_Highlight.png")} style={styles.image} />
          <Text style={styles.title}>This is the Profile page</Text>
          {/* Profile Info Display */}
          <View style={styles.profileInfoBox}>
            <Text style={styles.profileInfo}><Text style={styles.profileLabel}>First Name:</Text> {profile.firstName ? profile.firstName : ' '}</Text>
            <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Last Name:</Text> {profile.lastName ? profile.lastName : ' '}</Text>
            <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Age:</Text> {profile.age ? profile.age : ' '}</Text>
            <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Weight:</Text> {profile.weight ? profile.weight + ' kg' : ' '}</Text>
            <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Height:</Text> {profile.height ? profile.height + ' cm' : ' '}</Text>
            <Text style={styles.profileInfo}><Text style={styles.profileLabel}>Body Goal:</Text> {profile.bodyGoal ? profile.bodyGoal : ' '}</Text>
          </View>
          <CustomButton
            title="Edit Profile"
            onPress={() => router.push("/(profile)/editProfile")}
            backgroundColor="#333"
            textColor="white"
          />
          <View style={{ height: 12 }} />
          <View style={{ height: 16 }} />
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            backgroundColor="#FCB647"
            textColor="white"
          />
        </View>
      </ScrollView>
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
