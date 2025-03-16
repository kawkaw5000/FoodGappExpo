import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export default function CustomButton({ title, onPress, backgroundColor = "#6200ea", textColor = "white" }: CustomButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor }]} 
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
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
