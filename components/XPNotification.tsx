import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface XPNotificationProps {
  visible: boolean;
  xpGained: number;
  reason: string;
  isLevelUp?: boolean;
  newLevel?: number;
  isConsecutiveBonus?: boolean;
  consecutiveDays?: number;
  onAnimationComplete: () => void;
}

const XPNotification = ({
  visible,
  xpGained,
  reason,
  isLevelUp = false,
  newLevel,
  isConsecutiveBonus = false,
  consecutiveDays = 0,
  onAnimationComplete,
}: XPNotificationProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Slide down and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);
      onAnimationComplete();
    });
  };

  if (!visible) return null;

  const getNotificationStyle = () => {
    if (isLevelUp) {
      return {
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        icon: 'trophy' as any,
        iconColor: '#FFD700',
      };
    } else if (isConsecutiveBonus) {
      return {
        backgroundColor: '#FF9800',
        borderColor: '#F57C00',
        icon: 'flame' as any,
        iconColor: '#FF5722',
      };
    } else {
      return {
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        icon: 'add-circle' as any,
        iconColor: '#00E676',
      };
    }
  };

  const style = getNotificationStyle();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.notification,
            {
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={style.icon} size={24} color={style.iconColor} />
          </View>
          
          <View style={styles.content}>
            {isLevelUp ? (
              <>
                <Text style={styles.titleText}>LEVEL UP! 🎉</Text>
                <Text style={styles.levelText}>Level {newLevel}</Text>
                <Text style={styles.xpText}>+{xpGained} XP</Text>
              </>
            ) : (
              <>
                <Text style={styles.titleText}>
                  {isConsecutiveBonus ? `${consecutiveDays} Day Streak! 🔥` : reason}
                </Text>
                <Text style={styles.xpText}>+{xpGained} XP</Text>
                {isConsecutiveBonus && (
                  <Text style={styles.bonusText}>Streak Bonus!</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{xpGained}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 15,
    borderWidth: 2,
    padding: 16,
    marginHorizontal: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  levelText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  xpText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  bonusText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  xpBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default XPNotification;
