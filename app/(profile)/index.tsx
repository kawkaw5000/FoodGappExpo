import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, ScrollView, Modal } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageService, { UserProfile, BodyGoal } from '@/services/LocalStorageService';

interface UserStats {
  totalFoodsLogged: number;
  currentStreak: number;
  totalXP: number;
  level: number;
  achievementsUnlocked: number;
  weeklyGoalProgress: number;
}

interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyFats: number;
  dailyCarbs: number;
  waterGoal: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const storageService = LocalStorageService.getInstance();
  
  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  // Profile state based on User table schema
  const [profile, setProfile] = useState<UserProfile>({
    UserId: 1,
    Email: "",
    FirstName: "",
    LastName: "",
    Weight: 0,
    Height: 0,
    Age: 0,
    BodyGoalId: 1,
    IsActive: true
  });

  // Body goals from BodyGoal table
  const [bodyGoals] = useState<BodyGoal[]>(storageService.getBodyGoals());

  // Enhanced states
  const [userStats, setUserStats] = useState<UserStats>({
    totalFoodsLogged: 47,
    currentStreak: 5,
    totalXP: 2350,
    level: 8,
    achievementsUnlocked: 12,
    weeklyGoalProgress: 78
  });

  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyFats: 65,
    dailyCarbs: 250,
    waterGoal: 2000
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Log your first meal',
      icon: '🥗',
      unlocked: true,
      unlockedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintain a 7-day logging streak',
      icon: '🔥',
      unlocked: true,
      unlockedDate: '2024-01-22'
    },
    {
      id: '3',
      title: 'Filipino Food Explorer',
      description: 'Try 10 different Filipino dishes',
      icon: '🇵🇭',
      unlocked: true,
      unlockedDate: '2024-01-28'
    },
    {
      id: '4',
      title: 'Nutrition Champion',
      description: 'Meet all macro goals for 5 days',
      icon: '💪',
      unlocked: false
    },
    {
      id: '5',
      title: 'Social Sharer',
      description: 'Share 5 achievements on social media',
      icon: '📱',
      unlocked: true,
      unlockedDate: '2024-02-01'
    }
  ]);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Load from local storage using service
        let userProfile = await storageService.getUserProfile();
        
        if (!userProfile) {
          // Initialize default profile if none exists
          userProfile = await storageService.initializeDefaultProfile();
        }
        
        setProfile(userProfile);

        // Load user stats
        const statsData = await AsyncStorage.getItem('userStats');
        if (statsData) {
          setUserStats(JSON.parse(statsData));
        }

        // Load achievements
        const achievementsData = await AsyncStorage.getItem('userAchievements');
        if (achievementsData) {
          setAchievements(JSON.parse(achievementsData));
        }
      } catch (error) {
        console.log('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleDeleteProfile = async () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete your profile? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            try {
              // Clear all user data using the service
              await storageService.clearUserData(profile.UserId);
              Alert.alert("Deleted", "Your profile has been deleted.");
              router.replace("/(login)/loginScreen");
            } catch (error) {
              console.log('Delete profile error:', error);
              Alert.alert("Error", "Failed to delete profile.");
            }
          }
        }
      ]
    );
  };

  const getCurrentBodyGoal = () => {
    const goal = storageService.getBodyGoalById(profile.BodyGoalId);
    return goal?.BodyGoalName || 'Not set';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require("../../assets/images/Dashboard Icons/Profile_Highlight.png")} 
                style={styles.profileAvatar} 
              />
              <View style={styles.levelBadgeContainer}>
                <Text style={styles.levelBadgeText}>Lv.{userStats.level}</Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {profile.FirstName && profile.LastName 
                  ? `${profile.FirstName} ${profile.LastName}` 
                  : 'WellNū User'}
              </Text>
              <Text style={styles.userLevel}>Level {userStats.level} Nutrition Tracker</Text>
              <Text style={styles.xpText}>{userStats.totalXP.toLocaleString()} XP</Text>
            </View>
          </View>
          
          {/* Level Progress Bar */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View style={[styles.levelProgressFill, { width: `${(userStats.totalXP % 500) / 5}%` }]} />
            </View>
            <Text style={styles.levelProgressText}>
              {userStats.totalXP % 500}/500 XP to Level {userStats.level + 1}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.modernProfileInfoBox}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>👤</Text>
                <Text style={styles.infoLabel}>Name</Text>
              </View>
              <Text style={styles.infoValue}>
                {profile.FirstName && profile.LastName 
                  ? `${profile.FirstName} ${profile.LastName}` 
                  : 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📧</Text>
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue}>
                {profile.Email || 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>🎂</Text>
                <Text style={styles.infoLabel}>Age</Text>
              </View>
              <Text style={styles.infoValue}>
                {profile.Age ? `${profile.Age} years` : 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>⚖️</Text>
                <Text style={styles.infoLabel}>Weight</Text>
              </View>
              <Text style={styles.infoValue}>
                {profile.Weight ? `${profile.Weight} kg` : 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📏</Text>
                <Text style={styles.infoLabel}>Height</Text>
              </View>
              <Text style={styles.infoValue}>
                {profile.Height ? `${profile.Height} cm` : 'Not set'}
              </Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>🎯</Text>
                <Text style={styles.infoLabel}>Goal</Text>
              </View>
              <Text style={styles.infoValue}>
                {getCurrentBodyGoal()}
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Stats Dashboard */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress Dashboard</Text>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.modernStatCard} onPress={() => setShowStatsModal(true)}>
              <Text style={styles.statIcon}>🍽️</Text>
              <Text style={styles.statNumber}>{userStats.totalFoodsLogged}</Text>
              <Text style={styles.statLabel}>Foods Logged</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modernStatCard} onPress={() => setShowStatsModal(true)}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modernStatCard} onPress={() => setShowStatsModal(true)}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statNumber}>{userStats.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modernStatCard} onPress={() => setShowAchievementsModal(true)}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statNumber}>{achievements.filter(a => a.unlocked).length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weeklyProgressSection}>
            <Text style={styles.progressTitle}>Weekly Goal Progress</Text>
            <View style={styles.weeklyProgressBar}>
              <View style={[styles.weeklyProgressFill, { width: `${userStats.weeklyGoalProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{userStats.weeklyGoalProgress}% Complete</Text>
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.modernActionButton} onPress={() => setShowGoalsModal(true)}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.modernActionIcon}>🎯</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Nutrition Goals</Text>
              <Text style={styles.actionSubtitle}>Set and track daily macro targets</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modernActionButton} onPress={() => setShowAchievementsModal(true)}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.modernActionIcon}>🏆</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Achievements</Text>
              <Text style={styles.actionSubtitle}>View your nutrition milestones</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modernActionButton} onPress={() => router.push('/(profile)/editProfile')}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.modernActionIcon}>✏️</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>Update your personal information</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modernActionButton} onPress={() => setShowStatsModal(true)}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.modernActionIcon}>📊</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Detailed Statistics</Text>
              <Text style={styles.actionSubtitle}>View comprehensive progress data</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            backgroundColor="#FCB647"
            textColor="white"
          />
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* Enhanced Stats Modal */}
      <Modal visible={showStatsModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detailed Statistics</Text>
            <TouchableOpacity onPress={() => setShowStatsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.statDetailCard}>
              <Text style={styles.statDetailTitle}>🍽️ Nutrition Progress</Text>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Total Foods Logged</Text>
                <Text style={styles.statDetailValue}>{userStats.totalFoodsLogged}</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Current Streak</Text>
                <Text style={styles.statDetailValue}>{userStats.currentStreak} days</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Weekly Goal Progress</Text>
                <Text style={styles.statDetailValue}>{userStats.weeklyGoalProgress}%</Text>
              </View>
            </View>

            <View style={styles.statDetailCard}>
              <Text style={styles.statDetailTitle}>⭐ Experience & Level</Text>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Current Level</Text>
                <Text style={styles.statDetailValue}>Level {userStats.level}</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Total XP</Text>
                <Text style={styles.statDetailValue}>{userStats.totalXP.toLocaleString()}</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>XP to Next Level</Text>
                <Text style={styles.statDetailValue}>{500 - (userStats.totalXP % 500)}</Text>
              </View>
            </View>

            <View style={styles.statDetailCard}>
              <Text style={styles.statDetailTitle}>🏆 Achievements</Text>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Achievements Unlocked</Text>
                <Text style={styles.statDetailValue}>{achievements.filter(a => a.unlocked).length}/{achievements.length}</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Completion Rate</Text>
                <Text style={styles.statDetailValue}>
                  {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Enhanced Achievements Modal */}
      <Modal visible={showAchievementsModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Achievements</Text>
            <TouchableOpacity onPress={() => setShowAchievementsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {achievements.map((achievement, index) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementDetailCard,
                  !achievement.unlocked && styles.lockedAchievement
                ]}
              >
                <Text style={styles.achievementDetailIcon}>{achievement.icon}</Text>
                <View style={styles.achievementDetailContent}>
                  <Text style={[
                    styles.achievementDetailTitle,
                    !achievement.unlocked && styles.lockedText
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDetailDesc,
                    !achievement.unlocked && styles.lockedText
                  ]}>
                    {achievement.description}
                  </Text>
                  {achievement.unlocked && achievement.unlockedDate && (
                    <Text style={styles.achievementDate}>
                      Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.checkMark}>
                  {achievement.unlocked ? '✅' : '🔒'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Enhanced Goals Modal */}
      <Modal visible={showGoalsModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nutrition Goals</Text>
            <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.goalCard}>
              <Text style={styles.goalCardTitle}>🎯 Daily Targets</Text>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Daily Calories</Text>
                <Text style={styles.goalValue}>{nutritionGoals.dailyCalories} kcal</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Daily Protein</Text>
                <Text style={styles.goalValue}>{nutritionGoals.dailyProtein}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Daily Fats</Text>
                <Text style={styles.goalValue}>{nutritionGoals.dailyFats}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Daily Carbs</Text>
                <Text style={styles.goalValue}>{nutritionGoals.dailyCarbs}g</Text>
              </View>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Water Goal</Text>
                <Text style={styles.goalValue}>{nutritionGoals.waterGoal}ml</Text>
              </View>
              
              <TouchableOpacity style={styles.editGoalsButton}>
                <Text style={styles.editGoalsText}>Edit Goals</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  
  // Enhanced Header Styles
  headerSection: {
    backgroundColor: "white",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FCB647",
    padding: 10,
  },
  
  levelBadgeContainer: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "white",
  },
  
  levelBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  
  userLevel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  
  xpText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  
  levelProgressContainer: {
    marginTop: 8,
  },
  
  levelProgressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  
  levelProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  
  levelProgressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  // Profile Information Section
  profileInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  modernProfileInfoBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  
  infoLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },

  // Enhanced Stats Section
  statsSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  
  modernStatCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  
  weeklyProgressSection: {
    marginTop: 8,
  },
  
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  
  weeklyProgressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  
  weeklyProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  // Enhanced Actions Section  
  actionsSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  
  modernActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  modernActionIcon: {
    fontSize: 20,
  },
  
  actionContent: {
    flex: 1,
  },
  
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  
  actionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  
  actionArrow: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "300",
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  deleteButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  
  deleteButtonText: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "500",
  },

  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  
  closeButton: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "500",
    padding: 4,
  },
  
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Enhanced Modal Card Styles
  statDetailCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  statDetailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  
  statDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  
  statDetailLabel: {
    fontSize: 16,
    color: "#666",
  },
  
  statDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },

  // Achievement Detail Styles
  achievementDetailCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  lockedAchievement: {
    opacity: 0.6,
    backgroundColor: "#F5F5F5",
  },
  
  achievementDetailIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  
  achievementDetailContent: {
    flex: 1,
  },
  
  achievementDetailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  
  achievementDetailDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  
  lockedText: {
    color: "#999",
  },
  
  achievementDate: {
    fontSize: 12,
    color: "#4CAF50",
  },
  
  checkMark: {
    fontSize: 20,
  },

  // Goal Card Styles
  goalCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  goalCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  
  goalLabel: {
    fontSize: 16,
    color: "#666",
  },
  
  goalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  
  editGoalsButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  
  editGoalsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
