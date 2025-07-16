/**
 * WellNū Local User Experience & Gamification System
 * Fully local leveling system with no database dependencies
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLevel {
  level: number;
  currentXP: number;
  requiredXP: number;
  title: string;
  badge: string;
}

export interface DailyLoginData {
  lastLoginDate: string;
  consecutiveDays: number;
  totalLogins: number;
  hasLoggedInToday: boolean;
}

export interface UserExperience {
  deviceId: string; // Using device ID instead of user ID for local storage
  level: number;
  totalXP: number;
  dailyLogin: DailyLoginData;
  achievements: string[];
  unlockedAchievements: Achievement[];
  stats: LocalUserStats;
  weeklyChallenge?: WeeklyChallenge;
  createdDate: Date;
  lastActiveDate: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge: string;
  xpReward: number;
  unlockedDate?: Date;
  category: 'nutrition' | 'consistency' | 'exploration' | 'social' | 'milestone';
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
}

export interface LocalUserStats {
  totalFoodsLogged: number;
  totalScans: number;
  totalDaysActive: number;
  streakRecord: number;
  favoriteFoods: string[];
  nutritionGoalsAchieved: number;
  exerciseSessionsLogged: number;
  socialSharesCount: number;
}

class UserExperienceService {
  private static readonly STORAGE_KEY = 'userExperience';
  private static readonly DAILY_LOGIN_XP = 500;
  private static readonly CONSECUTIVE_BONUS_XP = 100; // Bonus per consecutive day
  
  // XP requirements for each level (exponential growth)
  private static readonly LEVEL_REQUIREMENTS = [
    0,     // Level 1
    1000,  // Level 2
    2500,  // Level 3
    4500,  // Level 4
    7000,  // Level 5
    10000, // Level 6
    13500, // Level 7
    17500, // Level 8
    22000, // Level 9
    27000, // Level 10
    32500, // Level 11
    38500, // Level 12
    45000, // Level 13
    52000, // Level 14
    59500, // Level 15
    67500, // Level 16
    76000, // Level 17
    85000, // Level 18
    94500, // Level 19
    104500, // Level 20
  ];

  private static readonly LEVEL_TITLES = [
    'Nutrition Newbie',      // Level 1
    'Health Beginner',       // Level 2
    'Wellness Warrior',      // Level 3
    'Food Fighter',          // Level 4
    'Calorie Counter',       // Level 5
    'Macro Master',          // Level 6
    'Nutrition Navigator',   // Level 7
    'Health Hero',           // Level 8
    'Fitness Fanatic',       // Level 9
    'Diet Dynamo',           // Level 10
    'Wellness Wizard',       // Level 11
    'Nutrition Ninja',       // Level 12
    'Health Champion',       // Level 13
    'Fitness Legend',        // Level 14
    'Diet Deity',            // Level 15
    'Wellness Overlord',     // Level 16
    'Nutrition Sage',        // Level 17
    'Health Immortal',       // Level 18
    'Fitness Demigod',       // Level 19
    'The Ultimate Being',    // Level 20
  ];

  private static readonly LEVEL_BADGES = [
    '🌱', '🥬', '💪', '🔥', '⭐', '🏆', '👑', '🦸', '⚡', '🌟',
    '🧙', '🥷', '🏅', '🦾', '👼', '🌌', '🧠', '💎', '⚔️', '🌈'
  ];

  // Enhanced XP rewards for WellNū actions
  static readonly XP_REWARDS = {
    DAILY_LOGIN: 500,
    FOOD_LOG: 50,
    SCAN_FOOD: 75,
    COMPLETE_MEAL: 100,
    EXERCISE_LOG: 150,
    PROFILE_COMPLETE: 200,
    GOAL_ACHIEVED: 300,
    NUTRITION_TARGET_MET: 200,
    WELLNU_ALERT_ACTED: 100,
    FILIPINO_FOOD_DISCOVERY: 125,
    STREAK_MILESTONE: 250,
    ACHIEVEMENT_UNLOCK: 500,
    WEEKLY_CHALLENGE_COMPLETE: 750,
  };

  // Achievement definitions for local unlock system
  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Log your first meal',
      badge: '👶',
      xpReward: 100,
      category: 'milestone'
    },
    {
      id: 'scanner_pro',
      name: 'Scanner Pro',
      description: 'Scan 10 different foods',
      badge: '📱',
      xpReward: 200,
      category: 'exploration'
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Log in for 7 consecutive days',
      badge: '🗓️',
      xpReward: 300,
      category: 'consistency'
    },
    {
      id: 'month_master',
      name: 'Month Master',
      description: 'Log in for 30 consecutive days',
      badge: '📅',
      xpReward: 1000,
      category: 'consistency'
    },
    {
      id: 'nutrition_ninja',
      name: 'Nutrition Ninja',
      description: 'Meet all nutrition targets for 5 days',
      badge: '🥷',
      xpReward: 500,
      category: 'nutrition'
    },
    {
      id: 'filipino_foodie',
      name: 'Filipino Foodie',
      description: 'Try 20 different Filipino foods',
      badge: '🇵🇭',
      xpReward: 400,
      category: 'exploration'
    },
    {
      id: 'social_sharer',
      name: 'Social Sharer',
      description: 'Share your progress 5 times',
      badge: '📢',
      xpReward: 250,
      category: 'social'
    },
    {
      id: 'century_club',
      name: 'Century Club',
      description: 'Log 100 different meals',
      badge: '💯',
      xpReward: 750,
      category: 'milestone'
    },
    {
      id: 'level_legend',
      name: 'Level Legend',
      description: 'Reach level 10',
      badge: '👑',
      xpReward: 1000,
      category: 'milestone'
    },
    {
      id: 'wellness_wizard',
      name: 'Wellness Wizard',
      description: 'Complete 10 weekly challenges',
      badge: '🧙‍♂️',
      xpReward: 1500,
      category: 'milestone'
    }
  ];

  static async getUserExperience(deviceId?: string): Promise<UserExperience> {
    try {
      // Use a default device ID if none provided (for local-only storage)
      const id = deviceId || 'local_device';
      const data = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${id}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error getting user experience:', error);
    }

    // Default user experience for new local users
    const today = new Date();
    const id = deviceId || 'local_device';
    return {
      deviceId: id,
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
      createdDate: today,
      lastActiveDate: today,
    };
  }

  static async saveUserExperience(userExp: UserExperience): Promise<void> {
    try {
      userExp.lastActiveDate = new Date();
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userExp.deviceId}`,
        JSON.stringify(userExp)
      );
    } catch (error) {
      console.error('Error saving user experience:', error);
    }
  }

  static async processDailyLogin(deviceId?: string): Promise<{
    xpGained: number;
    isConsecutiveBonus: boolean;
    consecutiveDays: number;
    leveledUp: boolean;
    newLevel?: number;
  }> {
    const userExp = await this.getUserExperience(deviceId);
    const today = new Date().toDateString();

    // Check if already logged in today
    if (userExp.dailyLogin.hasLoggedInToday && userExp.dailyLogin.lastLoginDate === today) {
      return {
        xpGained: 0,
        isConsecutiveBonus: false,
        consecutiveDays: userExp.dailyLogin.consecutiveDays,
        leveledUp: false,
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    let consecutiveDays = 1;
    let isConsecutiveBonus = false;

    // Check if yesterday was the last login (consecutive days)
    if (userExp.dailyLogin.lastLoginDate === yesterdayString) {
      consecutiveDays = userExp.dailyLogin.consecutiveDays + 1;
      isConsecutiveBonus = consecutiveDays > 1;
    }

    // Calculate XP gained
    let xpGained = this.DAILY_LOGIN_XP;
    if (isConsecutiveBonus) {
      xpGained += Math.min(consecutiveDays * this.CONSECUTIVE_BONUS_XP, 1000); // Cap bonus at 1000
    }

    const oldLevel = userExp.level;
    const newTotalXP = userExp.totalXP + xpGained;
    const newLevel = this.calculateLevel(newTotalXP);

    // Update user experience
    userExp.totalXP = newTotalXP;
    userExp.level = newLevel;
    userExp.dailyLogin = {
      lastLoginDate: today,
      consecutiveDays,
      totalLogins: userExp.dailyLogin.totalLogins + 1,
      hasLoggedInToday: true,
    };

    // Add achievements
    if (consecutiveDays === 7 && !userExp.achievements.includes('week_warrior')) {
      userExp.achievements.push('week_warrior');
    }
    if (consecutiveDays === 30 && !userExp.achievements.includes('month_master')) {
      userExp.achievements.push('month_master');
    }
    if (userExp.dailyLogin.totalLogins === 100 && !userExp.achievements.includes('login_legend')) {
      userExp.achievements.push('login_legend');
    }

    await this.saveUserExperience(userExp);

    return {
      xpGained,
      isConsecutiveBonus,
      consecutiveDays,
      leveledUp: newLevel > oldLevel,
      newLevel: newLevel > oldLevel ? newLevel : undefined,
    };
  }

  static async addXP(deviceId: string | undefined, amount: number, reason: string): Promise<{
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
    achievementUnlocked?: Achievement;
  }> {
    const userExp = await this.getUserExperience(deviceId);
    const oldLevel = userExp.level;
    const newTotalXP = userExp.totalXP + amount;
    const newLevel = this.calculateLevel(newTotalXP);

    userExp.totalXP = newTotalXP;
    userExp.level = newLevel;

    // Check for achievement unlocks
    const achievementUnlocked = await this.checkAchievements(userExp, reason);

    await this.saveUserExperience(userExp);

    return {
      xpGained: amount,
      leveledUp: newLevel > oldLevel,
      newLevel: newLevel > oldLevel ? newLevel : undefined,
      achievementUnlocked,
    };
  }

  static calculateLevel(totalXP: number): number {
    for (let i = this.LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (totalXP >= this.LEVEL_REQUIREMENTS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  static getLevelInfo(level: number): UserLevel {
    const currentLevelIndex = Math.max(0, Math.min(level - 1, this.LEVEL_REQUIREMENTS.length - 1));
    const nextLevelIndex = Math.min(currentLevelIndex + 1, this.LEVEL_REQUIREMENTS.length - 1);
    
    const currentXP = this.LEVEL_REQUIREMENTS[currentLevelIndex];
    const requiredXP = this.LEVEL_REQUIREMENTS[nextLevelIndex];
    
    return {
      level,
      currentXP,
      requiredXP,
      title: this.LEVEL_TITLES[currentLevelIndex] || 'Legendary Master',
      badge: this.LEVEL_BADGES[currentLevelIndex] || '🌟',
    };
  }

  static getProgressToNextLevel(totalXP: number, currentLevel: number): {
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number;
  } {
    const currentLevelIndex = Math.max(0, Math.min(currentLevel - 1, this.LEVEL_REQUIREMENTS.length - 1));
    const nextLevelIndex = Math.min(currentLevelIndex + 1, this.LEVEL_REQUIREMENTS.length - 1);
    
    const currentLevelXP = this.LEVEL_REQUIREMENTS[currentLevelIndex];
    const nextLevelXP = this.LEVEL_REQUIREMENTS[nextLevelIndex];
    
    const progress = nextLevelXP > currentLevelXP 
      ? (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)
      : 1;
    
    return {
      currentLevelXP,
      nextLevelXP,
      progress: Math.max(0, Math.min(1, progress)),
    };
  }

  /**
   * Check and unlock achievements based on user actions
   */
  private static async checkAchievements(userExp: UserExperience, reason: string): Promise<Achievement | undefined> {
    for (const achievement of this.ACHIEVEMENTS) {
      // Skip if already unlocked
      if (userExp.achievements.includes(achievement.id)) {
        continue;
      }

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_steps':
          shouldUnlock = userExp.stats.totalFoodsLogged >= 1;
          break;
        case 'scanner_pro':
          shouldUnlock = userExp.stats.totalScans >= 10;
          break;
        case 'week_warrior':
          shouldUnlock = userExp.dailyLogin.consecutiveDays >= 7;
          break;
        case 'month_master':
          shouldUnlock = userExp.dailyLogin.consecutiveDays >= 30;
          break;
        case 'nutrition_ninja':
          shouldUnlock = userExp.stats.nutritionGoalsAchieved >= 5;
          break;
        case 'filipino_foodie':
          shouldUnlock = userExp.stats.favoriteFoods.length >= 20;
          break;
        case 'social_sharer':
          shouldUnlock = userExp.stats.socialSharesCount >= 5;
          break;
        case 'century_club':
          shouldUnlock = userExp.stats.totalFoodsLogged >= 100;
          break;
        case 'level_legend':
          shouldUnlock = userExp.level >= 10;
          break;
        case 'wellness_wizard':
          shouldUnlock = userExp.stats.exerciseSessionsLogged >= 10;
          break;
      }

      if (shouldUnlock) {
        userExp.achievements.push(achievement.id);
        const unlockedAchievement = { ...achievement, unlockedDate: new Date() };
        userExp.unlockedAchievements.push(unlockedAchievement);
        userExp.totalXP += achievement.xpReward;
        return unlockedAchievement;
      }
    }

    return undefined;
  }

  /**
   * Update user statistics for achievement tracking
   */
  static async updateUserStats(
    deviceId: string | undefined, 
    action: 'FOOD_LOG' | 'SCAN' | 'GOAL_MET' | 'EXERCISE' | 'SHARE' | 'FILIPINO_FOOD',
    metadata?: any
  ): Promise<void> {
    const userExp = await this.getUserExperience(deviceId);

    switch (action) {
      case 'FOOD_LOG':
        userExp.stats.totalFoodsLogged++;
        if (metadata?.foodName && !userExp.stats.favoriteFoods.includes(metadata.foodName)) {
          userExp.stats.favoriteFoods.push(metadata.foodName);
        }
        break;
      case 'SCAN':
        userExp.stats.totalScans++;
        break;
      case 'GOAL_MET':
        userExp.stats.nutritionGoalsAchieved++;
        break;
      case 'EXERCISE':
        userExp.stats.exerciseSessionsLogged++;
        break;
      case 'SHARE':
        userExp.stats.socialSharesCount++;
        break;
      case 'FILIPINO_FOOD':
        if (metadata?.foodName && !userExp.stats.favoriteFoods.includes(metadata.foodName)) {
          userExp.stats.favoriteFoods.push(metadata.foodName);
        }
        break;
    }

    await this.saveUserExperience(userExp);
  }

  /**
   * Generate a weekly challenge for the user
   */
  static async generateWeeklyChallenge(deviceId?: string): Promise<WeeklyChallenge> {
    const userExp = await this.getUserExperience(deviceId);
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

    const challenges = [
      {
        name: 'Nutrition Explorer',
        description: 'Log 5 different Filipino vegetables this week',
        targetValue: 5,
        xpReward: 500,
      },
      {
        name: 'Consistency Champion',
        description: 'Log meals every day this week',
        targetValue: 7,
        xpReward: 750,
      },
      {
        name: 'Scanner Master',
        description: 'Scan 10 new foods this week',
        targetValue: 10,
        xpReward: 600,
      },
      {
        name: 'Balance Boss',
        description: 'Meet protein targets 5 days this week',
        targetValue: 5,
        xpReward: 650,
      },
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    const weeklyChallenge: WeeklyChallenge = {
      id: `challenge_${Date.now()}`,
      ...randomChallenge,
      currentValue: 0,
      startDate: now,
      endDate: endOfWeek,
      completed: false,
    };

    userExp.weeklyChallenge = weeklyChallenge;
    await this.saveUserExperience(userExp);

    return weeklyChallenge;
  }

  /**
   * Get all available achievements with unlock status
   */
  static async getAllAchievements(deviceId?: string): Promise<(Achievement & { unlocked: boolean })[]> {
    const userExp = await this.getUserExperience(deviceId);
    
    return this.ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: userExp.achievements.includes(achievement.id),
    }));
  }

  /**
   * Reset user experience (for testing or fresh start)
   */
  static async resetUserExperience(deviceId?: string): Promise<void> {
    const id = deviceId || 'local_device';
    await AsyncStorage.removeItem(`${this.STORAGE_KEY}_${id}`);
  }
}

export default UserExperienceService;
