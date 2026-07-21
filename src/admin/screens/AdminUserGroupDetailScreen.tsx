import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';
import apiClient from '@/api/apiClient';
import { storageService } from '@/services/storageService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserGroup {
  id?: number | string;
  groupCode?: string;
  groupName?: string;
  remarks?: string;
  totalStaff?: number;
  [key: string]: any;
}

export interface AdminUserGroupDetailScreenProps {
  groupID?: string | number;
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
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.rowDivider} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminUserGroupDetailScreen({
  groupID,
  onNavigate,
  onBack,
}: AdminUserGroupDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const id = groupID || '1030';
      const response = await apiClient.get(`/UserGroup/${id}`);
      
      if (response.data && response.data.status && response.data.data) {
        setGroup(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to fetch user group details.');
      }
    } catch (err: any) {
      console.error('Error fetching user group details:', err);
      let msg = 'An unexpected error occurred. Please try again later.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'Request timed out. Please try again later.';
      } else if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        msg = 'No internet connection. Please check your network and try again.';
      } else if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          await storageService.clearAuthData();
          onNavigate?.('login');
          return;
        } else if (status === 404) {
          msg = 'User group not found.';
        } else if (status === 500) {
          msg = 'Internal server error (500). Please try again later.';
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetail();
  }, [groupID]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ color: colors.textSecond, marginTop: 12, fontSize: 14 }}>Loading user group details...</Text>
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        <AdminHeader
          title="User Group Details"
          showBackButton={true}
          onBackPress={onBack}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 16, fontSize: 16, fontWeight: '600' }}>
            {error || 'User group not found.'}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.brand,
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20
            }}
            onPress={fetchGroupDetail}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayValue = (val: any) => {
    if (val === null || val === undefined || val === 'NULL' || val === '') {
      return 'N/A';
    }
    return String(val).trim();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar as any} backgroundColor={colors.header} />

      {/* Header */}
      <AdminHeader
        title="User Group Details"
        showBackButton={true}
        onBackPress={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="account-group" size={30} color="#0A52D6" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{displayValue(group.groupName)}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>Code: {displayValue(group.groupCode)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.successBg }]}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
              </View>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="account-multiple-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Members</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>
                  {group.totalStaff !== undefined ? `${group.totalStaff} Members` : '0 Members'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Group Information Card ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="information-outline" title="Group Information" color={colors.brand} />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Group Code" value={displayValue(group.groupCode)} />
          <Divider />
          <InfoRow label="Group Name" value={displayValue(group.groupName)} />
          <Divider />
          <InfoRow label="Access Type" value={`${displayValue(group.groupName)} Access`} />
        </View>

        {/* ── Remarks / Description Card ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="note-text-outline" title="Remarks / Description" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.remarksText, { color: colors.textPrimary }]}>
            {displayValue(group.remarks)}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <AdminBottomTabNavigator
        activeTab={undefined}
        onTabPress={(tab) => {
          if (tab === 'home') {
            onNavigate?.('admin_dashboard');
          } else {
            onNavigate?.(`admin_${tab}`);
          }
        }}
      />

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroId: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
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
  heroDivider: {
    height: 1,
    marginVertical: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pillText: {
    gap: 2,
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionDivider: {
    height: 1,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  remarksText: {
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 10,
    paddingTop: 4,
  },
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
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
