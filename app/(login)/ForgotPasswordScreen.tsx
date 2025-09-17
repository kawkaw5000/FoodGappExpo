import { View, Text, Image, TextInput, TouchableOpacity, Alert, Dimensions, ScrollView } from "react-native";
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
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const { width } = Dimensions.get("window");

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${Account_API}/forgot-password`, {
        email: email.trim()
      });

      if (response.data.success) {
        setCodeSent(true);
        Alert.alert(
          "Code Sent", 
          "A 6-digit confirmation code has been sent to your email address."
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to send confirmation code.");
      }
    } catch (error: any) {
      console.error("Send code error:", error);
      if (error.response?.status === 404) {
        Alert.alert(
          "Feature Not Available", 
          "The password reset feature is currently being set up. Please contact support or try again later.",
          [{ text: "OK" }]
        );
      } else if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Failed to send confirmation code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationCode.trim()) {
      Alert.alert("Error", "Please enter the confirmation code.");
      return;
    }

    if (confirmationCode.length !== 6) {
      Alert.alert("Error", "Confirmation code must be 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${Account_API}/verify-reset-code`, {
        email: email.trim(),
        code: confirmationCode.trim()
      });

      if (response.data.success) {
        setCodeVerified(true);
        Alert.alert("Success", "Code verified! You can now set your new password.");
      } else {
        Alert.alert("Error", response.data.message || "Invalid confirmation code.");
      }
    } catch (error: any) {
      console.error("Verify code error:", error);
      if (error.response?.status === 404) {
        Alert.alert(
          "Feature Not Available", 
          "The password reset feature is currently being set up. Please contact support.",
          [{ text: "OK" }]
        );
      } else if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Failed to verify code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    // Validate all fields
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (!codeSent) {
      Alert.alert("Error", "Please send the verification code first.");
      return;
    }

    if (!confirmationCode.trim()) {
      Alert.alert("Error", "Please enter the confirmation code.");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${Account_API}/reset-password`, {
        email: email.trim(),
        code: confirmationCode.trim(),
        newPassword: newPassword.trim()
      });

      if (response.data.success) {
        Alert.alert(
          "Password Reset Successful", 
          "Your password has been reset successfully. You can now log in with your new password.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(login)/loginScreen")
            }
          ]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to reset password.");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={require("../../assets/images/wellnu.png")}
            style={{
              width: width * 0.71,
              height: width * 0.71,
              resizeMode: "contain",
            }}
          />
        </View>

        <View style={{ gap: 35, width: "90%" }}>
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333", textAlign: "center" }}>
              Forgot Password?
            </Text>
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginTop: 10 }}>
              Enter your email, verification code, and new password below.
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ position: "relative", marginTop: 10 }}>
            <View style={{ position: "absolute", top: -25, left: 0, zIndex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>Email</Text>
            </View>
            <TextInput
              style={{
                height: 50,
                borderColor: "black",
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingRight: codeSent ? 50 : 90,
                borderRadius: 5,
                width: "100%",
                backgroundColor: "white",
                marginTop: 10,
              }}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!codeSent && (
              <TouchableOpacity
                onPress={handleSendCode}
                style={{
                  position: "absolute",
                  right: 5,
                  top: 15,
                  backgroundColor: "#FCB647",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
                disabled={isLoading}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
                  {isLoading ? "Sending..." : "Send Code"}
                </Text>
              </TouchableOpacity>
            )}
            {codeSent && (
              <View style={{ position: "absolute", right: 15, top: 25 }}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              </View>
            )}
          </View>

          {/* Verification Code Input */}
          <View style={{ position: "relative", opacity: codeSent ? 1 : 0.5, marginTop: 10 }}>
            <View style={{ position: "absolute", top: -25, left: 0, zIndex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: codeSent ? "#333" : "#ccc" }}>
                Enter Verification Code from Email
              </Text>
            </View>
            <TextInput
              style={{
                height: 50,
                borderColor: codeSent ? "black" : "#ccc",
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingRight: codeSent && confirmationCode.length === 6 && !codeVerified ? 70 : 50,
                borderRadius: 5,
                width: "100%",
                textAlign: "center",
                fontSize: 18,
                letterSpacing: 5,
                backgroundColor: codeSent ? "white" : "#f9f9f9",
                marginTop: 10,
              }}
              placeholder="000000"
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              keyboardType="numeric"
              maxLength={6}
              editable={codeSent}
            />
            {codeSent && confirmationCode.length === 6 && !codeVerified && (
              <TouchableOpacity
                onPress={handleVerifyCode}
                style={{
                  position: "absolute",
                  right: 5,
                  top: 15,
                  backgroundColor: "#4CAF50",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
                disabled={isLoading}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Text>
              </TouchableOpacity>
            )}
            {codeVerified && (
              <View style={{ position: "absolute", right: 15, top: 25 }}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              </View>
            )}
          </View>

          {/* Resend Code Link */}
          {codeSent && (
            <TouchableOpacity
              onPress={handleSendCode}
              style={{
                alignSelf: "center",
                paddingVertical: 5,
                marginTop: -15,
              }}
              disabled={isLoading}
            >
              <Text style={{
                fontSize: 14,
                color: "#6D7ABC",
                textDecorationLine: "underline",
                fontWeight: "bold"
              }}>
                Didn't receive code? Resend
              </Text>
            </TouchableOpacity>
          )}

          {/* New Password Input */}
          <View style={{ position: "relative", opacity: codeVerified ? 1 : 0.5, marginTop: 10 }}>
            <View style={{ position: "absolute", top: -25, left: 0, zIndex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: codeVerified ? "#333" : "#ccc" }}>
                Enter New Password
              </Text>
            </View>
            <TextInput
              style={{
                height: 50,
                borderColor: codeVerified ? "black" : "#ccc",
                borderWidth: 1,
                paddingHorizontal: 10,
                borderRadius: 5,
                width: "100%",
                backgroundColor: codeVerified ? "white" : "#f9f9f9",
                marginTop: 10,
              }}
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={codeVerified}
            />
          </View>

          {/* Confirm New Password Input */}
          <View style={{ position: "relative", opacity: codeVerified ? 1 : 0.5, marginTop: 10 }}>
            <View style={{ position: "absolute", top: -25, left: 0, zIndex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: codeVerified ? "#333" : "#ccc" }}>
                Confirm New Password
              </Text>
            </View>
            <TextInput
              style={{
                height: 50,
                borderColor: codeVerified ? "black" : "#ccc",
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingRight: 50,
                borderRadius: 5,
                width: "100%",
                backgroundColor: codeVerified ? "white" : "#f9f9f9",
                marginTop: 10,
              }}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={codeVerified}
            />
            {codeVerified && newPassword && confirmPassword && newPassword === confirmPassword && (
              <View style={{ position: "absolute", right: 15, top: 25 }}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              </View>
            )}
            {codeVerified && newPassword && confirmPassword && newPassword !== confirmPassword && (
              <View style={{ position: "absolute", right: 15, top: 25 }}>
                <MaterialIcons name="error" size={20} color="#f44336" />
              </View>
            )}
          </View>

          <View style={{ gap: 15, marginTop: 30 }}>
            <CustomButton
              title={isLoading ? "Resetting Password..." : "Reset Password"}
              onPress={handleCompleteReset}
              backgroundColor={codeVerified ? "#4CAF50" : "#FCB647"}
              textColor="white"
              disabled={isLoading || !codeVerified}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              alignSelf: "center",
              paddingVertical: 20,
              marginTop: 20,
            }}
          >
            <Text style={{
              fontSize: 16,
              color: "#6D7ABC",
              textDecorationLine: "underline",
              fontWeight: "bold"
            }}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}