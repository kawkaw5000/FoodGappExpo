import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#03dac6" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>Login Screen</Text>
      <Button
        title="Logout"
        onPress={() => {
            router.push("/(login)");
        }}
      />
    </SafeAreaView>
  );
}
