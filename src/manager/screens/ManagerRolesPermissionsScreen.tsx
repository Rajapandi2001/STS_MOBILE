import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ManagerMenu from '@/manager/components/ManagerMenu';

interface ManagerRolesPermissionsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const ROLES_DATA = [
  {
    id: 'ROLE-001',
    name: 'SUPER ADMIN',
    description: 'Full system access with all permissions',
    members: '3 Members',
    permissionsCount: '48 / 48',
    accessLevel: 'Full Access',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
    status: 'Active',
  },
  {
    id: 'ROLE-002',
    name: 'HR MANAGER',
    description: 'HR operations, leave & staff management',
    members: '8 Members',
    permissionsCount: '32 / 48',
    accessLevel: 'HR Access',
    color: '#FAF5FF',
    iconColor: '#9333EA',
    status: 'Active',
  },
  {
    id: 'ROLE-003',
    name: 'EMPLOYEE',
    description: 'Standard employee self-service access',
    members: '124 Members',
    permissionsCount: '10 / 48',
    accessLevel: 'Limited Access',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    status: 'Active',
  },
  {
    id: 'ROLE-004',
    name: 'PROJECT MANAGER',
    description: 'Project and team management permissions',
    members: '12 Members',
    permissionsCount: '26 / 48',
    accessLevel: 'Project Access',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    status: 'Active',
  },
  {
    id: 'ROLE-005',
    name: 'DIRECTOR',
    description: 'Executive-level read and approval rights',
    members: '4 Members',
    permissionsCount: '20 / 48',
    accessLevel: 'Executive Access',
    color: '#FEF3C7',
    iconColor: '#D97706',
    status: 'Pending',
  },
];

export default function ManagerRolesPermissionsScreen({
  onNavigate,
  onBack,
}: ManagerRolesPermissionsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredRoles = ROLES_DATA.filter((role) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      role.name.toLowerCase().includes(query) ||
      role.id.toLowerCase().includes(query) ||
      role.accessLevel.toLowerCase().includes(query)
    );
  });

  const renderStatusBadge = (status: string) => {
    const bgColor = status === 'Active' ? colors.successBg : colors.amberBg;
    const textColor = status === 'Active' ? colors.success : colors.amber;
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: textColor }]} />
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
            <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Roles & Permissions</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.iconBg || colors.cardAlt, marginRight: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.iconBg || colors.cardAlt, marginRight: 12 }]} 
            activeOpacity={0.7}
            onPress={() => Alert.alert('Notifications', 'No new notifications')}
          >
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('manager_profile', { source: 'header' })}
          >
            <Feather name="user" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
          Search roles and configure user permissions.
        </Text>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search roles or access levels..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionLabel, { color: colors.textSecond }]}>ROLES & ACCESS REGISTRY</Text>

        {/* Role Cards */}
        {filteredRoles.map((role) => (
          <TouchableOpacity
            key={role.id}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('manager_role_detail', { roleId: role.id })}
            style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.roleIconWrap, { backgroundColor: role.color }]}>
                <MaterialCommunityIcons name="shield-account" size={24} color={role.iconColor} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleName, { color: colors.textPrimary }]}>{role.name}</Text>
                <Text style={[styles.roleId, { color: colors.textSecond }]}>ID: {role.id}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textSecond} />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.cardMeta}>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, { color: colors.textSecond }]}>Members</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{role.members}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, { color: colors.textSecond }]}>Permissions</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{role.permissionsCount}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, { color: colors.textSecond }]}>Access</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{role.accessLevel.split(' ')[0]}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              {renderStatusBadge(role.status)}
              <Text style={[styles.roleDesc, { color: colors.textSecond }]} numberOfLines={1}>{role.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard')}>
          <Feather name="home" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <Feather name="users" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Team</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('attendance_history')}>
          <Feather name="clock" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'approvals' })}>
          <Feather name="check-square" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Approvals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_assets')}>
          <Feather name="package" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Assets</Text>
        </TouchableOpacity>
      </View>

      <ManagerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444' },
  iconButton: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 48, marginTop: 8, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  divider: { height: 1, marginVertical: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 16 },

  roleCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  roleId: { fontSize: 12, fontWeight: '500' },
  cardDivider: { height: 1, marginVertical: 12 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 11, marginBottom: 3 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleDesc: { flex: 1, fontSize: 12, fontWeight: '400' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },

  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
