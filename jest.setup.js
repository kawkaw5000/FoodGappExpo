// ========================================
// MOCK EXPO-ROUTER FIRST (before any imports)
// ========================================
jest.mock('expo-router', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      setParams: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    useGlobalSearchParams: jest.fn(() => ({})),
    useSegments: jest.fn(() => []),
    usePathname: jest.fn(() => '/'),
    useRootNavigationState: jest.fn(() => ({ key: 'root', routeNames: [], routes: [] })),
    useRootNavigation: jest.fn(),
    useUnstableGlobalHref: jest.fn(() => '/'),
    
    Link: jest.fn(({ children, href, ...props }) => 
      React.createElement(Text, { ...props, testID: 'mock-link' }, children)
    ),
    
    Redirect: jest.fn(() => null),
    
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      setParams: jest.fn(),
      navigate: jest.fn(),
    },
    
    Stack: Object.assign(
      jest.fn(({ children }) => React.createElement(View, null, children)),
      {
        Screen: jest.fn(({ children }) => React.createElement(View, null, children)),
      }
    ),
    
    Tabs: Object.assign(
      jest.fn(({ children }) => React.createElement(View, null, children)),
      {
        Screen: jest.fn(({ children }) => React.createElement(View, null, children)),
      }
    ),
    
    Slot: jest.fn(({ children }) => React.createElement(View, null, children)),
    
    Navigator: jest.fn(({ children }) => React.createElement(View, null, children)),
    
    ErrorBoundary: jest.fn(({ children }) => React.createElement(View, null, children)),
  };
});

// ========================================
// MOCK EXPO-FONT
// ========================================
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
  loadAsync: jest.fn(() => Promise.resolve()),
  useFonts: jest.fn(() => [true, null]),
}));

// ========================================
// MOCK @expo/vector-icons
// ========================================
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  
  const MockIcon = ({ name, size, color, ...props }) => 
    React.createElement(Text, { ...props, testID: `icon-${name}` }, name);
  
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    FontAwesome: MockIcon,
    FontAwesome5: MockIcon,
    Feather: MockIcon,
    AntDesign: MockIcon,
    Entypo: MockIcon,
    MaterialCommunityIcons: MockIcon,
    SimpleLineIcons: MockIcon,
    Octicons: MockIcon,
    Foundation: MockIcon,
    EvilIcons: MockIcon,
    Zocial: MockIcon,
    Fontisto: MockIcon,
  };
});

// ========================================
// NOW import everything else
// ========================================
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// AsyncStorage mock
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Alert
import { Alert, Dimensions, PixelRatio, StyleSheet } from 'react-native';
Alert.alert = jest.fn();

// ✅ Properly mock Dimensions to handle screen & window
const mockScreen = { width: 375, height: 812, scale: 2, fontScale: 2 };
const mockWindow = { width: 375, height: 667, scale: 2, fontScale: 2 };

Dimensions.get = jest.fn((dim) => {
  if (dim === 'screen') return mockScreen;
  if (dim === 'window') return mockWindow;
  return mockWindow;
});
Dimensions.addEventListener = jest.fn();
Dimensions.removeEventListener = jest.fn();
Dimensions.set = jest.fn();

// Mock PixelRatio
PixelRatio.get = jest.fn(() => 2);
PixelRatio.getFontScale = jest.fn(() => 2);
PixelRatio.getPixelSizeForLayoutSize = jest.fn((size) => size);
PixelRatio.roundToNearestPixel = jest.fn((size) => size);

// Mock StyleSheet
StyleSheet.create = (styles) => styles;
StyleSheet.flatten = (styles) => styles;
StyleSheet.compose = (...args) => Object.assign({}, ...args.filter(Boolean));
StyleSheet.hairlineWidth = 1;

// Silence console warnings
jest.spyOn(global.console, 'warn').mockImplementation(() => {});
jest.spyOn(global.console, 'error').mockImplementation(() => {});

// Silence NativeAnimated warnings (RN 0.76+)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

// Mock Reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 375, height: 667 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    },
  };
});