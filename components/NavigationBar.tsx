import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleSheet, Animated, Dimensions } from 'react-native';

interface NavItem {
  name: string;
  route: string;
  icon: ImageSourcePropType;
  highlight: ImageSourcePropType;
}

interface BottomNavBarProps {
  NavImg: () => NavItem[];
  currentRoute: string;
  handleNav: (route: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ NavImg, currentRoute, handleNav }) => {
  const animationValues = useRef<Record<string, Animated.Value>>({});
  const navItems = NavImg();
  const screenWidth = Dimensions.get('window').width;
  const indicatorWidth = screenWidth / navItems.length;

  // Initialize animation values for each nav item
  useEffect(() => {
    navItems.forEach((item) => {
      if (!animationValues.current[item.name]) {
        animationValues.current[item.name] = new Animated.Value(0);
      }
    });
  }, [navItems]);

  // Helper function to check if current route matches the nav item
  const isRouteActive = (navRoute: string, currentPath: string) => {
    // Normalize both routes: remove parentheses, leading/trailing slashes
    const normalize = (str: string) => str.replace(/[()]/g, '').replace(/\/$/, '').replace(/^\//, '');
    const nav = normalize(navRoute);
    const curr = normalize(currentPath);
    // Match if equal or if current path starts with nav route (for nested)
    return curr === nav || curr.startsWith(nav + '/');
  };

  // Get active index for indicator position
  const getActiveIndex = () => {
    return navItems.findIndex(item => isRouteActive(item.route, currentRoute));
  };

  const activeIndex = getActiveIndex();
  const indicatorPosition = useRef(new Animated.Value(activeIndex * indicatorWidth)).current;

  // Animate indicator position when route changes
  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeIndex * indicatorWidth,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeIndex, indicatorPosition, indicatorWidth]);

  // Animate icon press
  const handlePressIn = (itemName: string) => {
    if (animationValues.current[itemName]) {
      Animated.spring(animationValues.current[itemName], {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 4,
      }).start();
    }
  };

  const handlePressOut = (itemName: string) => {
    if (animationValues.current[itemName]) {
      Animated.spring(animationValues.current[itemName], {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 4,
      }).start();
    }
  };

  const handleNavPress = (route: string, itemName: string) => {
    handlePressOut(itemName);
    handleNav(route);
  };

  return (
    <View style={styles.container}>
      {/* Active Indicator */}
      <Animated.View 
        style={[
          styles.activeIndicator,
          {
            width: indicatorWidth * 0.6,
            left: indicatorPosition.interpolate({
              inputRange: [0, screenWidth],
              outputRange: [indicatorWidth * 0.2, screenWidth - (indicatorWidth * 0.2)],
              extrapolate: 'clamp',
            }),
          }
        ]} 
      />
      
      {/* Navigation Items */}
      <View style={styles.bottomBar}>
        {navItems.map((item, index) => {
          const isActive = isRouteActive(item.route, currentRoute);
          const animatedValue = animationValues.current[item.name] || new Animated.Value(0);
          // Add testID for automation and accessibility
          return (
            <TouchableOpacity
              key={item.name}
              testID={`nav-tab-${item.name.toLowerCase()}`}
              accessibilityLabel={`nav-tab-${item.name.toLowerCase()}`}
              style={styles.iconButton}
              onPress={() => handleNavPress(item.route, item.name)}
              onPressIn={() => handlePressIn(item.name)}
              onPressOut={() => handlePressOut(item.name)}
              activeOpacity={0.8}
            >
              {/* ...no highlight bar... */}
              <Animated.View 
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      {
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.9],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={isActive ? item.highlight : item.icon}
                  style={[styles.icon, isActive && styles.activeIcon, isActive && { tintColor: '#FCB647' }]}
                />
              </Animated.View>
              <Animated.Text
                style={[
                  styles.iconLabel,
                  isActive && styles.iconLabelActive,
                  {
                    opacity: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.7],
                    }),
                  },
                ]}
              >
                {item.name}
              </Animated.Text>
              {isActive && (
                <Animated.View 
                  style={[
                    styles.activeDot,
                    {
                      opacity: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.6],
                      }),
                    }
                  ]} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    backgroundColor: "#FCB647",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  
  iconButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
  },
  
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  

  // ...existing code...
  
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  
  activeIcon: {
    width: 32,
    height: 32,
  },
  
  iconLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  
  iconLabelActive: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FCB647",
    marginTop: 2,
  },
});
