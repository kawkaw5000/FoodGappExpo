import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleSheet, Animated } from 'react-native';

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
    console.log(`Checking "${navRoute}" vs "${currentPath}"`);
    
    // Direct match first
    if (currentPath === navRoute) {
      console.log(`Direct match found`);
      return true;
    }
    
    // Extract the core route name without parentheses
    const extractRouteCore = (route: string): string => {
      const match = route.match(/\(([^)]+)\)/);
      return match ? match[1] : route.replace(/[\/()]/g, '');
    };
    
    const navCore = extractRouteCore(navRoute);
    const pathCore = extractRouteCore(currentPath);
    
    console.log(`Core comparison: "${navCore}" vs "${pathCore}"`);
    
    // Check if path contains the nav route core
    if (pathCore === navCore || currentPath.includes(navCore)) {
      console.log(`Core match found`);
      return true;
    }
    
    // Special case for home route
    if (navRoute === '/(home)' && (currentPath === '/' || currentPath === '/index' || currentPath === '')) {
      console.log(`Home route match`);
      return true;
    }
    
    console.log(`No match found`);
    return false;
  };

  // Get active index for indicator position
  const getActiveIndex = () => {
    console.log(`=== Navigation Debug ===`);
    console.log(`Current route: "${currentRoute}"`);
    
    let activeIndex = -1;
    navItems.forEach((item, index) => {
      const isActive = isRouteActive(item.route, currentRoute);
      console.log(`${index}: ${item.name} (${item.route}) - Active: ${isActive}`);
      if (isActive && activeIndex === -1) {
        activeIndex = index;
      }
    });
    
    console.log(`Final active index: ${activeIndex}`);
    console.log(`========================`);
    
    // Return the found index, or -1 if no match
    return activeIndex;
  };

  const activeIndex = getActiveIndex();

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
                  style={[
                    styles.icon, 
                    isActive && styles.activeIcon
                  ]}
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
    color: "#FCB647",
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
