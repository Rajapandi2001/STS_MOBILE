import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export type AdminTab = 'home' | 'staff' | 'reports';

export interface AdminBottomTabNavigatorProps {
  activeTab: AdminTab;
  onTabPress: (tab: AdminTab) => void;
}

export default function AdminBottomTabNavigator({
  activeTab,
  onTabPress,
}: AdminBottomTabNavigatorProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bottomTabBar,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: colors.tabBar,
          borderTopColor: colors.borderLight,
        },
      ]}
    >
      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('home')}>
        <Feather
          name="home"
          size={20}
          color={activeTab === 'home' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'home' ? colors.brand : colors.tabInactive },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('staff')}>
        <Feather
          name="users"
          size={20}
          color={activeTab === 'staff' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'staff' ? colors.brand : colors.tabInactive },
          ]}
        >
          Staff
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('reports')}>
        <Feather
          name="file-text"
          size={20}
          color={activeTab === 'reports' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'reports' ? colors.brand : colors.tabInactive },
          ]}
        >
          Reports
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
