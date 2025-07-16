import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import Config from "@/constants/Config";
import UserExperienceService, { UserExperience } from "@/services/UserExperienceService";
import LevelBadge, { LevelModal } from "@/components/LevelBadge";
import XPNotification from "@/components/XPNotification";

const dashboardIcons = [
  { name: "Log", icon: require("../../assets/images/Dashboard Icons/Food_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Food_Highlight.png"), route: "/(log)" },
  { name: "Track", icon: require("../../assets/images/Dashboard Icons/Track_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Track_Highlight.png"), route: "/(track)" },
  { name: "Home", icon: require("../../assets/images/Dashboard Icons/Home_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Home_Highlight.png"), route: "/(home)" },
  { name: "Scan", icon: require("../../assets/images/Dashboard Icons/Scan_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Scan_Highlight.png"), route: "/(scan)" },
  { name: "Profile", icon: require("../../assets/images/Dashboard Icons/Profile_Nohighlight.png"), highlight: require("../../assets/images/Dashboard Icons/Profile_Highlight.png"), route: "/(profile)" },
];

export default function ProfilePage() {
  const router = useRouter();
  const currentRoute = "/(profile)";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userExperience, setUserExperience] = useState<UserExperience | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  
  // XP Notification states
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpNotificationData, setXPNotificationData] = useState({
    xpGained: 0,
    reason: '',
    isLevelUp: false,
    newLevel: 0,
    isConsecutiveBonus: false,
    consecutiveDays: 0,
  });

  // Extract fetchProfile so it can be called on demand
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
      const userInfoId = await AsyncStorage.getItem('userInfoId');
      console.log('ProfilePage: userId:', userId, 'userInfoId:', userInfoId); // Debug log
      if (!userId) {
        setError("No userId found. Please log in again.");
        setLoading(false);
        return;
      }
      let url = `${Config.Account_API}/getProfile?userId=${encodeURIComponent(userId)}`;
      if (userInfoId) url += `&userInfoId=${encodeURIComponent(userInfoId)}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('ProfilePage: backend response data:', data); // Debug log
      const userInfo = data.userInfo || data;
      setProfile(userInfo);

      // Load user experience data (using device-based local storage)
      const userExp = await UserExperienceService.getUserExperience();
      setUserExperience(userExp);

    } catch (err: any) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const processDailyLogin = async () => {
    try {
      const loginResult = await UserExperienceService.processDailyLogin();
      
      if (loginResult.xpGained > 0) {
        // Show XP notification
        setXPNotificationData({
          xpGained: loginResult.xpGained,
          reason: 'Daily Login',
          isLevelUp: loginResult.leveledUp,
          newLevel: loginResult.newLevel || 0,
          isConsecutiveBonus: loginResult.isConsecutiveBonus,
          consecutiveDays: loginResult.consecutiveDays,
        });
        setShowXPNotification(true);
        
        // Refresh user experience data
        const updatedUserExp = await UserExperienceService.getUserExperience();
        setUserExperience(updatedUserExp);
      }
    } catch (error) {
      console.error('Error processing daily login:', error);
    }
  };

  // Use useFocusEffect to trigger daily login check when the profile screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      processDailyLogin();
    }, [])
  );

  const handleNav = (route: string) => {
    if (route !== currentRoute) router.replace({ pathname: route as any });
  };

  const getLevelProgress = () => {
    if (!userExperience) return { progress: 0, currentLevelXP: 0, nextLevelXP: 1000 };
    return UserExperienceService.getProgressToNextLevel(userExperience.totalXP, userExperience.level);
  };

  const levelProgress = getLevelProgress();
  const userLevel = userExperience ? UserExperienceService.getLevelInfo(userExperience.level) : null;

  const renderUserStats = () => {
    if (!userExperience || !userLevel) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.levelContainer}>
          <TouchableOpacity onPress={() => setShowLevelModal(true)}>
            <LevelBadge
              level={userLevel.level}
              badge={userLevel.badge}
              title={userLevel.title}
              size="large"
              showDetails={true}
            />
          </TouchableOpacity>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{userLevel.title}</Text>
            <Text style={styles.levelText}>Level {userLevel.level}</Text>
            <Text style={styles.xpText}>{userExperience.totalXP.toLocaleString()} XP</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${levelProgress.progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(levelProgress.progress * 100)}% to Level {userLevel.level + 1}
          </Text>
        </View>

        <View style={styles.dailyStatsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={20} color="#FCB647" />
            <Text style={styles.statValue}>{userExperience.dailyLogin.consecutiveDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="log-in" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{userExperience.dailyLogin.totalLogins}</Text>
            <Text style={styles.statLabel}>Total Logins</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color="#FF9800" />
            <Text style={styles.statValue}>{userExperience.unlockedAchievements?.length || 0}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {userExperience.dailyLogin.hasLoggedInToday && (
          <View style={styles.loginStatusContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.loginStatusText}>Logged in today! ✨</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            onPress={() => setShowLevelModal(true)}
            style={styles.headerBadge}
          >
            {userLevel && (
              <LevelBadge
                level={userLevel.level}
                badge={userLevel.badge}
                title={userLevel.title}
                size="small"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* User Experience Stats */}
        {renderUserStats()}

        {/* Profile Information */}
        <View style={styles.profileContainer}>
          <Image source={require("../../assets/images/Dashboard Icons/Profile_Highlight.png")} style={styles.profileImage} />
          
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>First Name:</Text>
                <Text style={styles.infoValue}>{profile?.firstName || "Not set"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Name:</Text>
                <Text style={styles.infoValue}>{profile?.lastName || "Not set"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{profile?.age || "Not set"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{profile?.weight || "Not set"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height:</Text>
                <Text style={styles.infoValue}>{profile?.height || "Not set"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Body Goal:</Text>
                <Text style={styles.infoValue}>{profile?.bodyGoalId || "Not set"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <CustomButton
            title="Edit Profile"
            onPress={() => router.push("../(profile)/editProfile")}
            backgroundColor="#333"
            textColor="white"
          />
          <CustomButton
            title="Get Started"
            onPress={() => {/* Add your logic here */}}
            backgroundColor="#FCB647"
            textColor="white"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        {dashboardIcons.map((item) => (
          <TouchableOpacity key={item.name} style={styles.iconButton} onPress={() => handleNav(item.route)}>
            <Image source={item.route === currentRoute ? item.highlight : item.icon} style={styles.icon} />
            <Text style={[styles.iconLabel, item.route === currentRoute && styles.iconLabelActive]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Level Modal */}
      {userExperience && userLevel && (
        <LevelModal
          visible={showLevelModal}
          onClose={() => setShowLevelModal(false)}
          userLevel={userLevel}
          totalXP={userExperience.totalXP}
          progress={levelProgress.progress}
          consecutiveDays={userExperience.dailyLogin.consecutiveDays}
          achievements={userExperience.unlockedAchievements || []}
          userExperience={userExperience}
        />
      )}

      {/* XP Notification */}
      <XPNotification
        visible={showXPNotification}
        xpGained={xpNotificationData.xpGained}
        reason={xpNotificationData.reason}
        isLevelUp={xpNotificationData.isLevelUp}
        newLevel={xpNotificationData.newLevel}
        isConsecutiveBonus={xpNotificationData.isConsecutiveBonus}
        consecutiveDays={xpNotificationData.consecutiveDays}
        onAnimationComplete={() => setShowXPNotification(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerBadge: {
    // Badge positioning
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelInfo: {
    marginLeft: 20,
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    color: '#FCB647',
    fontWeight: '600',
    marginBottom: 2,
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FCB647',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dailyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  loginStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 8,
  },
  loginStatusText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  profileContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  profileInfo: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    gap: 12,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    position: 'absolute',
    bottom: 0,
  },
  iconButton: { 
    alignItems: "center", 
    flex: 1 
  },
  icon: { 
    width: 32, 
    height: 32, 
    resizeMode: "contain", 
    marginBottom: 2 
  },
  iconLabel: { 
    fontSize: 12, 
    color: "#333" 
  },
  iconLabelActive: { 
    color: "#FCB647", 
    fontWeight: "bold" 
  },
});