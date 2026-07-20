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
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';

interface ManagerTimeScreenProps {
  onNavigate?: (screen: any, params?: any) => void;
  routeParams?: any;
  isCheckedInGlobal?: boolean;
  checkInTimeGlobal?: Date | null;
  onCheckInPress?: () => void;
  onCheckOutPress?: () => void;
}

export default function ManagerTimeScreen({
  onNavigate,
  routeParams,
  isCheckedInGlobal,
  checkInTimeGlobal,
  onCheckInPress,
  onCheckOutPress,
}: ManagerTimeScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();

  // Navigation menu drawer state
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      onNavigate?.('manager_dashboard');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onNavigate]);

  // Check In/Out States
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('00:00 AM/PM');
  const [workedHours, setWorkedHours] = useState('00.00 Hr');
  const [timerIntervalId, setTimerIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Live current time for Time tab
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00 AM/PM');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      setCurrentTimeStr(`${hour12.toString().padStart(2, '0')}:${m} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helpers for Time Tab Week Calendar
  const getWeekDays = (currDate: Date) => {
    const current = new Date(currDate);
    const day = current.getDay();
    // Adjust so week starts on Monday (1 = Monday, 0 = Sunday)
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const formatWeekRange = (days: Date[]) => {
    if (days.length === 0) return '';
    const first = days[0];
    const last = days[6];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (first.getMonth() === last.getMonth()) {
      return `${months[first.getMonth()]} ${first.getDate()} - ${last.getDate()}`;
    } else {
      return `${months[first.getMonth()]} ${first.getDate()} - ${months[last.getMonth()]} ${last.getDate()}`;
    }
  };

  const getMockHistory = () => {
    const today = new Date();
    const history = [];

    let count = 0;
    let offset = 1;
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    while (count < 3 && offset < 10) {
      const d = new Date();
      d.setDate(today.getDate() - offset);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // skip Sat/Sun
        const dayLabel = `${daysOfWeek[dayOfWeek]}, ${months[d.getMonth()]} ${d.getDate()}`;
        const isLate = count === 2; // third record is late
        history.push({
          day: dayLabel,
          timeRange: isLate ? '08:15 AM - 05:00 PM' : count === 0 ? '07:58 AM - 05:05 PM' : '07:55 AM - 05:30 PM',
          status: isLate ? 'LATE' : 'ON TIME',
          isLate: isLate,
        });
        count++;
      }
      offset++;
    }
    return history;
  };

  useEffect(() => {
    if (isCheckedInGlobal === undefined) return;

    if (isCheckedInGlobal && checkInTimeGlobal) {
      setIsCheckedIn(true);

      const hours = checkInTimeGlobal.getHours();
      const minutes = checkInTimeGlobal.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
      setCheckInTime(`${formattedHours}:${minutes} ${ampm}`);

      const diffMs = Date.now() - checkInTimeGlobal.getTime();
      const initialSeconds = Math.max(0, Math.floor(diffMs / 1000));
      setSecondsElapsed(initialSeconds);

      const initHrs = Math.floor(initialSeconds / 3600);
      const initMins = Math.floor((initialSeconds % 3600) / 60);
      setWorkedHours(`${initHrs}.${initMins.toString().padStart(2, '0')} Hr`);

      const interval = setInterval(() => {
        setSecondsElapsed(prev => {
          const next = prev + 1;
          const hrs = Math.floor(next / 3600);
          const mins = Math.floor((next % 3600) / 60);
          setWorkedHours(`${hrs}.${mins.toString().padStart(2, '0')} Hr`);
          return next;
        });
      }, 1000);

      setTimerIntervalId(interval);

      return () => {
        clearInterval(interval);
      };
    } else {
      setIsCheckedIn(false);
      setSecondsElapsed(0);
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
    }
  }, [isCheckedInGlobal, checkInTimeGlobal]);

  const handleCheckInToggle = () => {
    if (!isCheckedIn) {
      if (onCheckInPress) {
        onCheckInPress();
      } else {
        setIsCheckedIn(true);
        Alert.alert('Success', 'Successfully checked in!');
      }
    } else {
      if (onCheckOutPress) {
        onCheckOutPress();
      } else {
        setIsCheckedIn(false);
        Alert.alert('Success', 'Successfully checked out!');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

  const today = new Date();
  const weekDays = getWeekDays(today);
  const weekRangeStr = formatWeekRange(weekDays);
  const historyList = getMockHistory();
  const weekdayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── HEADER ── */}
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
            Timesheet
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={{ marginTop: 8 }}>
          {/* Attendance Header */}
          <Text style={[styles.timeScreenTitle, { color: colors.textPrimary }]}>Attendance</Text>
          <Text style={[styles.timeScreenSubtitle, { color: colors.textSecond }]}>Ready for your shift?</Text>

          {/* Check In / Check Out Large Button */}
          <TouchableOpacity
            style={[styles.fingerprintBtn, { backgroundColor: isCheckedIn ? '#EF4444' : colors.brand }]}
            onPress={handleCheckInToggle}
            activeOpacity={0.8}
          >
            <Text style={styles.fingerprintBtnText}>
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Text>
          </TouchableOpacity>

          {/* Current Time Display */}
          <Text style={[styles.currentTimeText, { color: colors.textSecond }]}>
            Current Time: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{currentTimeStr}</Text>
          </Text>

          {/* Monthly Overview Section */}
          <Text style={[styles.timeSectionTitle, { color: colors.textPrimary, marginTop: 24, marginBottom: 12 }]}>
            Monthly Overview
          </Text>
          <View style={styles.timeOverviewRow}>
            {/* On-Time Rate Card */}
            <View style={[styles.timeOverviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.overviewCardHeader}>
                <MaterialCommunityIcons name="check-circle-outline" size={16} color="#22C55E" style={{ marginRight: 6 }} />
                <Text style={[styles.overviewCardLabel, { color: '#22C55E' }]}>On-time Rate</Text>
              </View>
              <Text style={[styles.overviewCardValue, { color: colors.textPrimary }]}>94%</Text>
            </View>

            {/* Days Present Card */}
            <View style={[styles.timeOverviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.overviewCardHeader}>
                <MaterialCommunityIcons name="calendar-outline" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={[styles.overviewCardLabel, { color: '#F59E0B' }]}>Days Present</Text>
              </View>
              <Text style={[styles.overviewCardValue, { color: colors.textPrimary }]}>
                22
                <Text style={{ fontSize: 16, fontWeight: 'normal', color: colors.textSecond }}> / 31</Text>
              </Text>
            </View>
          </View>

          {/* Week Card */}
          <View style={[styles.thisWeekCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 24 }]}>
            <View style={styles.thisWeekHeaderRow}>
              <Text style={[styles.timeSectionTitle, { color: colors.textPrimary }]}>This Week</Text>
              <Text style={[styles.weekRangeText, { color: colors.brand }]}>{weekRangeStr}</Text>
            </View>

            {/* Weekday Letters */}
            <View style={styles.thisWeekDaysRow}>
              {weekdayLetters.map((letter, idx) => {
                const isTodayDay = weekDays[idx].getDate() === today.getDate() &&
                  weekDays[idx].getMonth() === today.getMonth() &&
                  weekDays[idx].getFullYear() === today.getFullYear();
                return (
                  <Text
                    key={idx}
                    style={[
                      styles.thisWeekDayLetter,
                      { color: isTodayDay ? colors.brand : colors.textMuted, fontWeight: isTodayDay ? '700' : '500' }
                    ]}
                  >
                    {letter}
                  </Text>
                );
              })}
            </View>

            {/* Weekday Numbers */}
            <View style={styles.thisWeekNumbersRow}>
              {weekDays.map((dateObj, idx) => {
                const isTodayDay = dateObj.getDate() === today.getDate() &&
                  dateObj.getMonth() === today.getMonth() &&
                  dateObj.getFullYear() === today.getFullYear();
                const isPastDay = dateObj < today && !isTodayDay;

                return (
                  <View key={idx} style={styles.thisWeekNumberCell}>
                    {isTodayDay ? (
                      <View style={[styles.thisWeekActiveCircle, { backgroundColor: colors.brand }]}>
                        <Text style={styles.thisWeekActiveNumberText}>{dateObj.getDate()}</Text>
                      </View>
                    ) : isPastDay ? (
                      <View style={[styles.thisWeekPastCircle, { backgroundColor: isDark ? colors.border : '#EFF6FF' }]}>
                        <Text style={[styles.thisWeekPastNumberText, { color: colors.textSecond }]}>{dateObj.getDate()}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.thisWeekFutureNumberText, { color: colors.textMuted }]}>{dateObj.getDate()}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent History Section */}
          <Text style={[styles.timeSectionTitle, { color: colors.textPrimary, marginTop: 24, marginBottom: 12 }]}>
            Recent History
          </Text>

          <View style={styles.historyListContainer}>
            {historyList.map((record, index) => (
              <View
                key={index}
                style={[styles.historyRecordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View
                  style={[
                    styles.historyIconContainer,
                    { backgroundColor: record.isLate ? '#FFFBEB' : '#F0FDF4' }
                  ]}
                >
                  <MaterialCommunityIcons
                    name={(record.isLate ? 'alert-outline' : 'clock-outline') as any}
                    size={20}
                    color={record.isLate ? '#D97706' : '#16A34A'}
                  />
                </View>

                <View style={styles.historyTextContainer}>
                  <Text style={[styles.historyDayText, { color: colors.textPrimary }]}>{record.day}</Text>
                  <Text style={[styles.historyTimeText, { color: colors.textSecond }]}>{record.timeRange}</Text>
                </View>

                <View
                  style={[
                    styles.historyStatusBadge,
                    { backgroundColor: record.isLate ? '#FFFBEB' : '#F0FDF4' }
                  ]}
                >
                  <Text
                    style={[
                      styles.historyStatusText,
                      { color: record.isLate ? '#D97706' : '#16A34A' }
                    ]}
                  >
                    {record.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* View Full History Link */}
          <TouchableOpacity
            onPress={() => onNavigate?.('attendance_history')}
            activeOpacity={0.7}
            style={styles.viewFullHistoryBtn}
          >
            <Text style={[styles.viewFullHistoryText, { color: colors.brand }]}>View Full History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── BOTTOM NAV TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard')}>
          <Feather name="home" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_team')}>
          <Feather name="users" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
          <Feather name="clock" size={20} color={colors.tabActive} />
          <Text style={[styles.tabTextActive, { color: colors.tabActive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'approvals' })}>
          <Feather name="check-circle" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_assets')}>
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
  timeScreenTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  timeScreenSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
    marginBottom: 20,
  },
  fingerprintBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fingerprintBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  currentTimeText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 14,
  },
  timeSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  timeOverviewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeOverviewCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  overviewCardLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  overviewCardValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  thisWeekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  weekRangeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  thisWeekCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  thisWeekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  thisWeekDayLetter: {
    fontSize: 12,
    width: 32,
    textAlign: 'center',
  },
  thisWeekNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  thisWeekNumberCell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thisWeekActiveCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  thisWeekActiveNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  thisWeekPastCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thisWeekPastNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  thisWeekFutureNumberText: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyListContainer: {
    gap: 10,
  },
  historyRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyDayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyTimeText: {
    fontSize: 12,
    marginTop: 2,
  },
  historyStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  viewFullHistoryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  viewFullHistoryText: {
    fontSize: 14,
    fontWeight: '700',
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
