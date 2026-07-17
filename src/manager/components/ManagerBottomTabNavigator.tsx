import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export type ManagerTab = 'home' | 'team' | 'time' | 'approvals' | 'assets';

export interface ManagerBottomTabNavigatorProps {
  activeTab: ManagerTab;
  onTabPress: (tab: ManagerTab) => void;
}

export default function ManagerBottomTabNavigator({
  activeTab,
  onTabPress,
}: ManagerBottomTabNavigatorProps) {
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

      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('team')}>
        <Feather
          name="users"
          size={20}
          color={activeTab === 'team' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'team' ? colors.brand : colors.tabInactive },
          ]}
        >
          Team
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('time')}>
        <Feather
          name="clock"
          size={20}
          color={activeTab === 'time' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'time' ? colors.brand : colors.tabInactive },
          ]}
        >
          Time
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('approvals')}>
        <Feather
          name="check-circle"
          size={20}
          color={activeTab === 'approvals' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'approvals' ? colors.brand : colors.tabInactive },
          ]}
        >
          Approvals
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('assets')}>
        <Feather
          name="package"
          size={20}
          color={activeTab === 'assets' ? colors.brand : colors.tabInactive}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'assets' ? colors.brand : colors.tabInactive },
          ]}
        >
          Assets
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
    zIndex: 10,
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
