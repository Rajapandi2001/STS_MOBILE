import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdminUserGroupsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const USER_GROUPS_DATA = [
  {
    id: '1',
    name: 'ADMIN',
    groupId: 'UGP-001',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
  },
  {
    id: '2',
    name: 'EMPLOYEE',
    groupId: 'UGP-002',
    color: '#F0FDF4',
    iconColor: '#16A34A',
  },
  {
    id: '3',
    name: 'HR',
    groupId: 'UGP-003',
    color: '#FAF5FF',
    iconColor: '#9333EA',
  },
  {
    id: '4',
    name: 'DIRECTOR',
    groupId: 'UGP-004',
    color: '#FFF7ED',
    iconColor: '#EA580C',
  },
];

export default function AdminUserGroupsScreen({ onNavigate, onBack }: AdminUserGroupsScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredGroups = USER_GROUPS_DATA.filter((group) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      group.name.toLowerCase().includes(query) ||
      group.groupId.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack?.()}>
          <Feather name="arrow-left" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Groups</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>AP</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search User Groups by Name or ID..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Section Header */}
        <Text style={styles.sectionHeader}>USER GROUPS INDEX</Text>

        {/* User Groups List */}
        {filteredGroups.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.cardMainRow}>
              <View style={[styles.iconContainer, { backgroundColor: group.color }]}>
                <MaterialCommunityIcons name="account-group" size={24} color={group.iconColor} />
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupIdText}>Group ID: {group.groupId}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color="#64748B" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color="#64748B" />
          <Text style={styles.tabText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color="#64748B" />
          <Text style={styles.tabText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bell" size={22} color="#64748B" />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard', { menuOpen: true })}>
          <Feather name="grid" size={22} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  groupIdText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Bottom Tab Bar */
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    color: '#64748B',
    fontWeight: '500',
  },
});
