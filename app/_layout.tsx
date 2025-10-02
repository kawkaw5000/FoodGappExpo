import { Stack, useNavigationContainerRef, usePathname, useRouter, useSegments } from "expo-router";
import { useCallback, useEffect } from "react";
import { StatusBar, View, Image, TouchableOpacity, Dimensions, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavImg } from "@/constants/NavImg";
import BottomNavBar from "@/components/NavigationBar";
import { WellNuAlertService } from "@/services/WellNuAlertService";

export default function RootLayout() {
  const pathname = usePathname(); 
  const segments = useSegments();

  const hideBottomNav = pathname === "/loginScreen" || 
                        pathname === "/registerScreen" || 
                        pathname === "/registerMainScreen" ||
                        pathname === "/ForgotPasswordScreen" ||
                        pathname.includes('/manualEntry') ||
                        pathname.includes('/scan');
  useEffect(() => {
    console.log(hideBottomNav)
    console.log(pathname)
    console.log('Segments:', segments)
    
    // Initialize daily reset system when app starts
    const initializeDailyReset = async () => {
      try {
        const alertService = WellNuAlertService.getInstance();
        await alertService.checkAndResetDailyTracking(); // Check if reset is needed now
        alertService.scheduleDailyReset(); // Schedule automatic resets
        console.log('✅ Daily reset system initialized');
      } catch (error) {
        console.error('❌ Error initializing daily reset system:', error);
      }
    };
    
    initializeDailyReset();
  }, [])
  const router = useRouter();
  
  // Use segments to determine current route more accurately
  const getCurrentRoute = () => {
    console.log('Raw segments:', segments, 'Segments length:', segments.length);
    
    if (!segments) return '/(home)';
    
    const segmentString = JSON.stringify(segments);
    console.log('Segment string:', segmentString);
    
    // Check for group routes in segments
    if (segmentString.includes('(log)')) return '/(log)';
    if (segmentString.includes('(track)')) return '/(track)';
    if (segmentString.includes('(scan)')) return '/(scan)';
    if (segmentString.includes('(profile)')) return '/(profile)';
    if (segmentString.includes('(home)')) return '/(home)';
    
    // Check for specific page names
    if (segmentString.includes('log')) return '/(log)';
    if (segmentString.includes('track')) return '/(track)';
    if (segmentString.includes('scan')) return '/(scan)';
    if (segmentString.includes('profile')) return '/(profile)';
    
    return '/(home)'; // default fallback
  };
  
  const currentRoute = getCurrentRoute();
  
  const handleNav = (route: string) => {
    if (route !== currentRoute) {
      console.log('Navigating from', currentRoute, 'to', route);
      router.replace(route as any);
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

