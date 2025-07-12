import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, StyleProp, ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';
import { NavImg } from "@/constants/NavImg";
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
  // Helper function to check if current route matches the nav item
  const isRouteActive = (navRoute: string, currentPath: string) => {
    // Remove trailing slashes and normalize
    const normalizedNavRoute = navRoute.replace(/\/$/, '');
    const normalizedCurrentPath = currentPath.replace(/\/$/, '');
    
    // Check if current path starts with the nav route (for nested routes)
    return normalizedCurrentPath === normalizedNavRoute || 
           normalizedCurrentPath.startsWith(normalizedNavRoute + '/');
  };

  return (
    <View style={styles.bottomBar}>
      {NavImg().map((item) => {
        const isActive = isRouteActive(item.route, currentRoute);
        
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.iconButton}
            onPress={() => handleNav(item.route)}
          >
            <Image
              source={isActive ? item.highlight : item.icon}
              style={styles.icon}
            />
            <Text
              style={[
                styles.iconLabel,
                isActive && styles.iconLabelActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  spacer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  iconButton: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 2,
  },
  iconLabel: {
    fontSize: 12,
    color: "#333",
  },
  iconLabelActive: {
    color: "#FCB647",
    fontWeight: "bold",
  },
});
