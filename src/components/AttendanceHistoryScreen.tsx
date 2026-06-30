import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

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
    shift: 'Regular Shift',
    status: 'on_time',
    checkIn: '09:12 AM',
    checkOut: '06:45 PM',
    total: '9h 33m',
  },
  {
    date: 'Oct 23',
    dayLabel: '',
    shift: 'Regular Shift',
    status: 'late',
    checkIn: '10:45 AM',
    checkOut: '07:50 PM',
    total: '9h 05m',
  },
  {
    date: 'Oct 22',
    dayLabel: '',
    shift: 'Regular Shift',
    status: 'on_time',
    checkIn: '08:55 AM',
    checkOut: '06:00 PM',
    total: '9h 05m',
  },
  {
    date: 'Oct 21',
    dayLabel: '',
    shift: 'Regular Shift',
    status: 'absent',
    checkIn: '—',
    checkOut: '—',
    total: '—',
  },
];

const STATUS_CONFIG = {
  on_time: { label: 'On Time', color: '#16A34A', bgColor: '#DCFCE7', icon: 'check-circle' as const },
  late: { label: 'Late Arrival', color: '#D97706', bgColor: '#FEF3C7', icon: 'clock-alert' as const },
  absent: { label: 'Absent', color: '#DC2626', bgColor: '#FEE2E2', icon: 'close-circle' as const },
};

interface Props {
  onReturnHome: () => void;
  liveRecords?: AttendanceRecord[];  // Real check-in records from this session
}

export default function AttendanceHistoryScreen({ onReturnHome, liveRecords = [] }: Props) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'present' | 'absent' | 'late'>('all');

  // Merge: live check-ins (newest first) + historical sample records
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
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <Text style={styles.headerSubtitle}>Review your daily logs and shift details.</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
          <Feather name="bell" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#16A34A' }]}>{totalPresent}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#D97706' }]}>{totalLate}</Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#DC2626' }]}>{totalAbsent}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, activeFilter === f.key && styles.filterPillActive]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
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
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        )}

        {filtered.map((record, idx) => {
          const cfg = STATUS_CONFIG[record.status];
          return (
            <View key={idx} style={[styles.recordCard, record.status === 'late' && styles.recordCardLate]}>

              <View style={styles.recordHeader}>
                <View>
                  <View style={styles.recordDateRow}>
                    <Text style={styles.recordDate}>{record.date}</Text>
                    {record.dayLabel ? (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>{record.dayLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.recordShift}>{record.shift}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bgColor }]}>
                  <MaterialCommunityIcons name={cfg.icon} size={13} color={cfg.color} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={styles.recordDivider} />

              <View style={styles.recordTimingsRow}>
                {/* IN */}
                <View style={styles.timingItem}>
                  <View style={[styles.timingIconWrap, { backgroundColor: '#EBF2FF' }]}>
                    <MaterialCommunityIcons name="login" size={14} color="#0A52D6" />
                  </View>
                  <View>
                    <Text style={styles.timingLabel}>IN</Text>
                    <Text style={[styles.timingValue, record.checkIn === '—' && styles.timingNA]}>
                      {record.checkIn}
                    </Text>
                  </View>
                </View>

                {/* OUT */}
                <View style={styles.timingItem}>
                  <View style={[styles.timingIconWrap, { backgroundColor: '#EBF2FF' }]}>
                    <MaterialCommunityIcons name="logout" size={14} color="#0A52D6" />
                  </View>
                  <View>
                    <Text style={styles.timingLabel}>OUT</Text>
                    <Text style={[styles.timingValue, record.checkOut === '—' && styles.timingNA]}>
                      {record.checkOut}
                    </Text>
                  </View>
                </View>

                {/* TOTAL */}
                <View style={styles.timingItem}>
                  <View>
                    <Text style={styles.timingLabel}>TOTAL</Text>
                    <Text
                      style={[
                        styles.timingTotal,
                        { color: record.total === '—' ? '#CBD5E1' : '#0A52D6' },
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

      {/* Return Home Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.homeBtn} activeOpacity={0.85} onPress={onReturnHome}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 24,
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
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#F4F6FA',
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0A52D6',
    borderRadius: 18,
    paddingVertical: 17,
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
