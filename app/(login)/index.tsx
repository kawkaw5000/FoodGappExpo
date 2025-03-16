import { View, Text, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/buttons/CustomButton";

export default function LoginScreen() {
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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut ullamcorper velit. In ultricies eu magna non feugiat. Duis vitae cursus sapien. Nulla commodo nisi diam, et laoreet mauris dictum a.
        </Text>
      </View>
      <View style={{ gap: 15, position: "relative", top: -70, width: "70%" }}>
        <CustomButton
          title="Login"
          onPress={() => router.replace("/(login)/loginScreen")}
          backgroundColor="#FCB647"
          textColor="white"
        />
        <CustomButton title="Create an account" onPress={() => alert("Sign In Pressed")} backgroundColor="#59E74E" textColor="white" />
      </View>
    </SafeAreaView>
  );
}
