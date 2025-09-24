

import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Modal } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LevelBadge } from '@/components/LevelBadge';
import Config from '@/constants/Config';

// Helper function to convert integer gender to display string
const getGenderDisplay = (gender: number | null | undefined): string => {
  if (gender === 0) return 'Male';
  if (gender === 1) return 'Female';
  if (gender === 2) return 'Others';
  return '-';
};

interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: number; // 0 = Male, 1 = Female, 2 = Others
  bodyGoalId?: number;
  isActive?: boolean;
}

// Use the backend-driven UserLevel interface
interface UserLevel {
  level: number;
  badge: string;
  title: string;
  currentXP: number;
  requiredXP: number;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  const handleLogout = useCallback(() => {
    router.replace("/(login)/loginScreen");
  }, [router]);

  useEffect(() => {
    const fetchProfileAndLevel = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        // Fetch profile
        const profileRes = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(userId)}`, {
          credentials: "include"
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          console.log('🔍 Full API Response:', JSON.stringify(data, null, 2));
          const userInfo = data.userInfo || data;
          console.log('👤 User Info:', JSON.stringify(userInfo, null, 2));
          console.log('⚧️ Gender Value:', userInfo.gender);
          setProfile({
            userId: userInfo.userId,
            email: userInfo.email,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            weight: userInfo.weight,
            height: userInfo.height,
            age: userInfo.age,
            gender: userInfo.gender,
            bodyGoalId: userInfo.bodyGoalId,
            isActive: userInfo.isActive
          });
        }

        // Fetch level
        const levelRes = await fetch(`${Config.Account_API}/user-level/${encodeURIComponent(userId)}`, {
          credentials: "include"
        });
        if (levelRes.ok) {
          const levelData = await levelRes.json();
          setUserLevel(levelData);
        }

        // Fetch achievements (optional, if backend supports)
        const achRes = await fetch(`${Config.Account_API}/user-achievements/${encodeURIComponent(userId)}`, {
          credentials: "include"
        });
        if (achRes.ok) {
          const achData = await achRes.json();
          setAchievements(Array.isArray(achData) ? achData : []);
        }
      } catch (err) {
        // Handle error
      }
    };
    fetchProfileAndLevel();
  }, []);


  // Helper to map bodyGoalId to label
  const getBodyGoalLabel = (id?: number) => {
    if (id === 1) return 'Lose Weight';
    if (id === 2) return 'Maintain Weight';
    if (id === 3) return 'Gain Weight';
    return 'Not set';
  };

  // Calculate requiredXP if not provided by backend
  const computedRequiredXP = userLevel ? (typeof userLevel.requiredXP === 'number' ? userLevel.requiredXP : userLevel.level * 100) : 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.bigLevelNumberContainer}>
                <Text style={styles.bigLevelNumber}>
                  {userLevel && typeof userLevel.level === 'number' ? userLevel.level : 0}
                </Text>
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'WellNū User'}
              </Text>
              <Text style={styles.userLevel}>
                {userLevel && userLevel.title ? userLevel.title : 'No Title'}
              </Text>
              <Text style={styles.xpText}>
                {userLevel && typeof userLevel.currentXP === 'number' ? userLevel.currentXP.toLocaleString() : '0'} XP
              </Text>
              {/* XP Progress Bar and Level Info */}
              <View style={styles.levelProgressContainer}>
                <View style={styles.levelProgressBar}>
                  <View
                    style={[ 
                      styles.levelProgressFill,
                      { width: `${Math.min(100, (userLevel && typeof userLevel.currentXP === 'number' ? userLevel.currentXP : 0) / computedRequiredXP * 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.levelProgressText}>
                  {(userLevel && typeof userLevel.currentXP === 'number' ? userLevel.currentXP : 0)}/{computedRequiredXP} XP to Level {(userLevel && typeof userLevel.level === 'number' ? userLevel.level + 1 : 1)}
                </Text>
              </View>
            </View>
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
                {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>⚧️</Text>
                <Text style={styles.infoLabel}>Gender</Text>
              </View>
              <Text style={styles.infoValue}>{getGenderDisplay(profile?.gender)}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>🎂</Text>
                <Text style={styles.infoLabel}>Age</Text>
              </View>
              <Text style={styles.infoValue}>{profile?.age ? `${profile.age} years` : 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>⚖️</Text>
                <Text style={styles.infoLabel}>Weight</Text>
              </View>
              <Text style={styles.infoValue}>{profile?.weight ? `${profile.weight} kg` : 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📏</Text>
                <Text style={styles.infoLabel}>Height</Text>
              </View>
              <Text style={styles.infoValue}>{profile?.height ? `${profile.height} cm` : 'Not set'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}> 
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>🎯</Text>
                <Text style={styles.infoLabel}>Goal</Text>
              </View>
              <Text style={styles.infoValue}>{getBodyGoalLabel(profile?.bodyGoalId)}</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <View style={styles.actionsSection}>
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
        </View>

        {/* Achievements Section (if available) */}
        {achievements.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity style={styles.modernStatCard} onPress={() => setShowAchievementsModal(true)}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statNumber}>{achievements.filter(a => a.unlocked).length}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            backgroundColor="#FCB647"
            textColor="white"
          />
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Achievements Modal */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bigLevelNumberContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCB647',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bigLevelNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
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
