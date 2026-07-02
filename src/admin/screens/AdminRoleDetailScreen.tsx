import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Permission {
  key: string;
  label: string;
  enabled: boolean;
}

interface PermissionGroup {
  module: string;
  icon: string;
  color: string;
  permissions: Permission[];
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string;
  members: string;
  accessLevel: string;
  createdBy: string;
  createdOn: string;
  lastModified: string;
  status: string;
  color: string;
  iconColor: string;
  permissionGroups: PermissionGroup[];
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const ROLE_DETAILS: Record<string, RoleDetail> = {
  'ROLE-001': {
    id: 'ROLE-001',
    name: 'SUPER ADMIN',
    description: 'Full system access with all permissions enabled across every module.',
    members: '3 Members',
    accessLevel: 'Full Access',
    createdBy: 'System',
    createdOn: '01 Jan 2026',
    lastModified: '15 Jun 2026',
    status: 'Active',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
    permissionGroups: [
      { module: 'Dashboard', icon: 'view-dashboard-outline', color: '#2563EB', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }] },
      { module: 'Staff Management', icon: 'account-group-outline', color: '#7C3AED', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }, { key: 'delete', label: 'Delete', enabled: true }] },
      { module: 'Leave Settings', icon: 'calendar-check-outline', color: '#059669', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }, { key: 'approve', label: 'Approve', enabled: true }] },
      { module: 'Projects', icon: 'rocket-launch-outline', color: '#D97706', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }, { key: 'delete', label: 'Delete', enabled: true }] },
      { module: 'Reports', icon: 'chart-bar', color: '#DC2626', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'export', label: 'Export', enabled: true }] },
      { module: 'Roles & Permissions', icon: 'shield-account-outline', color: '#0891B2', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }] },
    ],
  },
  'ROLE-002': {
    id: 'ROLE-002',
    name: 'HR MANAGER',
    description: 'HR operations — staff management, leave processing and payroll visibility.',
    members: '8 Members',
    accessLevel: 'HR Access',
    createdBy: 'Admin',
    createdOn: '01 Jan 2026',
    lastModified: '10 May 2026',
    status: 'Active',
    color: '#FAF5FF',
    iconColor: '#9333EA',
    permissionGroups: [
      { module: 'Dashboard', icon: 'view-dashboard-outline', color: '#2563EB', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: false }] },
      { module: 'Staff Management', icon: 'account-group-outline', color: '#7C3AED', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Leave Settings', icon: 'calendar-check-outline', color: '#059669', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }, { key: 'approve', label: 'Approve', enabled: true }] },
      { module: 'Projects', icon: 'rocket-launch-outline', color: '#D97706', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Reports', icon: 'chart-bar', color: '#DC2626', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'export', label: 'Export', enabled: true }] },
      { module: 'Roles & Permissions', icon: 'shield-account-outline', color: '#0891B2', permissions: [{ key: 'view', label: 'View', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }] },
    ],
  },
  'ROLE-003': {
    id: 'ROLE-003',
    name: 'EMPLOYEE',
    description: 'Standard employee self-service access — view own records, apply leave.',
    members: '124 Members',
    accessLevel: 'Limited Access',
    createdBy: 'Admin',
    createdOn: '01 Jan 2026',
    lastModified: '01 Mar 2026',
    status: 'Active',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    permissionGroups: [
      { module: 'Dashboard', icon: 'view-dashboard-outline', color: '#2563EB', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: false }] },
      { module: 'Staff Management', icon: 'account-group-outline', color: '#7C3AED', permissions: [{ key: 'view', label: 'View', enabled: false }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Leave Settings', icon: 'calendar-check-outline', color: '#059669', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'approve', label: 'Approve', enabled: false }] },
      { module: 'Projects', icon: 'rocket-launch-outline', color: '#D97706', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Reports', icon: 'chart-bar', color: '#DC2626', permissions: [{ key: 'view', label: 'View', enabled: false }, { key: 'export', label: 'Export', enabled: false }] },
      { module: 'Roles & Permissions', icon: 'shield-account-outline', color: '#0891B2', permissions: [{ key: 'view', label: 'View', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }] },
    ],
  },
  'ROLE-004': {
    id: 'ROLE-004',
    name: 'PROJECT MANAGER',
    description: 'Project and team management — create projects, manage assignments.',
    members: '12 Members',
    accessLevel: 'Project Access',
    createdBy: 'Admin',
    createdOn: '15 Feb 2026',
    lastModified: '01 Jun 2026',
    status: 'Active',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    permissionGroups: [
      { module: 'Dashboard', icon: 'view-dashboard-outline', color: '#2563EB', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: false }] },
      { module: 'Staff Management', icon: 'account-group-outline', color: '#7C3AED', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Leave Settings', icon: 'calendar-check-outline', color: '#059669', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'approve', label: 'Approve', enabled: true }] },
      { module: 'Projects', icon: 'rocket-launch-outline', color: '#D97706', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: true }, { key: 'edit', label: 'Edit', enabled: true }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Reports', icon: 'chart-bar', color: '#DC2626', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'export', label: 'Export', enabled: true }] },
      { module: 'Roles & Permissions', icon: 'shield-account-outline', color: '#0891B2', permissions: [{ key: 'view', label: 'View', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }] },
    ],
  },
  'ROLE-005': {
    id: 'ROLE-005',
    name: 'DIRECTOR',
    description: 'Executive read and approval rights across all modules.',
    members: '4 Members',
    accessLevel: 'Executive Access',
    createdBy: 'Admin',
    createdOn: '01 Jan 2026',
    lastModified: '20 Apr 2026',
    status: 'Pending',
    color: '#FEF3C7',
    iconColor: '#D97706',
    permissionGroups: [
      { module: 'Dashboard', icon: 'view-dashboard-outline', color: '#2563EB', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: false }] },
      { module: 'Staff Management', icon: 'account-group-outline', color: '#7C3AED', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Leave Settings', icon: 'calendar-check-outline', color: '#059669', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'approve', label: 'Approve', enabled: true }] },
      { module: 'Projects', icon: 'rocket-launch-outline', color: '#D97706', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'create', label: 'Create', enabled: false }, { key: 'edit', label: 'Edit', enabled: false }, { key: 'delete', label: 'Delete', enabled: false }] },
      { module: 'Reports', icon: 'chart-bar', color: '#DC2626', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'export', label: 'Export', enabled: true }] },
      { module: 'Roles & Permissions', icon: 'shield-account-outline', color: '#0891B2', permissions: [{ key: 'view', label: 'View', enabled: true }, { key: 'edit', label: 'Edit', enabled: false }] },
    ],
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminRoleDetailScreenProps {
  roleId?: string;
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.rowDivider} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminRoleDetailScreen({
  roleId,
  onBack,
  onNavigate,
}: AdminRoleDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = roleId ? ROLE_DETAILS[roleId] : ROLE_DETAILS['ROLE-001'];

  if (!role) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Role not found.
        </Text>
      </View>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    Active:  { bg: colors.successBg, text: colors.success },
    Pending: { bg: colors.amberBg,   text: colors.amber },
    Inactive:{ bg: colors.iconBg,    text: colors.textSecond },
  };
  const sc = statusColors[role.status] ?? { bg: colors.iconBg, text: colors.textSecond };

  const totalPerms = role.permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0);
  const enabledPerms = role.permissionGroups.reduce((acc, g) => acc + g.permissions.filter(p => p.enabled).length, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Role Details</Text>
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
        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: role.color }]}>
              <MaterialCommunityIcons name="shield-account" size={30} color={role.iconColor} />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{role.name}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {role.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                <Text style={[styles.statusText, { color: sc.text }]}>{role.status}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="account-multiple-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Members</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{role.members}</Text>
              </View>
            </View>
            <View style={[styles.pillDivider, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Permissions</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{enabledPerms} / {totalPerms}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Role Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="shield-account-outline" title="Role Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Role Name" value={role.name} />
          <Divider />
          <InfoRow label="Role ID" value={role.id} />
          <Divider />
          <InfoRow label="Access Level" value={role.accessLevel} />
          <Divider />
          <InfoRow label="Total Members" value={role.members} />
        </View>

        {/* ── Audit Info ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="clock-outline" title="Audit Information" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Created By" value={role.createdBy} />
          <Divider />
          <InfoRow label="Created On" value={role.createdOn} />
          <Divider />
          <InfoRow label="Last Modified" value={role.lastModified} />
          <Divider />
          <InfoRow label="Status" value={role.status} />
        </View>

        {/* ── Description ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="note-text-outline" title="Description" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.descText, { color: colors.textSecond }]}>{role.description}</Text>
        </View>

        {/* ── Permissions by Module ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="shield-check-outline" title="Module Permissions" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          {role.permissionGroups.map((group, gIdx) => (
            <View key={group.module}>
              {gIdx > 0 && <View style={[styles.groupDivider, { backgroundColor: colors.borderLight }]} />}
              <View style={styles.moduleRow}>
                <View style={[styles.moduleIconWrap, { backgroundColor: group.color + '22' }]}>
                  <MaterialCommunityIcons name={group.icon as any} size={16} color={group.color} />
                </View>
                <Text style={[styles.moduleName, { color: colors.textPrimary }]}>{group.module}</Text>
              </View>
              <View style={styles.permissionsWrap}>
                {group.permissions.map((perm) => (
                  <View key={perm.key} style={[styles.permRow, { borderColor: colors.borderLight }]}>
                    <Text style={[styles.permLabel, { color: colors.textSecond }]}>{perm.label}</Text>
                    <View style={[styles.permIndicator, { backgroundColor: perm.enabled ? colors.successBg : colors.iconBg }]}>
                      <MaterialCommunityIcons
                        name={perm.enabled ? 'check-circle' : 'close-circle'}
                        size={16}
                        color={perm.enabled ? colors.success : colors.textSecond}
                      />
                      <Text style={[styles.permStatus, { color: perm.enabled ? colors.success : colors.textSecond }]}>
                        {perm.enabled ? 'Allowed' : 'Denied'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_roles_permissions')}>
          <MaterialCommunityIcons name="shield-account-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Roles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Staff</Text>
        </TouchableOpacity>
      </View>

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  heroCard: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  heroId: { fontSize: 12, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  heroDivider: { height: 1, marginVertical: 16 },
  pillsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pillText: { gap: 2 },
  pillLabel: { fontSize: 11, fontWeight: '500' },
  pillValue: { fontSize: 13, fontWeight: '700' },
  pillDivider: { width: 1, height: 36 },

  section: { borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', letterSpacing: 0.2 },
  sectionDivider: { height: 1, marginBottom: 4 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1.5, textAlign: 'right' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9' },

  descText: { fontSize: 13, lineHeight: 20, paddingBottom: 10, paddingTop: 4 },

  // Module permissions
  groupDivider: { height: 1, marginVertical: 10 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 4 },
  moduleIconWrap: { width: 28, height: 28, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  moduleName: { fontSize: 13, fontWeight: '700' },
  permissionsWrap: { gap: 6, marginBottom: 4 },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  permLabel: { fontSize: 13, fontWeight: '500' },
  permIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  permStatus: { fontSize: 12, fontWeight: '600' },

  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
