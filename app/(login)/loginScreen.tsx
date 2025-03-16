import { View, Text, Button, Image, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "flex-start", alignItems: "center", backgroundColor: "white",}}>
      <View>
        <Image
          source={require("../../assets/images/foodGapp.png")}
          style={{ width: 290, height: 290, resizeMode: "contain" }}
        />
      </View>
      <View style={{gap:50, width: 300, position: "relative"}}>
        <View style={{gap:20, width: 250, position: "relative"}}>
          <TextInput
            style={{
              height: 50,
              borderColor: "black",
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 5,
              width: 300,
            }}
            placeholder=""
            value={email}
            onChangeText={setEmail}
          />
          <View style={{position: "absolute", top:-30}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Email</Text>
          </View>
        </View> 
        <View style={{gap:20, width: 250, position: "relative"}}>
          <TextInput
            style={{
              height: 50,
              borderColor: "black",
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 5,
              width: 300,
            }}
            placeholder=""
            value={password}
            onChangeText={setPassword}
          />
          <View style={{position: "absolute", top:-30}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Password</Text>
          </View>
        </View>     
      </View>
      <View style={{ gap: 20, position: "relative", width: 300, top: 80 }}>
        <CustomButton
          title="Login"
          onPress={() => alert("Sign In Pressed")}
          backgroundColor="#FCB647"
          textColor="white"  
        />
        <Text style={{fontSize: 12, fontWeight: "bold", textAlign: "center", textDecorationLine:"underline", color:"#6D7ABC"}}>Forgot password?</Text>  
        <View style={{ borderBottomWidth: 1, borderBottomColor: "black", width: "auto" }} />
        <View style={{}}>
        <CustomButton
          title="Create an account"
          onPress={() => alert("Sign In Pressed")}
          backgroundColor="#59E74E"
          textColor="white"  
        />
        </View> 
      </View>
      {/* <Button
        title="Logout"
        onPress={() => {
            router.push("/(login)");
        }}
      /> */}
    </SafeAreaView>
  );
}
