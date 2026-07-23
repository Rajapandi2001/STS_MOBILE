import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';
import ManagerHeader from '../components/ManagerHeader';
import ManagerBottomTabNavigator from '../components/ManagerBottomTabNavigator';

interface ManagerClaimManagementScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function ManagerClaimManagementScreen({
  onBack,
  onNavigate,
}: ManagerClaimManagementScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [selectedTeamClaim, setSelectedTeamClaim] = useState<any | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  // Interactive local states for claims using dynamic real-time dates
  const [myClaims, setMyClaims] = useState(() => {
    const now = new Date();
    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d3 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
    const d5 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
    return [
      { id: '1', title: 'Travel Expense', category: 'travel', date: d0, amount: '₹4,500', desc: 'Client site travel reimbursement.', status: 'Approved' },
      { id: '2', title: 'Medical Expense', category: 'medical', date: d3, amount: '₹12,000', desc: 'Medical appointment checkup.', status: 'Approved' },
      { id: '3', title: 'Equipment Claim', category: 'equipment', date: d5, amount: '₹8,500', desc: 'Office chair & monitor setup.', status: 'Pending' }
    ];
  });

  const [teamClaims, setTeamClaims] = useState(() => {
    const now = new Date();
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    const d6 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const d10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10);
    return [
      { id: 't1', employee: 'Sarah Connor', title: 'Travel Expense', category: 'travel', date: d1, amount: '₹3,800', desc: 'Onsite customer support travel.', status: 'Pending' },
      { id: 't2', employee: 'John Doe', title: 'Meals & Ent.', category: 'meals', date: d2, amount: '₹1,200', desc: 'Project milestone celebration meal.', status: 'Pending' },
      { id: 't3', employee: 'Alex Mercer', title: 'Equipment Claim', category: 'equipment', date: d6, amount: '₹15,500', desc: 'External hard drive & accessories.', status: 'Approved' },
      { id: 't4', employee: 'David Miller', title: 'Medical Claim', category: 'medical', date: d10, amount: '₹6,000', desc: 'Eye prescription glasses reimbursement.', status: 'Rejected' }
    ];
  });

  // Handle hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('manager_dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate]);

  const handleApprove = (id: string, employee: string, amount: string) => {
    Alert.alert(
      'Approve Claim',
      `Are you sure you want to approve ${employee}'s claim of ${amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            setTeamClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
            Alert.alert('Approved', `${employee}'s claim has been approved.`);
          }
        }
      ]
    );
  };

  const handleReject = (id: string, employee: string, amount: string) => {
    Alert.alert(
      'Reject Claim',
      `Are you sure you want to reject ${employee}'s claim of ${amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => {
            setTeamClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
            Alert.alert('Rejected', `${employee}'s claim has been rejected.`);
          }
        }
      ]
    );
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = [];
    // Previous month empty pads
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayCell} />);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const isSelected = isSameDay(dayDate, selectedDate);
      
      // Check if this day has any claims in the currently active tab
      const dayClaims = activeTab === 'my' 
        ? myClaims.filter(c => isSameDay(c.date, dayDate))
        : teamClaims.filter(c => isSameDay(c.date, dayDate));
      const hasClaims = dayClaims.length > 0;
      
      days.push(
        <TouchableOpacity 
          key={`day-${d}`} 
          style={[
            styles.calendarDayCell,
            isSelected && { backgroundColor: '#0A52D6', borderRadius: 18 }
          ]}
          onPress={() => setSelectedDate(dayDate)}
        >
          <Text style={[
            styles.calendarDayText,
            { color: isSelected ? '#FFFFFF' : colors.textPrimary }
          ]}>
            {d}
          </Text>
          {hasClaims && !isSelected && <View style={[styles.calendarDot, { backgroundColor: '#0A52D6' }]} />}
          {hasClaims && isSelected && <View style={[styles.calendarDot, { backgroundColor: '#FFFFFF' }]} />}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.calendarHeader}>
          <Text style={[styles.calendarMonthText, { color: colors.textPrimary }]}>
            {monthNames[month]} {year}
          </Text>
          <View style={styles.calendarNav}>
            <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <Feather name="chevron-left" size={20} color={colors.textSecond} style={{ marginRight: 15 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <Feather name="chevron-right" size={20} color={colors.textSecond} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.weekdayRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <Text key={`weekday-${idx}`} style={[styles.weekdayText, { color: colors.textSecond }]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
<<<<<<< Updated upstream:src/manager/screens/ManagerClaimManagementScreen.tsx
      <ManagerHeader
        title="Claim Management"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('manager_alerts')}
        onProfilePress={() => onNavigate?.('manager_profile')}
      />
=======
      <View style={[styles.headerContainer, { paddingTop: insets.top || 16, backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.iconBg }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={20} color={colors.brand} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary, marginLeft: 12 }]}>
            Claim Management
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.iconBg, marginRight: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.iconBg, marginRight: 12 }]} 
            activeOpacity={0.7}
            onPress={() => onNavigate?.('manager_alerts')}
          >
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('manager_profile')}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150' }}
                style={styles.avatarImage}
              />
              <View style={styles.activeDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
>>>>>>> Stashed changes:src/manager/screens/ManagerClaimsScreen.tsx

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.borderLight, backgroundColor: colors.header }]}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'my' && { borderBottomColor: colors.brand, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'my' ? colors.brand : colors.textSecond }, activeTab === 'my' && { fontWeight: '700' }]}>
            My Claims
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'team' && { borderBottomColor: colors.brand, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('team')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'team' ? colors.brand : colors.textSecond }, activeTab === 'team' && { fontWeight: '700' }]}>
            Team Claims
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        {activeTab === 'my' ? (
          <>
            {/* Total Annual Claim limit card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceTitle}>Total Annual Claim Limit</Text>
              <Text style={styles.balanceAmount}>₹45,000</Text>
              <Text style={styles.balanceValidity}>Valid until Dec 31, 2026</Text>
              
              <View style={styles.balanceButtons}>
                <TouchableOpacity 
                  style={styles.balanceBtn}
                  activeOpacity={0.9}
                  onPress={() => onNavigate?.('manager_create_claim')}
                >
                  <Text style={styles.balanceBtnTextPrimary}>Claim</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.balanceBtnSecondary}
                  activeOpacity={0.9}
                  onPress={() => onNavigate?.('manager_claims_history')}
                >
                  <Text style={styles.balanceBtnTextSecondary}>View History</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Medical / Travel Claims Cards */}
            <View style={styles.metricRow}>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconWrap, { backgroundColor: '#FEF2F2' }]}>
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#EF4444" />
                  </View>
                  <Text style={[styles.metricLabel, { color: colors.textSecond }]}>Medical Claims</Text>
                </View>
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>₹8,200</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <MaterialCommunityIcons name="car-outline" size={20} color="#3B82F6" />
                  </View>
                  <Text style={[styles.metricLabel, { color: colors.textSecond }]}>Travel Claims</Text>
                </View>
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>₹12,400</Text>
              </View>
            </View>

            {/* Claim History Link Card */}
            <TouchableOpacity 
              style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              activeOpacity={0.8}
              onPress={() => onNavigate?.('manager_claims_history')}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name="history" size={20} color={colors.brand} />
              </View>
              <View style={styles.linkInfo}>
                <Text style={[styles.linkTitle, { color: colors.textPrimary }]}>Claim History</Text>
                <Text style={[styles.linkSubtitle, { color: colors.textSecond }]}>View all past claims and statuses</Text>
              </View>
              <Text style={[styles.linkButtonText, { color: colors.brand }]}>View Full History</Text>
              <Feather name="chevron-right" size={16} color={colors.brand} />
            </TouchableOpacity>

            {/* Calendar */}
            {renderCalendar()}

            {/* Recent Claims Section */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Claims on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            {(() => {
              const filtered = myClaims.filter(c => isSameDay(c.date, selectedDate));
              if (filtered.length === 0) {
                return (
                  <View style={[styles.emptyClaimsCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                    <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={colors.textSecond} style={{ marginBottom: 6 }} />
                    <Text style={[styles.emptyClaimsText, { color: colors.textSecond }]}>No claim records on this day</Text>
                    <Text style={[styles.emptyClaimsSubText, { color: colors.textMuted }]}>Select a date with a blue dot to view details</Text>
                  </View>
                );
              }
              return (
                <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  {filtered.map((claim, idx) => {
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
                              {claim.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {claim.amount}
                            </Text>
                            <Text style={[styles.claimDescText, { color: colors.textMuted }]} numberOfLines={1}>{claim.desc}</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.text }]}>{claim.status}</Text>
                          </View>
                        </View>
                        {idx < filtered.length - 1 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            {/* Archive and History Card */}
            <TouchableOpacity 
              style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Claim Archive', 'Archive database loading...')}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name="archive-outline" size={20} color={colors.brand} />
              </View>
              <View style={styles.linkInfo}>
                <Text style={[styles.linkTitle, { color: colors.textPrimary }]}>Archive & History</Text>
                <Text style={[styles.linkSubtitle, { color: colors.textSecond }]}>Access all past claim requests and balance adjustments</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textSecond} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Team Claims Metric Cards */}
            <View style={styles.teamMetricRow}>
              <View style={[styles.teamMetricCard, { backgroundColor: '#0A52D6', borderColor: '#0A52D6', shadowColor: '#0A52D6' }]}>
                <Text style={[styles.teamMetricLabel, { color: '#E0E7FF' }]}>PENDING REQUESTS</Text>
                <Text style={[styles.teamMetricValue, { color: '#FFFFFF' }]}>
                  {teamClaims.filter(c => c.status === 'Pending').length}
                </Text>
              </View>

              <View style={[styles.teamMetricCard, { backgroundColor: '#0A52D6', borderColor: '#0A52D6', shadowColor: '#0A52D6' }]}>
                <Text style={[styles.teamMetricLabel, { color: '#E0E7FF' }]}>TOTAL APPROVED</Text>
                <Text style={[styles.teamMetricValue, { color: '#FFFFFF' }]}>
                  ₹{teamClaims
                    .filter(c => c.status === 'Approved')
                    .reduce((sum, item) => sum + parseInt(item.amount.replace(/[^0-9]/g, '')), 0)
                    .toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchBarContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search team members..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterIconWrap}>
                <Feather name="sliders" size={18} color={colors.textSecond} />
              </TouchableOpacity>
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
                      isActive && { backgroundColor: '#0A52D6', borderColor: '#0A52D6' }
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

            {/* Recent Submissions List */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 8 }]}>Recent Applications</Text>
            {(() => {
              const filtered = teamClaims.filter(c => {
                const matchesSearch = c.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
                return matchesSearch && matchesStatus;
              });

              if (filtered.length === 0) {
                return (
                  <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                    <MaterialCommunityIcons name="clipboard-text-search-outline" size={32} color={colors.textSecond} />
                    <Text style={[styles.emptyText, { color: colors.textSecond }]}>No claims match your filters</Text>
                  </View>
                );
              }

              return (
                <View style={styles.teamClaimsList}>
                  {filtered.map((claim) => {
                    const icon = getCategoryIcon(claim.category);
                    const status = getStatusStyle(claim.status);
                    
                    // Initials for avatar
                    const initials = claim.employee
                      .split(' ')
                      .map(w => w[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);

                    return (
                      <TouchableOpacity
                        key={claim.id}
                        style={[styles.teamClaimRowCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedTeamClaim(claim);
                          setDetailModalVisible(true);
                        }}
                      >
                        <View style={styles.teamClaimRowLeft}>
                          <View style={[styles.avatarInitialsCircle, { backgroundColor: colors.iconBg }]}>
                            <Text style={[styles.avatarInitialsText, { color: colors.brand }]}>{initials}</Text>
                          </View>
                          <View style={styles.teamClaimDetails}>
                            <Text style={[styles.teamEmployeeName, { color: colors.textPrimary }]}>{claim.employee}</Text>
                            <View style={styles.teamClaimMetaRow}>
                              <View style={[styles.categoryBadge, { backgroundColor: icon.bg }]}>
                                <Text style={[styles.categoryBadgeText, { color: icon.color }]}>
                                  {claim.category.toUpperCase()}
                                </Text>
                              </View>
                              <Text style={[styles.teamClaimDateText, { color: colors.textSecond }]}>
                                {claim.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({claim.amount})
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.teamClaimRowRight}>
                          <View style={[styles.statusBadge, { backgroundColor: status.bg, marginRight: 4 }]}>
                            <Text style={[styles.statusText, { color: status.text }]}>{claim.status.toUpperCase()}</Text>
                          </View>
                          <Feather name="chevron-right" size={16} color={colors.textSecond} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })()}

            {/* Archive and History Card */}
            <TouchableOpacity 
              style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.borderLight, marginTop: 12 }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Claim Archive', 'Archive database loading...')}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name="archive-outline" size={20} color={colors.brand} />
              </View>
              <View style={styles.linkInfo}>
                <Text style={[styles.linkTitle, { color: colors.textPrimary }]}>Archive & History</Text>
                <Text style={[styles.linkSubtitle, { color: colors.textSecond }]}>Access all past team claims and reimbursement logs</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textSecond} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Navigation Drawer Menu */}
      <ManagerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Team Claim Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.detailModalContainer, { backgroundColor: colors.card }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleText, { color: colors.textPrimary }]}>Claim Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTeamClaim && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Employee Card */}
                <View style={[styles.modalEmployeeCard, { backgroundColor: colors.iconBg }]}>
                  <View style={[styles.avatarInitialsCircle, { backgroundColor: colors.brandBorder, width: 44, height: 44, borderRadius: 22 }]}>
                    <Text style={[styles.avatarInitialsText, { color: colors.brand, fontSize: 16 }]}>
                      {selectedTeamClaim.employee
                        .split(' ')
                        .map((w: string) => w[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.modalEmployeeInfo}>
                    <Text style={[styles.modalEmployeeName, { color: colors.textPrimary }]}>{selectedTeamClaim.employee}</Text>
                    <Text style={[styles.modalEmployeeSubtitle, { color: colors.textSecond }]}>Team Member</Text>
                  </View>
                </View>

                {/* Claim Information Table */}
                <View style={styles.infoTable}>
                  <View style={[styles.infoTableRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.infoTableLabel, { color: colors.textSecond }]}>Category</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryIcon(selectedTeamClaim.category).bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: getCategoryIcon(selectedTeamClaim.category).color }]}>
                        {selectedTeamClaim.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.infoTableRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.infoTableLabel, { color: colors.textSecond }]}>Date</Text>
                    <Text style={[styles.infoTableValue, { color: colors.textPrimary }]}>
                      {selectedTeamClaim.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>

                  <View style={[styles.infoTableRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.infoTableLabel, { color: colors.textSecond }]}>Amount Requested</Text>
                    <Text style={[styles.infoTableValue, { color: colors.brand, fontWeight: '800', fontSize: 16 }]}>
                      {selectedTeamClaim.amount}
                    </Text>
                  </View>

                  <View style={[styles.infoTableRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.infoTableLabel, { color: colors.textSecond }]}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(selectedTeamClaim.status).bg }]}>
                      <Text style={[styles.statusText, { color: getStatusStyle(selectedTeamClaim.status).text }]}>
                        {selectedTeamClaim.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.infoTableCol, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.infoTableLabel, { color: colors.textSecond, marginBottom: 6 }]}>Description</Text>
                    <Text style={[styles.infoTableValueText, { color: colors.textPrimary }]}>
                      {selectedTeamClaim.desc}
                    </Text>
                  </View>
                </View>

                {/* Approve/Reject Controls (only if pending) */}
                {selectedTeamClaim.status === 'Pending' && (
                  <View style={styles.modalActionButtons}>
                    <TouchableOpacity 
                      style={[styles.modalActionBtn, styles.modalRejectBtn]}
                      onPress={() => {
                        setDetailModalVisible(false);
                        handleReject(selectedTeamClaim.id, selectedTeamClaim.employee, selectedTeamClaim.amount);
                      }}
                    >
                      <Text style={styles.rejectBtnText}>Reject Claim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalActionBtn, styles.modalApproveBtn]}
                      onPress={() => {
                        setDetailModalVisible(false);
                        handleApprove(selectedTeamClaim.id, selectedTeamClaim.employee, selectedTeamClaim.amount);
                      }}
                    >
                      <Text style={styles.approveBtnText}>Approve Claim</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#0A52D6',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 6,
  },
  balanceValidity: {
    fontSize: 12,
    color: '#C7D2FE',
    fontWeight: '400',
    marginBottom: 20,
  },
  balanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceBtnTextPrimary: {
    color: '#0A52D6',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceBtnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceBtnTextSecondary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: 2,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  calendarMonthText: {
    fontSize: 15,
    fontWeight: '700',
  },
  calendarNav: {
    flexDirection: 'row',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    paddingLeft: 4,
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
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyClaimsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderStyle: 'dashed',
  },
  emptyClaimsText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyClaimsSubText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  approvalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  approvalInfo: {
    flex: 1,
    gap: 2,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  approvalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  teamMetricRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  teamMetricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  teamMetricLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  teamMetricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  filterIconWrap: {
    padding: 4,
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
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
  teamClaimsList: {
    gap: 12,
    marginBottom: 12,
  },
  teamClaimRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 0.5,
  },
  teamClaimRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarInitialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitialsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamClaimDetails: {
    flex: 1,
    gap: 4,
  },
  teamEmployeeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamClaimMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  teamClaimDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  teamClaimRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    paddingBottom: 16,
  },
  modalEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalEmployeeInfo: {
    flex: 1,
    gap: 2,
  },
  modalEmployeeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalEmployeeSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoTable: {
    marginBottom: 20,
  },
  infoTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoTableCol: {
    flexDirection: 'column',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoTableLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoTableValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoTableValueText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRejectBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  modalApproveBtn: {
    backgroundColor: '#10B981',
  },
});
