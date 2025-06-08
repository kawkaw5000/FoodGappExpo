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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyGoalId, setBodyGoalId] = useState<number>(1);
  const { width } = Dimensions.get("window");

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!isChecked) {
      Alert.alert("Error", "You must agree to the Privacy & Policy.");
      return;
    }
    try {
      const payload = {
        email,
        password,
        firstName: firstName || null,
        lastName: lastName || null
      };
      const response = await axios.post(`${Account_API}/register`, payload);
      if (response.data && response.data.message && response.data.message.toLowerCase().includes("success")) {
        // Registration successful, now create UserInfo
        try {
          // Login to get cookie/session for createUserInfo
          await axios.post(`${Account_API}/login`, { email, password }, { withCredentials: true });
          const userInfoPayload = {
            age: age ? Number(age) : null,
            weight: weight ? Number(weight) : null,
            height: height ? Number(height) : null,
            bodyGoalId: bodyGoalId || null,
            firstName: firstName || null,
            lastName: lastName || null
          };
          await axios.post(`${Account_API}/createUserInfo`, userInfoPayload, { withCredentials: true });
        } catch (userInfoErr) {
          // Optionally handle error
        }
        Alert.alert("Success", "Registration successful!", [
          { text: "OK", onPress: () => router.replace("/(login)/loginScreen") }
        ]);
      } else {
        Alert.alert("Error", (response.data && response.data.error) || "Registration failed.");
      }
    } catch (err: any) {
      let msg = "Registration failed.";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      Alert.alert("Error", msg);
    }
  };

  
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
                onPress={handleRegister}
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
        <View style={{gap: 20, width: "100%"}}>
        <View style={{ position: "relative"}}>
          <TextInput
            style={{ height: 50, borderColor: "black", borderWidth: 1, paddingHorizontal: 10, borderRadius: 5, width: "100%" }}
            placeholder=""
            value={firstName}
            onChangeText={setFirstName}
          />
          <View style={{position: "absolute", top:-35}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>First Name</Text>
          </View>
        </View>
        <View style={{ position: "relative"}}>
          <TextInput
            style={{ height: 50, borderColor: "black", borderWidth: 1, paddingHorizontal: 10, borderRadius: 5, width: "100%" }}
            placeholder=""
            value={lastName}
            onChangeText={setLastName}
          />
          <View style={{position: "absolute", top:-35}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Last Name</Text>
          </View>
        </View>
        <View style={{ position: "relative"}}>
          <TextInput
            style={{ height: 50, borderColor: "black", borderWidth: 1, paddingHorizontal: 10, borderRadius: 5, width: "100%" }}
            placeholder=""
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <View style={{position: "absolute", top:-35}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Age</Text>
          </View>
        </View>
        <View style={{ position: "relative"}}>
          <TextInput
            style={{ height: 50, borderColor: "black", borderWidth: 1, paddingHorizontal: 10, borderRadius: 5, width: "100%" }}
            placeholder=""
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <View style={{position: "absolute", top:-35}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Weight</Text>
          </View>
        </View>
        <View style={{ position: "relative"}}>
          <TextInput
            style={{ height: 50, borderColor: "black", borderWidth: 1, paddingHorizontal: 10, borderRadius: 5, width: "100%" }}
            placeholder=""
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
          <View style={{position: "absolute", top:-35}}>
            <Text style={{fontSize: 20, fontWeight: "bold"}}>Height</Text>
          </View>
        </View>
        <View style={{ position: "relative"}}>
          <Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 5}}>Body Goal</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[{id:1,label:'Lose Weight'},{id:2,label:'Maintain Weight'},{id:3,label:'Gain Weight'}].map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={{
                  borderWidth: 1,
                  borderColor: bodyGoalId === goal.id ? "#FCB647" : "#ccc",
                  backgroundColor: bodyGoalId === goal.id ? "#FCB647" : "#fff",
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  marginVertical: 5,
                  alignItems: "center"
                }}
                onPress={() => setBodyGoalId(goal.id)}
              >
                <Text style={{ color: bodyGoalId === goal.id ? "#fff" : "#FCB647", fontWeight: "bold" }}>{goal.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}
