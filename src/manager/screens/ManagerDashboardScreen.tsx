import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';

interface ManagerDashboardScreenProps {
  onNavigate?: (screen: any, params?: any) => void;
  routeParams?: { menuOpen?: boolean };
}

export default function ManagerDashboardScreen({ onNavigate, routeParams }: ManagerDashboardScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();

  // Navigation menu drawer state
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (routeParams?.menuOpen) {
      setMenuOpen(true);
    }
  }, [routeParams]);

  // Functional States
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('00:00 AM/PM');
  const [workedHours, setWorkedHours] = useState('00.00 Hr');
  const [timerIntervalId, setTimerIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [, setSecondsElapsed] = useState(0);

  // Pending Approvals state
  const [pendingCount, setPendingCount] = useState(5);
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      name: 'David Chen',
      type: 'Annual Leave',
      date: 'Oct 12 - Oct 14',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=100',
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      type: 'Expense Claim',
      detail: 'Travel $240',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100',
    },
  ]);

  // Check In/Out handler
  const handleCheckInToggle = () => {
    if (!isCheckedIn) {
      // Check In
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
      
      setIsCheckedIn(true);
      setCheckInTime(`${formattedHours}:${minutes} ${ampm}`);
      setSecondsElapsed(0);
      setWorkedHours('00.00 Hr');

      const interval = setInterval(() => {
        setSecondsElapsed(prev => {
          const next = prev + 1;
          const hrs = Math.floor(next / 3600);
          const mins = Math.floor((next % 3600) / 60);
          const formattedMins = mins.toString().padStart(2, '0');
          setWorkedHours(`${hrs}.${formattedMins} Hr`);
          return next;
        });
      }, 1000);

      setTimerIntervalId(interval);
      Alert.alert('Success', 'Successfully checked in!');
    } else {
      // Check Out
      setIsCheckedIn(false);
      setCheckInTime('00:00 AM/PM');
      setWorkedHours('00.00 Hr');
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
      Alert.alert('Success', 'Successfully checked out!');
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

  // Approval Handlers
  const handleApprove = (id: number, name: string) => {
    Alert.alert('Request Approved', `Approved request for ${name}.`);
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    setPendingCount(prev => Math.max(0, prev - 1));
  };

  const handleReject = (id: number, name: string) => {
    Alert.alert('Request Rejected', `Rejected request for ${name}.`);
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    setPendingCount(prev => Math.max(0, prev - 1));
  };

  // Celebration action handler
  const handleCelebrateAction = (name: string, type: 'birthday' | 'anniversary') => {
    const action = type === 'birthday' ? 'Birthday wish' : 'Congratulatory message';
    Alert.alert('Sent', `${action} successfully sent to ${name}!`);
  };

  // Static Days for Attendance Overview Grid
  const overviewDays = [
    { day: 'Mon', active: false },
    { day: 'Tue', active: false },
    { day: 'Wed', active: true },
    { day: 'Thu', active: false },
    { day: 'Fri', active: false },
  ];

  // Calendar static data for October 2023 grid
  const calendarGrid = [
    [
      { day: 25, current: false, status: 'none' },
      { day: 26, current: false, status: 'none' },
      { day: 27, current: false, status: 'none' },
      { day: 28, current: false, status: 'none' },
      { day: 29, current: false, status: 'none' },
      { day: 30, current: false, status: 'none' },
      { day: 1, current: true, status: 'holiday' },
    ],
    [
      { day: 2, current: true, status: 'absent' },
      { day: 3, current: true, status: 'absent' },
      { day: 4, current: true, status: 'present' },
      { day: 5, current: true, status: 'present' },
      { day: 6, current: true, status: 'present' },
      { day: 7, current: true, status: 'present' },
      { day: 8, current: true, status: 'present' },
    ],
    [
      { day: 9, current: true, status: 'present' },
      { day: 10, current: true, status: 'present' },
      { day: 11, current: true, status: 'present' },
      { day: 12, current: true, status: 'present' },
      { day: 13, current: true, status: 'present' },
      { day: 14, current: true, status: 'present' },
      { day: 15, current: true, status: 'leave' },
    ],
    [
      { day: 16, current: true, status: 'present' },
      { day: 17, current: true, status: 'present' },
      { day: 18, current: true, status: 'present' },
      { day: 19, current: true, status: 'present' },
      { day: 20, current: true, status: 'halfday' },
      { day: 21, current: true, status: 'present' },
      { day: 22, current: true, status: 'present' },
    ],
    [
      { day: 23, current: true, status: 'present' },
      { day: 24, current: true, status: 'present', selected: true },
      { day: 25, current: true, status: 'present' },
      { day: 26, current: true, status: 'present' },
      { day: 27, current: true, status: 'present' },
      { day: 28, current: true, status: 'present' },
      { day: 29, current: true, status: 'present' },
    ],
    [
      { day: 30, current: true, status: 'present' },
      { day: 31, current: true, status: 'present' },
      { day: 1, current: false, status: 'none' },
      { day: 2, current: false, status: 'none' },
      { day: 3, current: false, status: 'none' },
      { day: 4, current: false, status: 'none' },
      { day: 5, current: false, status: 'none' },
    ]
  ];

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── HEADER ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top || 16, backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.iconBg }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.brand} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.brand }]}>Manager Dashboard</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.iconBg, marginRight: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.iconBg, marginRight: 12 }]} activeOpacity={0.7}>
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150' }}
              style={styles.avatarImage}
            />
            <View style={styles.activeDot} />
          </View>
        </View>
      </View>

      {/* ── MAIN SCROLL CONTENT ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeGreeting, { color: colors.textPrimary }]}>Good Morning, Lingesvaran</Text>
          <Text style={[styles.welcomeDate, { color: colors.textSecond }]}>Monday, 20 Nov - 09:45 AM</Text>
        </View>

        {/* Current Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecond }]}>CURRENT STATUS</Text>
          <Text style={[styles.statusLocation, { color: colors.textPrimary }]}>
            Location : {isCheckedIn ? 'HQ Block A' : 'Not checked in'}
          </Text>

          <View style={styles.statusTimesContainer}>
            {/* Check-In */}
            <View style={styles.statusTimeBox}>
              <View style={[styles.statusIconWrap, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name="logout" size={20} color={colors.brand} style={{ transform: [{ scaleX: -1 }] }} />
              </View>
              <View style={styles.statusTimeTextWrap}>
                <Text style={[styles.timeLabel, { color: colors.textSecond }]}>CHECK-IN</Text>
                <Text style={[styles.timeValue, { color: colors.textPrimary }]}>{checkInTime}</Text>
              </View>
            </View>

            {/* Worked */}
            <View style={styles.statusTimeBox}>
              <View style={[styles.statusIconWrap, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name="timer-sand" size={20} color={colors.brand} />
              </View>
              <View style={styles.statusTimeTextWrap}>
                <Text style={[styles.timeLabel, { color: colors.textSecond }]}>WORKED</Text>
                <Text style={[styles.timeValue, { color: colors.textPrimary }]}>{workedHours}</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.checkInBtn, { backgroundColor: isCheckedIn ? '#EF4444' : colors.brand }]}
            onPress={handleCheckInToggle}
            activeOpacity={0.8}
          >
            <Text style={styles.checkInBtnText}>
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Present & Absent Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
            <View style={styles.statInfo}>
              <Text style={[styles.statTitle, { color: '#1E3A8A' }]}>Present</Text>
              <Text style={[styles.statCount, { color: '#0A52D6' }]}>142</Text>
            </View>
            <View style={styles.blueDecorationCircle} />
          </View>

          <View style={[styles.statBox, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
            <View style={styles.statInfo}>
              <Text style={[styles.statTitle, { color: '#991B1B' }]}>Absent</Text>
              <Text style={[styles.statCount, { color: '#EF4444' }]}>12</Text>
            </View>
            <View style={styles.redDecorationCircle} />
          </View>
        </View>

        {/* Pending Approvals Blue Banner */}
        <View style={[styles.approvalsBanner, { backgroundColor: colors.brand }]}>
          <Text style={styles.bannerText}>Pending Approvals</Text>
          <Text style={styles.bannerCount}>{pendingCount}</Text>
        </View>

        {/* Leaves, Reports, Claims Grid */}
        <View style={styles.gridContainer}>
          {[
            { name: 'Leaves', icon: 'calendar-blank', color: '#3B82F6' },
            { name: 'Reports', icon: 'chart-bar', color: '#10B981' },
            { name: 'Claims', icon: 'credit-card-outline', color: '#F59E0B' },
          ].map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.gridIconBg, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={[styles.gridLabel, { color: colors.textPrimary }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions / Attendance Overview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.overviewHeader}>
            <Text style={[styles.overviewTitle, { color: colors.textPrimary }]}>Attendance Overview</Text>
            <View style={styles.dropdownSelector}>
              <Text style={[styles.dropdownText, { color: colors.textSecond }]}>This Week</Text>
              <Feather name="chevron-down" size={14} color={colors.textSecond} />
            </View>
          </View>

          <View style={styles.daysRow}>
            {overviewDays.map((d) => (
              <View
                key={d.day}
                style={[
                  styles.dayColumn,
                  d.active && [styles.activeDayColumn, { backgroundColor: colors.brand }]
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: d.active ? '#FFFFFF' : colors.textSecond }
                  ]}
                >
                  {d.day}
                </Text>
                {d.active && <View style={styles.activeDayDot} />}
              </View>
            ))}
          </View>
        </View>

        {/* Calendar Card */}
        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.calendarHeader}>
            <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>October 2023</Text>
            <View style={styles.calendarArrows}>
              <TouchableOpacity style={styles.arrowBtn}>
                <Feather name="chevron-left" size={18} color={colors.textSecond} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowBtn}>
                <Feather name="chevron-right" size={18} color={colors.textSecond} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdayRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text key={idx} style={[styles.weekdayText, { color: colors.textMuted }]}>{day}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.calendarGrid}>
            {calendarGrid.map((row, rIdx) => (
              <View key={rIdx} style={styles.calendarRow}>
                {row.map((cell, cIdx) => {
                  let dotColor = 'transparent';
                  if (cell.status === 'present') dotColor = '#22C55E';
                  else if (cell.status === 'absent') dotColor = '#EF4444';
                  else if (cell.status === 'leave') dotColor = '#F59E0B';
                  else if (cell.status === 'holiday') dotColor = '#3B82F6';
                  else if (cell.status === 'halfday') dotColor = '#A855F7';

                  return (
                    <View key={cIdx} style={styles.calendarCell}>
                      <View
                        style={[
                          styles.dayNumberContainer,
                          cell.selected && [styles.selectedDayNumber, { backgroundColor: colors.brand }]
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            {
                              color: cell.selected
                                ? '#FFFFFF'
                                : cell.current
                                  ? colors.textPrimary
                                  : colors.textEmpty
                            }
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </View>
                      <View style={[styles.calendarDot, { backgroundColor: dotColor }]} />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {[
              { label: 'PRESENT', color: '#22C55E' },
              { label: 'ABSENT', color: '#EF4444' },
              { label: 'LEAVE', color: '#F59E0B' },
              { label: 'HOLIDAY', color: '#3B82F6' },
              { label: 'HALF DAY', color: '#A855F7' },
            ].map((leg) => (
              <View key={leg.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: leg.color }]} />
                <Text style={[styles.legendText, { color: colors.textSecond }]}>{leg.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pending Approvals List */}
        <View style={styles.pendingSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pending Approvals</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAllText, { color: colors.brand }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.approvalsList}>
          {pendingRequests.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No pending approvals</Text>
          ) : (
            pendingRequests.map((req) => (
              <View key={req.id} style={[styles.approvalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: req.avatar }} style={styles.approvalAvatar} />
                <View style={styles.approvalDetails}>
                  <Text style={[styles.approvalName, { color: colors.textPrimary }]}>{req.name}</Text>
                  <Text style={[styles.approvalType, { color: colors.textSecond }]}>
                    {req.type} {req.date ? `• ${req.date}` : req.detail ? `• ${req.detail}` : ''}
                  </Text>
                </View>
                <View style={styles.approvalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn, { backgroundColor: '#F0FDF4' }]}
                    onPress={() => handleApprove(req.id, req.name)}
                    activeOpacity={0.7}
                  >
                    <Feather name="check" size={16} color="#16A34A" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn, { backgroundColor: '#FEF2F2' }]}
                    onPress={() => handleReject(req.id, req.name)}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* This Week's Celebrations */}
        <View style={styles.pendingSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{"This Week's Celebrations"}</Text>
          <TouchableOpacity>
            <Feather name="more-horizontal" size={18} color={colors.textSecond} />
          </TouchableOpacity>
        </View>

        <View style={styles.celebrationsList}>
          {/* Sarah Mitchell */}
          <View style={[styles.celebrationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.celebLeft}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=100' }}
                style={styles.celebAvatar}
              />
              <View style={styles.celebTextContainer}>
                <Text style={[styles.celebName, { color: colors.textPrimary }]}>Sarah Mitchell</Text>
                <Text style={[styles.celebSubtitle, { color: colors.textSecond }]}>Birthday Tomorrow</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.celebActionBtn, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}
              onPress={() => handleCelebrateAction('Sarah Mitchell', 'birthday')}
              activeOpacity={0.7}
            >
              <Text style={[styles.celebActionText, { color: colors.brand }]}>WISH HER</Text>
            </TouchableOpacity>
          </View>

          {/* David Chen Anniversary */}
          <View style={[styles.celebrationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.celebLeft}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=100' }}
                style={styles.celebAvatar}
              />
              <View style={styles.celebTextContainer}>
                <Text style={[styles.celebName, { color: colors.textPrimary }]}>David Chen</Text>
                <Text style={[styles.celebSubtitle, { color: colors.textSecond }]}>3rd Work Anniversary • May 15</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.celebActionBtn, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}
              onPress={() => handleCelebrateAction('David Chen', 'anniversary')}
              activeOpacity={0.7}
            >
              <Text style={[styles.celebActionText, { color: colors.brand }]}>CONGRATULATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
        </View>

        <View style={[styles.activityTimeline, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            {
              id: 1,
              title: 'Design Team Meeting',
              desc: 'Started 10 mins ago • 5 Members present',
              dotColor: colors.brand,
              isLast: false,
            },
            {
              id: 2,
              title: 'Q3 Report Submission',
              desc: 'Uploaded by Mark R. • 2 hours ago',
              dotColor: colors.textMuted,
              isLast: false,
            },
            {
              id: 3,
              title: 'System Maintenance Completed',
              desc: 'IT Dept • Yesterday, 11:00 PM',
              dotColor: colors.textMuted,
              isLast: true,
            },
          ].map((act) => (
            <View key={act.id} style={styles.timelineItem}>
              <View style={styles.timelineLeftColumn}>
                <View style={[styles.timelineDot, { backgroundColor: act.dotColor }]} />
                {!act.isLast && <View style={[styles.timelineLine, { backgroundColor: colors.borderLight }]} />}
              </View>
              <View style={styles.timelineRightColumn}>
                <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>{act.title}</Text>
                <Text style={[styles.timelineDesc, { color: colors.textSecond }]}>{act.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Announcements */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Announcements</Text>
        </View>

        <View style={[styles.announcementCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.announcementIconBox}>
            <MaterialCommunityIcons name="bullhorn-outline" size={24} color="#FD8D3C" />
          </View>
          <View style={styles.announcementTextWrap}>
            <Text style={[styles.announcementTitle, { color: colors.textPrimary }]}>Townhall Meeting Scheduled</Text>
            <Text style={[styles.announcementDesc, { color: colors.textSecond }]}>
              Join us this Friday at 3 PM in the Main Auditorium for the Q4 kickoff and strategy alignment.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── BOTTOM NAV TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={20} color={colors.tabActive} />
          <Text style={[styles.tabTextActive, { color: colors.tabActive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="users" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="clock" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="check-square" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="package" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Assets</Text>
        </TouchableOpacity>
      </View>

      {/* ── SIDEBAR DRAWER OVERLAY ── */}
      <ManagerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(screen, params) => {
          setMenuOpen(false);
          if (onNavigate) {
            onNavigate(screen, params);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeGreeting: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  welcomeDate: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  statusCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusLocation: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  statusTimesContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 20,
    gap: 16,
  },
  statusTimeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusTimeTextWrap: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  checkInBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    zIndex: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  blueDecorationCircle: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    opacity: 0.4,
  },
  redDecorationCircle: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    opacity: 0.4,
  },
  approvalsBanner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bannerCount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  gridIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  overviewCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  activeDayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  calendarArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowBtn: {
    padding: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    gap: 8,
    marginBottom: 16,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: 32,
    alignItems: 'center',
  },
  dayNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayNumber: {
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 8,
    fontWeight: '700',
  },
  pendingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  approvalsList: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  approvalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  approvalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  approvalDetails: {
    flex: 1,
  },
  approvalName: {
    fontSize: 13,
    fontWeight: '700',
  },
  approvalType: {
    fontSize: 11,
    marginTop: 2,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtn: {
    // Background dynamic
  },
  rejectBtn: {
    // Background dynamic
  },
  celebrationsList: {
    marginBottom: 16,
  },
  celebrationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  celebLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  celebAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  celebTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  celebName: {
    fontSize: 13,
    fontWeight: '700',
  },
  celebSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  celebActionBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  celebActionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activityTimeline: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  announcementCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  announcementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  announcementTextWrap: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  announcementDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  tabTextActive: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
});
