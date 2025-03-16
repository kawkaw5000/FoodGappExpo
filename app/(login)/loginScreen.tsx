import { View, Text, Button, Image, TextInput, TouchableOpacity, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import { Ionicons } from '@expo/vector-icons';
import axios, { AxiosError, AxiosResponse } from "axios";
import Config from "@/constants/Config";

const Account_API = Config.Account_API;
const loginUrl = `${Account_API}/login`

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { width } = Dimensions.get("window");
  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Email and password are required.");
        setError("Email and password are required.");
        return;
      }

      const response: AxiosResponse<LoginResponse> = await axios.post(
        loginUrl,
        { email: email, password: password },
        { headers: { "Content-Type": "application/json" } }
      );  
      const { message, roleName } = response.data;

      Alert.alert(response.data.message!);
      console.log("Login successful", `Role: ${roleName}`);
      
    } catch (err) {
      const error = err as AxiosError<LoginResponse>;
      if (error.response) {
        Alert.alert(error.response.data?.error)
        setError(error.response.data?.error);
      } else {
        console.error("Unexpected error:", (err as Error).message);
        setError("An unexpected error occurred.");
      }
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "flex-start", alignItems: "center", backgroundColor: "white",}}>
      <View>
      <Image
        source={require("../../assets/images/foodGapp.png")}
        style={{
          width: width * 0.81,
          height: width * 0.81,
          resizeMode: "contain",
        }}
      />
    </View>
      <View style={{gap:50, width: "90%", position: "relative"}}>
        <View style={{gap:20, width: "100%", position: "relative"}}>
          <TextInput
            style={{
              height: 50,
              borderColor: "black",
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 5,
              width: "100%",
            }}
            placeholder=""
            value={email}
            onChangeText={setEmail}
          />
          <View style={{position: "absolute", top:-35}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Email</Text>
          </View>
        </View> 
        <View style={{ gap: 20, width: "100%", position: 'relative' }}>
            {/* Password Input */}
            <TextInput
              style={{
                  height: 50,
                  borderColor: 'black',
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  width: "100%",
              }}
              placeholder=""
              value={password}
              secureTextEntry={!isPasswordVisible} 
              onChangeText={setPassword}
            />
            <View style={{ position: 'absolute', top: -35 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Password</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={{
                position: 'absolute',
                right: 10,
                top: 12,
              }}>
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
        </View>    
      </View>
      <View style={{ gap: 20, position: "relative", width: "90%", top: 80 }}>
        <CustomButton
          title="Login"
          onPress={() => handleLogin()}
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
    </SafeAreaView>
  );
}
