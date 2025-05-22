import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const screenWidth = Dimensions.get('window').width;
const { width } = Dimensions.get("window");

export default function RootLayout() {
  return (
    <>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <Stack>
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen name="(register)" options={{ headerShown: false }} />
        </Stack>
        <View style={{ position: "absolute", bottom: 0}}>
          <View style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", width: screenWidth, gap:20, borderTopColor: "#656262", borderTopWidth: 2,}}>
            <TouchableOpacity onPress={() => console.log('Image clicked!')}>
              <Image
                source={require("../assets/images/dashbordNavImg/Log.png")}
                style={{
                  width: width * 0.15,
                  height: width * 0.15,
                  resizeMode: "contain",
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Image clicked!')}>
              <Image
              source={require("../assets/images/dashbordNavImg/Track.png")}  
              style={{
                width: width * 0.140,
                height: width * 0.140,
                resizeMode: "contain",
              }}      
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Image clicked!')}>
              <Image
              source={require("../assets/images/dashbordNavImg/Home.png")}    
              style={{
                width: width * 0.140,
                height: width * 0.140,
                resizeMode: "contain",
              }}    
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Image clicked!')}>
              <Image
              source={require("../assets/images/dashbordNavImg/Scan.png")}  
              style={{
                width: width * 0.140,
                height: width * 0.140,
                resizeMode: "contain",
              }}      
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Image clicked!')}>
              <Image
              source={require("../assets/images/dashbordNavImg/Profile.png")}   
              style={{
                width: width * 0.140,
                height: width * 0.140,
                resizeMode: "contain",
              }}     
              />
            </TouchableOpacity>    
          </View>
        </View>
      </SafeAreaProvider>
      {/* Set StatusBar globally */}
      
    </>
  );
}
