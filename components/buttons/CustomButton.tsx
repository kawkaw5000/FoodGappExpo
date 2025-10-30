import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  testID?: string;
}

export default function CustomButton({ title, onPress, backgroundColor = "#6200ea", textColor = "white", style, disabled = false, testID }: CustomButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: disabled ? "#ccc" : backgroundColor }, style]} 
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      testID={testID}
    >
      <Text style={[styles.buttonText, { color: disabled ? "#666" : textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: "center",
    width: "auto",
    padding: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
