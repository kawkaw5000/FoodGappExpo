import { View, Text, SafeAreaView, StyleSheet } from "react-native";
export default function TrackPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>This is the Track page</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  text: { fontSize: 22, fontWeight: "bold" },
});
