/**
 * Jest Setup Configuration for WellNū Testing
 */

import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
    },
    requestCameraPermissionsAsync: jest.fn(() => 
      Promise.resolve({ status: 'granted' })
    ),
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(),
      })),
    },
  };
});

// Global test utilities
global.testUtils = {
  createMockUserExperience: (overrides = {}) => ({
    deviceId: 'test_device',
    level: 1,
    totalXP: 0,
    dailyLogin: {
      lastLoginDate: '',
      consecutiveDays: 0,
      totalLogins: 0,
      hasLoggedInToday: false,
    },
    achievements: [],
    unlockedAchievements: [],
    stats: {
      totalFoodsLogged: 0,
      totalScans: 0,
      totalDaysActive: 0,
      streakRecord: 0,
      favoriteFoods: [],
      nutritionGoalsAchieved: 0,
      exerciseSessionsLogged: 0,
      socialSharesCount: 0,
    },
    createdDate: new Date(),
    lastActiveDate: new Date(),
    ...overrides,
  }),

  createMockNutritionData: (overrides = {}) => ({
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 65,
    iron: 15,
    vitaminC: 75,
    calcium: 1000,
    vitaminA: 800,
    fiber: 25,
    sodium: 2000,
    sugar: 40,
    ...overrides,
  }),

  createMockFoodLog: (overrides = {}) => ({
    id: 'test_food_1',
    name: 'Test Food',
    calories: 200,
    protein: 10,
    carbs: 30,
    fat: 5,
    createdAt: new Date().toISOString(),
    mealType: 'lunch',
    ...overrides,
  }),
};

// Console log suppression for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('React DevTools')) {
    return;
  }
  originalConsoleError(...args);
};
