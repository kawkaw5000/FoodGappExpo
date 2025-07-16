import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  id: string;
  type: 'achievement' | 'challenge' | 'milestone' | 'streak' | 'level_up';
  title: string;
  message: string;
  icon: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  actionText?: string;
  actionCallback?: () => void;
}

interface NotificationSystemProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationItemProps {
  notification: NotificationData;
  onPress: (notification: NotificationData) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress, onMarkAsRead }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTypeColor = () => {
    switch (notification.type) {
      case 'achievement': return '#FFD700';
      case 'challenge': return '#4CAF50';
      case 'milestone': return '#2196F3';
      case 'streak': return '#FF5722';
      case 'level_up': return '#9C27B0';
      default: return '#666';
    }
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'achievement': return 'trophy';
      case 'challenge': return 'flag';
      case 'milestone': return 'star';
      case 'streak': return 'flame';
      case 'level_up': return 'arrow-up-circle';
      default: return 'information-circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => onPress(notification)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '20' }]}>
          <Ionicons name={getTypeIcon() as any} size={24} color={getTypeColor()} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(notification.timestamp).toLocaleString()}
          </Text>
        </View>
        
        {!notification.read && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={() => onMarkAsRead(notification.id)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {notification.actionable && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={notification.actionCallback}
        >
          <Text style={styles.actionButtonText}>
            {notification.actionText || 'View'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const NotificationCenter: React.FC<NotificationSystemProps> = ({ visible, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed.sort((a: NotificationData, b: NotificationData) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } else {
        // Demo notifications
        const demoNotifications: NotificationData[] = [
          {
            id: '1',
            type: 'achievement',
            title: '🏆 First Achievement!',
            message: 'You\'ve unlocked your first achievement: "Food Logger"',
            icon: '🏆',
            timestamp: new Date().toISOString(),
            read: false,
          },
          {
            id: '2',
            type: 'streak',
            title: '🔥 5-Day Streak!',
            message: 'Amazing! You\'ve logged food for 5 consecutive days',
            icon: '🔥',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
          },
          {
            id: '3',
            type: 'level_up',
            title: '⭐ Level Up!',
            message: 'Congratulations! You\'ve reached Level 8',
            icon: '⭐',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true,
          },
        ];
        setNotifications(demoNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const updatedNotifications = notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationPress = (notification: NotificationData) => {
    markAsRead(notification.id);
    // Handle specific notification actions based on type
    if (notification.actionCallback) {
      notification.actionCallback();
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || !notif.read
  );

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterTabText, filter === 'unread' && styles.activeFilterTabText]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <View style={styles.actionButtonsContainer}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={markAllAsRead}>
                <Text style={styles.actionButtonSecondaryText}>Mark All Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={clearAllNotifications}>
              <Text style={styles.actionButtonSecondaryText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={handleNotificationPress}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={64} color="#DDD" />
              <Text style={styles.emptyStateTitle}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </Text>
              <Text style={styles.emptyStateMessage}>
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new updates.'
                  : 'Notifications about your progress and achievements will appear here.'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Utility function to add a notification
export const addNotification = async (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
  try {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    const storedNotifications = await AsyncStorage.getItem('notifications');
    const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    notifications.unshift(newNotification);
    
    // Keep only the latest 50 notifications
    const trimmedNotifications = notifications.slice(0, 50);
    
    await AsyncStorage.setItem('notifications', JSON.stringify(trimmedNotifications));
    
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
};

// Utility function to get unread count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const storedNotifications = await AsyncStorage.getItem('notifications');
    if (storedNotifications) {
      const notifications: NotificationData[] = JSON.parse(storedNotifications);
      return notifications.filter(notif => !notif.read).length;
    }
    return 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  closeButton: {
    padding: 4,
  },
  
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  
  activeFilterTab: {
    backgroundColor: '#4CAF50',
  },
  
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  activeFilterTabText: {
    color: 'white',
  },
  
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  actionButtonSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  
  actionButtonSecondaryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  textContainer: {
    flex: 1,
  },
  
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  
  markReadButton: {
    padding: 4,
  },
  
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyStateMessage: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

export default NotificationCenter;
