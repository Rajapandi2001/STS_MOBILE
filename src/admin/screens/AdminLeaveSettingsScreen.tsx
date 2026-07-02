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
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

interface AdminLeaveSettingsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const LEAVE_DATA = [
  {
    id: '1',
    name: 'ANNUAL LEAVE',
    policyId: 'AL-2026',
    type: 'Paid',
    description: 'Vacation Block',
    days: '18 Days',
    icon: 'island',
    iconType: 'MaterialCommunityIcons',
    color: '#FEF3C7',
    iconColor: '#D97706',
    status: 'Active',
  },
  {
    id: '2',
    name: 'MEDICAL LEAVE',
    policyId: 'ML-2026',
    type: 'Sick',
    description: 'Allocation Block',
    days: '12 Days',
    icon: 'hospital-building',
    iconType: 'MaterialCommunityIcons',
    color: '#FEE2E2',
    iconColor: '#DC2626',
    status: 'Active',
  },
  {
    id: '3',
    name: 'MATERNITY LEAVE',
    policyId: 'MAT-2026',
    type: 'Parental',
    description: 'Care Block',
    days: '24 Days',
    icon: 'baby-bottle-outline',
    iconType: 'MaterialCommunityIcons',
    color: '#E0F2FE',
    iconColor: '#0284C7',
    status: 'Active',
  },
  {
    id: '4',
    name: 'CASUAL LEAVE',
    policyId: 'CL-2026',
    type: 'Contingency',
    description: 'Contingency Allocation',
    days: '08 Days',
    icon: 'email-outline',
    iconType: 'MaterialCommunityIcons',
    color: '#F1F5F9',
    iconColor: '#475569',
    status: 'Pending',
  },
];

export default function AdminLeaveSettingsScreen({ onNavigate, onBack }: AdminLeaveSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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

  const filteredLeaves = LEAVE_DATA.filter((leave) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      leave.name.toLowerCase().includes(query) ||
      leave.policyId.toLowerCase().includes(query) ||
      leave.description.toLowerCase().includes(query) ||
      leave.type.toLowerCase().includes(query)
    );
  });

  const renderIcon = (leave: typeof LEAVE_DATA[0]) => {
    if (leave.iconType === 'MaterialCommunityIcons') {
      return (
        <MaterialCommunityIcons
          name={leave.icon as any}
          size={24}
          color={leave.iconColor}
        />
      );
    }
    return <Feather name={leave.icon as any} size={24} color={leave.iconColor} />;
  };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Leave Settings</Text>
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
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search leave parameters or limits..."
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
        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>STAFF LEAVE SETTINGS LEDGER</Text>

        {/* Leave List */}
        {filteredLeaves.map((leave) => {
          return (
            <TouchableOpacity
              key={leave.id}
              activeOpacity={0.8}
              onPress={() => onNavigate?.('admin_leave_setting_detail', { leaveId: leave.id })}
              style={[styles.leaveCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardInfoRow}>
                  <View style={[styles.iconContainer, { backgroundColor: leave.color }]}>
                    {renderIcon(leave)}
                  </View>
                  <View>
                    <Text style={[styles.leaveName, { color: colors.textPrimary }]}>{leave.name}</Text>
                    <Text style={[styles.policyText, { color: colors.textSecond }]}>Policy ID: {leave.policyId}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.leaveDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.leaveDetailsRow}>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Type</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{leave.type}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Days/Year</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{leave.days}</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                {renderStatusBadge(leave.status)}
              </View>
            </TouchableOpacity>
          );
        })}
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

        <TouchableOpacity style={styles.tabItem}>
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
  leaveCard: {
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
  leaveName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  policyText: {
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
  leaveDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  leaveDetailsRow: {
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
