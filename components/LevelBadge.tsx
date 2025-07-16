import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserExperienceService, { UserLevel, Achievement, UserExperience } from '../services/UserExperienceService';

interface LevelBadgeProps {
  level: number;
  badge: string;
  title: string;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onPress?: () => void;
}

interface LevelModalProps {
  visible: boolean;
  onClose: () => void;
  userLevel: UserLevel;
  totalXP: number;
  progress: number;
  consecutiveDays: number;
  achievements: Achievement[];
  userExperience: UserExperience;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  badge,
  title,
  size = 'medium',
  showDetails = false,
  onPress,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { container: 40, text: 12, badge: 16 };
      case 'large':
        return { container: 80, text: 16, badge: 24 };
      default:
        return { container: 60, text: 14, badge: 20 };
    }
  };

  const sizes = getSize();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: sizes.container, height: sizes.container },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.badgeCircle}>
        <Text style={[styles.badgeEmoji, { fontSize: sizes.badge }]}>{badge}</Text>
        <View style={styles.levelIndicator}>
          <Text style={[styles.levelText, { fontSize: sizes.text - 2 }]}>{level}</Text>
        </View>
      </View>
      {showDetails && (
        <Text style={[styles.titleText, { fontSize: sizes.text - 2 }]} numberOfLines={2}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const LevelModal: React.FC<LevelModalProps> = ({
  visible,
  onClose,
  userLevel,
  totalXP,
  progress,
  consecutiveDays,
  achievements,
  userExperience,
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnimation, {
          toValue: progress,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      progressAnimation.setValue(0);
      scaleAnimation.setValue(0.9);
    }
  }, [visible, progress]);

  const achievementInfo = {
    week_warrior: { title: '7-Day Warrior', icon: '🔥', description: 'Logged in for 7 consecutive days' },
    month_master: { title: 'Monthly Master', icon: '💪', description: 'Logged in for 30 consecutive days' },
    login_legend: { title: 'Login Legend', icon: '👑', description: 'Completed 100 total logins' },
    food_explorer: { title: 'Food Explorer', icon: '🍽️', description: 'Logged 50 different foods' },
    macro_master: { title: 'Macro Master', icon: '📊', description: 'Hit macro goals 10 times' },
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnimation }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Level Progress</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Level Display */}
            <View style={styles.currentLevelContainer}>
              <LevelBadge
                level={userLevel.level}
                badge={userLevel.badge}
                title={userLevel.title}
                size="large"
                showDetails={true}
              />
              <View style={styles.levelDetails}>
                <Text style={styles.currentLevelText}>Level {userLevel.level}</Text>
                <Text style={styles.titleLarge}>{userLevel.title}</Text>
                <Text style={styles.xpText}>{totalXP.toLocaleString()} Total XP</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}% to Level {userLevel.level + 1}
              </Text>
              <Text style={styles.xpProgressText}>
                {totalXP - userLevel.currentXP} / {userLevel.requiredXP - userLevel.currentXP} XP
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={20} color="#FCB647" />
                <Text style={styles.statValue}>{consecutiveDays}</Text>
                <Text style={styles.statLabel}>Consecutive Days</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={20} color="#FCB647" />
                <Text style={styles.statValue}>{achievements.length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color="#FCB647" />
                <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
            </View>

            {/* Achievements */}
            {achievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                <Text style={styles.sectionTitle}>🏆 Achievements</Text>
                {achievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementItem}>
                    <Text style={styles.achievementIcon}>{achievement.badge}</Text>
                    <View style={styles.achievementText}>
                      <Text style={styles.achievementTitle}>{achievement.name}</Text>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                      <Text style={styles.achievementXP}>+{achievement.xpReward} XP</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Local Statistics */}
            <View style={styles.localStatsContainer}>
              <Text style={styles.sectionTitle}>📊 Your Local Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userExperience.stats.totalFoodsLogged}</Text>
                  <Text style={styles.statLabel}>Foods Logged</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userExperience.stats.totalScans}</Text>
                  <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userExperience.stats.streakRecord}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userExperience.stats.nutritionGoalsAchieved}</Text>
                  <Text style={styles.statLabel}>Goals Met</Text>
                </View>
              </View>
            </View>

            {/* XP Earning Guide */}
            <View style={styles.xpGuideContainer}>
              <Text style={styles.sectionTitle}>💡 Earn XP by:</Text>
              <View style={styles.xpGuideItem}>
                <Text style={styles.xpGuideIcon}>🌅</Text>
                <Text style={styles.xpGuideText}>Daily Login: 500 XP + streak bonus</Text>
              </View>
              <View style={styles.xpGuideItem}>
                <Text style={styles.xpGuideIcon}>📱</Text>
                <Text style={styles.xpGuideText}>Scanning Food: 75 XP</Text>
              </View>
              <View style={styles.xpGuideItem}>
                <Text style={styles.xpGuideIcon}>📝</Text>
                <Text style={styles.xpGuideText}>Logging Food: 50 XP</Text>
              </View>
              <View style={styles.xpGuideItem}>
                <Text style={styles.xpGuideIcon}>🍽️</Text>
                <Text style={styles.xpGuideText}>Complete Meal: 100 XP</Text>
              </View>
              <View style={styles.xpGuideItem}>
                <Text style={styles.xpGuideIcon}>🏃</Text>
                <Text style={styles.xpGuideText}>Exercise Log: 150 XP</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCircle: {
    backgroundColor: '#FCB647',
    borderRadius: 30,
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeEmoji: {
    color: 'white',
  },
  levelIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  titleText: {
    marginTop: 4,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  
  // Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  levelDetails: {
    marginLeft: 20,
    flex: 1,
  },
  currentLevelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCB647',
  },
  titleLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FCB647',
    borderRadius: 4,
    shadowColor: '#FCB647',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  xpProgressText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  localStatsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FCB647',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  achievementXP: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  xpGuideContainer: {
    marginBottom: 10,
  },
  xpGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  xpGuideIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  xpGuideText: {
    fontSize: 14,
    color: '#333',
  },
});

export { LevelBadge, LevelModal };
export default LevelBadge;
