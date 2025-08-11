/**
 * WellNū Performance & Integration Testing Suite
 * Performance benchmarks and integration tests for the complete app
 */

import { performance } from 'perf_hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import UserExperienceService from '../services/UserExperienceService';
import { WellNuNutrientService, ComprehensiveNutrientData } from '../services/WellNuNutrientService';
import { WellNuAlertService } from '../services/WellNuAlertService';

// Type-safe mocks
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('WellNū Performance Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockAsyncStorage.clear.mockResolvedValue(undefined);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('Service Performance Benchmarks', () => {
    it('should load user level data within 200ms', async () => {
      const startTime = performance.now();
      await UserExperienceService.getUserLevel('test_user');
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(200);
    });

    it('should generate alerts within 100ms', async () => {
      const nutritionData: ComprehensiveNutrientData = {
        calories: 2500,
        protein: 80,
        carbs: 300,
        fats: 80,
        fiber: 25,
        sugar: 50,
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
        sodium: 3000,
        zinc: 8,
        copper: 0.9,
        manganese: 1.8,
        selenium: 55
      };

      const userProfile = { age: 25, gender: 'female' as const, weight: 60, height: 165, activity: 'moderate' };

      const startTime = performance.now();
      
      const alerts = await WellNuAlertService.getInstance().generateRealTimeAlerts(nutritionData, userProfile);
      
      const endTime = performance.now();
      const alertTime = endTime - startTime;
      
      expect(alertTime).toBeLessThan(100);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should handle 100 XP calculations without performance degradation', async () => {
      const startTime = performance.now();
      // Simulate 100 XP calculations
      for (let i = 0; i < 100; i++) {
        await UserExperienceService.addXP('test_user', 10, 'Performance Test');
      }
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      // Should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not create memory leaks in repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      // Perform 50 cycles of typical user operations
      for (let i = 0; i < 50; i++) {
        await UserExperienceService.addXP('test_user', 100, 'Memory Test');
        const nutritionData: ComprehensiveNutrientData = {
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
        await WellNuAlertService.getInstance().generateRealTimeAlerts(nutritionData, userProfile);
      }
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Concurrent Operations Tests', () => {
    it('should handle multiple simultaneous XP additions', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        UserExperienceService.addXP('test_user', 100, `Concurrent Test ${i}`)
      );
      const results = await Promise.all(promises);
      // All operations should complete successfully
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});

describe('WellNū Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockAsyncStorage.clear.mockResolvedValue(undefined);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('Complete User Journey Integration', () => {
    it('should complete basic user experience flow', async () => {
      // Step 1: Initialize user experience
      const userLevel = await UserExperienceService.getUserLevel('test_user');
      expect(userLevel.level).toBe(1);
      expect(userLevel.currentXP).toBe(0);

      // Step 2: Add XP for food logging
      const addXPLevel = await UserExperienceService.addXP('test_user', 150, 'First Food Log');
      expect(addXPLevel.level).toBeGreaterThanOrEqual(1);

      // Step 3: Process daily login
      const loginLevel = await UserExperienceService.processDailyLogin('test_user');
      expect(loginLevel.level).toBeGreaterThanOrEqual(1);
    });

    it('should maintain data consistency across operations', async () => {
      // Initial setup
      await UserExperienceService.addXP('test_user', 750, 'Initial XP');
      const beforeLevel = await UserExperienceService.getUserLevel('test_user');
      expect(beforeLevel.currentXP).toBeGreaterThanOrEqual(750);

      // Add more XP
      await UserExperienceService.addXP('test_user', 250, 'Additional XP');
      const afterLevel = await UserExperienceService.getUserLevel('test_user');
      expect(afterLevel.currentXP).toBeGreaterThanOrEqual(1000);
      expect(afterLevel.level).toBeGreaterThanOrEqual(2); // Should level up at 1000 XP
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover gracefully from storage errors', async () => {
      // Mock storage failure for getItem
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      // Should fallback to default values
      const userLevel = await UserExperienceService.getUserLevel('test_user');
      expect(userLevel.level).toBe(1);
      expect(userLevel.currentXP).toBe(0);

      // Restore normal behavior
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Should work normally after recovery
      const addXPLevel = await UserExperienceService.addXP('test_user', 100, 'Recovery Test');
      expect(addXPLevel.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate data integrity across services', async () => {
      // Test with edge case data
      const edgeCases = [
        { xp: 0, reason: 'Zero XP' },
        { xp: 999999, reason: 'Maximum XP' },
      ];

      for (const testCase of edgeCases) {
        const beforeLevel = await UserExperienceService.getUserLevel('test_user');
        const beforeXP = beforeLevel.currentXP;
        await UserExperienceService.addXP('test_user', testCase.xp, testCase.reason);
        const afterLevel = await UserExperienceService.getUserLevel('test_user');
        // XP should increase correctly
        expect(afterLevel.currentXP).toBeGreaterThanOrEqual(beforeXP + testCase.xp);
        // Level should be calculated correctly
        expect(afterLevel.level).toBeGreaterThanOrEqual(1);
      }
    });
  });
});

describe('WellNū Stress Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockAsyncStorage.clear.mockResolvedValue(undefined);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('High Load Scenarios', () => {
    it('should handle rapid successive operations', async () => {
      const operations = [];
      // Create 20 rapid operations
      for (let i = 0; i < 20; i++) {
        operations.push(
          UserExperienceService.addXP('test_user', Math.floor(Math.random() * 100), `Stress Test ${i}`)
        );
      }
      // All operations should complete without errors
      const results = await Promise.allSettled(operations);
      const failures = results.filter(result => result.status === 'rejected');
      expect(failures.length).toBe(0);
    });

    it('should maintain performance with simulated usage data', async () => {
      // Simulate 10 days of usage data
      for (let day = 0; day < 10; day++) {
        for (let meal = 0; meal < 3; meal++) {
          await UserExperienceService.addXP('test_user', 100, `Day ${day} Meal ${meal}`);
        }
      }
      const startTime = performance.now();
      // Should still perform quickly with accumulated data
      const userLevel = await UserExperienceService.getUserLevel('test_user');
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      expect(operationTime).toBeLessThan(500); // Still under 500ms
      expect(userLevel.currentXP).toBeGreaterThanOrEqual(3000); // 10 days * 3 meals * 100 XP
    });
  });
});

export default {};
