// Backup of the original profile.tsx before syntax cleanup
/*
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LevelBadge from '../../components/LevelBadge';

function bodyGoalLabel(bodyGoalId: number | undefined): string {
  switch (bodyGoalId) {
    case 1:
      return 'Lose Weight';
    case 2:
      return 'Maintain Weight';
    case 3:
      return 'Gain Weight';
    default:
      return 'Not set';
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [userLevel, setUserLevel] = useState<any>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const renderUserStats = () => {
    if (!userLevel) return null;
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
            <Text style={styles.xpText}>{userLevel.currentXP?.toLocaleString()} XP</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userLevel && userLevel.currentXP && userLevel.nextLevelXP ? (userLevel.currentXP / userLevel.nextLevelXP) * 100 : 0}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {userLevel && userLevel.currentXP && userLevel.nextLevelXP ? Math.round((userLevel.currentXP / userLevel.nextLevelXP) * 100) : 0}% to Level {userLevel.level + 1}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={20} color="#FCB647" />
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="log-in" size={20} color="#4CAF50" />
          <Text style={styles.statLabel}>Total Logins</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={20} color="#FF9800" />
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        <View style={styles.loginStatusContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.loginStatusText}>Logged in today! ✨</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View>
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
          {renderUserStats()}
          <View style={styles.profileInfo}>
            <View style={styles.profileRow}>
              <Ionicons name="person" size={24} color="#FCB647" />
              <Text style={styles.profileLabel}>Name:</Text>
              <Text style={styles.profileValue}>{profile?.firstName} {profile?.lastName}</Text>
            </View>
            <View style={styles.profileRow}>
              <Ionicons name="body" size={24} color="#4CAF50" />
              <Text style={styles.profileLabel}>Body Goal:</Text>
              <Text style={styles.profileValue}>{bodyGoalLabel(profile?.bodyGoal)}</Text>
            </View>
            <View style={styles.profileRow}>
              <Ionicons name="calendar" size={24} color="#FF9800" />
              <Text style={styles.profileLabel}>Joined:</Text>
              <Text style={styles.profileValue}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    marginLeft: 20,
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  levelText: {
    fontSize: 16,
    color: '#888',
    marginTop: 2,
  },
  xpText: {
    fontSize: 16,
    color: '#FCB647',
    marginTop: 2,
  },
  progressBarContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    backgroundColor: '#FCB647',
    borderRadius: 5,
  },
  progressText: {
    marginTop: 4,
    fontSize: 14,
    color: '#888',
    textAlign: 'right',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  loginStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  loginStatusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
  },
});
*/