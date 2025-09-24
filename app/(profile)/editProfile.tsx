import { View, Text, TextInput, SafeAreaView, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Config from "@/constants/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PasswordChangeModal from "@/components/PasswordChangeModal";

const bodyGoals = [
  { id: 1, label: "Lose Weight" },
  { id: 2, label: "Maintain Weight" },
  { id: 3, label: "Gain Weight" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<number>(0); // 0 = Male, 1 = Female, 2 = Others
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyGoalId, setBodyGoalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Handle password change
  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  // Fetch current profile info on mount using unified User model
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          Alert.alert("Error", "No userId found. Please log in again.");
          return;
        }
        setUserId(Number(storedUserId));
        const res = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(storedUserId)}`, {
          credentials: "include"
        });
        if (!res.ok) {
          const errorText = await res.text();
          Alert.alert("Error", "Failed to load profile: " + errorText);
          return;
        }
        const data = await res.json();
        console.log('Edit Profile API Response:', data); // Debug log
        
        // Handle nested response structure (userInfo might be nested)
        const user = data.userInfo || data;
        setUsername(user.username ?? "");
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setAge(user.age != null ? String(user.age) : "");
        setGender(user.gender != null ? user.gender : 0); // Default to Male (0)
        setWeight(user.weight != null ? String(user.weight) : "");
        setHeight(user.height != null ? String(user.height) : "");
        setBodyGoalId(user.bodyGoalId != null ? user.bodyGoalId : null);
        setEmail(user.email ?? "");
      } catch (e) {
        Alert.alert("Error", "Could not fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    // Only require fields that map to dbo.Userinfo
    if (
      String(firstName).trim() === "" ||
      String(lastName).trim() === "" ||
      String(age).trim() === "" ||
      String(weight).trim() === "" ||
      String(height).trim() === ""
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const safeBodyGoalId = bodyGoalId || 1;
      const payload = {
        firstName,
        lastName,
        age: Number(age),
        gender: gender, // Send integer: 0 = Male, 1 = Female, 2 = Others
        weight: Number(weight),
        height: Number(height),
        bodyGoalId: safeBodyGoalId
      };
      // Use the correct endpoint for updating user account
      const response = await fetch(`${Config.Account_API}/updateAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      let data = null;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        console.log('Profile update parse error:', parseErr);
      }
      setLoading(false);
      if ((data && data.message && data.message.toLowerCase().includes("success")) || response.ok) {
        Alert.alert("Success", "Profile updated successfully.", [
          { text: "OK", onPress: () => router.replace("/(profile)/profile") }
        ]);
      } else {
        Alert.alert("Error", (data && data.message) || "Failed to update profile.");
      }
    } catch (e) {
      setLoading(false);
      console.log('Profile update error:', e);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const resInfo = await fetch(`${Config.Account_API}/deleteAccount`, {
                method: "DELETE",
                credentials: "include"
              });

              if (resInfo.ok) {
                // Optionally clear local storage / tokens here
                router.replace("/(login)/loginScreen");
              } else {
                const errorText = await resInfo.text();
                console.log("Delete failed:", errorText);
                Alert.alert("Error", "Failed to delete account.");
              }
            } catch (e) {
              console.log("Delete account: fetch error:", e);
              Alert.alert("Error", "Failed to delete account.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Edit Profile</Text>
        
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              { borderColor: gender === 0 ? "black" : "gray" },
            ]}
            onPress={() => setGender(0)}
          >
            <Text style={{ fontWeight: "bold" }}>Male</Text>
            <Ionicons
              name={gender === 0 ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={gender === 0 ? "black" : "gray"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              { borderColor: gender === 1 ? "black" : "gray" },
            ]}
            onPress={() => setGender(1)}
          >
            <Text style={{ fontWeight: "bold" }}>Female</Text>
            <Ionicons
              name={gender === 1 ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={gender === 1 ? "black" : "gray"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              { borderColor: gender === 2 ? "black" : "gray" },
            ]}
            onPress={() => setGender(2)}
          >
            <Text style={{ fontWeight: "bold" }}>Others</Text>
            <Ionicons
              name={gender === 2 ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={gender === 2 ? "black" : "gray"}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Physical Information</Text>
        <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
        <Text style={styles.label}>Body Goal</Text>
        <View style={styles.radialMenu}>
          {bodyGoals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.radialButton, bodyGoalId === goal.id && styles.radialButtonActive]}
              onPress={() => setBodyGoalId(goal.id)}
            >
              <Text style={bodyGoalId === goal.id ? styles.radialTextActive : styles.radialText}>{goal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.passwordButton} onPress={handleChangePassword}>
          <Text style={styles.passwordButtonText}>Set New Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '80%', marginTop: 8 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CustomButton
              title={loading ? "Saving..." : "Save"}
              onPress={handleSave}
            backgroundColor="#FCB647"
            textColor="white"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <CustomButton
            title="Delete"
            onPress={handleDeleteAccount}
            backgroundColor="#d9534f"
            textColor="white"
          />
        </View>
      </View>
      </ScrollView>
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
    alignSelf: "flex-start",
    marginLeft: "10%",
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    alignSelf: "flex-start",
    marginLeft: "10%",
  },
  radialMenu: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  radialButton: {
    borderWidth: 1,
    borderColor: "#FCB647",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 5,
    backgroundColor: "#fff",
    width: 180,
    alignItems: "center",
  },
  radialButtonActive: {
    backgroundColor: "#FCB647",
  },
  radialText: {
    color: "#FCB647",
    fontWeight: "bold",
  },
  radialTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%",
    flexWrap: "wrap",
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    minWidth: 90,
    margin: 5,
  },

  passwordButton: {
    width: "80%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  passwordButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
