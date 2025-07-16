/**
 * WellNū Advanced Nutrient Tracking Service
 * Implements comprehensive micronutrient tracking as specified in Phase 2
 * Supports Filipino food database integration and nutrient density scoring
 */

export interface MicroNutrient {
  id: string;
  name: string;
  unit: string;
  dailyValue: number;
  category: 'vitamin' | 'mineral' | 'other';
}

export interface ComprehensiveNutrientData {
  // Macronutrients
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  
  // Vitamins
  vitaminA: number; // mcg RAE
  vitaminC: number; // mg
  vitaminD: number; // mcg
  vitaminE: number; // mg
  vitaminK: number; // mcg
  thiamine: number; // mg (B1)
  riboflavin: number; // mg (B2)
  niacin: number; // mg (B3)
  vitaminB6: number; // mg
  folate: number; // mcg
  vitaminB12: number; // mcg
  
  // Minerals
  calcium: number; // mg
  iron: number; // mg
  magnesium: number; // mg
  phosphorus: number; // mg
  potassium: number; // mg
  sodium: number; // mg
  zinc: number; // mg
  copper: number; // mg
  manganese: number; // mg
  selenium: number; // mcg
}

export interface NutrientDeficiency {
  nutrient: string;
  currentIntake: number;
  recommendedIntake: number;
  deficiencyLevel: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  recommendations: string[];
  filipinoFoodSources: string[];
}

export interface NutrientDensityScore {
  overall: number; // 0-100
  vitamins: number;
  minerals: number;
  macros: number;
  category: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface FilipinoFoodItem {
  id: string;
  name: string;
  localName: string;
  region: string;
  category: 'staple' | 'vegetable' | 'fruit' | 'protein' | 'snack' | 'beverage';
  nutrients: ComprehensiveNutrientData;
  servingSize: string;
  availability: 'common' | 'seasonal' | 'regional';
  culturalSignificance: string;
  preparationMethods: string[];
}

export class WellNuNutrientService {
  private static instance: WellNuNutrientService;
  
  // Filipino RDA values (based on FNRI guidelines)
  private static readonly FILIPINO_RDA: Record<string, { male: number; female: number; unit: string }> = {
    vitaminA: { male: 700, female: 600, unit: 'mcg RAE' },
    vitaminC: { male: 90, female: 75, unit: 'mg' },
    vitaminD: { male: 15, female: 15, unit: 'mcg' },
    calcium: { male: 1000, female: 1000, unit: 'mg' },
    iron: { male: 8, female: 18, unit: 'mg' },
    potassium: { male: 3500, female: 3500, unit: 'mg' },
    sodium: { male: 2300, female: 2300, unit: 'mg' },
    zinc: { male: 11, female: 8, unit: 'mg' },
    folate: { male: 400, female: 400, unit: 'mcg' },
    vitaminB12: { male: 2.4, female: 2.4, unit: 'mcg' },
  };

  // Filipino Food Database (Sample entries)
  private static readonly FILIPINO_FOODS: FilipinoFoodItem[] = [
    {
      id: 'fil_001',
      name: 'Adobong Manok',
      localName: 'Chicken Adobo',
      region: 'National',
      category: 'protein',
      servingSize: '150g (1 piece)',
      availability: 'common',
      culturalSignificance: 'National dish, comfort food',
      preparationMethods: ['stewed', 'braised'],
      nutrients: {
        calories: 340,
        protein: 28,
        carbs: 12,
        fats: 18,
        fiber: 1,
        sugar: 8,
        vitaminA: 45,
        vitaminC: 2,
        vitaminD: 0.2,
        vitaminE: 1.2,
        vitaminK: 8,
        thiamine: 0.08,
        riboflavin: 0.15,
        niacin: 8.5,
        vitaminB6: 0.4,
        folate: 12,
        vitaminB12: 0.8,
        calcium: 45,
        iron: 8,
        magnesium: 28,
        phosphorus: 220,
        potassium: 580,
        sodium: 380,
        zinc: 2.1,
        copper: 0.08,
        manganese: 0.02,
        selenium: 22
      }
    },
    {
      id: 'fil_002',
      name: 'Malunggay Leaves',
      localName: 'Dahon ng Malunggay',
      region: 'National',
      category: 'vegetable',
      servingSize: '50g (1/2 cup)',
      availability: 'common',
      culturalSignificance: 'Superfood, traditional medicine',
      preparationMethods: ['sautéed', 'soup', 'fresh'],
      nutrients: {
        calories: 32,
        protein: 4.8,
        carbs: 4.2,
        fats: 0.8,
        fiber: 3.2,
        sugar: 1.8,
        vitaminA: 378,
        vitaminC: 120,
        vitaminD: 0,
        vitaminE: 9.8,
        vitaminK: 108,
        thiamine: 0.21,
        riboflavin: 0.66,
        niacin: 2.22,
        vitaminB6: 1.2,
        folate: 40,
        vitaminB12: 0,
        calcium: 185,
        iron: 28.2,
        magnesium: 147,
        phosphorus: 112,
        potassium: 337,
        sodium: 9,
        zinc: 0.6,
        copper: 1.1,
        manganese: 0.36,
        selenium: 0.9
      }
    },
    {
      id: 'fil_003',
      name: 'Bangus',
      localName: 'Milkfish',
      region: 'National',
      category: 'protein',
      servingSize: '120g (1 fillet)',
      availability: 'common',
      culturalSignificance: 'National fish, staple protein',
      preparationMethods: ['grilled', 'fried', 'steamed', 'sinigang'],
      nutrients: {
        calories: 148,
        protein: 20.5,
        carbs: 0,
        fats: 6.9,
        fiber: 0,
        sugar: 0,
        vitaminA: 15,
        vitaminC: 0,
        vitaminD: 3.8,
        vitaminE: 0.87,
        vitaminK: 0.1,
        thiamine: 0.04,
        riboflavin: 0.05,
        niacin: 4.1,
        vitaminB6: 0.4,
        folate: 15,
        vitaminB12: 1.36,
        calcium: 51,
        iron: 0.8,
        magnesium: 22,
        phosphorus: 203,
        potassium: 417,
        sodium: 78,
        zinc: 0.4,
        copper: 0.04,
        manganese: 0.02,
        selenium: 36.5
      }
    }
  ];

  public static getInstance(): WellNuNutrientService {
    if (!WellNuNutrientService.instance) {
      WellNuNutrientService.instance = new WellNuNutrientService();
    }
    return WellNuNutrientService.instance;
  }

  /**
   * Calculate comprehensive nutrient analysis for a user's daily intake
   */
  public calculateDailyNutrientAnalysis(
    dailyLogs: any[],
    userProfile: { age: number; gender: 'male' | 'female'; weight: number; height: number }
  ): {
    totals: ComprehensiveNutrientData;
    deficiencies: NutrientDeficiency[];
    densityScore: NutrientDensityScore;
    recommendations: string[];
  } {
    // Calculate total nutrients from daily logs
    const totals = this.aggregateNutrients(dailyLogs);
    
    // Identify deficiencies based on Filipino RDA
    const deficiencies = this.identifyDeficiencies(totals, userProfile);
    
    // Calculate nutrient density score
    const densityScore = this.calculateNutrientDensity(totals);
    
    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(deficiencies, userProfile);

    return {
      totals,
      deficiencies,
      densityScore,
      recommendations
    };
  }

  /**
   * Get Filipino food recommendations based on nutrient deficiencies
   */
  public getFilipinoFoodRecommendations(deficiencies: NutrientDeficiency[]): FilipinoFoodItem[] {
    const recommendations: FilipinoFoodItem[] = [];
    
    deficiencies.forEach(deficiency => {
      const foodsRichInNutrient = WellNuNutrientService.FILIPINO_FOODS.filter(food => {
        const nutrientKey = deficiency.nutrient.toLowerCase().replace(/\s+/g, '');
        const nutrientValue = (food.nutrients as any)[nutrientKey] || 0;
        const rda = WellNuNutrientService.FILIPINO_RDA[nutrientKey];
        
        if (rda) {
          return nutrientValue >= (rda.male * 0.1); // At least 10% of RDA per serving
        }
        return false;
      });

      recommendations.push(...foodsRichInNutrient.slice(0, 3)); // Top 3 per deficiency
    });

    // Remove duplicates and return unique recommendations
    return recommendations.filter((food, index, self) => 
      index === self.findIndex(f => f.id === food.id)
    );
  }

  /**
   * Search Filipino foods by name or category
   */
  public searchFilipinoFoods(query: string, category?: string): FilipinoFoodItem[] {
    let results = WellNuNutrientService.FILIPINO_FOODS;

    if (category) {
      results = results.filter(food => food.category === category);
    }

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(food => 
        food.name.toLowerCase().includes(searchTerm) ||
        food.localName.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }

  /**
   * Calculate nutrient density score for foods
   */
  public calculateNutrientDensity(nutrients: ComprehensiveNutrientData): NutrientDensityScore {
    // Calculate scores based on nutrient density per calorie
    const vitaminScore = this.calculateVitaminScore(nutrients);
    const mineralScore = this.calculateMineralScore(nutrients);
    const macroScore = this.calculateMacroScore(nutrients);
    
    const overall = (vitaminScore + mineralScore + macroScore) / 3;
    
    let category: 'poor' | 'fair' | 'good' | 'excellent';
    if (overall >= 80) category = 'excellent';
    else if (overall >= 65) category = 'good';
    else if (overall >= 50) category = 'fair';
    else category = 'poor';

    return {
      overall: Math.round(overall),
      vitamins: Math.round(vitaminScore),
      minerals: Math.round(mineralScore),
      macros: Math.round(macroScore),
      category
    };
  }

  // Private helper methods
  private aggregateNutrients(dailyLogs: any[]): ComprehensiveNutrientData {
    return dailyLogs.reduce((acc, log) => {
      if (log.nutrientData) {
        acc.calories += parseFloat(log.nutrientData.calories) || 0;
        acc.protein += parseFloat(log.nutrientData.protein) || 0;
        acc.carbs += parseFloat(log.nutrientData.carbohydrates) || 0;
        acc.fats += parseFloat(log.nutrientData.fat) || 0;
        acc.fiber += parseFloat(log.nutrientData.fiber) || 0;
        acc.vitaminA += parseFloat(log.nutrientData.vitaminA) || 0;
        acc.vitaminC += parseFloat(log.nutrientData.vitaminC) || 0;
        acc.calcium += parseFloat(log.nutrientData.calcium) || 0;
        acc.iron += parseFloat(log.nutrientData.iron) || 0;
        acc.potassium += parseFloat(log.nutrientData.potassium) || 0;
        acc.sodium += parseFloat(log.nutrientData.sodium) || 0;
        // Add more nutrients as available in data
      }
      return acc;
    }, {
      calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0,
      vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
      thiamine: 0, riboflavin: 0, niacin: 0, vitaminB6: 0, folate: 0, vitaminB12: 0,
      calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, sodium: 0,
      zinc: 0, copper: 0, manganese: 0, selenium: 0
    });
  }

  private identifyDeficiencies(
    totals: ComprehensiveNutrientData,
    userProfile: { gender: 'male' | 'female' }
  ): NutrientDeficiency[] {
    const deficiencies: NutrientDeficiency[] = [];

    Object.entries(WellNuNutrientService.FILIPINO_RDA).forEach(([nutrient, rda]) => {
      const currentIntake = (totals as any)[nutrient] || 0;
      const recommendedIntake = rda[userProfile.gender];
      const percentage = (currentIntake / recommendedIntake) * 100;

      if (percentage < 70) {
        let deficiencyLevel: 'mild' | 'moderate' | 'severe';
        if (percentage < 30) deficiencyLevel = 'severe';
        else if (percentage < 50) deficiencyLevel = 'moderate';
        else deficiencyLevel = 'mild';

        deficiencies.push({
          nutrient,
          currentIntake,
          recommendedIntake,
          deficiencyLevel,
          symptoms: this.getDeficiencySymptoms(nutrient),
          recommendations: this.getDeficiencyRecommendations(nutrient),
          filipinoFoodSources: this.getFilipinoFoodSources(nutrient)
        });
      }
    });

    return deficiencies;
  }

  private calculateVitaminScore(nutrients: ComprehensiveNutrientData): number {
    const vitaminValues = [
      nutrients.vitaminA, nutrients.vitaminC, nutrients.vitaminD,
      nutrients.vitaminE, nutrients.vitaminK, nutrients.thiamine,
      nutrients.riboflavin, nutrients.niacin, nutrients.vitaminB6,
      nutrients.folate, nutrients.vitaminB12
    ];
    
    // Score based on variety and adequacy of vitamins
    const nonZeroVitamins = vitaminValues.filter(v => v > 0).length;
    return (nonZeroVitamins / vitaminValues.length) * 100;
  }

  private calculateMineralScore(nutrients: ComprehensiveNutrientData): number {
    const mineralValues = [
      nutrients.calcium, nutrients.iron, nutrients.magnesium,
      nutrients.phosphorus, nutrients.potassium, nutrients.sodium,
      nutrients.zinc, nutrients.copper, nutrients.manganese, nutrients.selenium
    ];
    
    const nonZeroMinerals = mineralValues.filter(v => v > 0).length;
    return (nonZeroMinerals / mineralValues.length) * 100;
  }

  private calculateMacroScore(nutrients: ComprehensiveNutrientData): number {
    // Score based on balanced macronutrient distribution
    const totalCals = nutrients.calories;
    if (totalCals === 0) return 0;

    const proteinCals = nutrients.protein * 4;
    const carbCals = nutrients.carbs * 4;
    const fatCals = nutrients.fats * 9;

    const proteinPercent = (proteinCals / totalCals) * 100;
    const carbPercent = (carbCals / totalCals) * 100;
    const fatPercent = (fatCals / totalCals) * 100;

    // Ideal ranges: Protein 15-25%, Carbs 45-65%, Fat 20-35%
    let score = 0;
    if (proteinPercent >= 15 && proteinPercent <= 25) score += 33;
    if (carbPercent >= 45 && carbPercent <= 65) score += 33;
    if (fatPercent >= 20 && fatPercent <= 35) score += 34;

    return score;
  }

  private generateRecommendations(
    deficiencies: NutrientDeficiency[],
    userProfile: { age: number; gender: 'male' | 'female' }
  ): string[] {
    const recommendations: string[] = [];

    deficiencies.forEach(deficiency => {
      recommendations.push(
        `Increase ${deficiency.nutrient} intake by eating ${deficiency.filipinoFoodSources.join(', ')}`
      );
    });

    return recommendations;
  }

  private getDeficiencySymptoms(nutrient: string): string[] {
    const symptomsMap: Record<string, string[]> = {
      vitaminA: ['Night blindness', 'Dry skin', 'Weak immunity'],
      vitaminC: ['Fatigue', 'Slow wound healing', 'Weak immunity'],
      iron: ['Fatigue', 'Weakness', 'Pale skin', 'Cold hands/feet'],
      calcium: ['Weak bones', 'Muscle cramps', 'Brittle nails'],
      vitaminD: ['Bone pain', 'Muscle weakness', 'Frequent infections']
    };
    return symptomsMap[nutrient] || ['Consult healthcare provider'];
  }

  private getDeficiencyRecommendations(nutrient: string): string[] {
    const recommendationsMap: Record<string, string[]> = {
      vitaminA: ['Eat colorful vegetables', 'Include liver in diet', 'Add malunggay to meals'],
      vitaminC: ['Eat citrus fruits', 'Include guava and papaya', 'Add tomatoes to dishes'],
      iron: ['Eat lean meat and fish', 'Include malunggay leaves', 'Pair with vitamin C foods'],
      calcium: ['Include dairy products', 'Eat small fish with bones', 'Add sesame seeds'],
      vitaminD: ['Get morning sunlight', 'Eat fatty fish', 'Consider supplements if needed']
    };
    return recommendationsMap[nutrient] || ['Consult nutritionist'];
  }

  private getFilipinoFoodSources(nutrient: string): string[] {
    const foodSourcesMap: Record<string, string[]> = {
      vitaminA: ['Malunggay', 'Kangkong', 'Kamote', 'Papaya'],
      vitaminC: ['Guava', 'Sinigang na bayabas', 'Kamatis', 'Calamansi'],
      iron: ['Dinuguan', 'Malunggay leaves', 'Dugo-dugo', 'Liver'],
      calcium: ['Dilis', 'Malunggay', 'Kesong puti', 'Gabi leaves'],
      vitaminD: ['Bangus', 'Galunggong', 'Tuyo', 'Sardinas']
    };
    return foodSourcesMap[nutrient] || ['Varied Filipino foods'];
  }
}

export default WellNuNutrientService;
