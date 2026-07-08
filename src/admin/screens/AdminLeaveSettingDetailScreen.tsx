import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LeaveSettingDetail {
  id: string;
  policyId: string;
  name: string;
  type: string;
  description: string;
  days: string;
  carryForward: string;
  maxCarryForward: string;
  minNoticeDays: string;
  applicableTo: string;
  payType: string;
  documentRequired: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminLeaveSettingDetailScreenProps {
  leaveId?: string;
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

export default function AdminLeaveSettingDetailScreen({
  leaveId,
  onBack,
  onNavigate,
}: AdminLeaveSettingDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const [leave, setLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leaveId) {
      fetchLeaveDetail();
    } else {
      setLoading(false);
    }
  }, [leaveId]);

  const fetchLeaveDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/LeaveSetting/${leaveId}`);
      
      if (response.data && response.data.status) {
        const item = response.data.data;
        const fetchedLeave = {
          id: item.leaveId ? item.leaveId.toString() : leaveId,
          policyId: item.leaveCode ? item.leaveCode.trim() : '',
          name: item.leaveName ? item.leaveName.trim() : '',
          type: 'Standard',
          description: item.leaveDescription || '',
          remarks: (item.remarks === 'NULL' || !item.remarks) ? '-' : item.remarks,
          days: item.days ? `${item.days} Days` : '0 Days',
          carryForward: 'No',
          maxCarryForward: '—',
          minNoticeDays: '—',
          applicableTo: 'All Employees',
          payType: 'Full Pay',
          documentRequired: 'No',
          effectiveFrom: '01 Jan 2026',
          effectiveTo: '31 Dec 2026',
          status: 'Active',
          icon: 'calendar-blank-outline',
          iconColor: '#0284C7',
          iconBg: '#E0F2FE',
        };
        setLeave(fetchedLeave);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to fetch leave details');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await storageService.clearAuthData();
        onNavigate?.('login');
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'Leave details not found (404).');
      } else if (error.response?.status === 500) {
        Alert.alert('Error', 'Internal server error (500). Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert('Error', 'Request timeout. Please check your connection.');
      } else if (error.message === 'Network Error' || !error.response) {
        Alert.alert('Error', 'No internet connection or network error.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!leave) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Leave policy not found.
        </Text>
      </View>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    Active:  { bg: colors.successBg, text: colors.success },
    Pending: { bg: colors.amberBg,   text: colors.amber },
    Inactive:{ bg: colors.iconBg,    text: colors.textSecond },
  };
  const sc = statusColors[leave.status] ?? { bg: colors.iconBg, text: colors.textSecond };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Leave Policy Details</Text>
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
            <View style={[styles.heroIcon, { backgroundColor: leave.iconBg }]}>
              <MaterialCommunityIcons name={leave.icon as any} size={30} color={leave.iconColor} />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{leave.name}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>Policy ID: {leave.policyId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                <Text style={[styles.statusText, { color: sc.text }]}>{leave.status}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="calendar-check-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Days / Year</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{leave.days}</Text>
              </View>
            </View>
            <View style={[styles.pillDivider, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Type</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{leave.type}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Policy Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="file-document-outline" title="Policy Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Policy Name" value={leave.name} />
          <Divider />
          <InfoRow label="Policy ID" value={leave.policyId} />
          <Divider />
          <InfoRow label="Remarks" value={leave.remarks} />
          <Divider />
          <InfoRow label="Leave Type" value={leave.type} />
          <Divider />
          <InfoRow label="Pay Type" value={leave.payType} />
          <Divider />
          <InfoRow label="Applicable To" value={leave.applicableTo} />
        </View>

        {/* ── Entitlement ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-range-outline" title="Entitlement & Rules" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Days Per Year" value={leave.days} />
          <Divider />
          <InfoRow label="Carry Forward" value={leave.carryForward} />
          <Divider />
          <InfoRow label="Max Carry Forward" value={leave.maxCarryForward} />
          <Divider />
          <InfoRow label="Min Notice Period" value={leave.minNoticeDays} />
          <Divider />
          <InfoRow label="Document Required" value={leave.documentRequired} />
        </View>

        {/* ── Validity ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="clock-outline" title="Validity Period" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Effective From" value={leave.effectiveFrom} />
          <Divider />
          <InfoRow label="Effective To" value={leave.effectiveTo} />
          <Divider />
          <InfoRow label="Status" value={leave.status} />
        </View>

        {/* ── Description ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="note-text-outline" title="Description" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.descText, { color: colors.textSecond }]}>{leave.description}</Text>
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_leave_settings', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="calendar-check-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Leave</Text>
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1,
  },
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

  section: { borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', letterSpacing: 0.2 },
  sectionDivider: { height: 1, marginBottom: 4 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1.5, textAlign: 'right' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9' },

  descText: { fontSize: 13, lineHeight: 20, fontWeight: '400', paddingBottom: 14, paddingTop: 4 },

  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
