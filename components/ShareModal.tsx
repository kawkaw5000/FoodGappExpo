import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

const ShareModal = ({ visible, onClose }: ShareModalProps) => {
  const handleShare = (platform: string) => {
    // Simulate sharing to different platforms
    alert(`Sharing to ${platform}!`);
    setTimeout(() => {
      // Show success message
      alert('Successfully shared!');
      onClose();
    }, 1000);
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
            <Text style={styles.dateText}>May 29, 2025</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>362</Text>
                <Text style={styles.summaryLabel}>cal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>1,925</Text>
                <Text style={styles.summaryLabel}>kcal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>1,563</Text>
                <Text style={styles.summaryLabel}>kcal</Text>
              </View>
            </View>
            <View style={styles.macrosRow}>
              <Text style={styles.macroText}>Protein 31g</Text>
              <Text style={styles.macroText}>Fats 27g</Text>
              <Text style={styles.macroText}>Carbs 2g</Text>
            </View>
          </View>

          <View style={styles.platformsContainer}>
            <TouchableOpacity 
              style={styles.platformButton} 
              onPress={() => handleShare('Facebook')}
            >
              <Ionicons name="logo-facebook" size={40} color="#1877F2" />
              <Text style={styles.platformText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.platformButton} 
              onPress={() => handleShare('Instagram')}
            >
              <Ionicons name="logo-instagram" size={40} color="#E4405F" />
              <Text style={styles.platformText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.platformButton} 
              onPress={() => handleShare('Twitter')}
            >
              <Ionicons name="logo-twitter" size={40} color="#1DA1F2" />
              <Text style={styles.platformText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.platformButton} 
              onPress={() => handleShare('WhatsApp')}
            >
              <Ionicons name="logo-whatsapp" size={40} color="#25D366" />
              <Text style={styles.platformText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
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
    width: '35%',
  },
  platformText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ShareModal;
