import { View, Text, SafeAreaView, StyleSheet } from "react-native";
export default function LogPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>This is the Log page</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  text: { fontSize: 22, fontWeight: "bold" },
});
