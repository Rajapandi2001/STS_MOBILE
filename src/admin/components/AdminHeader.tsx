import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface AdminHeaderProps {
  title?: string;
  onMenuPress: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function AdminHeader({
  title = 'Admin',
  onMenuPress,
  onNotificationPress,
  onProfilePress,
}: AdminHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top || 16,
          backgroundColor: colors.header,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.iconBg }]}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.iconBg, marginRight: 8 }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.iconBg, marginRight: 12 }]}
          activeOpacity={0.7}
          onPress={onNotificationPress}
        >
          <Feather name="bell" size={18} color={colors.brand} />
          <View style={styles.notifDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarWrapper}
          activeOpacity={0.8}
          onPress={onProfilePress}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
