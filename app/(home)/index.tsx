import { View, Text, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/buttons/CustomButton";

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
    </SafeAreaView>
  );
}
