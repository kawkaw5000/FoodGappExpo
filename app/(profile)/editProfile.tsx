import { View, Text, TextInput, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useState } from "react";

const bodyGoals = [
  { id: 1, label: "Lose Weight" },
  { id: 2, label: "Maintain Weight" },
  { id: 3, label: "Gain Weight" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyGoalId, setBodyGoalId] = useState<number | null>(null);

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
      <CustomButton
        title="Save"
        onPress={() => router.back()}
        backgroundColor="#FCB647"
        textColor="white"
      />
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
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 10,
  },
  radialButton: {
    borderWidth: 1,
    borderColor: "#FCB647",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    backgroundColor: "#fff",
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
