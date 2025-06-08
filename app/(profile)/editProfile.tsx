import { View, Text, TextInput, SafeAreaView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Config from "@/constants/Config";

const bodyGoals = [
  { id: 1, label: "Lose Weight" },
  { id: 2, label: "Maintain Weight" },
  { id: 3, label: "Gain Weight" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyGoalId, setBodyGoalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current profile info on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${Config.Account_API}/userInfo`, {
          credentials: "include"
        });
        const data = await res.json();
        const userInfo = data.data || {};  
        // setUserId(data.userId || null);
        // setUserInfoId(userInfo.userInfoId || null);
        // setEmail(data.email || "");
        // setPassword(""); // Don't prefill password for security
        setFirstName(userInfo.firstName || "");
        setLastName(userInfo.lastName || "");
        setAge(userInfo.age ? String(userInfo.age) : "");
        setWeight(userInfo.weight ? String(userInfo.weight) : "");
        setHeight(userInfo.height ? String(userInfo.height) : "");
        setBodyGoalId(userInfo.bodyGoalId || null);

        console.log('EditProfileScreen: fetched profile:', data);
      } catch (e) {
        // Could not fetch profile
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
      // const safeUserInfoId = userInfoId || 1;
      const safeBodyGoalId = bodyGoalId || 1;
      const payload = {    
        firstName,
        lastName,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        bodyGoalId: safeBodyGoalId
      };
      const response = await fetch(`${Config.Account_API}/updateUserInfo`, {
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
          { text: "OK", onPress: () => router.back() }
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
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
});
