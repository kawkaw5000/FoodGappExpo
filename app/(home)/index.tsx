import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import GetStarted from "./getStarted";

export default function HomeScreen() {
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  // Determine which icon is highlighted
  const currentRoute = "/(home)";

  const handleNav = (route: string) => {
    if (route !== currentRoute) router.replace(route as any);
  };

  const [getStartedStep, setGetStartedStep] = useState(0);
  const [showGetStarted, setShowGetStarted] = useState(false);

  // Example steps for Get Started (replace with your actual content/icons)
  const getStartedSteps = [
    {
      title: "Set Your Goal",
      description: "Choose your body goal to personalize your experience.",
      icon: require("../../assets/images/GetStarted Icons/TargetLogo.png"),
    },
    {
      title: "Enter Your Weight",
      description: "Track your weight for better recommendations.",
      icon: require("../../assets/images/GetStarted Icons/WeightLogo.png"),
    },
    {
      title: "Enter Your Height",
      description: "Height helps us calculate your BMI.",
      icon: require("../../assets/images/GetStarted Icons/HeightLogo.png"),
    },
    {
      title: "Start Exercising",
      description: "Add your exercise routines to get started!",
      icon: require("../../assets/images/GetStarted Icons/ExerciseLogo.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Image source={require("../../assets/images/Dashboard Icons/Home_Highlight.png")} style={styles.image} />
        <Text style={styles.title}>Welcome to the Main Dashboard!</Text>
        {/* Get Started Stepper */}
        {showGetStarted ? (
          <GetStarted onFinish={() => { setShowGetStarted(false); }} />
        ) : (
          <CustomButton
            title="Get Started"
            onPress={() => setShowGetStarted(true)}
            backgroundColor="#FCB647"
            textColor="white"
          />
        )}
        <CustomButton
          title="Edit Profile"
          onPress={() => router.push({ pathname: "/(profile)/editProfile" })}
          backgroundColor="#333"
          textColor="white"
        />
      </View>
      <View style={styles.spacer} />
      {/* <CustomButton
        title="Logout"
        onPress={handleLogout}
        backgroundColor="#FCB647"
        textColor="white"
      /> */}
      <View style={{ height: 12 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  spacer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  iconButton: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 2,
  },
  iconLabel: {
    fontSize: 12,
    color: "#333",
  },
  iconLabelActive: {
    color: "#FCB647",
    fontWeight: "bold",
  },
  getStartedBox: {
    width: '90%',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  getStartedIcon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  getStartedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  getStartedDesc: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  getStartedNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
});
