import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HolidayDetail {
  id: string;
  name: string;
  emoji: string;
  date: string;
  dayOfWeek: string;
  month: string;
  year: string;
  type: string;
  region: string;
  applicableTo: string;
  description: string;
  status: string;
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const HOLIDAY_DETAILS: Record<string, HolidayDetail> = {
  'HOL-2026-001': {
    id: 'HOL-2026-001',
    name: "NEW YEAR'S DAY",
    emoji: '🎉',
    date: '01 January 2026',
    dayOfWeek: 'Thursday',
    month: 'January',
    year: '2026',
    type: 'Public Holiday',
    region: 'Nationwide',
    applicableTo: 'All Employees',
    description: 'The first day of the Gregorian calendar year. A public holiday observed across the country.',
    status: 'Passed',
  },
  'HOL-2026-002': {
    id: 'HOL-2026-002',
    name: 'GOOD FRIDAY',
    emoji: '🕊️',
    date: '03 April 2026',
    dayOfWeek: 'Friday',
    month: 'April',
    year: '2026',
    type: 'Religious Holiday',
    region: 'Nationwide',
    applicableTo: 'All Employees',
    description: 'Good Friday commemorates the crucifixion of Jesus Christ. Observed as a national public holiday.',
    status: 'Passed',
  },
  'HOL-2026-003': {
    id: 'HOL-2026-003',
    name: 'LABOR DAY',
    emoji: '🛠️',
    date: '01 May 2026',
    dayOfWeek: 'Friday',
    month: 'May',
    year: '2026',
    type: 'Public Holiday',
    region: 'Nationwide',
    applicableTo: 'All Employees',
    description: 'International Workers\' Day (Labour Day) celebrates the achievements of workers and the labor movement.',
    status: 'Passed',
  },
  'HOL-2026-004': {
    id: 'HOL-2026-004',
    name: 'CHRISTMAS DAY',
    emoji: '🎄',
    date: '25 December 2026',
    dayOfWeek: 'Friday',
    month: 'December',
    year: '2026',
    type: 'Public Holiday',
    region: 'Nationwide',
    applicableTo: 'All Employees',
    description: 'Christmas Day is an annual festival commemorating the birth of Jesus Christ, observed as a public holiday.',
    status: 'Active',
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminHolidayDetailScreenProps {
  holidayId?: string;
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

export default function AdminHolidayDetailScreen({
  holidayId,
  onBack,
  onNavigate,
}: AdminHolidayDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const holiday = holidayId ? HOLIDAY_DETAILS[holidayId] : HOLIDAY_DETAILS['HOL-2026-001'];

  if (!holiday) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Holiday not found.
        </Text>
      </View>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    Active:  { bg: colors.successBg, text: colors.success },
    Passed:  { bg: colors.iconBg,    text: colors.textSecond },
    Pending: { bg: colors.amberBg,   text: colors.amber },
  };
  const sc = statusColors[holiday.status] ?? { bg: colors.iconBg, text: colors.textSecond };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Holiday Details</Text>
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
            <View style={[styles.heroIcon, { backgroundColor: colors.brandBorder }]}>
              <Text style={styles.heroEmoji}>{holiday.emoji}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{holiday.name}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {holiday.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                <Text style={[styles.statusText, { color: sc.text }]}>{holiday.status}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="calendar-today" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Date</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{holiday.date}</Text>
              </View>
            </View>
            <View style={[styles.pillDivider, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Type</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{holiday.type}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Holiday Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-star" title="Holiday Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Holiday Name" value={holiday.name} />
          <Divider />
          <InfoRow label="Holiday ID" value={holiday.id} />
          <Divider />
          <InfoRow label="Type" value={holiday.type} />
          <Divider />
          <InfoRow label="Status" value={holiday.status} />
        </View>

        {/* ── Date & Schedule ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-clock-outline" title="Date & Schedule" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Date" value={holiday.date} />
          <Divider />
          <InfoRow label="Day" value={holiday.dayOfWeek} />
          <Divider />
          <InfoRow label="Month" value={holiday.month} />
          <Divider />
          <InfoRow label="Year" value={holiday.year} />
        </View>

        {/* ── Applicability ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="account-group-outline" title="Applicability" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Region" value={holiday.region} />
          <Divider />
          <InfoRow label="Applicable To" value={holiday.applicableTo} />
        </View>

        {/* ── Description ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="note-text-outline" title="Description" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.descText, { color: colors.textSecond }]}>{holiday.description}</Text>
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_holidays', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="calendar-star" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Holidays</Text>
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
  heroEmoji: { fontSize: 30 },
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
