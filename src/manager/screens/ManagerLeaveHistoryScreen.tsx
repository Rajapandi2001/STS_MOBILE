import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';
import ManagerHeader from '../components/ManagerHeader';
import ManagerBottomTabNavigator from '../components/ManagerBottomTabNavigator';

interface ManagerLeaveHistoryScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function ManagerLeaveHistoryScreen({
  onBack,
  onNavigate,
}: ManagerLeaveHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Static mock leaves history
  const leavesHistory = [
    { id: 1, type: 'Annual Leave', dates: 'Oct 5, 2023', days: '1 Day', reason: 'Family vacation trip.', status: 'Approved', icon: 'calendar-blank-outline', iconColor: '#3B82F6', bg: '#EFF6FF' },
    { id: 2, type: 'Sick Leave', dates: 'Sep 12 - Sep 13, 2023', days: '2 Days', reason: 'Medical appointment and recovery.', status: 'Approved', icon: 'heart-pulse', iconColor: '#EF4444', bg: '#FEF2F2' },
    { id: 3, type: 'Annual Leave', dates: 'Nov 20 - Nov 24, 2023', days: '5 Days', reason: 'Thanksgiving holiday travel.', status: 'Pending', icon: 'calendar-blank-outline', iconColor: '#3B82F6', bg: '#EFF6FF' },
    { id: 4, type: 'Flexi Leave', dates: 'Aug 10, 2023', days: '1 Day', reason: 'Personal errands.', status: 'Approved', icon: 'clock-outline', iconColor: '#10B981', bg: '#ECFDF5' },
    { id: 5, type: 'Sick Leave', dates: 'Jul 04, 2023', days: '1 Day', reason: 'Severe headache.', status: 'Approved', icon: 'heart-pulse', iconColor: '#EF4444', bg: '#FEF2F2' },
    { id: 6, type: 'LOP', dates: 'Jun 15 - Jun 17, 2023', days: '3 Days', reason: 'Urgent domestic travel.', status: 'Rejected', icon: 'cash-off', iconColor: '#F59E0B', bg: '#FFFBEB' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return { bg: '#ECFDF5', text: '#10B981' };
      case 'Rejected':
        return { bg: '#FEF2F2', text: '#EF4444' };
      default:
        return { bg: '#FFFBEB', text: '#F59E0B' };
    }
  };

  const filteredLeaves = leavesHistory.filter(l => statusFilter === 'All' || l.status === statusFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header Container */}
      <ManagerHeader
        title="Leave History"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('manager_alerts')}
        onProfilePress={() => onNavigate?.('manager_profile')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        {/* Page Header */}
        <View style={styles.pageTitleContainer}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>My Leave Logs</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecond }]}>
            Review all your past leave request records and balance counts.
          </Text>
        </View>

        {/* Leave Summary Sub-cards */}
        <View style={styles.rowCardsContainer}>
          <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowCardHeader}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={18} color="#3B82F6" />
              <Text style={[styles.rowCardLabel, { color: colors.textSecond }]}>Annual</Text>
            </View>
            <Text style={[styles.rowCardValue, { color: colors.textPrimary }]}>14 Days</Text>
          </View>

          <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowCardHeader}>
              <MaterialCommunityIcons name="heart-pulse" size={18} color="#EF4444" />
              <Text style={[styles.rowCardLabel, { color: colors.textSecond }]}>Sick</Text>
            </View>
            <Text style={[styles.rowCardValue, { color: colors.textPrimary }]}>5 Days</Text>
          </View>

          <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowCardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#10B981" />
              <Text style={[styles.rowCardLabel, { color: colors.textSecond }]}>Flexi</Text>
            </View>
            <Text style={[styles.rowCardValue, { color: colors.textPrimary }]}>2 Days</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterPillsScroll}
        >
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isActive && { backgroundColor: colors.brand, borderColor: colors.brand }
                ]}
                onPress={() => setStatusFilter(status as any)}
              >
                <Text style={[
                  styles.filterPillText,
                  { color: colors.textSecond },
                  isActive && { color: '#FFFFFF', fontWeight: '700' }
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Leaves List */}
        <View style={{ marginBottom: 20 }}>
          {filteredLeaves.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <MaterialCommunityIcons name="clipboard-text-search-outline" size={32} color={colors.textSecond} />
              <Text style={[styles.emptyText, { color: colors.textSecond }]}>No leave records match filters</Text>
            </View>
          ) : (
            filteredLeaves.map((log) => (
              <View key={log.id} style={[styles.logItem, { borderBottomColor: colors.borderLight }]}>
                <View style={[styles.logIconBg, { backgroundColor: log.bg }]}>
                  <MaterialCommunityIcons name={log.icon as any} size={20} color={log.iconColor} />
                </View>
                <View style={styles.logInfo}>
                  <Text style={[styles.logTitle, { color: colors.textPrimary }]}>{log.type}</Text>
                  <Text style={[styles.logMeta, { color: colors.textSecond }]}>{log.dates} • {log.days}</Text>
                  {log.reason ? <Text style={[styles.logReason, { color: colors.textMuted }]}>{log.reason}</Text> : null}
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: log.status === 'Approved' ? '#ECFDF5' : log.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: log.status === 'Approved' ? '#10B981' : log.status === 'Rejected' ? '#EF4444' : '#F59E0B' }
                  ]}>
                    {log.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <ManagerBottomTabNavigator
        activeTab={undefined}
        onTabPress={(tab) => {
          if (tab === 'home' || tab === 'approvals') {
            onNavigate?.('manager_dashboard', { tab });
          } else {
            onNavigate?.(`manager_${tab}`);
          }
        }}
      />

      <ManagerMenu
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
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  pageTitleContainer: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  rowCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rowCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'column',
  },
  rowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rowCardLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 16,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  logIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  logMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  logReason: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
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
  bottomTabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
