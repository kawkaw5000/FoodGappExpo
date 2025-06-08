import { View, Text, SafeAreaView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function ScanPage() {
  const router = useRouter();

  // Simulate a scan result for demonstration
  const handleScanResult = (scannedFood: string) => {
    // Show the scanned food in an alert, then redirect to manualEntry with food prefilled
    Alert.alert(
      "Scan Result",
      `You scanned: ${scannedFood}`,
      [
        {
          text: "OK",
          onPress: () => setTimeout(() => router.push({ pathname: "/(scan)/manualEntry", params: { food: scannedFood } }), 100)
        }
      ]
    );
  };

  // For demo, trigger scan result on mount
  // useEffect(() => { handleScanResult("Apple"); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>This is the Scan page</Text>
      {/* Example scan button for demo */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ color: '#FCB647', fontWeight: 'bold', fontSize: 18 }} onPress={() => handleScanResult("Apple")}>Simulate Scan</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  text: { fontSize: 22, fontWeight: "bold" },
});
