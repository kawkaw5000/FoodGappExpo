import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/buttons/CustomButton";
import { useState } from "react";

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", margin: 0 }}>
      <View style={{ marginTop: 40 }}>
        <Image
          source={require("../../assets/images/mainlogInscreen.png")}
          style={{
            width: width * 0.60,
            height: width * 0.60,
            resizeMode: "contain",
          }}
        />
      </View>
      <View style={{ position: "relative", top: -50 }}>
        <Image
          source={require("../../assets/images/foodGapp.png")}
          style={{
            width: width * 0.80,
            height: width * 0.80,
            resizeMode: "contain",
          }}
        />
      </View>
      <View style={{ position: "relative", top: -140, padding: 5 }}>
        <Text style={{ textAlign: "center", fontSize: 13 }}>
        THIS IS HOME TEST
        </Text>
      </View>
      <View style={{ position: "absolute", bottom: 0}}>
        <View style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", width: screenWidth, gap:20, borderTopColor: "#656262", borderTopWidth: 2,}}>
          <TouchableOpacity onPress={() => console.log('Image clicked!')}>
            <Image
              source={require("../../assets/images/dashbordNavImg/Log.png")}
              style={{
                width: width * 0.15,
                height: width * 0.15,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Image clicked!')}>
            <Image
            source={require("../../assets/images/dashbordNavImg/Track.png")}  
            style={{
              width: width * 0.140,
              height: width * 0.140,
              resizeMode: "contain",
            }}      
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Image clicked!')}>
            <Image
            source={require("../../assets/images/dashbordNavImg/Home.png")}    
            style={{
              width: width * 0.140,
              height: width * 0.140,
              resizeMode: "contain",
            }}    
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Image clicked!')}>
            <Image
            source={require("../../assets/images/dashbordNavImg/Scan.png")}  
            style={{
              width: width * 0.140,
              height: width * 0.140,
              resizeMode: "contain",
            }}      
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Image clicked!')}>
            <Image
            source={require("../../assets/images/dashbordNavImg/Profile.png")}   
            style={{
              width: width * 0.140,
              height: width * 0.140,
              resizeMode: "contain",
            }}     
            />
          </TouchableOpacity>    
        </View>
      </View>
      {/* <CustomButton
        title="Login"
        onPress={() => router.replace("/(login)/loginScreen")}
        backgroundColor="#FCB647"
        textColor="white"
      /> */}
    </SafeAreaView>
  );
}
