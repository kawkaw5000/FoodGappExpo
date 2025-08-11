/**
 * WellNū Local User Experience & Gamification System
 * Fully local leveling system with no database dependencies
 */

import Config from '../constants/Config';
// Backend-driven UserExperienceService
export interface UserLevel {
  level: number;
  currentXP: number;
  requiredXP: number;
  title: string;
  badge: string;
}

class UserExperienceService {
  // Fetch user level and XP from backend
  static async getUserLevel(userId: string): Promise<UserLevel> {
    const res = await fetch(`${Config.Account_API}/user-level/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user level');
    return await res.json();
  }

  // Add experience to user (e.g., for scan, log, etc.)
  static async addXP(userId: string, amount: number, reason: string): Promise<UserLevel> {
    const res = await fetch(`${Config.Account_API}/add-experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserId: Number(userId), Experience: amount })
    });
    if (!res.ok) throw new Error('Failed to add XP');
    return await res.json();
  }

  // Process daily login (awards XP, handles streaks, etc.)
  static async processDailyLogin(userId: string): Promise<UserLevel> {
    const res = await fetch(`${Config.Account_API}/process-daily-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to process daily login');
    return await res.json();
  }
}

export default UserExperienceService;
