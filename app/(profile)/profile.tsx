


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LevelBadge from '../../components/LevelBadge';
import { calculateBMI, getBMICategory, getCalorieRecommendations } from '../../utils/bmiCalculator';
import Config from '../../constants/Config';

// Helper function to convert integer gender to display string
const getGenderDisplay = (gender: number | null | undefined): string => {
  if (gender === 0) return 'Male';
  if (gender === 1) return 'Female';
  if (gender === 2) return 'Others';
  return '-';
};



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
        const profileRes = await fetch(`${Config.Account_API}/getProfile?userId=${encodeURIComponent(storedUserId)}`, {
          credentials: "include"
        });
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileRes.json();
        console.log('Profile API Response:', profileData); // Debug log
        
        // Handle nested response structure (userInfo might be nested)
        const userInfo = profileData.userInfo || profileData;
        setProfile(userInfo);

        // Fetch user level
        const levelRes = await fetch(`${Config.Account_API}/user-level/${storedUserId}`, {
          credentials: "include"
        });
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
              <Text style={styles.infoLabel}>Gender: <Text style={styles.infoValue}>{getGenderDisplay(profile.gender)}</Text></Text>
              <Text style={styles.infoLabel}>Age: <Text style={styles.infoValue}>{profile.age ? `${profile.age} years` : '-'}</Text></Text>
              <Text style={styles.infoLabel}>Weight: <Text style={styles.infoValue}>{profile.weight ? `${profile.weight} kg` : '-'}</Text></Text>
              <Text style={styles.infoLabel}>Height: <Text style={styles.infoValue}>{profile.height ? `${profile.height} cm` : '-'}</Text></Text>
              {(() => {
                const bmi = calculateBMI(profile.weight, profile.height);
                if (bmi === 0) return <Text style={styles.infoLabel}>BMI: <Text style={styles.infoValue}>-</Text></Text>;
                
                const bmiParams = {
                  weight: profile.weight,
                  height: profile.height,
                  age: profile.age,
                  gender: profile.gender != null ? profile.gender : 0, // Use integer gender: 0 = Male, 1 = Female, 2 = Others
                  activityLevel: 'moderate' as const
                };
                
                const bmiResult = getBMICategory(bmi, profile.gender, bmiParams);
                const calorieRecs = profile.age ? getCalorieRecommendations(bmiParams, bmi) : null;
                
                return (
                  <View style={styles.bmiSection}>
                    <Text style={styles.infoLabel}>
                      BMI: <Text style={[styles.infoValue, { color: bmiResult.categoryColor }]}>
                        {bmiResult.bmi} ({bmiResult.category})
                      </Text>
                    </Text>
                    
                    {calorieRecs && (
                      <View style={styles.calorieRecommendations}>
                        <Text style={styles.calorieTitle}>Daily Calorie Goals:</Text>
                        <Text style={styles.calorieGoal}>
                          • Maintain: <Text style={styles.calorieValue}>{calorieRecs.goals.maintain.calories} cal</Text>
                        </Text>
                        <Text style={styles.calorieGoal}>
                          • Lose Weight: <Text style={styles.calorieValue}>{calorieRecs.goals.loseWeight.calories} cal</Text>
                        </Text>
                        <Text style={styles.calorieGoal}>
                          • Gain Weight: <Text style={styles.calorieValue}>{calorieRecs.goals.gainWeight.calories} cal</Text>
                        </Text>
                        <Text style={styles.bmiGuidance}>
                          Recommended: {calorieRecs.bmiGuidance.focus}
                        </Text>
                      </View>
                    )}
                    
                    {bmiResult.recommendations && bmiResult.recommendations.length > 0 && (
                      <View style={styles.recommendations}>
                        <Text style={styles.recommendationTitle}>Health Recommendations:</Text>
                        {bmiResult.recommendations.map((rec, index) => (
                          <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })()}
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
  bmiSection: {
    marginVertical: 8,
  },
  calorieRecommendations: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  calorieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  calorieGoal: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  calorieValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bmiGuidance: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  recommendations: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    lineHeight: 16,
  },
});