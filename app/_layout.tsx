import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  return (
    <>
      {/* Set StatusBar globally */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Stack>
        {/* Show the login screen first */}
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
