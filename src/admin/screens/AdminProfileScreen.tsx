import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';

interface AdminProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function AdminProfileScreen({ onNavigate, onBack }: AdminProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* ── Header ── */}
      <AdminHeader
        title="Profile"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('admin_alerts')}
        onProfilePress={() => {}}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar Card ── */}
        <View style={[styles.avatarCard, { backgroundColor: colors.card }]}>
          {/* Avatar */}
          <View style={styles.avatarOuter}>
            <View style={[styles.avatarInner, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}>
              <MaterialCommunityIcons name="account" size={60} color={colors.brand} />
            </View>
          </View>
          {/* Details */}
          <View style={styles.avatarDetails}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.displayName || 'ADMIN'}</Text>
            <Text style={[styles.profileUsername, { color: colors.textSecond }]}>{user?.userName || 'admin@cybervault.in'}</Text>
            <Text style={[styles.profileId, { color: colors.brand }]}>Employee ID : {user?.empID || '2100'}</Text>
            <View style={[styles.activeChip, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.activeText, { color: colors.successText }]}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* ══ Security ══ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security</Text>
          </View>

          <TouchableOpacity style={styles.securityRow} activeOpacity={0.7}>
            <View style={styles.securityLeft}>
              <View style={[styles.securityIconBg, { backgroundColor: colors.iconBg }]}>
                <Feather name="lock" size={16} color={colors.brand} />
              </View>
              <View>
                <Text style={[styles.securityLabel, { color: colors.textPrimary }]}>Change Password</Text>
                <Text style={[styles.securitySub, { color: colors.textSecond }]}>Last changed 30 days ago</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
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

      <AdminMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0F172A', marginHorizontal: 8 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Scroll */
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },

  /* Avatar Card */
  avatarCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 36, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, shadowColor: '#0A52D6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  avatarOuter: { position: 'relative' },
  avatarInner: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#DBEAFE' },
  avatarDetails: { justifyContent: 'center', flex: 1 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  profileRole: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  profileUsername: { fontSize: 13, color: '#64748B', fontWeight: '400', marginBottom: 4 },
  profileId: { fontSize: 13, color: '#0A52D6', fontWeight: '600', marginBottom: 12 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#BBF7D0', alignSelf: 'flex-start' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  activeText: { fontSize: 11, fontWeight: '700', color: '#16A34A', letterSpacing: 0.5 },

  /* Section Card */
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, shadowColor: '#0A52D6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },

  /* Security */
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  securityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  securityIconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  securityLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  securitySub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },

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
