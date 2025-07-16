/**
 * Local Storage Service for WellNū App
 * Handles local data persistence based on database schema
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Database schema interfaces
export interface UserProfile {
  UserId: number;
  Email: string;
  FirstName: string;
  LastName: string;
  Weight: number;
  Height: number;
  Age: number;
  BodyGoalId: number;
  IsActive: boolean;
}

export interface BodyGoal {
  BodyGoalId: number;
  BodyGoalName: string;
  BodyGoalDesc: string;
}

export interface FoodLog {
  FoodLogId: number;
  UserId: number;
  FoodCategoryId: number;
  FoodId: number;
  NutrientLogId: number;
  CreatedAt: string;
}

export interface NutrientLog {
  NutrientLogId: number;
  FoodCategoryId: number;
  FoodId: number;
  Calories: string;
  Protein: string;
  Fat: string;
  UserId: number;
  FoodGramAmount: number;
}

export interface DailyIntake {
  DailyIntakeId: number;
  UserId: number;
  CalorieIntake: number;
  UpdatedAt: string;
}

class LocalStorageService {
  private static instance: LocalStorageService;

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // User Profile Methods
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem('userProfile');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  // Body Goals Methods
  getBodyGoals(): BodyGoal[] {
    return [
      { BodyGoalId: 1, BodyGoalName: "Weight Loss", BodyGoalDesc: "Lose weight and maintain health" },
      { BodyGoalId: 2, BodyGoalName: "Weight Gain", BodyGoalDesc: "Gain healthy weight and muscle" },
      { BodyGoalId: 3, BodyGoalName: "Maintenance", BodyGoalDesc: "Maintain current weight and health" },
      { BodyGoalId: 4, BodyGoalName: "Muscle Building", BodyGoalDesc: "Build muscle and strength" }
    ];
  }

  getBodyGoalById(id: number): BodyGoal | undefined {
    return this.getBodyGoals().find(goal => goal.BodyGoalId === id);
  }

  // Food Log Methods
  async getFoodLogs(userId: number): Promise<FoodLog[]> {
    try {
      const data = await AsyncStorage.getItem(`foodLogs_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting food logs:', error);
      return [];
    }
  }

  async saveFoodLog(foodLog: FoodLog): Promise<boolean> {
    try {
      const existingLogs = await this.getFoodLogs(foodLog.UserId);
      const updatedLogs = [...existingLogs, foodLog];
      await AsyncStorage.setItem(`foodLogs_${foodLog.UserId}`, JSON.stringify(updatedLogs));
      return true;
    } catch (error) {
      console.error('Error saving food log:', error);
      return false;
    }
  }

  // Nutrient Log Methods
  async getNutrientLogs(userId: number): Promise<NutrientLog[]> {
    try {
      const data = await AsyncStorage.getItem(`nutrientLogs_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting nutrient logs:', error);
      return [];
    }
  }

  async saveNutrientLog(nutrientLog: NutrientLog): Promise<boolean> {
    try {
      const existingLogs = await this.getNutrientLogs(nutrientLog.UserId);
      const updatedLogs = [...existingLogs, nutrientLog];
      await AsyncStorage.setItem(`nutrientLogs_${nutrientLog.UserId}`, JSON.stringify(updatedLogs));
      return true;
    } catch (error) {
      console.error('Error saving nutrient log:', error);
      return false;
    }
  }

  // Daily Intake Methods
  async getDailyIntake(userId: number, date: string): Promise<DailyIntake | null> {
    try {
      const data = await AsyncStorage.getItem(`dailyIntake_${userId}_${date}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting daily intake:', error);
      return null;
    }
  }

  async saveDailyIntake(dailyIntake: DailyIntake): Promise<boolean> {
    try {
      const date = new Date(dailyIntake.UpdatedAt).toISOString().split('T')[0];
      await AsyncStorage.setItem(
        `dailyIntake_${dailyIntake.UserId}_${date}`, 
        JSON.stringify(dailyIntake)
      );
      return true;
    } catch (error) {
      console.error('Error saving daily intake:', error);
      return false;
    }
  }

  // Clear all user data
  async clearUserData(userId: number): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => 
        key.includes(`_${userId}`) || 
        key === 'userProfile' ||
        key === 'userStats' ||
        key === 'userAchievements' ||
        key === 'nutritionGoals'
      );
      await AsyncStorage.multiRemove(userKeys);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // Initialize default user profile
  async initializeDefaultProfile(): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      UserId: 1,
      Email: "user@wellnu.com",
      FirstName: "WellNū",
      LastName: "User",
      Weight: 65,
      Height: 170,
      Age: 25,
      BodyGoalId: 1,
      IsActive: true
    };
    
    await this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }
}

export default LocalStorageService;
