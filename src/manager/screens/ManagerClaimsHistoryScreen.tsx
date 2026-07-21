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

interface ManagerClaimsHistoryScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function ManagerClaimsHistoryScreen({
  onBack,
  onNavigate,
}: ManagerClaimsHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Static mock claims history
  const claimsHistory = [
    { id: 'h1', title: 'Travel Expense', category: 'travel', date: 'Jul 15, 2026', amount: '₹4,500', desc: 'Client site travel reimbursement.', status: 'Approved' },
    { id: 'h2', title: 'Medical Expense', category: 'medical', date: 'Jul 13, 2026', amount: '₹12,000', desc: 'Medical appointment checkup.', status: 'Approved' },
    { id: 'h3', title: 'Equipment Claim', category: 'equipment', date: 'Jul 11, 2026', amount: '₹8,500', desc: 'Office chair & monitor setup.', status: 'Pending' },
    { id: 'h4', title: 'Client Dinner', category: 'meals', date: 'Jul 05, 2026', amount: '₹3,200', desc: 'Business dinner with partners.', status: 'Approved' },
    { id: 'h5', title: 'Software License', category: 'equipment', date: 'Jun 28, 2026', amount: '₹6,400', desc: 'Development software annual package.', status: 'Rejected' },
    { id: 'h6', title: 'Flight Ticket', category: 'travel', date: 'Jun 15, 2026', amount: '₹14,200', desc: 'Onsite project kickoff flight travel.', status: 'Approved' },
    { id: 'h7', title: 'Pharmacy Bill', category: 'medical', date: 'Jun 12, 2026', amount: '₹1,500', desc: 'First aid box supplies.', status: 'Approved' },
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel':
        return { name: 'car-outline', bg: '#EFF6FF', color: '#3B82F6' };
      case 'medical':
        return { name: 'heart-pulse', bg: '#FEF2F2', color: '#EF4444' };
      case 'meals':
        return { name: 'food-fork-drink', bg: '#FFFBEB', color: '#F59E0B' };
      default:
        return { name: 'file-document-outline', bg: '#ECFDF5', color: '#10B981' };
    }
  };

  const filteredClaims = claimsHistory.filter(c => statusFilter === 'All' || c.status === statusFilter);

  // Stats helpers
  const totalClaimed = claimsHistory
    .reduce((sum, item) => sum + parseInt(item.amount.replace(/[^0-9]/g, '')), 0);
  const totalApproved = claimsHistory
    .filter(c => c.status === 'Approved')
    .reduce((sum, item) => sum + parseInt(item.amount.replace(/[^0-9]/g, '')), 0);
  const totalPending = claimsHistory
    .filter(c => c.status === 'Pending')
    .reduce((sum, item) => sum + parseInt(item.amount.replace(/[^0-9]/g, '')), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header Container */}
      <ManagerHeader
        title="Claims History"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('manager_alerts')}
        onProfilePress={() => onNavigate?.('manager_profile')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        {/* Page Header */}
        <View style={styles.pageTitleContainer}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>My Claims Logs</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecond }]}>
            Access all your past submitted expense reimbursements and balances.
          </Text>
        </View>

        {/* Claim Statistics Strip */}
        <View style={styles.statsStrip}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.statLabel, { color: colors.textSecond }]}>TOTAL APPROVED</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>₹{totalApproved.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.statLabel, { color: colors.textSecond }]}>TOTAL PENDING</Text>
            <Text style={[styles.statValue, { color: colors.amber }]}>₹{totalPending.toLocaleString('en-IN')}</Text>
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

        {/* Claims Timeline List */}
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          {filteredClaims.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-search-outline" size={32} color={colors.textSecond} />
              <Text style={[styles.emptyText, { color: colors.textSecond }]}>No claims record found</Text>
            </View>
          ) : (
            filteredClaims.map((claim, idx) => {
              const icon = getCategoryIcon(claim.category);
              const status = getStatusStyle(claim.status);
              return (
                <View key={claim.id}>
                  <View style={styles.claimItem}>
                    <View style={[styles.claimIconWrap, { backgroundColor: icon.bg }]}>
                      <MaterialCommunityIcons name={icon.name as any} size={22} color={icon.color} />
                    </View>
                    <View style={styles.claimInfo}>
                      <Text style={[styles.claimTitleText, { color: colors.textPrimary }]}>{claim.title}</Text>
                      <Text style={[styles.claimMetaText, { color: colors.textSecond }]}>
                        {claim.date} • {claim.amount}
                      </Text>
                      <Text style={[styles.claimDescText, { color: colors.textMuted }]} numberOfLines={1}>{claim.desc}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>{claim.status}</Text>
                    </View>
                  </View>
                  {idx < filteredClaims.length - 1 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
                </View>
              );
            })
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
  statsStrip: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 16,
    marginBottom: 4,
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
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  claimItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  claimIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  claimInfo: {
    flex: 1,
    gap: 3,
  },
  claimTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  claimMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  claimDescText: {
    fontSize: 12,
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  emptyContainer: {
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
