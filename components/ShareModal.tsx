import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SocialSharingService, { ShareData } from '../services/SocialSharingService';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  shareData?: ShareData;
}

const ShareModal = ({ visible, onClose, shareData }: ShareModalProps) => {
  const [sharing, setSharing] = useState(false);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      loadAvailablePlatforms();
    }
  }, [visible]);

  const loadAvailablePlatforms = async () => {
    const platforms = await SocialSharingService.getAvailablePlatforms();
    setAvailablePlatforms(platforms);
  };

  const defaultShareData: ShareData = {
    calories: 362,
    goal: 1925,
    remaining: 1563,
    protein: 31,
    fats: 27,
    carbs: 2,
    date: new Date().toLocaleDateString(),
  };

  const data = shareData || defaultShareData;

  const handleShare = async (platform: string) => {
    if (sharing) return;
    
    setSharing(true);
    let success = false;

    try {
      switch (platform) {
        case 'facebook':
          success = await SocialSharingService.shareToFacebook(data);
          break;
        case 'twitter':
          success = await SocialSharingService.shareToTwitter(data);
          break;
        case 'instagram':
          success = await SocialSharingService.shareToInstagram(data);
          break;
        case 'whatsapp':
          success = await SocialSharingService.shareToWhatsApp(data);
          break;
        case 'linkedin':
          success = await SocialSharingService.shareToLinkedIn(data);
          break;
        case 'clipboard':
          success = await SocialSharingService.copyToClipboard(data);
          break;
        case 'generic':
          success = await SocialSharingService.shareGeneric(data);
          break;
        default:
          Alert.alert('Error', 'Platform not supported');
      }

      if (success) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const platformConfig = {
    facebook: { icon: 'logo-facebook', color: '#1877F2', label: 'Facebook' },
    twitter: { icon: 'logo-twitter', color: '#1DA1F2', label: 'Twitter' },
    instagram: { icon: 'logo-instagram', color: '#E4405F', label: 'Instagram' },
    whatsapp: { icon: 'logo-whatsapp', color: '#25D366', label: 'WhatsApp' },
    linkedin: { icon: 'logo-linkedin', color: '#0077B5', label: 'LinkedIn' },
    clipboard: { icon: 'copy', color: '#666', label: 'Copy Text' },
    generic: { icon: 'share', color: '#333', label: 'More Options' },
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Share Progress</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSummary}>
            <Text style={styles.dateText}>{data.date}</Text>
            {data.userName && (
              <View style={styles.userInfo}>
                <Text style={styles.userNameText}>{data.userName}</Text>
                {data.level && (
                  <Text style={styles.levelText}>Level {data.level} {data.badge}</Text>
                )}
              </View>
            )}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{data.calories}</Text>
                <Text style={styles.summaryLabel}>cal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{data.goal.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>kcal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{data.remaining.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>kcal</Text>
              </View>
            </View>
            <View style={styles.macrosRow}>
              <Text style={styles.macroText}>Protein {data.protein}g</Text>
              <Text style={styles.macroText}>Fats {data.fats}g</Text>
              <Text style={styles.macroText}>Carbs {data.carbs}g</Text>
            </View>
          </View>

          <View style={styles.platformsContainer}>
            {availablePlatforms.map((platform) => {
              const config = platformConfig[platform as keyof typeof platformConfig];
              if (!config) return null;

              return (
                <TouchableOpacity 
                  key={platform}
                  style={[
                    styles.platformButton,
                    sharing && styles.platformButtonDisabled
                  ]} 
                  onPress={() => handleShare(platform)}
                  disabled={sharing}
                >
                  <Ionicons 
                    name={config.icon as any} 
                    size={40} 
                    color={sharing ? '#ccc' : config.color} 
                  />
                  <Text style={[
                    styles.platformText,
                    sharing && styles.platformTextDisabled
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {sharing && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Sharing...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
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
  progressSummary: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  levelText: {
    fontSize: 14,
    color: '#FCB647',
    fontWeight: '500',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'gray',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroText: {
    fontSize: 14,
    color: 'gray',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  platformButton: {
    alignItems: 'center',
    padding: 15,
    margin: 10,
    width: '30%',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  platformButtonDisabled: {
    opacity: 0.5,
  },
  platformText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  platformTextDisabled: {
    color: '#ccc',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#FCB647',
    fontWeight: '500',
  },
});

export default ShareModal;
