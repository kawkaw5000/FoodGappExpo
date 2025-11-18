import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

// Helper function to format numerical values
const formatValue = (value: any): string => {
  const num = parseFloat(value) || 0;
  // If it's a whole number, don't show decimals
  if (num % 1 === 0) {
    return num.toString();
  }
  // Otherwise show up to 2 decimals
  return num.toFixed(2);
};

interface FoodRecommendation {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  description: string;
}



// Example placeholder for user profile hook/context
// Replace this with your actual user context or async storage logic
function useUserProfile() {
  // TODO: Connect to your real user context or async storage
  // Example: return useContext(UserContext)
  // Example return value:
  // return { id: 1, name: "Jane Doe", age: 25, gender: "female", height: 160, weight: 60, body_goal: "maintain weight" };
  return {
    id: 1,
    name: "Jane Doe",
    age: 25,
    gender: "female",
    height: 160,
    weight: 60,
    body_goal: "maintain weight"
  };
}

// Leveling system: fetch user level/exp from backend
function useUserLevel(userId: number) {
  const [levelData, setLevelData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch(require('../../constants/Config').default.API_BASE + `/account/user-level/${userId}`)
      .then(res => res.json())
      .then(data => {
        setLevelData(data);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to fetch user level');
        setLoading(false);
      });
  }, [userId]);

  return { levelData, loading, error, setLevelData };
}

// Example placeholder for food logs hook
// Replace with your backend or async storage logic
function useFoodLogs(userId: number) {
  // TODO: Connect to your backend or async storage for food logs
  // Example return value:
  // return [{ id: 1, name: "Adobong Manok", calories: 285, date: "2025-07-30" }];
  return [
    { id: 1, name: "Adobong Manok", calories: 285, date: "2025-07-30" },
    { id: 2, name: "Pancit Canton", calories: 340, date: "2025-07-30" }
  ];
}

export default function TrackPage() {
  const userProfile = useUserProfile();
  // Fallback: show loading or error if user profile is not loaded
  if (!userProfile) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#333' }}>Loading user profile...</Text>
      </SafeAreaView>
    );
  }

  // Leveling system: fetch user level/exp
  const { levelData, loading: levelLoading, error: levelError, setLevelData } = useUserLevel(userProfile.id);

  // Fetch food logs for the current user
  const foodLogs = useFoodLogs(userProfile.id);

  // Filter food logs for today (from backend/storage)
  const todayString = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const todayLogs = foodLogs.filter(log => log.date && log.date.startsWith(todayString));

  // State for personalized recommendations
  const [recommendations, setRecommendations] = useState<string | string[]>("");
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  // State for health risk alerts/deficiencies
  const [deficiency, setDeficiency] = useState<string>("");
  const [deficiencyLoading, setDeficiencyLoading] = useState(false);
  const [deficiencyError, setDeficiencyError] = useState<string | null>(null);

  // State for meal plan
  const [mealPlan, setMealPlan] = useState<string>("");
  const [mealPlanLoading, setMealPlanLoading] = useState(false);
  const [mealPlanError, setMealPlanError] = useState<string | null>(null);

  // State for nutrition education
  const [education, setEducation] = useState<string>("");
  const [educationLoading, setEducationLoading] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);

  // State for food alternatives
  const [alternatives, setAlternatives] = useState<string>("");
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const [alternativesError, setAlternativesError] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedMeal = params.meal as string || "Breakfast";
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [trackedFoods, setTrackedFoods] = useState<FoodRecommendation[]>([]);

  // Filipino food recommendations
  const filipinoFoodRecommendations: FoodRecommendation[] = [
    {
      id: "1",
      name: "Adobong Manok",
      calories: 285,
      protein: 25,
      carbs: 8,
      fats: 18,
      category: "Viand",
      description: "Classic Filipino chicken adobo with soy sauce and vinegar"
    },
    {
      id: "2", 
      name: "Pancit Canton",
      calories: 340,
      protein: 12,
      carbs: 52,
      fats: 11,
      category: "Noodles",
      description: "Stir-fried wheat noodles with vegetables and meat"
    },
    {
      id: "3",
      name: "Sinigang na Baboy",
      calories: 220,
      protein: 18,
      carbs: 15,
      fats: 12,
      category: "Soup",
      description: "Tamarind-based pork soup with vegetables"
    },
    {
      id: "4",
      name: "Fried Rice (Garlic)",
      calories: 280,
      protein: 8,
      carbs: 45,
      fats: 9,
      category: "Rice",
      description: "Filipino-style garlic fried rice"
    },
    {
      id: "5",
      name: "Lumpia Shanghai",
      calories: 45,
      protein: 3,
      carbs: 4,
      fats: 2,
      category: "Appetizer",
      description: "Filipino spring rolls (per piece)"
    },
    {
      id: "6",
      name: "Tinola",
      calories: 180,
      protein: 20,
      carbs: 8,
      fats: 8,
      category: "Soup",
      description: "Ginger-based chicken soup with green papaya"
    },
    {
      id: "7",
      name: "Kare-Kare",
      calories: 350,
      protein: 22,
      carbs: 12,
      fats: 25,
      category: "Viand",
      description: "Oxtail stew in peanut sauce"
    },
    {
      id: "8",
      name: "Bicol Express",
      calories: 320,
      protein: 15,
      carbs: 10,
      fats: 26,
      category: "Viand",
      description: "Spicy pork in coconut milk with chilies"
    }
  ];

  // Reset daily tracking at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      const lastReset = new Date(currentDate);
      
      if (now.getDate() !== lastReset.getDate() || 
          now.getMonth() !== lastReset.getMonth() || 
          now.getFullYear() !== lastReset.getFullYear()) {
        setCurrentDate(now);
        setTrackedFoods([]); // Reset tracked foods for new day
        console.log("Daily tracker reset for new day");
      }
    };

    // Check every minute
    const interval = setInterval(checkForNewDay, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const getMealRecommendations = (mealType: string) => {
    // Filter recommendations based on meal type
    switch (mealType) {
      case "Breakfast":
        return filipinoFoodRecommendations.filter(food => 
          ["Rice", "Soup"].includes(food.category) || 
          food.name.includes("Fried Rice")
        );
      case "Lunch":
        return filipinoFoodRecommendations.filter(food => 
          ["Viand", "Noodles", "Soup", "Rice"].includes(food.category)
        );
      case "Dinner":
        return filipinoFoodRecommendations.filter(food => 
          ["Viand", "Soup", "Rice"].includes(food.category)
        );
      default:
        return filipinoFoodRecommendations;
    }
  };

  // Fetch nutrition info for a food and add to tracked foods (like food logging)
  const handleAddRecommendation = async (food: FoodRecommendation) => {
    try {
      // Prepare payload for nutrition API (like scan.tsx)
      const nutritionPayload = {
        items: [
          {
            foodName: food.name,
            grams: 100 // or allow user to input grams if needed
          }
        ],
        body_goal: "maintain weight",
        date: new Date().toISOString()
      };

      const nutritionRes = await fetch(require('../../constants/Config').default.NUTRITION_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nutritionPayload),
      });
      const nutritionRawText = await nutritionRes.text();
      let nutritionResponse: any = {};
      try {
        nutritionResponse = JSON.parse(nutritionRawText);
      } catch (err) {
        nutritionResponse = {};
      }

      // Parse nutrition info (Gemini returns Calories, Protein, Fat, no carbs)
      let parsedNutrition: {calories: number, protein: number, carbs: number, fats: number} = {
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
      };
      let embeddedJson = null;
      if (nutritionResponse && typeof nutritionResponse === 'object' && 'nutritional_info' in nutritionResponse && typeof nutritionResponse.nutritional_info === 'string') {
        let info = nutritionResponse.nutritional_info.trim();
        if (info.startsWith('```json')) {
          info = info.replace(/```json|```/g, '').trim();
        }
        try {
          embeddedJson = JSON.parse(info);
        } catch (err) {
          embeddedJson = null;
        }
      }
      if (embeddedJson && Array.isArray(embeddedJson.foods) && embeddedJson.foods.length > 0) {
        const foodObj = embeddedJson.foods[0];
        parsedNutrition = {
          calories: foodObj.Calories ?? 0,
          protein: foodObj.Protein ?? 0,
          carbs: 0, // Gemini does not return carbs, set to 0
          fats: foodObj.Fat ?? 0,
        };
      } else if (nutritionResponse && typeof nutritionResponse === 'object' && 'total_nutrients' in nutritionResponse && nutritionResponse.total_nutrients) {
        parsedNutrition = {
          calories: nutritionResponse.total_nutrients.calories ?? 0,
          protein: nutritionResponse.total_nutrients.protein ?? 0,
          carbs: nutritionResponse.total_nutrients.carbohydrates ?? nutritionResponse.total_nutrients.total_carbohydrate ?? 0,
          fats: nutritionResponse.total_nutrients.total_fat ?? nutritionResponse.total_nutrients.fat ?? 0,
        };
      }

      // Add to tracked foods with nutrition info
      setTrackedFoods(prev => [
        ...prev,
        {
          ...food,
          calories: parsedNutrition.calories,
          protein: parsedNutrition.protein,
          carbs: parsedNutrition.carbs,
          fats: parsedNutrition.fats,
        }
      ]);

      // Add experience points for logging food (e.g., 10 exp per food)
      const expRes = await fetch(require('../../constants/Config').default.API_BASE + '/account/add-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id, experience: 10 })
      });
      if (expRes.ok) {
        const expData = await expRes.json();
        setLevelData(expData); // update level UI immediately
      }

      Alert.alert("Added to Tracker", `${food.name} has been added to your daily tracker!`);
    } catch (e) {
      Alert.alert("Error", "Failed to fetch nutrition info for this food.");
    }
  };

  const getCurrentDateString = () => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate daily macros
  const getTotalMacros = () => {
    return trackedFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.calories || 0),
        protein: totals.protein + (food.protein || 0),
        carbs: totals.carbs + (food.carbs || 0),
        fats: totals.fats + (food.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };
  const totalMacros = getTotalMacros();


  // Fetch all dashboard data when trackedFoods or userProfile change
  useEffect(() => {
    if (!userProfile) return;
    // 1. Personalized Recommendations
    const fetchRecommendations = async () => {
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      try {
        const res = await fetch(require('../../constants/Config').default.API_BASE + '/personalized_recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_profile: userProfile,
            current_nutrition: trackedFoods
          })
        });
        const data = await res.json();
        let recs = data.recommendations || "No recommendations available.";
        // Try to parse as array if possible
        if (typeof recs === 'string') {
          // Try splitting by newlines or numbered/bulleted list
          const lines = recs.split(/\n|\r|\d+\. |\- /).map(s => s.trim()).filter(Boolean);
          if (lines.length > 1) {
            setRecommendations(lines);
          } else {
            setRecommendations(recs);
          }
        } else if (Array.isArray(recs)) {
          setRecommendations(recs);
        } else {
          setRecommendations("No recommendations available.");
        }
      } catch (e) {
        setRecommendationsError("Failed to fetch recommendations.");
      } finally {
        setRecommendationsLoading(false);
      }
    };

    // 2. Health Risk Alerts / Deficiencies
    const fetchDeficiency = async () => {
      setDeficiencyLoading(true);
      setDeficiencyError(null);
      try {
        const res = await fetch(require('../../constants/Config').default.API_BASE + '/analyze_deficiencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...userProfile,
            daily_nutrition: trackedFoods
          })
        });
        const data = await res.json();
        setDeficiency(data.deficiency_analysis || "No health risk alerts or deficiencies detected today.");
      } catch (e) {
        setDeficiencyError("Failed to fetch deficiency analysis.");
      } finally {
        setDeficiencyLoading(false);
      }
    };

    // 3. Meal Plan
    const fetchMealPlan = async () => {
      setMealPlanLoading(true);
      setMealPlanError(null);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        const res = await fetch(require('../../constants/Config').default.API_BASE + '/generate_meal_plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_profile: userProfile,
            duration_days: 7
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        const data = await res.json();
        setMealPlan(data.meal_plan || "No meal plan available.");
      } catch (e: any) {
        if (e.name === 'AbortError') {
          setMealPlanError("Request timed out (30s). Is the Python server running?");
        } else {
          setMealPlanError("Failed to fetch meal plan.");
        }
      } finally {
        setMealPlanLoading(false);
      }
    };

    // 4. Nutrition Education
    const fetchEducation = async () => {
      setEducationLoading(true);
      setEducationError(null);
      try {
        const res = await fetch(require('../../constants/Config').default.API_BASE + '/nutrition_education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: "basic_nutrition",
            level: "beginner"
          })
        });
        const data = await res.json();
        setEducation(data.education_content || "No education content available.");
      } catch (e) {
        setEducationError("Failed to fetch nutrition education.");
      } finally {
        setEducationLoading(false);
      }
    };

    // 5. Food Alternatives
    const fetchAlternatives = async () => {
      setAlternativesLoading(true);
      setAlternativesError(null);
      try {
        const res = await fetch(require('../../constants/Config').default.API_BASE + '/local_food_alternatives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_nutrients: ["protein", "iron"],
            dietary_restrictions: null
          })
        });
        const data = await res.json();
        setAlternatives(data.food_alternatives || "No food alternatives available.");
      } catch (e) {
        setAlternativesError("Failed to fetch food alternatives.");
      } finally {
        setAlternativesLoading(false);
      }
    };

    fetchRecommendations();
    fetchDeficiency();
    fetchMealPlan();
    fetchEducation();
    fetchAlternatives();
  }, [trackedFoods, userProfile]);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Leveling System UI */}
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 }}>Leveling System</Text>
          {levelLoading ? (
            <Text style={{ color: '#888' }}>Loading level...</Text>
          ) : levelError ? (
            <Text style={{ color: '#D32F2F' }}>{levelError}</Text>
          ) : levelData ? (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>Level {levelData.userLevel}</Text>
              <View style={{ width: '80%', height: 16, backgroundColor: '#E0E0E0', borderRadius: 8, marginVertical: 8 }}>
                <View style={{
                  width: `${Math.min(100, 100 * (levelData.userCurrentExperience / levelData.experienceToNextLevel))}%`,
                  height: '100%',
                  backgroundColor: '#4CAF50',
                  borderRadius: 8
                }} />
              </View>
              <Text style={{ fontSize: 14, color: '#333' }}>{levelData.userCurrentExperience} / {levelData.experienceToNextLevel} XP to next level</Text>
            </View>
          ) : null}
        </View>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Tracker</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Date and Daily Reset Info */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{getCurrentDateString()}</Text>
          <Text style={styles.dailyResetText}>Daily tracker resets at midnight</Text>
        </View>

        {/* Daily Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{formatValue(totalMacros.calories)}</Text>
            <Text style={styles.progressSubText}>/ {formatValue(dailyGoal)} kcal</Text>
          </View>
          <Text style={styles.progressLabel}>Today's Intake</Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{formatValue(totalMacros.protein)}g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{formatValue(totalMacros.carbs)}g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{formatValue(totalMacros.fats)}g</Text>
            </View>
          </View>
        </View>

        {/* Health Risk Alerts / Deficiencies */}
        <View style={{paddingHorizontal: 20, marginBottom: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8}}>
            Health Risk Alerts / Deficiencies
          </Text>
          <View style={{backgroundColor: '#FFF3E0', borderRadius: 8, padding: 12, minHeight: 48, justifyContent: 'center'}}>
            {deficiencyLoading ? (
              <Text style={{color: '#D32F2F', fontSize: 14}}>Loading...</Text>
            ) : deficiencyError ? (
              <Text style={{color: '#D32F2F', fontSize: 14}}>{deficiencyError}</Text>
            ) : (
              <Text style={{color: '#D32F2F', fontSize: 14}}>{deficiency}</Text>
            )}
          </View>
        </View>

        {/* Personalized Recommendations */}
        <View style={{paddingHorizontal: 20, marginBottom: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginBottom: 8}}>
            Personalized Recommendations
          </Text>
          <View style={{backgroundColor: '#E3F2FD', borderRadius: 8, padding: 12, minHeight: 48, justifyContent: 'center'}}>
            {recommendationsLoading ? (
              <Text style={{color: '#1976D2', fontSize: 14}}>Loading...</Text>
            ) : recommendationsError ? (
              <Text style={{color: '#D32F2F', fontSize: 14}}>{recommendationsError}</Text>
            ) : Array.isArray(recommendations) ? (
              <View>
                {recommendations.map((rec, idx) => (
                  <View key={idx} style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4}}>
                    <Text style={{color: '#1976D2', fontSize: 16, marginRight: 6}}>{'•'}</Text>
                    <Text style={{color: '#1976D2', fontSize: 14, flex: 1}}>{rec}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{color: '#1976D2', fontSize: 14}}>{recommendations}</Text>
            )}
          </View>
        </View>

        {/* Meal Plan */}
        <View style={{paddingHorizontal: 20, marginBottom: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#388E3C', marginBottom: 8}}>
            Meal Plan
          </Text>
          <View style={{backgroundColor: '#E8F5E9', borderRadius: 8, padding: 12, minHeight: 48, justifyContent: 'center'}}>
            {mealPlanLoading ? (
              <Text style={{color: '#388E3C', fontSize: 14}}>Loading...</Text>
            ) : mealPlanError ? (
              <Text style={{color: '#D32F2F', fontSize: 14}}>{mealPlanError}</Text>
            ) : (
              <Text style={{color: '#388E3C', fontSize: 14}}>{mealPlan}</Text>
            )}
          </View>
        </View>

        {/* Nutrition Education */}
        <View style={{paddingHorizontal: 20, marginBottom: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#FBC02D', marginBottom: 8}}>
            Nutrition Education
          </Text>
          <View style={{backgroundColor: '#FFFDE7', borderRadius: 8, padding: 12, minHeight: 48, justifyContent: 'center'}}>
            {educationLoading ? (
              <Text style={{color: '#FBC02D', fontSize: 14}}>Loading...</Text>
            ) : educationError ? (
              <Text style={{color: '#D32F2F', fontSize: 14}}>{educationError}</Text>
            ) : (
              <Text style={{color: '#FBC02D', fontSize: 14}}>{education}</Text>
            )}
          </View>
        </View>

        {/* Food Alternatives */}
        <View style={{paddingHorizontal: 20, marginBottom: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#7B1FA2', marginBottom: 8}}>
            Food Alternatives
          </Text>
          <View style={{backgroundColor: '#F3E5F5', borderRadius: 8, padding: 12, minHeight: 48, justifyContent: 'center'}}>
            {alternativesLoading ? (
              <Text style={{color: '#7B1FA2', fontSize: 14}}>Loading...</Text>
            ) : alternativesError ? (
              <Text style={{color: '#D32F2F', fontSize: 14}}>{alternativesError}</Text>
            ) : (
              <Text style={{color: '#7B1FA2', fontSize: 14}}>{alternatives}</Text>
            )}
          </View>
        </View>

        {/* Meal Selection */}
        <View style={styles.mealSection}>
          <Text style={styles.sectionTitle}>Recommendations for {selectedMeal}</Text>
          <View style={styles.mealTabs}>
            {["Breakfast", "Lunch", "Dinner"].map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealTab,
                  selectedMeal === meal && styles.activeMealTab
                ]}
                onPress={() => router.setParams({ meal })}
              >
                <Text style={[
                  styles.mealTabText,
                  selectedMeal === meal && styles.activeMealTabText
                ]}>
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filipino Food Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Filipino Food Recommendations</Text>
          {Array.isArray(recommendations) && recommendations.map((food: any) => (
            <View key={food.id} style={styles.foodCard}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodDescription}>{food.description}</Text>
                <Text style={styles.foodCategory}>{food.category}</Text>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{formatValue(food.calories)}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{formatValue(food.protein)}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>{formatValue(food.carbs)}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fats</Text>
                    <Text style={styles.nutritionValue}>{formatValue(food.fats)}g</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddRecommendation(food)}
              >
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ))}
        </View>


        {/* Tracked Foods Today (from backend/storage) */}
        {todayLogs.length > 0 && (
          <View style={styles.trackedSection}>
            <Text style={styles.sectionTitle}>Tracked Today ({todayLogs.length} items)</Text>
            {todayLogs.map((log) => (
              <View key={log.id} style={styles.trackedItem}>
                <Text style={styles.trackedName}>{log.name}</Text>
                <Text style={styles.trackedCalories}>{formatValue(log.calories)} kcal</Text>
              </View>
            ))}
          </View>
        )}

        {/* Food Logs from backend/storage */}
        {foodLogs.length > 0 && (
          <View style={styles.trackedSection}>
            <Text style={styles.sectionTitle}>Food Logs (All Time)</Text>
            {foodLogs.map((log) => (
              <View key={log.id} style={styles.trackedItem}>
                <Text style={styles.trackedName}>{log.name}</Text>
                <Text style={styles.trackedCalories}>{formatValue(log.calories)} kcal</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>{log.date}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  macroBox: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 24,
  },
  dateSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  dailyResetText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  progressSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  progressSubText: {
    fontSize: 14,
    color: "#666",
  },
  progressLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  mealSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  mealTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mealTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  activeMealTab: {
    backgroundColor: "#4CAF50",
  },
  mealTabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeMealTabText: {
    color: "#fff",
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  foodCategory: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    padding: 8,
  },
  trackedSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trackedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackedName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  trackedCalories: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
