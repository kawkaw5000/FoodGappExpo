/**
 * Daily Goal Tracking Service
 * Handles tracking daily calorie goal achievements and notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyGoalRecord {
  date: string; // YYYY-MM-DD format
  userId: number;
  calorieGoal: number;
  caloriesConsumed: number;
  goalAchieved: boolean;
  completionPercentage: number;
}

export interface YesterdayGoalNotification {
  shouldShow: boolean;
  yesterdayDate: string;
  goalMissed: boolean;
  completionPercentage: number;
}

class DailyGoalTracker {
  private static STORAGE_KEY = 'daily_goal_records';
  private static NOTIFICATION_KEY = 'yesterday_goal_notification_shown';

  /**
   * Save today's goal achievement record
   */
  static async saveDailyGoalRecord(record: DailyGoalRecord): Promise<void> {
    try {
      const existingRecords = await this.getDailyGoalRecords();
      const updatedRecords = existingRecords.filter(r => 
        r.date !== record.date || r.userId !== record.userId
      );
      updatedRecords.push(record);

      // Keep only last 30 days of records
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRecords = updatedRecords.filter(r => 
        new Date(r.date) >= thirtyDaysAgo
      );

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentRecords));
    } catch (error) {
      console.error('Error saving daily goal record:', error);
    }
  }

  /**
   * Get all stored daily goal records
   */
  static async getDailyGoalRecords(): Promise<DailyGoalRecord[]> {
    try {
      const recordsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return recordsJson ? JSON.parse(recordsJson) : [];
    } catch (error) {
      console.error('Error getting daily goal records:', error);
      return [];
    }
  }

  /**
   * Get yesterday's goal record for a specific user
   */
  static async getYesterdayGoalRecord(userId: number): Promise<DailyGoalRecord | null> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const records = await this.getDailyGoalRecords();
      return records.find(r => r.date === yesterdayString && r.userId === userId) || null;
    } catch (error) {
      console.error('Error getting yesterday goal record:', error);
      return null;
    }
  }

  /**
   * Check if yesterday goal notification should be shown
   */
  static async checkYesterdayGoalNotification(userId: number): Promise<YesterdayGoalNotification> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      // Check if notification was already shown for yesterday
      const notificationKey = `${this.NOTIFICATION_KEY}_${userId}_${yesterdayString}`;
      const notificationShown = await AsyncStorage.getItem(notificationKey);

      if (notificationShown === 'true') {
        return {
          shouldShow: false,
          yesterdayDate: yesterdayString,
          goalMissed: false,
          completionPercentage: 0
        };
      }

      // Get yesterday's record
      const yesterdayRecord = await this.getYesterdayGoalRecord(userId);
      
      if (!yesterdayRecord) {
        return {
          shouldShow: false,
          yesterdayDate: yesterdayString,
          goalMissed: false,
          completionPercentage: 0
        };
      }

      // Check if goal was missed (less than 80% completion)
      const goalMissed = yesterdayRecord.completionPercentage < 80;

      return {
        shouldShow: goalMissed,
        yesterdayDate: yesterdayString,
        goalMissed,
        completionPercentage: yesterdayRecord.completionPercentage
      };
    } catch (error) {
      console.error('Error checking yesterday goal notification:', error);
      return {
        shouldShow: false,
        yesterdayDate: '',
        goalMissed: false,
        completionPercentage: 0
      };
    }
  }

  /**
   * Mark yesterday goal notification as shown
   */
  static async markYesterdayNotificationShown(userId: number): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      const notificationKey = `${this.NOTIFICATION_KEY}_${userId}_${yesterdayString}`;
      await AsyncStorage.setItem(notificationKey, 'true');
    } catch (error) {
      console.error('Error marking yesterday notification as shown:', error);
    }
  }

  /**
   * Update today's goal progress (call this whenever calories are updated)
   */
  static async updateTodayGoalProgress(
    userId: number, 
    caloriesConsumed: number, 
    calorieGoal: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const completionPercentage = Math.round((caloriesConsumed / calorieGoal) * 100);
      const goalAchieved = completionPercentage >= 80; // Consider 80%+ as achieved

      const record: DailyGoalRecord = {
        date: today,
        userId,
        calorieGoal,
        caloriesConsumed,
        goalAchieved,
        completionPercentage
      };

      await this.saveDailyGoalRecord(record);
    } catch (error) {
      console.error('Error updating today goal progress:', error);
    }
  }

  /**
   * Get goal achievement streak for user
   */
  static async getGoalAchievementStreak(userId: number): Promise<number> {
    try {
      const records = await this.getDailyGoalRecords();
      const userRecords = records
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let streak = 0;
      for (const record of userRecords) {
        if (record.goalAchieved) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error getting goal achievement streak:', error);
      return 0;
    }
  }
}

export default DailyGoalTracker;
