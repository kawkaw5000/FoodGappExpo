import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FoodRecommendation {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  tags: string[];
  description: string;
  culturalContext?: string;
  healthBenefits: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number; // in minutes
  ingredients: string[];
  instructions?: string[];
  imageUrl?: string;
  reasonForRecommendation: string;
  score: number; // 0-100 based on user preferences and goals
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedFoods: string[];
  calorieGoal: number;
  proteinGoal: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthGoals: string[];
}

interface SmartFoodRecommendationSystemProps {
  visible: boolean;
  onClose: () => void;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all';
  userPreferences?: UserPreferences;
}

const SmartFoodRecommendationSystem: React.FC<SmartFoodRecommendationSystemProps> = ({
  visible,
  onClose,
  category = 'all',
  userPreferences
}) => {
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [selectedRecommendation, setSelectedRecommendation] = useState<FoodRecommendation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      generateRecommendations();
    }
  }, [visible, selectedCategory]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // In a real app, this would call your AI recommendation service
      const mockRecommendations = await getMockRecommendations(selectedCategory);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockRecommendations = async (category: string): Promise<FoodRecommendation[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const filipinoRecommendations: FoodRecommendation[] = [
      {
        id: '1',
        name: 'Chicken Adobo Bowl',
        category: 'lunch',
        calories: 420,
        protein: 35,
        carbs: 25,
        fats: 22,
        fiber: 3,
        tags: ['filipino', 'protein-rich', 'comfort-food'],
        description: 'Traditional Filipino chicken adobo served with brown rice',
        culturalContext: 'A beloved Filipino comfort food with Spanish influences',
        healthBenefits: ['High protein content', 'Rich in vitamin B6', 'Good source of niacin'],
        difficulty: 'medium',
        prepTime: 45,
        ingredients: ['Chicken thighs', 'Soy sauce', 'Vinegar', 'Garlic', 'Bay leaves', 'Brown rice'],
        reasonForRecommendation: 'Matches your preference for Filipino cuisine and protein goals',
        score: 92
      },
      {
        id: '2',
        name: 'Bangus Sisig Salad',
        category: 'dinner',
        calories: 320,
        protein: 28,
        carbs: 15,
        fats: 18,
        fiber: 5,
        tags: ['filipino', 'seafood', 'low-carb', 'fresh'],
        description: 'Grilled bangus with mixed greens and native vegetables',
        culturalContext: 'Modern take on classic Filipino sisig with health-conscious twist',
        healthBenefits: ['Omega-3 fatty acids', 'High protein', 'Rich in vitamins A and C'],
        difficulty: 'easy',
        prepTime: 25,
        ingredients: ['Bangus fillet', 'Mixed greens', 'Tomatoes', 'Onions', 'Calamansi'],
        reasonForRecommendation: 'Perfect for your weight loss goals while maintaining Filipino flavors',
        score: 88
      },
      {
        id: '3',
        name: 'Quinoa Sinangag',
        category: 'breakfast',
        calories: 280,
        protein: 12,
        carbs: 45,
        fats: 8,
        fiber: 6,
        tags: ['healthy', 'fusion', 'high-fiber', 'energizing'],
        description: 'Filipino garlic fried rice made with quinoa for extra nutrition',
        culturalContext: 'Fusion of Filipino breakfast tradition with modern superfoods',
        healthBenefits: ['Complete protein', 'High fiber', 'Gluten-free', 'Rich in iron'],
        difficulty: 'easy',
        prepTime: 15,
        ingredients: ['Quinoa', 'Garlic', 'Eggs', 'Green onions', 'Soy sauce'],
        reasonForRecommendation: 'Great breakfast option that supports your fitness goals',
        score: 85
      },
      {
        id: '4',
        name: 'Fresh Lumpia Wraps',
        category: 'snack',
        calories: 180,
        protein: 8,
        carbs: 22,
        fats: 7,
        fiber: 4,
        tags: ['fresh', 'vegetable-rich', 'light', 'filipino'],
        description: 'Fresh spring rolls with local vegetables and lean protein',
        culturalContext: 'Traditional Filipino fresh rolls perfect for healthy snacking',
        healthBenefits: ['High vegetable content', 'Low calories', 'Rich in vitamins'],
        difficulty: 'easy',
        prepTime: 20,
        ingredients: ['Lettuce', 'Carrots', 'Bean sprouts', 'Tofu', 'Lumpia wrapper'],
        reasonForRecommendation: 'Light, nutritious snack that fits your calorie goals',
        score: 82
      }
    ];

    if (category === 'all') {
      return filipinoRecommendations;
    }

    return filipinoRecommendations.filter(rec => rec.category === category);
  };

  const handleRecommendationPress = (recommendation: FoodRecommendation) => {
    setSelectedRecommendation(recommendation);
    setShowDetailModal(true);
  };

  const handleAddToMealPlan = async (recommendation: FoodRecommendation) => {
    try {
      // In a real app, this would add to the user's meal plan
      Alert.alert(
        'Added to Meal Plan',
        `${recommendation.name} has been added to your meal plan!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding to meal plan:', error);
    }
  };

  const categories = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'breakfast', label: 'Breakfast', icon: 'sunny' },
    { key: 'lunch', label: 'Lunch', icon: 'restaurant' },
    { key: 'dinner', label: 'Dinner', icon: 'moon' },
    { key: 'snack', label: 'Snacks', icon: 'fast-food' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Smart Food Recommendations</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryTab,
                selectedCategory === cat.key && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={20} 
                color={selectedCategory === cat.key ? 'white' : '#666'} 
              />
              <Text style={[
                styles.categoryTabText,
                selectedCategory === cat.key && styles.activeCategoryTabText
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommendations List */}
        <ScrollView style={styles.recommendationsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Generating personalized recommendations...</Text>
            </View>
          ) : recommendations.length > 0 ? (
            recommendations.map((recommendation) => (
              <TouchableOpacity
                key={recommendation.id}
                style={styles.recommendationCard}
                onPress={() => handleRecommendationPress(recommendation)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{recommendation.name}</Text>
                    <View style={styles.scoreContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.scoreText}>{recommendation.score}%</Text>
                    </View>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(recommendation.difficulty) }]}>
                    <Text style={styles.difficultyText}>{recommendation.difficulty}</Text>
                  </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                  {recommendation.description}
                </Text>

                <View style={styles.nutritionInfo}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recommendation.calories}</Text>
                    <Text style={styles.nutritionLabel}>cal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recommendation.protein}g</Text>
                    <Text style={styles.nutritionLabel}>protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recommendation.prepTime}min</Text>
                    <Text style={styles.nutritionLabel}>prep</Text>
                  </View>
                </View>

                <View style={styles.tagContainer}>
                  {recommendation.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.reasonText}>
                  💡 {recommendation.reasonForRecommendation}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant" size={64} color="#DDD" />
              <Text style={styles.emptyStateTitle}>No recommendations found</Text>
              <Text style={styles.emptyStateMessage}>
                Try adjusting your category filter or updating your preferences
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Detail Modal */}
        <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet">
          {selectedRecommendation && (
            <View style={styles.detailContainer}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{selectedRecommendation.name}</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailContent}>
                <Text style={styles.detailDescription}>{selectedRecommendation.description}</Text>
                
                {selectedRecommendation.culturalContext && (
                  <View style={styles.culturalSection}>
                    <Text style={styles.sectionTitle}>🇵🇭 Cultural Context</Text>
                    <Text style={styles.sectionText}>{selectedRecommendation.culturalContext}</Text>
                  </View>
                )}

                <View style={styles.nutritionSection}>
                  <Text style={styles.sectionTitle}>📊 Nutrition Facts</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionDetailItem}>
                      <Text style={styles.nutritionDetailValue}>{selectedRecommendation.calories}</Text>
                      <Text style={styles.nutritionDetailLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionDetailItem}>
                      <Text style={styles.nutritionDetailValue}>{selectedRecommendation.protein}g</Text>
                      <Text style={styles.nutritionDetailLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionDetailItem}>
                      <Text style={styles.nutritionDetailValue}>{selectedRecommendation.carbs}g</Text>
                      <Text style={styles.nutritionDetailLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionDetailItem}>
                      <Text style={styles.nutritionDetailValue}>{selectedRecommendation.fats}g</Text>
                      <Text style={styles.nutritionDetailLabel}>Fats</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.healthSection}>
                  <Text style={styles.sectionTitle}>💚 Health Benefits</Text>
                  {selectedRecommendation.healthBenefits.map((benefit, index) => (
                    <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                  ))}
                </View>

                <View style={styles.ingredientsSection}>
                  <Text style={styles.sectionTitle}>🛒 Ingredients</Text>
                  {selectedRecommendation.ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.detailActions}>
                <TouchableOpacity 
                  style={styles.addToMealPlanButton}
                  onPress={() => handleAddToMealPlan(selectedRecommendation)}
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.addToMealPlanText}>Add to Meal Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  closeButton: {
    padding: 4,
  },
  
  categoryContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  
  activeCategoryTab: {
    backgroundColor: '#4CAF50',
  },
  
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  
  activeCategoryTabText: {
    color: 'white',
  },
  
  recommendationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 2,
  },
  
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  
  nutritionItem: {
    alignItems: 'center',
  },
  
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  
  tag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  
  tagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  
  reasonText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB000',
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyStateMessage: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  
  // Detail Modal Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  
  detailContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  detailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  
  culturalSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  nutritionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  nutritionDetailItem: {
    alignItems: 'center',
  },
  
  nutritionDetailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  
  nutritionDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  healthSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  benefitItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  
  ingredientsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  ingredientItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  
  detailActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  
  addToMealPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
  },
  
  addToMealPlanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SmartFoodRecommendationSystem;
