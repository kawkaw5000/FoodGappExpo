


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LevelBadge from '../../components/LevelBadge';



export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [userLevel, setUserLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndLevel = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) throw new Error('User not logged in.');

        // Fetch profile
        const profileRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL || ''}/account/getProfile?userId=${encodeURIComponent(storedUserId)}`);
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch user level
        const levelRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL || ''}/account/user-level/${storedUserId}`);
        if (!levelRes.ok) throw new Error('Failed to fetch user level');
        const levelData = await levelRes.json();
        setUserLevel(levelData);
      } catch (e: any) {
        setError(e.message || 'Could not load profile or user level.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndLevel();
  }, []);


  // Helper for body goal
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>User Profile</Text>
          {userLevel && (
            <View style={styles.levelPanel}>
              <LevelBadge
                level={userLevel.level}
                badge={userLevel.badge}
                title={userLevel.title}
                size="large"
              />
              <Text style={styles.levelText}>Level {userLevel.level} - {userLevel.title}</Text>
              <Text style={styles.xpText}>{userLevel.currentXP?.toLocaleString()} XP</Text>
            </View>
          )}
          {profile && (
            <View style={styles.infoPanel}>
              <Text style={styles.infoLabel}>Name: <Text style={styles.infoValue}>{profile.firstName} {profile.lastName}</Text></Text>
              <Text style={styles.infoLabel}>Email: <Text style={styles.infoValue}>{profile.email}</Text></Text>
              <Text style={styles.infoLabel}>Age: <Text style={styles.infoValue}>{profile.age ? `${profile.age} years` : '-'}</Text></Text>
              <Text style={styles.infoLabel}>Weight: <Text style={styles.infoValue}>{profile.weight ? `${profile.weight} kg` : '-'}</Text></Text>
              <Text style={styles.infoLabel}>Height: <Text style={styles.infoValue}>{profile.height ? `${profile.height} cm` : '-'}</Text></Text>
              <Text style={styles.infoLabel}>Goal: <Text style={styles.infoValue}>{bodyGoalLabel(profile.bodyGoalId)}</Text></Text>
              <Text style={styles.infoLabel}>Joined: <Text style={styles.infoValue}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</Text></Text>
            </View>
          )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerBadge: {
    marginLeft: 20,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 10,
    width: 100,
  },
  profileValue: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
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
  panel: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 18,
    textAlign: 'center',
  },
  levelPanel: {
    alignItems: 'center',
    marginBottom: 18,
  },
  levelText: {
    fontSize: 18,
    color: '#333',
    marginTop: 8,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 16,
    color: '#FCB647',
    marginTop: 2,
    fontWeight: 'bold',
  },
  infoPanel: {
    marginTop: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  infoValue: {
    fontWeight: 'normal',
    color: '#222',
  },
});