import { Stack, useNavigationContainerRef, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { StatusBar, View, Image, TouchableOpacity, Dimensions, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavImg } from "@/constants/NavImg";
import BottomNavBar from "@/components/NavigationBar";

export default function RootLayout() {
  const pathname = usePathname(); 

  const hideBottomNav = pathname === "/loginScreen" || 
                        pathname === "/registerScreen" || 
                        pathname === "/registerMainScreen" ||
                        pathname.includes('/manualEntry') ||
                        pathname.includes('/scan');
  useEffect(() => {
    console.log(hideBottomNav)
    console.log(pathname)
  })
  const router = useRouter();
  const currentRoute = pathname; // Use actual current pathname instead of hardcoded value
  
  const handleNav = (route: string) => {
    if (route !== currentRoute) {
      console.log('Navigating from', currentRoute, 'to', route);
      router.push(route as any);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="(register)" options={{ headerShown: false }} />
        <Stack.Screen name="(log)" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen name="(scan)" options={{ headerShown: false }} />
        <Stack.Screen name="(track)" options={{ headerShown: false }} />
      </Stack>

      {/* Global Bottom Nav - only show on main screens */}
      {!hideBottomNav && (
        <BottomNavBar
          NavImg={NavImg}
          currentRoute={currentRoute}
          handleNav={handleNav}
        />
      )}

    </SafeAreaProvider>
  );
}

