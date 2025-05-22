import { View, Text, Button, Image, TextInput, TouchableOpacity, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios, { AxiosError, AxiosResponse } from "axios";
import Config from "@/constants/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Account_API = Config.Account_API;
const loginUrl = `${Account_API}/login`

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setCnfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPassVisible, setIsConfirmPassVisible] = useState(false);
  const { width } = Dimensions.get("window");

  
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "flex-start", alignItems: "center", backgroundColor: "white",}}>
      <View>
        <Image
          source={require("../../assets/images/foodGapp.png")}
          style={{
            width: width * 0.71,
            height: width * 0.71,
            resizeMode: "contain",
          }}
        />
      </View>
      <View style={{gap:50, width: "90%", position: "relative"}}>
        <View style={{ position: "relative"}}>
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
        <View style={{ position: 'relative' }}>
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
        <View style={{ position: 'relative', gap:15 }}>
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
              value={confirmPassword}
              secureTextEntry={!isConfirmPassVisible} 
              onChangeText={setCnfirmPassword}
            />
            <View style={{ position: 'absolute', top: -35 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Confirm Password</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsConfirmPassVisible(!isConfirmPassVisible)}
              style={{
                position: 'absolute',
                right: 10,
                top: 12,
              }}>
              <Ionicons
                name={isConfirmPassVisible ? 'eye-off' : 'eye'}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center"}}>
              <TouchableOpacity
                onPress={() => setIsChecked(!isChecked)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "black",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                {isChecked && <MaterialIcons name="check-circle" size={19} color="black" />}
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: "black" }}>
                I agree to the{" "}
                <Text
                  style={{ fontWeight: "bold", color: "#007BFF", textDecorationLine: "underline" }}
                  onPress={() => console.log("Open Privacy & Policy")}
                >
                  Privacy & Policy
                </Text>
              </Text>
            </View>
            <View>
              <CustomButton
                title="Confirm"
                onPress={() => router.replace("/(register)")}
                backgroundColor="#FCB647"
                textColor="white"  
              />
            </View> 
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
              style={{
                backgroundColor: "#FCB647",
                width: 70,
                height: 70,
                borderRadius: 100,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              }}
              onPress={() => router.replace("/(register)/registerMainScreen")}
            >
              <MaterialIcons name="arrow-back" size={54} color="white" />
            </TouchableOpacity>
            </View>
        </View>  
           
      </View>
    </SafeAreaView>
  );
}
