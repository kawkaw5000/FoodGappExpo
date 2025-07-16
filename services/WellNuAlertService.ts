/**
 * WellNū Real-time Alert System
 * Implements nutrient deficiency warnings, excess intake alerts, 
 * meal timing recommendations, and hydration reminders
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WellNuNutrientService, NutrientDeficiency, ComprehensiveNutrientData } from './WellNuNutrientService';

export interface NutrientAlert {
  id: string;
  type: 'deficiency' | 'excess' | 'timing' | 'hydration' | 'balance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  nutrient?: string;
  currentValue: number;
  targetValue: number;
  recommendations: string[];
  filipinoFoodSuggestions: string[];
  timestamp: Date;
  isRead: boolean;
  actionable: boolean;
  cultural_context?: string;
}

export interface MealTimingAlert {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recommendedTime: string;
  message: string;
  culturalNote: string;
}

export interface HydrationReminder {
  currentIntake: number; // in mL
  targetIntake: number; // in mL
  nextReminderTime: Date;
  message: string;
  weatherAdjustment: boolean;
}

export class WellNuAlertService {
  private static instance: WellNuAlertService;
  private alertQueue: NutrientAlert[] = [];
  private hydrationTimer: NodeJS.Timeout | null = null;
  
  // Filipino meal timing recommendations
  private static readonly FILIPINO_MEAL_TIMES = {
    breakfast: { time: '07:00', window: 2 }, // 6-8 AM
    lunch: { time: '12:00', window: 1 }, // 11 AM - 1 PM
    dinner: { time: '18:30', window: 1.5 }, // 6-7:30 PM
    merienda: { time: '15:00', window: 1 } // 3-4 PM
  };

  public static getInstance(): WellNuAlertService {
    if (!WellNuAlertService.instance) {
      WellNuAlertService.instance = new WellNuAlertService();
    }
    return WellNuAlertService.instance;
  }

  /**
   * Analyze daily nutrition and generate real-time alerts
   */
  public async generateRealTimeAlerts(
    dailyNutrition: ComprehensiveNutrientData,
    userProfile: { age: number; gender: 'male' | 'female'; weight: number; height: number; activity: string },
    lastMealTime?: Date,
    waterIntake?: number
  ): Promise<NutrientAlert[]> {
    const alerts: NutrientAlert[] = [];
    const nutrientService = WellNuNutrientService.getInstance();
    
    // Get comprehensive analysis
    const analysis = nutrientService.calculateDailyNutrientAnalysis([], userProfile);
    
    // Generate deficiency alerts
    const deficiencyAlerts = await this.generateDeficiencyAlerts(analysis.deficiencies);
    alerts.push(...deficiencyAlerts);
    
    // Generate excess intake alerts
    const excessAlerts = await this.generateExcessIntakeAlerts(dailyNutrition, userProfile);
    alerts.push(...excessAlerts);
    
    // Generate meal timing alerts
    if (lastMealTime) {
      const timingAlerts = await this.generateMealTimingAlerts(lastMealTime);
      alerts.push(...timingAlerts);
    }
    
    // Generate hydration alerts
    if (waterIntake !== undefined) {
      const hydrationAlerts = await this.generateHydrationAlerts(waterIntake, userProfile);
      alerts.push(...hydrationAlerts);
    }
    
    // Store alerts for persistence
    await this.storeAlerts(alerts);
    
    return this.prioritizeAlerts(alerts);
  }

  /**
   * Generate nutrient deficiency warnings with Filipino context
   */
  private async generateDeficiencyAlerts(deficiencies: NutrientDeficiency[]): Promise<NutrientAlert[]> {
    const alerts: NutrientAlert[] = [];
    
    for (const deficiency of deficiencies) {
      const alert: NutrientAlert = {
        id: `def_${deficiency.nutrient}_${Date.now()}`,
        type: 'deficiency',
        priority: this.mapDeficiencyToPriority(deficiency.deficiencyLevel),
        title: `${deficiency.nutrient} Deficiency Alert`,
        message: this.generateDeficiencyMessage(deficiency),
        nutrient: deficiency.nutrient,
        currentValue: deficiency.currentIntake,
        targetValue: deficiency.recommendedIntake,
        recommendations: deficiency.recommendations,
        filipinoFoodSuggestions: deficiency.filipinoFoodSources,
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        cultural_context: this.getCulturalContext(deficiency.nutrient)
      };
      
      alerts.push(alert);
    }
    
    return alerts;
  }

  /**
   * Generate excess intake alerts (e.g., sodium, sugar)
   */
  private async generateExcessIntakeAlerts(
    nutrition: ComprehensiveNutrientData,
    userProfile: { age: number; gender: 'male' | 'female' }
  ): Promise<NutrientAlert[]> {
    const alerts: NutrientAlert[] = [];
    
    // Sodium excess check
    if (nutrition.sodium > 2300) {
      alerts.push({
        id: `excess_sodium_${Date.now()}`,
        type: 'excess',
        priority: nutrition.sodium > 3000 ? 'high' : 'medium',
        title: 'High Sodium Intake Warning',
        message: `You've consumed ${Math.round(nutrition.sodium)}mg of sodium today. The recommended limit is 2,300mg.`,
        nutrient: 'sodium',
        currentValue: nutrition.sodium,
        targetValue: 2300,
        recommendations: [
          'Reduce processed foods',
          'Use herbs and spices instead of salt',
          'Choose fresh over canned foods'
        ],
        filipinoFoodSuggestions: [
          'Fresh fish instead of dried fish',
          'Homemade adobo with less soy sauce',
          'Fresh vegetables over pickled ones'
        ],
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        cultural_context: 'Many Filipino dishes are naturally high in sodium. Try using calamansi and herbs for flavor.'
      });
    }
    
    // Sugar excess check
    if (nutrition.sugar > 50) { // WHO recommendation: <50g/day
      alerts.push({
        id: `excess_sugar_${Date.now()}`,
        type: 'excess',
        priority: nutrition.sugar > 75 ? 'high' : 'medium',
        title: 'High Sugar Intake Alert',
        message: `Your sugar intake is ${Math.round(nutrition.sugar)}g today. Try to keep it under 50g.`,
        nutrient: 'sugar',
        currentValue: nutrition.sugar,
        targetValue: 50,
        recommendations: [
          'Choose water over sweetened drinks',
          'Limit desserts and sweet snacks',
          'Read food labels for hidden sugars'
        ],
        filipinoFoodSuggestions: [
          'Fresh fruits instead of fruit juices',
          'Unsweetened coffee or tea',
          'Natural sweeteners like honey (in moderation)'
        ],
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        cultural_context: 'Filipino cuisine often includes sweet elements. Balance with plenty of vegetables and protein.'
      });
    }
    
    return alerts;
  }

  /**
   * Generate meal timing recommendations based on Filipino eating patterns
   */
  private async generateMealTimingAlerts(lastMealTime: Date): Promise<NutrientAlert[]> {
    const alerts: NutrientAlert[] = [];
    const now = new Date();
    const hoursSinceLastMeal = (now.getTime() - lastMealTime.getTime()) / (1000 * 60 * 60);
    
    // Alert if too long since last meal
    if (hoursSinceLastMeal > 4) {
      alerts.push({
        id: `timing_meal_${Date.now()}`,
        type: 'timing',
        priority: hoursSinceLastMeal > 6 ? 'high' : 'medium',
        title: 'Meal Timing Reminder',
        message: `It's been ${Math.round(hoursSinceLastMeal)} hours since your last meal. Consider eating something nutritious.`,
        currentValue: hoursSinceLastMeal,
        targetValue: 4,
        recommendations: [
          'Have a balanced meal or healthy snack',
          'Include protein and complex carbs',
          'Stay hydrated'
        ],
        filipinoFoodSuggestions: [
          'Banana or kamote for quick energy',
          'Nuts or crackers with cheese',
          'Fresh fruit with yogurt'
        ],
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        cultural_context: 'Filipinos traditionally eat 3 main meals plus merienda. Don\'t skip meals to maintain energy.'
      });
    }
    
    // Check for optimal meal timing
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + (currentMinutes / 60);
    
    // Suggest merienda if appropriate time
    if (currentTime >= 14.5 && currentTime <= 16 && hoursSinceLastMeal > 2) {
      alerts.push({
        id: `timing_merienda_${Date.now()}`,
        type: 'timing',
        priority: 'low',
        title: 'Merienda Time!',
        message: 'It\'s merienda time! Having a light snack can help maintain your energy levels.',
        currentValue: currentTime,
        targetValue: 15,
        recommendations: [
          'Keep portions moderate',
          'Choose nutritious options',
          'Balance with dinner planning'
        ],
        filipinoFoodSuggestions: [
          'Turon with banana',
          'Biko or kakanin',
          'Fresh fruit shake',
          'Crackers with palaman'
        ],
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        cultural_context: 'Merienda is an important Filipino tradition that helps bridge the gap between lunch and dinner.'
      });
    }
    
    return alerts;
  }

  /**
   * Generate hydration reminders with climate considerations
   */
  private async generateHydrationAlerts(
    currentIntake: number,
    userProfile: { weight: number; height: number; activity: string }
  ): Promise<NutrientAlert[]> {
    const alerts: NutrientAlert[] = [];
    
    // Calculate recommended water intake (mL)
    const baseIntake = userProfile.weight * 35; // 35ml per kg
    const activityMultiplier = userProfile.activity === 'active' ? 1.3 : 1.0;
    const climateMultiplier = 1.2; // Philippines tropical climate
    const recommendedIntake = Math.round(baseIntake * activityMultiplier * climateMultiplier);
    
    const intakePercentage = (currentIntake / recommendedIntake) * 100;
    
    if (intakePercentage < 50) {
      alerts.push({
        id: `hydration_low_${Date.now()}`,
        type: 'hydration',
        priority: intakePercentage < 30 ? 'high' : 'medium',
        title: 'Hydration Alert',
        message: `You've only had ${currentIntake}ml of water today. Aim for ${recommendedIntake}ml, especially in our tropical climate.`,
        currentValue: currentIntake,
        targetValue: recommendedIntake,
        recommendations: [
          'Drink water regularly throughout the day',
          'Increase intake during hot weather',
          'Monitor urine color as a hydration indicator'
        ],
        filipinoFoodSuggestions: [
          'Fresh buko juice',
          'Watermelon and other juicy fruits',
          'Cucumber and leafy vegetables',
          'Herbal teas like salabat'
        ],
        timestamp: new Date(),
        isRead: false,
        actionable: true,
        cultural_context: 'The Philippine tropical climate increases water needs. Traditional drinks like buko juice are excellent for hydration.'
      });
    }
    
    return alerts;
  }

  /**
   * Prioritize alerts based on health impact and urgency
   */
  private prioritizeAlerts(alerts: NutrientAlert[]): NutrientAlert[] {
    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Store alerts in AsyncStorage for persistence
   */
  private async storeAlerts(alerts: NutrientAlert[]): Promise<void> {
    try {
      const existingAlertsJson = await AsyncStorage.getItem('wellnu_alerts');
      const existingAlerts: NutrientAlert[] = existingAlertsJson ? JSON.parse(existingAlertsJson) : [];
      
      // Merge new alerts with existing ones (avoid duplicates)
      const allAlerts = [...existingAlerts, ...alerts];
      const uniqueAlerts = allAlerts.filter((alert, index, self) => 
        index === self.findIndex(a => a.id === alert.id)
      );
      
      // Keep only alerts from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentAlerts = uniqueAlerts.filter(alert => 
        new Date(alert.timestamp) > sevenDaysAgo
      );
      
      await AsyncStorage.setItem('wellnu_alerts', JSON.stringify(recentAlerts));
    } catch (error) {
      console.error('Error storing alerts:', error);
    }
  }

  /**
   * Get stored alerts for display
   */
  public async getStoredAlerts(): Promise<NutrientAlert[]> {
    try {
      const alertsJson = await AsyncStorage.getItem('wellnu_alerts');
      return alertsJson ? JSON.parse(alertsJson) : [];
    } catch (error) {
      console.error('Error retrieving alerts:', error);
      return [];
    }
  }

  /**
   * Mark alert as read
   */
  public async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const alerts = await this.getStoredAlerts();
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      );
      await AsyncStorage.setItem('wellnu_alerts', JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  /**
   * Setup hydration reminders throughout the day
   */
  public setupHydrationReminders(targetIntake: number): void {
    if (this.hydrationTimer) {
      clearInterval(this.hydrationTimer);
    }
    
    // Remind every 2 hours during waking hours (6 AM - 10 PM)
    this.hydrationTimer = setInterval(async () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 6 && hour <= 22) {
        const currentIntake = await this.getCurrentHydrationLevel();
        if (currentIntake < targetIntake * (hour - 6) / 16) { // Expected progress based on time
          // Generate hydration reminder
          console.log('Hydration reminder triggered');
        }
      }
    }, 2 * 60 * 60 * 1000); // 2 hours
  }

  // Helper methods
  private mapDeficiencyToPriority(level: 'mild' | 'moderate' | 'severe'): 'low' | 'medium' | 'high' | 'critical' {
    switch (level) {
      case 'severe': return 'critical';
      case 'moderate': return 'high';
      case 'mild': return 'medium';
      default: return 'low';
    }
  }

  private generateDeficiencyMessage(deficiency: NutrientDeficiency): string {
    const percentage = Math.round((deficiency.currentIntake / deficiency.recommendedIntake) * 100);
    return `Your ${deficiency.nutrient} intake is ${percentage}% of the recommended daily amount. ` +
           `Consider adding ${deficiency.filipinoFoodSources.slice(0, 2).join(' or ')} to your diet.`;
  }

  private getCulturalContext(nutrient: string): string {
    const contexts: Record<string, string> = {
      iron: 'Iron deficiency is common in the Philippines. Traditional dishes like dinuguan and malunggay can help.',
      vitaminA: 'Colorful Filipino vegetables like malunggay and kamote are excellent sources of Vitamin A.',
      vitaminC: 'The Philippines has abundant Vitamin C sources like guava, calamansi, and papaya.',
      calcium: 'Small fish eaten with bones (like dilis) are traditional Filipino calcium sources.'
    };
    return contexts[nutrient] || 'Consult with a healthcare provider for personalized advice.';
  }

  private async getCurrentHydrationLevel(): Promise<number> {
    try {
      const hydrationData = await AsyncStorage.getItem('daily_hydration');
      return hydrationData ? parseInt(hydrationData) : 0;
    } catch (error) {
      return 0;
    }
  }
}

export default WellNuAlertService;
