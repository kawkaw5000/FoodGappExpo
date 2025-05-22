import { Stack } from "expo-router";

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="loginScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
