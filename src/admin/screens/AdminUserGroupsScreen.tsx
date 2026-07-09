import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';
import apiClient from '@/api/apiClient';
import { storageService } from '@/services/storageService';

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
    status: 'Active',
    members: '15 Members',
    accessType: 'Super Admin',
  },
  {
    id: '2',
    name: 'EMPLOYEE',
    groupId: 'UGP-002',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    status: 'Active',
    members: '124 Members',
    accessType: 'Standard Access',
  },
  {
    id: '3',
    name: 'HR',
    groupId: 'UGP-003',
    color: '#FAF5FF',
    iconColor: '#9333EA',
    status: 'Active',
    members: '8 Members',
    accessType: 'HR Access',
  },
  {
    id: '4',
    name: 'DIRECTOR',
    groupId: 'UGP-004',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    status: 'Pending',
    members: '4 Members',
    accessType: 'Executive Access',
  },
];

export default function AdminUserGroupsScreen({ onNavigate, onBack }: AdminUserGroupsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/UserGroup');
      if (response.data && response.data.status) {
        const fetchedGroups = (response.data.data || []).map((item: any, index: number) => {
          const colorsList = [
            { bg: '#EFF6FF', icon: '#0A52D6' }, // blue
            { bg: '#F0FDF4', icon: '#16A34A' }, // green
            { bg: '#FAF5FF', icon: '#9333EA' }, // purple
            { bg: '#FFF7ED', icon: '#EA580C' }, // orange
          ];
          const colorPair = colorsList[index % colorsList.length];
          return {
            id: item.groupID ? item.groupID.toString() : Math.random().toString(),
            name: item.groupName ? item.groupName.trim() : 'N/A',
            groupId: item.groupCode ? item.groupCode.trim() : 'N/A',
            color: colorPair.bg,
            iconColor: colorPair.icon,
            status: 'Active',
            members: item.totalStaff !== undefined ? `${item.totalStaff} Members` : '0 Members',
            accessType: `${item.groupName ? item.groupName.trim() : 'Standard'} Access`,
          };
        });
        setGroups(fetchedGroups);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to fetch user groups.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await storageService.clearAuthData();
        onNavigate?.('login');
      } else {
        Alert.alert('Error', 'An unexpected error occurred while fetching user groups.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    let bgColor = colors.successBg;
    let textColor = colors.success;
    if (status === 'Inactive') {
      bgColor = colors.iconBg;
      textColor = colors.textSecond;
    } else if (status === 'Pending') {
      bgColor = colors.amberBg;
      textColor = colors.amber;
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: textColor }]} />
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const filteredGroups = groups.filter((group) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      group.name.toLowerCase().includes(query) ||
      group.groupId.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>User Groups</Text>
        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
          activeOpacity={0.8}
          onPress={() => onNavigate?.('admin_profile', { source: 'header' })}
        >
          <Feather name="user" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
          Manage user groups and their assigned access levels.
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search User Groups by Name or ID..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color={colors.textSecond} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Section Header */}
        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>USER GROUPS INDEX</Text>

        {/* User Groups List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 20 }} />
        ) : filteredGroups.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecond, marginTop: 20 }}>No user groups found.</Text>
        ) : (
          filteredGroups.map((group) => {
            return (
              <TouchableOpacity
                key={group.id}
                activeOpacity={0.8}
                onPress={() => {
                  onNavigate?.('admin_user_group_detail', { groupID: parseInt(group.id) || group.id });
                }}
                style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardInfoRow}>
                    <View style={[styles.iconContainer, { backgroundColor: group.color }]}>
                      <MaterialCommunityIcons name="account-group" size={24} color={group.iconColor} />
                    </View>
                    <View>
                      <Text style={[styles.groupName, { color: colors.textPrimary }]}>{group.name}</Text>
                      <Text style={[styles.groupIdText, { color: colors.textSecond }]}>Group ID: {group.groupId}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.groupDivider, { backgroundColor: colors.borderLight }]} />

                <View style={styles.groupDetailsRow}>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Access Level</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{group.accessType}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Total Members</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{group.members}</Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  {renderStatusBadge(group.status)}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_reports')}>
          <Feather name="bar-chart-2" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      <AdminMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
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
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
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
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 12,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfoRow: {
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
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  groupIdText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0A52D6',
    borderColor: '#0A52D6',
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  groupDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
