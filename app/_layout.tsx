import { Stack, useNavigationContainerRef, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { StatusBar, View, Image, TouchableOpacity, Dimensions, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavImg } from "@/constants/NavImg";


const { width } = Dimensions.get("window");

export default function RootLayout() {
  const pathname = usePathname(); 

  const hideBottomNav = pathname === "/loginScreen" || pathname === "/registerScreen" || pathname === "/registerMainScreen";
  useEffect(() => {
    console.log(hideBottomNav)
    console.log(pathname)
  })
  const router = useRouter();
    const handleLogout = useCallback(() => {
      router.replace("/(login)/loginScreen");
    }, [router]);
  
    const currentRoute = "/(login)/loginScreen";
  
    const handleNav = (route: string) => {
      if (route !== currentRoute) router.replace(route as any);
    };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Stack>
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
        <View style={styles.bottomBar}>
          {NavImg().map((item) => (
            <TouchableOpacity key={item.name} style={styles.iconButton} onPress={() => handleNav(item.route)}>
              <Image source={item.route === currentRoute ? item.highlight : item.icon} style={styles.icon} />
              <Text style={[styles.iconLabel, item.route === currentRoute && styles.iconLabelActive]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  spacer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  iconButton: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 2,
  },
  iconLabel: {
    fontSize: 12,
    color: "#333",
  },
  iconLabelActive: {
    color: "#FCB647",
    fontWeight: "bold",
  },
});