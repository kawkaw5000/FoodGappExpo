import { View, Text, Image, TextInput, TouchableOpacity, Alert, Dimensions, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from "axios";
import Config from "@/constants/Config";

const Account_API = Config.Account_API;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const { width } = Dimensions.get("window");

  // Debug info for troubleshooting
  console.log("🔧 ForgotPasswordScreen loaded (MERN-style)");
  console.log("📡 Account_API URL:", Account_API);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Sending password reset request...");
      console.log(`📡 Backend URL: ${Account_API}/forgot-password`);

      const response = await axios.post(`${Account_API}/forgot-password`, {
        email: email.trim(),
      }, {
        timeout: 15000, // 15-second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ Backend response:", response.data);

      if (response.data.success) {
        setEmailSent(true);
        
        // In development, show the reset URL
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
          console.log("🔗 Reset URL for testing:", response.data.resetUrl);
        }

        Alert.alert(
          "Email Sent! 📧",
          "We've sent a password reset link to your email. Please check your inbox and spam folder.",
          [
            { text: "OK" },
            ...(response.data.resetUrl ? [{
              text: "Open Reset Link (Dev)",
              onPress: () => Linking.openURL(response.data.resetUrl)
            }] : [])
          ]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      console.log("❌ Backend error:", error.message);
      console.log("📋 Error details:", error.response?.data || 'No response data');

      let errorMessage = "An error occurred while sending the reset link.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/(login)/loginScreen");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
          
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Image
              source={require("@/assets/images/foodGapp.png")}
              style={{ width: 120, height: 120, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333" }}>
              Forgot Password?
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: "#666", 
              textAlign: "center", 
              marginTop: 10,
              lineHeight: 22 
            }}>
              {emailSent 
                ? "Password reset email sent! Check your inbox and follow the link to reset your password." 
                : "Enter your email address and we'll send you a secure link to reset your password."
              }
            </Text>
          </View>

          {!emailSent ? (
            /* Email Input Form */
            <View style={{ width: "100%" }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" }}>
                  Email Address
                </Text>
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E1E1E1",
                  borderRadius: 8,
                  paddingHorizontal: 15,
                }}>
                  <MaterialIcons name="email" size={20} color="#666" style={{ marginRight: 10 }} />
                  <TextInput
                    style={{ 
                      flex: 1, 
                      paddingVertical: 15, 
                      fontSize: 16, 
                      color: "#333" 
                    }}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <CustomButton
                title={isLoading ? "Sending..." : "Send Reset Link"}
                onPress={handleSendResetLink}
                backgroundColor={isLoading ? "#B0B0B0" : "#007AFF"}
                textColor="#FFFFFF"
                style={{ marginBottom: 15 }}
                disabled={isLoading}
              />

              <TouchableOpacity
                style={{ alignItems: "center", paddingVertical: 15 }}
                onPress={handleBackToLogin}
              >
                <Text style={{ color: "#007AFF", fontSize: 16, fontWeight: "500" }}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Success State */
            <View style={{ alignItems: "center" }}>
              <View style={{ 
                backgroundColor: "#E8F5E8", 
                borderRadius: 50, 
                width: 80, 
                height: 80, 
                justifyContent: "center", 
                alignItems: "center",
                marginBottom: 20 
              }}>
                <Ionicons name="checkmark" size={40} color="#4CAF50" />
              </View>

              <Text style={{ 
                fontSize: 20, 
                fontWeight: "600", 
                color: "#333", 
                textAlign: "center",
                marginBottom: 10 
              }}>
                Check Your Email
              </Text>

              <Text style={{ 
                fontSize: 16, 
                color: "#666", 
                textAlign: "center", 
                lineHeight: 22,
                marginBottom: 10 
              }}>
                We've sent a secure reset link to:
                {"\n"}
                <Text style={{ fontWeight: "600", color: "#333" }}>{email}</Text>
              </Text>

              <Text style={{ 
                fontSize: 14, 
                color: "#888", 
                textAlign: "center", 
                lineHeight: 20,
                marginBottom: 30 
              }}>
                Click the link in your email to reset your password. 
                The link expires in 30 minutes.
              </Text>

              {/* Development helper */}
              {resetUrl && (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#FFF3CD",
                    borderColor: "#FFEAA7",
                    borderWidth: 1,
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 20,
                    width: "100%"
                  }}
                  onPress={() => Linking.openURL(resetUrl)}
                >
                  <Text style={{ 
                    color: "#856404", 
                    textAlign: "center", 
                    fontWeight: "500" 
                  }}>
                    🚧 Dev Mode: Tap to Open Reset Link
                  </Text>
                </TouchableOpacity>
              )}

              <CustomButton
                title="Try Another Email"
                onPress={() => {
                  setEmailSent(false);
                  setEmail("");
                  setResetUrl("");
                }}
                backgroundColor="#007AFF"
                textColor="#FFFFFF"
                style={{ marginBottom: 15 }}
              />

              <TouchableOpacity
                style={{ alignItems: "center", paddingVertical: 15 }}
                onPress={handleBackToLogin}
              >
                <Text style={{ color: "#007AFF", fontSize: 16, fontWeight: "500" }}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
