import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/buttons/CustomButton";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", margin: 0 }}>
      <View style={{ marginTop: 20 }}>
        <Image
          source={require("../../assets/images/mainlogInscreen.png")}
          style={{ width: 210, height: 210, resizeMode: "contain" }}
        />
      </View>
      <View style={{ position: "relative", top: -50 }}>
        <Image
          source={require("../../assets/images/foodGapp.png")}
          style={{ width: 290, height: 290, resizeMode: "contain" }}
        />
      </View>
      <View style={{ position: "relative", top: -140, padding: 5 }}>
        <Text style={{ textAlign: "center", fontSize: 13 }}>
          Welcome to FoodGapp! Enjoy ordering your favorite meals.
        </Text>
      </View>
      <View style={{ gap: 10, position: "relative", top: -70, width: 250 }}>
        <CustomButton
          title="Login"
          onPress={() => router.replace("/(login)/loginScreen")}  // ✅ Correct path
          backgroundColor="#FCB647"
          textColor="white"
        />
        <CustomButton title="Create an account" onPress={() => alert("Sign In Pressed")} backgroundColor="#59E74E" textColor="white" />
      </View>
    </SafeAreaView>
  );
}
