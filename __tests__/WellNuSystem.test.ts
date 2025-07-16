/**
 * WellNū Testing Framework
 * Comprehensive unit tests for all WellNū components and services
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserExperienceService from '../services/UserExperienceService';
import { WellNuNutrientService, ComprehensiveNutrientData, NutrientDeficiency } from '../services/WellNuNutrientService';
import { WellNuAlertService } from '../services/WellNuAlertService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Type-safe mocks
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('WellNū Local Leveling System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserExperienceService', () => {
    it('should create new user experience for first-time user', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const userExp = await UserExperienceService.getUserExperience();
      
      expect(userExp.deviceId).toBe('local_device');
      expect(userExp.level).toBe(1);
      expect(userExp.totalXP).toBe(0);
      expect(userExp.unlockedAchievements.length).toBe(0);
      expect(userExp.stats.totalFoodsLogged).toBe(0);
    });

    it('should process daily login and award XP', async () => {
      const mockUserExp = {
        deviceId: 'local_device',
        level: 1,
        totalXP: 0,
        dailyLogin: {
          lastLoginDate: '',
          consecutiveDays: 0,
          totalLogins: 0,
          hasLoggedInToday: false,
        },
        achievements: [],
        unlockedAchievements: [],
        stats: {
          totalFoodsLogged: 0,
          totalScans: 0,
          totalDaysActive: 0,
          streakRecord: 0,
          favoriteFoods: [],
          nutritionGoalsAchieved: 0,
          exerciseSessionsLogged: 0,
          socialSharesCount: 0,
        },
        createdDate: new Date(),
        lastActiveDate: new Date(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserExp));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await UserExperienceService.processDailyLogin();
      
      expect(result.xpGained).toBe(500); // Daily login XP
      expect(result.consecutiveDays).toBe(1);
      expect(result.leveledUp).toBe(false); // Still level 1
    });

    it('should unlock achievements based on actions', async () => {
      const mockUserExp = {
        deviceId: 'local_device',
        level: 1,
        totalXP: 50,
        achievements: [],
        unlockedAchievements: [],
        stats: {
          totalFoodsLogged: 1, // Triggers "First Steps" achievement
          totalScans: 0,
          totalDaysActive: 0,
          streakRecord: 0,
          favoriteFoods: [],
          nutritionGoalsAchieved: 0,
          exerciseSessionsLogged: 0,
          socialSharesCount: 0,
        },
        dailyLogin: { consecutiveDays: 0 },
        createdDate: new Date(),
        lastActiveDate: new Date(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserExp));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await UserExperienceService.addXP(undefined, 50, 'FOOD_LOG');
      
      expect(result.achievementUnlocked).toBeDefined();
      expect(result.achievementUnlocked?.id).toBe('first_steps');
      expect(result.xpGained).toBe(50);
    });

    it('should calculate level progression correctly', () => {
      expect(UserExperienceService.calculateLevel(0)).toBe(1);
      expect(UserExperienceService.calculateLevel(1000)).toBe(2);
      expect(UserExperienceService.calculateLevel(2500)).toBe(3);
      expect(UserExperienceService.calculateLevel(100000)).toBe(20); // Max level
    });

    it('should update user statistics correctly', async () => {
      const mockUserExp = {
        deviceId: 'local_device',
        stats: {
          totalFoodsLogged: 0,
          totalScans: 5,
          favoriteFoods: [],
        },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserExp));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await UserExperienceService.updateUserStats(undefined, 'FOOD_LOG', { foodName: 'Adobo' });
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      // Verify stats were updated in the saved data
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData.stats.totalFoodsLogged).toBe(1);
      expect(savedData.stats.favoriteFoods).toContain('Adobo');
    });
  });

  describe('WellNuNutrientService', () => {
    it('should calculate nutrient deficiencies correctly', () => {
      const service = WellNuNutrientService.getInstance();
      const mockFoodLogs = [
        {
          food: 'Rice',
          calories: 200,
          protein: 4,
          carbs: 45,
          fat: 0.5,
          iron: 1, // Low iron
          vitaminC: 0, // No vitamin C
        }
      ];

      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165 };
      const analysis = service.calculateDailyNutrientAnalysis(mockFoodLogs, userProfile);
      
      expect(analysis.deficiencies.length).toBeGreaterThan(0);
      expect(analysis.deficiencies.some(d => d.nutrient === 'iron')).toBe(true);
      expect(analysis.deficiencies.some(d => d.nutrient === 'vitaminC')).toBe(true);
    });

    it('should provide Filipino food recommendations for deficiencies', () => {
      const service = WellNuNutrientService.getInstance();
      const mockDeficiencies: NutrientDeficiency[] = [{
        nutrient: 'iron',
        currentIntake: 5,
        recommendedIntake: 18,
        deficiencyLevel: 'moderate',
        symptoms: ['fatigue'],
        recommendations: ['eat iron-rich foods'],
        filipinoFoodSources: ['malunggay']
      }];
      
      const recommendations = service.getFilipinoFoodRecommendations(mockDeficiencies);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(food => food.name.toLowerCase().includes('malunggay'))).toBe(true);
    });

    it('should calculate comprehensive nutrient analysis', () => {
      const service = WellNuNutrientService.getInstance();
      const mockFoodLogs = [{
        food: 'Sample Food',
        calories: 1800,
        protein: 60,
        carbs: 200,
        fat: 60,
        iron: 10,
        vitaminC: 50,
        calcium: 800,
        vitaminA: 600,
        fiber: 20,
        sodium: 2000,
        sugar: 30,
      }];

      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165 };
      const analysis = service.calculateDailyNutrientAnalysis(mockFoodLogs, userProfile);
      
      expect(analysis.deficiencies).toBeDefined();
      expect(Array.isArray(analysis.deficiencies)).toBe(true);
    });
  });

  describe('WellNuAlertService', () => {
    it('should generate deficiency alerts correctly', async () => {
      const service = WellNuAlertService.getInstance();
      const mockNutrition: ComprehensiveNutrientData = {
        calories: 1200,
        protein: 30,
        carbs: 150,
        fats: 40,
        fiber: 15,
        sugar: 80,
        vitaminA: 400,
        vitaminC: 10,
        vitaminD: 5,
        vitaminE: 8,
        vitaminK: 50,
        thiamine: 0.8,
        riboflavin: 0.9,
        niacin: 12,
        vitaminB6: 1.0,
        folate: 200,
        vitaminB12: 1.5,
        calcium: 600,
        iron: 5,
        magnesium: 200,
        phosphorus: 500,
        potassium: 2000,
        sodium: 3000,
        zinc: 6,
        copper: 0.5,
        manganese: 1.2,
        selenium: 30
      };

      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165, activity: 'moderate' };
      const alerts = await service.generateRealTimeAlerts(mockNutrition, userProfile);
      
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.type === 'excess' && alert.nutrient === 'sodium')).toBe(true);
      expect(alerts.some(alert => alert.priority === 'high')).toBe(true);
    });

    it('should provide Filipino cultural context in alerts', async () => {
      const service = WellNuAlertService.getInstance();
      const mockNutrition: ComprehensiveNutrientData = {
        calories: 2000,
        protein: 60,
        carbs: 250,
        fats: 70,
        fiber: 25,
        sugar: 50,
        vitaminA: 700,
        vitaminC: 75,
        vitaminD: 15,
        vitaminE: 15,
        vitaminK: 90,
        thiamine: 1.2,
        riboflavin: 1.3,
        niacin: 16,
        vitaminB6: 1.3,
        folate: 400,
        vitaminB12: 2.4,
        calcium: 1000,
        iron: 18,
        magnesium: 320,
        phosphorus: 700,
        potassium: 3500,
        sodium: 3000, // High sodium
        zinc: 8,
        copper: 0.9,
        manganese: 1.8,
        selenium: 55
      };

      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165, activity: 'moderate' };
      const alerts = await service.generateRealTimeAlerts(mockNutrition, userProfile);
      
      const sodiumAlert = alerts.find(alert => alert.nutrient === 'sodium');
      expect(sodiumAlert?.cultural_context).toContain('Filipino');
      expect(sodiumAlert?.filipinoFoodSuggestions.length).toBeGreaterThan(0);
    });

    it('should generate meal timing alerts', async () => {
      const service = WellNuAlertService.getInstance();
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      const mockNutrition: ComprehensiveNutrientData = {
        calories: 500,
        protein: 20,
        carbs: 60,
        fats: 15,
        fiber: 8,
        sugar: 10,
        vitaminA: 200,
        vitaminC: 30,
        vitaminD: 5,
        vitaminE: 5,
        vitaminK: 30,
        thiamine: 0.4,
        riboflavin: 0.4,
        niacin: 5,
        vitaminB6: 0.5,
        folate: 100,
        vitaminB12: 0.8,
        calcium: 300,
        iron: 6,
        magnesium: 100,
        phosphorus: 200,
        potassium: 1000,
        sodium: 800,
        zinc: 3,
        copper: 0.3,
        manganese: 0.6,
        selenium: 20
      };
      
      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165, activity: 'moderate' };
      
      const alerts = await service.generateRealTimeAlerts(mockNutrition, userProfile, sixHoursAgo);
      
      expect(alerts.some(alert => alert.type === 'timing')).toBe(true);
      expect(alerts.some(alert => alert.priority === 'high')).toBe(true); // 6+ hours since last meal
    });

    it('should generate hydration alerts with climate considerations', async () => {
      const service = WellNuAlertService.getInstance();
      const mockNutrition: ComprehensiveNutrientData = {
        calories: 2000,
        protein: 80,
        carbs: 250,
        fats: 70,
        fiber: 25,
        sugar: 40,
        vitaminA: 700,
        vitaminC: 90,
        vitaminD: 15,
        vitaminE: 15,
        vitaminK: 90,
        thiamine: 1.2,
        riboflavin: 1.3,
        niacin: 16,
        vitaminB6: 1.3,
        folate: 400,
        vitaminB12: 2.4,
        calcium: 1000,
        iron: 18,
        magnesium: 320,
        phosphorus: 700,
        potassium: 3500,
        sodium: 2300,
        zinc: 8,
        copper: 0.9,
        manganese: 1.8,
        selenium: 55
      };
      
      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165, activity: 'active' };
      
      const alerts = await service.generateRealTimeAlerts(mockNutrition, userProfile, undefined, 500); // Very low water intake
      
      const hydrationAlert = alerts.find(alert => alert.type === 'hydration');
      expect(hydrationAlert).toBeDefined();
      expect(hydrationAlert?.cultural_context).toContain('tropical');
      expect(hydrationAlert?.filipinoFoodSuggestions).toContain('Fresh buko juice');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full user journey with XP and achievements', async () => {
      // Mock fresh user
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      // 1. New user registration
      const userExp = await UserExperienceService.getUserExperience();
      expect(userExp.level).toBe(1);

      // 2. Daily login
      const loginResult = await UserExperienceService.processDailyLogin();
      expect(loginResult.xpGained).toBe(500);

      // 3. Food logging (triggers achievement)
      await UserExperienceService.updateUserStats(undefined, 'FOOD_LOG', { foodName: 'Adobo' });
      const addXPResult = await UserExperienceService.addXP(undefined, 50, 'FOOD_LOG');
      expect(addXPResult.achievementUnlocked?.id).toBe('first_steps');

      // 4. Scanning foods
      for (let i = 0; i < 10; i++) {
        await UserExperienceService.updateUserStats(undefined, 'SCAN');
        await UserExperienceService.addXP(undefined, 75, 'SCAN');
      }

      // Should trigger scanner_pro achievement
      const finalUserExp = await UserExperienceService.getUserExperience();
      expect(finalUserExp.stats.totalScans).toBe(10);
    });

    it('should maintain data persistence across app sessions', async () => {
      const mockUserData = {
        deviceId: 'local_device',
        level: 5,
        totalXP: 7500,
        achievements: ['first_steps', 'scanner_pro'],
        stats: { totalFoodsLogged: 50, totalScans: 25 },
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserData));

      const userExp = await UserExperienceService.getUserExperience();
      expect(userExp.level).toBe(5);
      expect(userExp.totalXP).toBe(7500);
      expect(userExp.achievements).toContain('first_steps');
      expect(userExp.stats.totalFoodsLogged).toBe(50);
    });
  });
});

describe('WellNū Component Testing', () => {
  describe('LevelBadge Component', () => {
    it('should display correct level information', () => {
      // Component testing would go here with React Testing Library
      // Testing badge display, level progression, achievement modal
    });

    it('should handle level up animations', () => {
      // Animation and notification testing
    });
  });

  describe('FilipinoFoodDatabase Component', () => {
    it('should search and filter Filipino foods correctly', () => {
      // Search functionality testing
    });

    it('should display cultural context and nutrition information', () => {
      // Content display testing
    });
  });

  describe('XPNotification Component', () => {
    it('should show XP gain notifications with correct values', () => {
      // Notification display and animation testing
    });

    it('should handle level up celebrations', () => {
      // Level up notification testing
    });
  });
});

export default {};
