import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import EmployeeMenu from '@/employee/components/EmployeeMenu';

export interface AttendanceRecord {
  date: string;       // e.g. 'Jun 23'
  dayLabel: string;   // e.g. 'Today' or ''
  shift: string;
  status: 'on_time' | 'late' | 'absent';
  checkIn: string;    // e.g. '09:12 AM'
  checkOut: string;   // e.g. '06:45 PM' or '—'
  total: string;      // e.g. '9h 33m' or '—'
}

// Historical sample records (past days, no live today entry)
const HISTORICAL_RECORDS: AttendanceRecord[] = [
  {
    date: 'Oct 24',
    dayLabel: '',
    shift: 'Regular',
    status: 'on_time',
    checkIn: '09:12 AM',
    checkOut: '06:45 PM',
    total: '9h 33m',
  },
  {
    date: 'Oct 23',
    dayLabel: '',
    shift: 'Regular',
    status: 'late',
    checkIn: '10:45 AM',
    checkOut: '07:50 PM',
    total: '9h 05m',
  },
  {
    date: 'Oct 22',
    dayLabel: '',
    shift: 'Regular',
    status: 'on_time',
    checkIn: '08:55 AM',
    checkOut: '06:00 PM',
    total: '9h 05m',
  },
  {
    date: 'Oct 21',
    dayLabel: '',
    shift: 'Regular',
    status: 'absent',
    checkIn: '—',
    checkOut: '—',
    total: '—',
  },
];

const STATUS_CONFIG = {
  on_time: { label: 'On Time', color: '#16A34A', bgColor: '#DCFCE7', icon: 'check-circle' as const },
  late: { label: 'Late Arrival', color: '#D97706', bgColor: '#FEF3C7', icon: 'clock-outline' as const },
  absent: { label: 'Absent', color: '#DC2626', bgColor: '#FEE2E2', icon: 'close-circle-outline' as const },
};

interface Props {
  onReturnHome: () => void;
  onNavigate?: (screen: string, params?: any) => void;
  liveRecords?: AttendanceRecord[];
}

export default function EmployeeAttendanceHistoryScreen({ onReturnHome, onNavigate, liveRecords = [] }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'present' | 'absent' | 'late'>('all');

  const allRecords: AttendanceRecord[] = [...liveRecords, ...HISTORICAL_RECORDS];

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'present', label: 'Present' },
    { key: 'absent', label: 'Absent' },
    { key: 'late', label: 'Late' },
  ] as const;

  const filtered = allRecords.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'present') return r.status === 'on_time';
    if (activeFilter === 'absent') return r.status === 'absent';
    if (activeFilter === 'late') return r.status === 'late';
    return true;
  });

  const totalPresent = allRecords.filter(r => r.status === 'on_time').length;
  const totalLate    = allRecords.filter(r => r.status === 'late').length;
  const totalAbsent  = allRecords.filter(r => r.status === 'absent').length;

  return (
    <View style={[styles.root, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top || 16, backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: colors.iconBg }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={20} color={colors.brand} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.brand, marginLeft: 12 }]}>
            Attendance
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.iconButtonHeader, { backgroundColor: colors.iconBg }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>

          {/* Bell Icon */}
          <TouchableOpacity
            style={[styles.iconButtonHeader, { backgroundColor: colors.iconBg }]}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={[styles.notificationDotHeader, { borderColor: colors.header }]} />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity
            style={[styles.avatarCircleHeader, { backgroundColor: colors.brandBorder }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('employee_profile')}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120' }}
              style={styles.avatarImageHeader}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Title Block */}
      <View style={[styles.bodyTitleBlock, { backgroundColor: colors.bgScreen }]}>
        <Text style={[styles.bodyTitle, { color: colors.textPrimary }]}>Attendance History</Text>
        <Text style={[styles.bodySubtitle, { color: colors.textSecond }]}>Review your daily logs and shift details.</Text>
      </View>

      {/* Summary strip */}
      <View style={[styles.summaryStrip, { backgroundColor: colors.card, shadowColor: colors.brand }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#16A34A' }]}>{totalPresent}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecond }]}>Present</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#D97706' }]}>{totalLate}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecond }]}>Late</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#DC2626' }]}>{totalAbsent}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecond }]}>Absent</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
                activeFilter === f.key && [styles.filterPillActive, { backgroundColor: colors.brand, borderColor: colors.brand }]
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, { color: colors.textSecond }, activeFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Records List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecond }]}>No records found</Text>
          </View>
        )}

        {filtered.map((record, idx) => {
          const cfg = STATUS_CONFIG[record.status];
          const isAbsent = record.status === 'absent';
          return (
            <View key={idx} style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }, record.status === 'late' && styles.recordCardLate]}>

              <View style={styles.recordHeader}>
                <View>
                  <View style={styles.recordDateRow}>
                    <Text style={[styles.recordDate, { color: colors.textPrimary }]}>{record.date}</Text>
                    {record.dayLabel ? (
                      <View style={[styles.todayBadge, { backgroundColor: colors.brandBg }]}>
                        <Text style={[styles.todayBadgeText, { color: colors.brand }]}>{record.dayLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.recordShift, { color: colors.textSecond }]}>{record.shift}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bgColor }]}>
                  <MaterialCommunityIcons name={cfg.icon} size={13} color={cfg.color} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={[styles.recordDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.recordTimingsRow}>
                {/* IN */}
                <View style={styles.timingItem}>
                  <View style={[styles.timingIconWrap, { backgroundColor: isAbsent ? (isDark ? '#334155' : '#F1F5F9') : '#EBF2FF' }]}>
                    <MaterialCommunityIcons name="login" size={14} color={isAbsent ? '#94A3B8' : '#0A52D6'} />
                  </View>
                  <View>
                    <Text style={[styles.timingLabel, { color: colors.textSecond }]}>IN</Text>
                    <Text style={[styles.timingValue, { color: colors.textPrimary }, record.checkIn === '—' && styles.timingNA]}>
                      {record.checkIn}
                    </Text>
                  </View>
                </View>

                {/* OUT */}
                <View style={styles.timingItem}>
                  <View style={[styles.timingIconWrap, { backgroundColor: isAbsent ? (isDark ? '#334155' : '#F1F5F9') : '#EBF2FF' }]}>
                    <MaterialCommunityIcons name="logout" size={14} color={isAbsent ? '#94A3B8' : '#0A52D6'} />
                  </View>
                  <View>
                    <Text style={[styles.timingLabel, { color: colors.textSecond }]}>OUT</Text>
                    <Text style={[styles.timingValue, { color: colors.textPrimary }, record.checkOut === '—' && styles.timingNA]}>
                      {record.checkOut}
                    </Text>
                  </View>
                </View>

                {/* TOTAL */}
                <View style={styles.timingItem}>
                  <View>
                    <Text style={[styles.timingLabel, { color: colors.textSecond }]}>TOTAL</Text>
                    <Text
                      style={[
                        styles.timingTotal,
                        { color: record.total === '—' ? colors.textMuted : '#0A52D6' },
                      ]}
                    >
                      {record.total}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard')}>
          <Ionicons name="home-outline" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_create_claim')}>
          <MaterialCommunityIcons name="receipt-outline" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Claim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard', { openCalendar: true })}>
          <Feather name="clock" size={22} color={colors.tabActive} />
          <Text style={[styles.tabTextActive, { color: colors.tabActive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_apply_leave')}>
          <Feather name="calendar" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_assets')}>
          <MaterialCommunityIcons name="laptop" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Asset</Text>
        </TouchableOpacity>
      </View>

      {/* Side Menu Drawer overlay */}
      <EmployeeMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 2,
  },
  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  filterRow: {
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0A52D6',
    borderColor: '#0A52D6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  recordCardLate: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordDate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  todayBadge: {
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A52D6',
  },
  recordShift: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recordDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  recordTimingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '28%',
  },
  timingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timingLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  timingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  timingNA: {
    color: '#CBD5E1',
  },
  timingTotal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButtonHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDotHeader: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
  },
  avatarCircleHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImageHeader: {
    width: '100%',
    height: '100%',
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
  tabTextActive: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  bodyTitleBlock: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  bodyTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bodySubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});
