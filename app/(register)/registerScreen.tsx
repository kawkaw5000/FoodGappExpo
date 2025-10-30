  import { View, Text, Button, Image, TextInput, TouchableOpacity, Alert, Dimensions, ScrollView } from "react-native";
  import { useRouter } from "expo-router";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { useState, useEffect } from "react";
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
    const [gender, setGender] = useState<number | null>(null);
    const [bodyGoalId, setBodyGoalId] = useState<number>(1);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const { width } = Dimensions.get("window");

    // Email validation function
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Check email availability
    const checkEmailAvailability = async (email: string) => {
      if (!validateEmail(email)) {
        setEmailAvailable(null);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await axios.get(`${Account_API}/check-email/${encodeURIComponent(email)}`);
        setEmailAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking email availability:', error);
        // If endpoint doesn't exist yet, assume email is available
        setEmailAvailable(true);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    // Handle email change with validation
    const handleEmailChange = (text: string) => {
      setEmail(text);
      const isValid = validateEmail(text);
      setEmailValid(text.length > 0 ? isValid : null);
      
      if (isValid) {
        // Debounce email availability check
        const timeoutId = setTimeout(() => {
          checkEmailAvailability(text);
        }, 500);
        return () => clearTimeout(timeoutId);
      } else {
        setEmailAvailable(null);
      }
    };

    // Load profile data from previous screen
    useEffect(() => {
      const loadProfileData = async () => {
        try {
          const profileDataString = await AsyncStorage.getItem('registrationProfileData');
          if (profileDataString) {
            const profileData = JSON.parse(profileDataString);
            setFirstName(profileData.firstName || "");
            setLastName(profileData.lastName || "");
            setAge(profileData.age ? profileData.age.toString() : "");
            setWeight(profileData.weight ? profileData.weight.toString() : "");
            setHeight(profileData.height ? profileData.height.toString() : "");
            setGender(profileData.gender);
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      };
      loadProfileData();
    }, []);

    const handleRegister = async () => {
      if (!email || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }
      
      // Validate email format
      if (!validateEmail(email)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }
      
      // Check if email is available
      if (emailAvailable === false) {
        Alert.alert("Error", "This email address is already registered. Please use a different email or try logging in.");
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
      }
      
      // Password strength validation
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long.");
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
              gender: gender,
              bodyGoalId: bodyGoalId || null,
              firstName: firstName || null,
              lastName: lastName || null
            };
            await axios.post(`${Account_API}/createUserInfo`, userInfoPayload, { withCredentials: true });
          } catch (userInfoErr) {
            console.error('Error creating user info:', userInfoErr);
          }
          
          // Clean up stored profile data
          try {
            await AsyncStorage.removeItem('registrationProfileData');
          } catch (error) {
            console.error('Error cleaning up profile data:', error);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
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
                borderColor: emailValid === false ? "#f44336" : emailAvailable === false ? "#f44336" : emailValid === true && emailAvailable === true ? "#4CAF50" : "black",
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingRight: 45,
                borderRadius: 5,
                width: "100%",
              }}
              placeholder="Enter your email address"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="register-email"
            />
            <View style={{position: "absolute", top:-35}}>
              <Text style={{fontSize: 20, fontWeight: "bold"}}>Email</Text>
            </View>
            
            {/* Email Validation Icons */}
            <View style={{ position: "absolute", right: 12, top: 15 }}>
              {isCheckingEmail ? (
                <MaterialIcons name="hourglass-empty" size={20} color="#FCB647" />
              ) : emailValid === false ? (
                <MaterialIcons name="error" size={20} color="#f44336" />
              ) : emailAvailable === false ? (
                <MaterialIcons name="error" size={20} color="#f44336" />
              ) : emailValid === true && emailAvailable === true ? (
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              ) : null}
            </View>
            
            {/* Email Status Messages */}
            {email.length > 0 && (
              <View style={{ position: "absolute", top: 55, left: 0 }}>
                {emailValid === false ? (
                  <Text style={{ color: "#f44336", fontSize: 12 }}>Please enter a valid email address</Text>
                ) : emailAvailable === false ? (
                  <Text style={{ color: "#f44336", fontSize: 12 }}>This email is already registered</Text>
                ) : emailValid === true && emailAvailable === true ? (
                  <Text style={{ color: "#4CAF50", fontSize: 12 }}>Email is available</Text>
                ) : isCheckingEmail ? (
                  <Text style={{ color: "#FCB647", fontSize: 12 }}>Checking email availability...</Text>
                ) : null}
              </View>
            )}
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
                testID="register-password"
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
                testID="register-confirm-password"
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
              
              {/* Privacy Policy Scrollable Box */}
              <View style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                height: 120,
                marginTop: 15,
                marginBottom: 15,
                backgroundColor: '#fafafa',
              }}>
                <ScrollView 
                  style={{ flex: 1 }} 
                  contentContainerStyle={{ padding: 10 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  <Text style={{ fontSize: 12, color: '#333', lineHeight: 18 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Privacy Policy</Text>{'\n\n'}
                    By registering, you agree to our Privacy Policy. We respect your privacy and are committed to protecting your personal data.{'\n\n'}
                    
                    <Text style={{ fontWeight: 'bold' }}>Information We Collect:</Text>{'\n'}
                    • Personal information (name, email, age, weight, height){'\n'}
                    • Food logging data and dietary preferences{'\n'}
                    • Usage analytics and app performance data{'\n'}
                    • Device information and location data{'\n\n'}
                    
                    <Text style={{ fontWeight: 'bold' }}>How We Use Your Data:</Text>{'\n'}
                    • To provide personalized nutrition recommendations{'\n'}
                    • To track your health and fitness progress{'\n'}
                    • To improve our services and user experience{'\n'}
                    • To send you relevant notifications and updates{'\n\n'}
                    
                    <Text style={{ fontWeight: 'bold' }}>Data Protection:</Text>{'\n'}
                    • Your data will not be shared with third parties without your consent{'\n'}
                    • We use industry-standard security measures{'\n'}
                    • You have the right to access, modify, or delete your data{'\n'}
                    • Data is encrypted both in transit and at rest{'\n\n'}
                    
                    <Text style={{ fontWeight: 'bold' }}>Your Rights:</Text>{'\n'}
                    • Right to access your personal data{'\n'}
                    • Right to correct inaccurate data{'\n'}
                    • Right to delete your account and data{'\n'}
                    • Right to data portability{'\n\n'}
                    
                    For more information, contact support@wellnu.com{'\n\n'}
                    Last updated: September 2025
                  </Text>
                </ScrollView>
              </View>
              
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
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  testID="register-privacy-checkbox"
                >
                  {isChecked && <MaterialIcons name="check-circle" size={19} color="black" />}
                </TouchableOpacity>
                <Text style={{ fontSize: 14, color: "black" }}>
                  I agree to the <Text style={{ fontWeight: "bold" }}>Privacy Policy</Text>
                </Text>
              </View>
              <View>
                <CustomButton
                  title="Confirm"
                  onPress={handleRegister}
                  backgroundColor="#FCB647"
                  textColor="white"  
                  testID="register-submit"
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
        </ScrollView>
      </SafeAreaView>
    );
  }
