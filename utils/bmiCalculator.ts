// BMI Calculation and Categorization Utility

export interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  description: string;
  calorieGoals?: {
    maintain: number;
    loseWeight: number;
    gainWeight: number;
  };
  recommendations?: string[];
}

export interface CalorieCalculationParams {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: number; // 0 = Male, 1 = Female, 2 = Others (calculates as Male)
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

// Calculate BMI: weight (kg) / height (m)^2
export const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  const heightInMeters = height / 100; // Convert cm to meters
  return weight / (heightInMeters * heightInMeters);
};

// Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
// Gender: 0 = Male, 1 = Female, 2 = Others (calculates as Male)
export const calculateBMR = (weight: number, height: number, age: number, gender: number): number => {
  if (!weight || !height || !age) return 0;
  
  if (gender === 0 || gender === 2) { // Male or Others (calculates as Male)
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else { // Female
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

// Calculate Total Daily Energy Expenditure (TDEE)
export const calculateTDEE = (bmr: number, activityLevel: string = 'moderate'): number => {
  const activityMultipliers = {
    sedentary: 1.2,     // Little/no exercise
    light: 1.375,       // Light exercise 1-3 days/week
    moderate: 1.55,     // Moderate exercise 3-5 days/week
    active: 1.725,      // Hard exercise 6-7 days/week
    very_active: 1.9    // Very hard exercise, physical job
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
  return Math.round(bmr * multiplier);
};

// Get gender-specific BMI category with calorie recommendations
export const getBMICategory = (bmi: number, gender?: string | number, params?: CalorieCalculationParams): BMIResult => {
  if (bmi === 0) {
    return {
      bmi: 0,
      category: 'Not Available',
      categoryColor: '#999',
      description: 'Please add your weight and height',
      recommendations: ['Complete your profile to get personalized recommendations']
    };
  }

  let category: string;
  let categoryColor: string;
  let description: string;
  let recommendations: string[] = [];

  // Gender-specific BMI interpretations - handle both string and number gender
  let isMale: boolean;
  let isFemale: boolean;
  if (typeof gender === 'number') {
    isMale = gender === 0 || gender === 2; // 0 = Male, 2 = Others (calculates as Male)
    isFemale = gender === 1; // 1 = Female
  } else {
    isMale = gender?.toLowerCase() === 'male';
    isFemale = gender?.toLowerCase() === 'female';
  }

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = '#3498db'; // Blue
    description = isMale ? 'Below healthy weight for men' : isFemale ? 'Below healthy weight for women' : 'Below healthy weight range';
    recommendations = [
      isMale ? 'Focus on strength training and protein-rich foods' : 'Consider nutrient-dense, calorie-rich foods',
      'Consult healthcare provider if weight loss is unexplained',
      'Aim for gradual, healthy weight gain (0.5-1 lb/week)'
    ];
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal Weight';
    categoryColor = '#27ae60'; // Green
    description = isMale ? 'Healthy weight range for men' : isFemale ? 'Healthy weight range for women' : 'Healthy weight range';
    recommendations = [
      'Maintain current weight with balanced nutrition',
      isMale ? 'Continue strength training to maintain muscle mass' : 'Include calcium and iron-rich foods',
      'Focus on overall health and fitness goals'
    ];
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    categoryColor = '#f39c12'; // Orange
    description = isMale ? 'Above healthy weight for men' : isFemale ? 'Above healthy weight for women' : 'Above healthy weight range';
    recommendations = [
      'Aim for gradual weight loss (1-2 lbs/week)',
      isMale ? 'Combine cardio with strength training' : 'Focus on portion control and regular exercise',
      'Consider consulting a nutritionist for personalized plan'
    ];
  } else {
    category = 'Obese';
    categoryColor = '#e74c3c'; // Red
    description = isMale ? 'Significantly above healthy weight for men' : isFemale ? 'Significantly above healthy weight for women' : 'Significantly above healthy weight';
    recommendations = [
      'Consult healthcare provider for weight management plan',
      'Focus on sustainable lifestyle changes',
      'Consider professional nutrition and fitness guidance'
    ];
  }

  // Calculate calorie goals if parameters provided
  let calorieGoals;
  if (params && params.weight && params.height && params.age) {
    const bmr = calculateBMR(params.weight, params.height, params.age, params.gender);
    const tdee = calculateTDEE(bmr, params.activityLevel);
    
    calorieGoals = {
      maintain: tdee,
      loseWeight: Math.max(1200, tdee - 500), // Safe minimum calories
      gainWeight: tdee + 300 // Conservative surplus for healthy gain
    };
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    categoryColor,
    description,
    calorieGoals,
    recommendations
  };
};

// Get comprehensive BMI and calorie information
export const getBMIInfo = (gender?: string): string => {
  const genderText = gender ? ` (${gender})` : '';
  return `BMI Categories${genderText}:
• Underweight: < 18.5
• Normal Weight: 18.5 - 24.9
• Overweight: 25.0 - 29.9
• Obese: ≥ 30.0

Gender-Specific Considerations:
• Men: Higher muscle mass may affect BMI interpretation
• Women: Hormonal factors and body composition differences
• Both: Age, ethnicity, and fitness level also matter

BMI is a general indicator and may not account for muscle mass, bone density, and other factors.`;
};

// Get personalized calorie recommendations based on BMI and goals
export const getCalorieRecommendations = (params: CalorieCalculationParams, currentBMI: number) => {
  const bmr = calculateBMR(params.weight, params.height, params.age, params.gender);
  const tdee = calculateTDEE(bmr, params.activityLevel);
  
  const recommendations = {
    bmr,
    tdee,
    goals: {
      maintain: {
        calories: tdee,
        description: 'Maintain current weight',
        weeklyChange: '0 lbs'
      },
      loseWeight: {
        calories: Math.max(params.gender === 1 ? 1200 : 1500, tdee - 500), // 1 = Female
        description: 'Healthy weight loss',
        weeklyChange: '-1 lb'
      },
      gainWeight: {
        calories: tdee + 300,
        description: 'Healthy weight gain',
        weeklyChange: '+0.5 lb'
      }
    },
    bmiGuidance: getBMIBasedGuidance(currentBMI, params.gender)
  };

  return recommendations;
};

// Get BMI-based guidance for calorie goals
// Gender: 0 = Male, 1 = Female, 2 = Others (calculates as Male)
const getBMIBasedGuidance = (bmi: number, gender: number) => {
  if (bmi < 18.5) {
    return {
      primaryGoal: 'gainWeight',
      focus: (gender === 0 || gender === 2) ? 'Muscle building with adequate calories' : 'Healthy weight gain with nutrient density',
      calorieAdjustment: '+300-500 calories above maintenance'
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      primaryGoal: 'maintain',
      focus: (gender === 0 || gender === 2) ? 'Maintain muscle mass and strength' : 'Balanced nutrition for overall health',
      calorieAdjustment: 'At maintenance level'
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      primaryGoal: 'loseWeight',
      focus: (gender === 0 || gender === 2) ? 'Fat loss while preserving muscle' : 'Sustainable weight loss with balanced nutrition',
      calorieAdjustment: '-300-500 calories below maintenance'
    };
  } else {
    return {
      primaryGoal: 'loseWeight',
      focus: 'Significant lifestyle changes with professional guidance',
      calorieAdjustment: '-500-750 calories below maintenance (with medical supervision)'
    };
  }
};
