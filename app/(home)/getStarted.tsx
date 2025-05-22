import { View, Text, StyleSheet, Image, TextInput } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useState } from "react";

const steps = [
  {
    title: "What is your goal body?",
    icon: require("../../assets/images/GetStarted Icons/TargetLogo.png"),
    buttons: [
      { label: "Lose weight", color: "#FCB647", description: "Often for health, appearance, or fitness." },
      { label: "Maintain weight", color: "#59E74E", description: "After reaching the desired weight, maintain and refresh." },
    ],
  },
  {
    title: "What is your height?",
    icon: require("../../assets/images/GetStarted Icons/HeightLogo.png"),
    input: { placeholder: "CM", type: "numeric" },
  },
  {
    title: "What is your weight?",
    icon: require("../../assets/images/GetStarted Icons/WeightLogo.png"),
    input: { placeholder: "KG", type: "numeric" },
  },
  {
    title: "How do you work out?",
    icon: require("../../assets/images/GetStarted Icons/ExerciseLogo.png"),
    buttons: [
      { label: "No workout", color: "#B0B0B0" },
      { label: "Light workout", color: "#FCB647", description: "1-3 times/week" },
      { label: "Moderate workout", color: "#59E74E", description: "4-5 times/week" },
      { label: "Intense workout", color: "#F25C3D", description: "6-10 times/week" },
    ],
  },
];

export default function GetStarted({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [workout, setWorkout] = useState<string | null>(null);
  const [error, setError] = useState("");

  const current = steps[step];

  // Validation for required fields
  const canGoNext = () => {
    if (step === 0) return !!goal;
    if (step === 1) return !!height && !isNaN(Number(height)) && Number(height) > 0;
    if (step === 2) return !!weight && !isNaN(Number(weight)) && Number(weight) > 0;
    if (step === 3) return !!workout;
    return true;
  };

  const handleNext = () => {
    setError("");
    if (!canGoNext()) {
      if (step === 0) setError("Please select a goal.");
      if (step === 1) setError("Please enter your height in cm.");
      if (step === 2) setError("Please enter your weight in kg.");
      if (step === 3) setError("Please select your workout level.");
      return;
    }
    if (step === steps.length - 1) onFinish();
    else setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <View style={styles.container}>
      <Image source={current.icon} style={styles.icon} />
      <Text style={styles.title}>{current.title}</Text>
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      {current.buttons && (
        <View style={styles.buttonCol}>
          {current.buttons.map((btn, idx) => (
            <View key={btn.label} style={{ marginBottom: 12, width: '100%' }}>
              <CustomButton
                title={btn.label}
                backgroundColor={
                  (step === 0 && goal === btn.label) || (step === 3 && workout === btn.label)
                    ? btn.color
                    : '#eee'
                }
                textColor="#222"
                onPress={() => {
                  if (step === 0) setGoal(btn.label);
                  if (step === 3) setWorkout(btn.label);
                }}
              />
            </View>
          ))}
        </View>
      )}
      {current.input && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputBox}
            placeholder={current.input.placeholder}
            keyboardType="numeric"
            value={current.input.placeholder === "CM" ? height : weight}
            onChangeText={current.input.placeholder === "CM" ? setHeight : setWeight}
            maxLength={current.input.placeholder === "CM" ? 3 : 3}
          />
          <Text style={{ alignSelf: 'center', marginLeft: 6, fontWeight: 'bold' }}>
            {current.input.placeholder}
          </Text>
        </View>
      )}
      <View style={styles.navRow}>
        <CustomButton
          title="Previous"
          onPress={() => {
            setError("");
            setStep((prev) => Math.max(prev - 1, 0));
          }}
          backgroundColor={step === 0 ? "#ccc" : "#eee"}
          textColor="#333"
        />
        <CustomButton
          title={step === steps.length - 1 ? "Finish" : "Next"}
          onPress={handleNext}
          backgroundColor={canGoNext() ? "#FCB647" : "#ccc"}
          textColor="white"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  buttonCol: {
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 120,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
});
