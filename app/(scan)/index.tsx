import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import CustomButton from "@/components/buttons/CustomButton";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentScan {
  id: string;
  name: string;
  confidence: number;
  calories: number;
  scannedDate: string;
  image?: string;
}

interface ScanStats {
  totalScans: number;
  accurateScans: number;
  weeklyScans: number;
  favoriteCategory: string;
}

export default function ScanScreen() {
  const router = useRouter();
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [scanStats, setScanStats] = useState<ScanStats>({
    totalScans: 47,
    accurateScans: 43,
    weeklyScans: 12,
    favoriteCategory: "Filipino Dishes"
  });
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const scansData = await AsyncStorage.getItem('recentScans');
      if (scansData) {
        setRecentScans(JSON.parse(scansData));
      } else {
        setRecentScans([]);
      }
    } catch (error) {
      console.error('Error loading recent scans:', error);
      setRecentScans([]);
    }
  };

  const handleQuickScan = () => {
    router.push("/(scan)/scan");
  };



  const clearRecentScans = () => {
    Alert.alert(
      "Clear Recent Scans",
      "Are you sure you want to clear all recent scans?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recentScans');
              setRecentScans([]);
            } catch (error) {
              console.error('Error clearing scans:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Image 
                source={require("../../assets/images/Dashboard Icons/Scan_Highlight.png")} 
                style={styles.headerImage} 
              />
              <View style={styles.headerText}>
                <Text style={styles.title}>Smart Food Scanner</Text>
                <Text style={styles.subtitle}>AI-powered food recognition</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.statsButton} onPress={() => setShowStatsModal(true)}>
              <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.primaryActionCard} onPress={handleQuickScan}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="camera" size={32} color="white" />
              </View>
              <Text style={styles.actionTitle}>Scan Food</Text>
              <Text style={styles.actionSubtitle}>Point camera at your food</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>Your Scan Stats</Text>
            <TouchableOpacity onPress={() => setShowStatsModal(true)}>
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{scanStats.totalScans}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{Math.round((scanStats.accurateScans / scanStats.totalScans) * 100)}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{scanStats.weeklyScans}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.recentScansSection}>
          <View style={styles.recentScansHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            {recentScans.length > 0 && (
              <TouchableOpacity onPress={clearRecentScans}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentScans.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScansContainer}>
              {recentScans.map((scan) => (
                <View key={scan.id} style={styles.recentScanCard}>
                  <View style={styles.recentScanImageContainer}>
                    <Ionicons name="restaurant" size={32} color="#4CAF50" />
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>{scan.confidence}%</Text>
                    </View>
                  </View>
                  <Text style={styles.recentScanName} numberOfLines={2}>{scan.name}</Text>
                  <Text style={styles.recentScanCalories}>{scan.calories} cal</Text>
                  <Text style={styles.recentScanDate}>
                    {new Date(scan.scannedDate).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyRecentScans}>
              <Ionicons name="scan" size={48} color="#DDD" />
              <Text style={styles.emptyRecentScansText}>No recent scans</Text>
              <Text style={styles.emptyRecentScansSubtext}>Start scanning to see your history here</Text>
            </View>
          )}
        </View>

        {/* Scanning Tips */}
        <View style={styles.tipsSection}>
          <TouchableOpacity style={styles.tipsCard} onPress={() => setShowTipsModal(true)}>
            <View style={styles.tipsIconContainer}>
              <Ionicons name="bulb" size={24} color="#FFB000" />
            </View>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Scanning Tips</Text>
              <Text style={styles.tipsSubtitle}>Get better scan results</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Stats Modal */}
      <Modal visible={showStatsModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Statistics</Text>
            <TouchableOpacity onPress={() => setShowStatsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.statDetailCard}>
              <Text style={styles.statDetailTitle}>📊 Overall Performance</Text>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Total Scans</Text>
                <Text style={styles.statDetailValue}>{scanStats.totalScans}</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Accurate Scans</Text>
                <Text style={styles.statDetailValue}>{scanStats.accurateScans}</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Accuracy Rate</Text>
                <Text style={styles.statDetailValue}>
                  {Math.round((scanStats.accurateScans / scanStats.totalScans) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.statDetailCard}>
              <Text style={styles.statDetailTitle}>📅 Recent Activity</Text>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>This Week</Text>
                <Text style={styles.statDetailValue}>{scanStats.weeklyScans} scans</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Daily Average</Text>
                <Text style={styles.statDetailValue}>{Math.round(scanStats.weeklyScans / 7)} scans</Text>
              </View>
              <View style={styles.statDetailRow}>
                <Text style={styles.statDetailLabel}>Favorite Category</Text>
                <Text style={styles.statDetailValue}>{scanStats.favoriteCategory}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Tips Modal */}
      <Modal visible={showTipsModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scanning Tips</Text>
            <TouchableOpacity onPress={() => setShowTipsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>📱</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Good Lighting</Text>
                <Text style={styles.tipDescription}>
                  Ensure your food is well-lit. Natural light works best for accurate recognition.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🎯</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Center the Food</Text>
                <Text style={styles.tipDescription}>
                  Place the food item in the center of your camera frame for better detection.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>📏</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Proper Distance</Text>
                <Text style={styles.tipDescription}>
                  Hold your phone 6-12 inches away from the food for optimal scanning.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🍽️</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Single Items</Text>
                <Text style={styles.tipDescription}>
                  For best results, scan one food item at a time rather than mixed dishes.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🔄</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Multiple Angles</Text>
                <Text style={styles.tipDescription}>
                  If the first scan isn't accurate, try scanning from different angles.
                </Text>
              </View>
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

  // Header Section
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

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 16,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
  },

  statsButton: {
    width: 44,
    height: 44,
    backgroundColor: "#F0F8F0",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },

  actionsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },

  primaryActionCard: {
    maxWidth: 300,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  actionIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },

  secondaryActionCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8F5E8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  secondaryActionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#F0F8F0",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  secondaryActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    textAlign: "center",
  },

  secondaryActionSubtitle: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },

  // Stats Section
  statsSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  viewMoreText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  // Recent Scans Section
  recentScansSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  recentScansHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  clearText: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "500",
  },

  recentScansContainer: {
    paddingLeft: 4,
  },

  recentScanCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  recentScanImageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 8,
  },

  confidenceBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  confidenceText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },

  recentScanName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },

  recentScanCalories: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },

  recentScanDate: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },

  emptyRecentScans: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  emptyRecentScansText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
    marginTop: 12,
  },

  emptyRecentScansSubtext: {
    fontSize: 14,
    color: "#CCC",
    textAlign: "center",
    marginTop: 4,
  },

  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  tipsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  tipsIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  tipsContent: {
    flex: 1,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },

  tipsSubtitle: {
    fontSize: 13,
    color: "#666",
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

  // Stat Detail Cards
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

  // Tip Cards
  tipCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  tipIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 4,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  tipDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
