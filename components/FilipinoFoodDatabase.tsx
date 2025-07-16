/**
 * WellNū Filipino Food Database Integration Component
 * Provides comprehensive Filipino food search and nutrition data
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WellNuNutrientService, FilipinoFoodItem, ComprehensiveNutrientData } from '../services/WellNuNutrientService';

interface FilipinoFoodDatabaseProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FilipinoFoodItem) => void;
  userDeficiencies?: string[];
}

interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'all', name: 'All Foods', icon: '🍽️', color: '#4CAF50' },
  { id: 'staple', name: 'Staples', icon: '🍚', color: '#FF9800' },
  { id: 'vegetable', name: 'Vegetables', icon: '🥬', color: '#4CAF50' },
  { id: 'fruit', name: 'Fruits', icon: '🥭', color: '#FF5722' },
  { id: 'protein', name: 'Proteins', icon: '🐟', color: '#3F51B5' },
  { id: 'snack', name: 'Snacks', icon: '🍪', color: '#9C27B0' },
  { id: 'beverage', name: 'Beverages', icon: '🥤', color: '#00BCD4' }
];

const FilipinoFoodDatabase: React.FC<FilipinoFoodDatabaseProps> = ({
  visible,
  onClose,
  onSelectFood,
  userDeficiencies = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [foodItems, setFoodItems] = useState<FilipinoFoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FilipinoFoodItem | null>(null);
  const [showFoodDetails, setShowFoodDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const nutrientService = WellNuNutrientService.getInstance();

  useEffect(() => {
    if (visible) {
      loadFilipinoFoods();
    }
  }, [visible, selectedCategory, searchQuery]);

  const loadFilipinoFoods = async () => {
    setLoading(true);
    try {
      const foods = nutrientService.searchFilipinoFoods(
        searchQuery,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      
      // If user has deficiencies, prioritize foods that help with those
      if (userDeficiencies.length > 0) {
        const deficiencyObjects = userDeficiencies.map(nutrient => ({
          nutrient,
          currentIntake: 0,
          recommendedIntake: 100,
          deficiencyLevel: 'mild' as const,
          symptoms: [],
          recommendations: [],
          filipinoFoodSources: []
        }));
        
        const recommendedFoods = nutrientService.getFilipinoFoodRecommendations(deficiencyObjects);
        
        // Merge and prioritize recommended foods
        const prioritizedFoods = [
          ...recommendedFoods,
          ...foods.filter(food => !recommendedFoods.find(rec => rec.id === food.id))
        ];
        
        setFoodItems(prioritizedFoods);
      } else {
        setFoodItems(foods);
      }
    } catch (error) {
      console.error('Error loading Filipino foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodPress = (food: FilipinoFoodItem) => {
    setSelectedFood(food);
    setShowFoodDetails(true);
  };

  const handleSelectFood = () => {
    if (selectedFood) {
      onSelectFood(selectedFood);
      setShowFoodDetails(false);
      onClose();
    }
  };

  const getNutrientColor = (value: number, type: 'vitamin' | 'mineral' | 'macro'): string => {
    if (type === 'macro') {
      return '#4CAF50'; // Green for macros
    } else if (type === 'vitamin') {
      return '#FF9800'; // Orange for vitamins
    } else {
      return '#3F51B5'; // Blue for minerals
    }
  };

  const formatNutrientValue = (value: number, unit: string): string => {
    if (value < 1) {
      return `${(value * 1000).toFixed(0)}${unit === 'mg' ? 'mcg' : unit}`;
    }
    return `${value.toFixed(1)}${unit}`;
  };

  const renderFoodItem = ({ item }: { item: FilipinoFoodItem }) => {
    const isRecommended = userDeficiencies.length > 0 && 
      nutrientService.getFilipinoFoodRecommendations(
        userDeficiencies.map(n => ({ 
          nutrient: n, currentIntake: 0, recommendedIntake: 100, 
          deficiencyLevel: 'mild' as const, symptoms: [], recommendations: [], filipinoFoodSources: [] 
        }))
      ).some(rec => rec.id === item.id);

    return (
      <TouchableOpacity 
        style={[styles.foodItem, isRecommended && styles.recommendedFood]}
        onPress={() => handleFoodPress(item)}
      >
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={12} color="white" />
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}
        
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.localName}>{item.localName}</Text>
        </View>

        <View style={styles.foodMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={12} color="#666" />
            <Text style={styles.metaText}>{item.region}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.availabilityBadge, 
              { backgroundColor: item.availability === 'common' ? '#4CAF50' : '#FF9800' }
            ]}>
              {item.availability}
            </Text>
          </View>
        </View>

        <View style={styles.nutritionPreview}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.nutrients.calories}</Text>
            <Text style={styles.nutritionLabel}>cal</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.nutrients.protein.toFixed(1)}</Text>
            <Text style={styles.nutritionLabel}>protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.nutrients.vitaminC.toFixed(0)}</Text>
            <Text style={styles.nutritionLabel}>vit C</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.nutrients.iron.toFixed(1)}</Text>
            <Text style={styles.nutritionLabel}>iron</Text>
          </View>
        </View>

        <Text style={styles.servingSize}>Serving: {item.servingSize}</Text>
        
        {item.culturalSignificance && (
          <Text style={styles.culturalNote}>💡 {item.culturalSignificance}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFoodDetails = () => {
    if (!selectedFood) return null;

    const majorVitamins = [
      { name: 'Vitamin A', value: selectedFood.nutrients.vitaminA, unit: 'mcg' },
      { name: 'Vitamin C', value: selectedFood.nutrients.vitaminC, unit: 'mg' },
      { name: 'Vitamin D', value: selectedFood.nutrients.vitaminD, unit: 'mcg' },
      { name: 'Folate', value: selectedFood.nutrients.folate, unit: 'mcg' },
      { name: 'B12', value: selectedFood.nutrients.vitaminB12, unit: 'mcg' }
    ];

    const majorMinerals = [
      { name: 'Calcium', value: selectedFood.nutrients.calcium, unit: 'mg' },
      { name: 'Iron', value: selectedFood.nutrients.iron, unit: 'mg' },
      { name: 'Potassium', value: selectedFood.nutrients.potassium, unit: 'mg' },
      { name: 'Zinc', value: selectedFood.nutrients.zinc, unit: 'mg' },
      { name: 'Magnesium', value: selectedFood.nutrients.magnesium, unit: 'mg' }
    ];

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFoodDetails}
        onRequestClose={() => setShowFoodDetails(false)}
      >
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <TouchableOpacity onPress={() => setShowFoodDetails(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.detailsTitle}>Food Details</Text>
            <TouchableOpacity onPress={handleSelectFood} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsContent}>
            {/* Food Header */}
            <View style={styles.detailsFoodHeader}>
              <Text style={styles.detailsFoodName}>{selectedFood.name}</Text>
              <Text style={styles.detailsLocalName}>{selectedFood.localName}</Text>
              <Text style={styles.detailsServing}>Per {selectedFood.servingSize}</Text>
            </View>

            {/* Macronutrients */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{selectedFood.nutrients.calories}</Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{selectedFood.nutrients.protein.toFixed(1)}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{selectedFood.nutrients.carbs.toFixed(1)}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{selectedFood.nutrients.fats.toFixed(1)}g</Text>
                  <Text style={styles.macroLabel}>Fats</Text>
                </View>
              </View>
            </View>

            {/* Vitamins */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Key Vitamins</Text>
              <View style={styles.nutrientList}>
                {majorVitamins.filter(v => v.value > 0).map((vitamin, index) => (
                  <View key={index} style={styles.nutrientRow}>
                    <Text style={styles.nutrientName}>{vitamin.name}</Text>
                    <Text style={[styles.nutrientValue, { color: getNutrientColor(vitamin.value, 'vitamin') }]}>
                      {formatNutrientValue(vitamin.value, vitamin.unit)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Minerals */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Key Minerals</Text>
              <View style={styles.nutrientList}>
                {majorMinerals.filter(m => m.value > 0).map((mineral, index) => (
                  <View key={index} style={styles.nutrientRow}>
                    <Text style={styles.nutrientName}>{mineral.name}</Text>
                    <Text style={[styles.nutrientValue, { color: getNutrientColor(mineral.value, 'mineral') }]}>
                      {formatNutrientValue(mineral.value, mineral.unit)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Cultural Context */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Cultural Context</Text>
              <Text style={styles.culturalText}>{selectedFood.culturalSignificance}</Text>
              
              <Text style={styles.subSectionTitle}>Preparation Methods</Text>
              <View style={styles.preparationList}>
                {selectedFood.preparationMethods.map((method, index) => (
                  <Text key={index} style={styles.preparationItem}>• {method}</Text>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filipino Food Database</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Filipino foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
        >
          {FOOD_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                { backgroundColor: selectedCategory === category.id ? category.color : '#f5f5f5' }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category.id ? 'white' : '#333' }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        {userDeficiencies.length > 0 && (
          <View style={styles.deficiencyNote}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.deficiencyText}>
              Foods recommended for your nutrient needs are marked with a star
            </Text>
          </View>
        )}

        {/* Food List */}
        <FlatList
          data={foodItems}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          style={styles.foodList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading Filipino foods...' : 'No foods found for your search.'}
              </Text>
            </View>
          }
        />

        {renderFoodDetails()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deficiencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  deficiencyText: {
    fontSize: 12,
    color: '#F57C00',
    marginLeft: 8,
    flex: 1,
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  foodItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  recommendedFood: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  foodHeader: {
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  localName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  categoryBadge: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  availabilityBadge: {
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  nutritionPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  servingSize: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 4,
  },
  culturalNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Details Modal Styles
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsContent: {
    flex: 1,
    padding: 16,
  },
  detailsFoodHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailsFoodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailsLocalName: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  detailsServing: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  detailsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  nutrientList: {
    marginTop: 8,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutrientName: {
    fontSize: 14,
    color: '#333',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  culturalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  preparationList: {
    marginTop: 8,
  },
  preparationItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default FilipinoFoodDatabase;
