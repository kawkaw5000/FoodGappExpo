import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import GetStarted from "./getStarted";
import { Ionicons } from '@expo/vector-icons';
import ChatbotScreen from "@/components/ChatbotScreen";
import ShareModal from "@/components/ShareModal";

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
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

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
      <View style={styles.header}>
        <Text style={styles.dateText}>May 29, 2025</Text>
        <TouchableOpacity onPress={() => setShareModalVisible(true)}>
          <Ionicons name="share-social-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Calorie Summary */}
        <View style={styles.mainSummary}>
          <View style={styles.calorieCircleContainer}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieNumber}>362</Text>
              <Text style={styles.calorieLabel}>cal</Text>
            </View>
            <View style={styles.goalContainer}>
              <Text style={styles.goalNumber}>1,925</Text>
              <Text style={styles.goalLabel}>kcal</Text>
            </View>
            <View style={styles.remainingContainer}>
              <Text style={styles.remainingNumber}>1,563</Text>
              <Text style={styles.remainingLabel}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Macros Row */}
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>31g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>27g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>2g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
        </View>

        {/* Exercise Section */}
        <View style={styles.exerciseSection}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>Exercise</Text>
            <TouchableOpacity>
              <Ionicons name="add" size={24} color="#FCB647" />
            </TouchableOpacity>
          </View>
          <View style={styles.weekDays}>
            {[26, 27, 28, 29, 30].map((day, index) => (
              <View key={day} style={[styles.dayCircle, index === 2 && styles.activeDayCircle]}>
                <Text style={[styles.dayText, index === 2 && styles.activeDayText]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Meals</Text>
          
          <TouchableOpacity style={styles.mealItem}>
            <View style={styles.mealIcon}>
              <Ionicons name="sunny" size={20} color="#FF6B6B" />
            </View>
            <Text style={styles.mealLabel}>Breakfast</Text>
            <View style={styles.mealStatus}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mealItem}>
            <View style={styles.mealIcon}>
              <Ionicons name="partly-sunny" size={20} color="#FFB74D" />
            </View>
            <Text style={styles.mealLabel}>Lunch</Text>
            <View style={styles.mealStatusEmpty} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mealItem}>
            <View style={styles.mealIcon}>
              <Ionicons name="moon" size={20} color="#9C27B0" />
            </View>
            <Text style={styles.mealLabel}>Dinner</Text>
            <View style={styles.mealStatusEmpty} />
          </TouchableOpacity>
        </View>

        {/* Extra padding at bottom for the floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <TouchableOpacity style={styles.chatbotButton} onPress={() => setChatbotVisible(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={chatbotVisible}
        onRequestClose={() => {
          setChatbotVisible(!chatbotVisible);
        }}
      >
        <ChatbotScreen onClose={() => setChatbotVisible(false)} />
      </Modal>

      <ShareModal 
        visible={shareModalVisible} 
        onClose={() => setShareModalVisible(false)} 
      />

      {/* <CustomButton
        title="Logout"
        onPress={handleLogout}
        backgroundColor="#FCB647"
        textColor="white"
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 120,
  },
  mainSummary: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  calorieCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#FCB647',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieLabel: {
    fontSize: 14,
    color: 'gray',
  },
  goalContainer: {
    position: 'absolute',
    left: -40,
    top: 40,
    alignItems: 'center',
  },
  goalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  goalLabel: {
    fontSize: 12,
    color: 'gray',
  },
  remainingContainer: {
    position: 'absolute',
    right: -40,
    top: 40,
    alignItems: 'center',
  },
  remainingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  remainingLabel: {
    fontSize: 12,
    color: 'gray',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  macroLabel: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  exerciseSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDayCircle: {
    backgroundColor: '#FCB647',
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activeDayText: {
    color: 'white',
  },
  mealsSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mealLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  mealStatus: {
    marginLeft: 10,
  },
  mealStatusEmpty: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FCB647',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
