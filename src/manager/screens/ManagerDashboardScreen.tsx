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
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';

interface ManagerDashboardScreenProps {
  onNavigate?: (screen: any, params?: any) => void;
  routeParams?: { menuOpen?: boolean };
  isCheckedInGlobal?: boolean;
  checkInTimeGlobal?: Date | null;
  onCheckInPress?: () => void;
  onCheckOutPress?: () => void;
}

export default function ManagerDashboardScreen({
  onNavigate,
  routeParams,
  isCheckedInGlobal,
  checkInTimeGlobal,
  onCheckInPress,
  onCheckOutPress,
}: ManagerDashboardScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors, toggleTheme, isDark } = useTheme();

  // Navigation menu drawer state
  const [menuOpen, setMenuOpen] = useState(false);

  // Tab Navigation and Filter States
  const [currentTab, setCurrentTab] = useState<'home' | 'team' | 'time' | 'approvals' | 'assets'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'on-time' | 'late' | 'absent'>('all');
  const [showAllLogs, setShowAllLogs] = useState(false);

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
  const [secondsElapsed, setSecondsElapsed] = useState(0);

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
      setCheckInTime('00:00 AM/PM');
      setWorkedHours('00.00 Hr');
      setSecondsElapsed(0);
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
    }
  }, [isCheckedInGlobal, checkInTimeGlobal]);

  // Pending Approvals state
  const [pendingCount, setPendingCount] = useState(5);
  const [viewAllPending, setViewAllPending] = useState(false);
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
    {
      id: 3,
      name: 'Michael Brown',
      type: 'Sick Leave',
      date: 'Oct 15 - Oct 16',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100',
    },
    {
      id: 4,
      name: 'Emily Davis',
      type: 'Work From Home',
      date: 'Oct 18',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=100',
    },
    {
      id: 5,
      name: 'James Wilson',
      type: 'Device Request',
      detail: 'MacBook Pro replacement',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100',
    }
  ]);

  // Celebrations state
  const [viewAllCelebrations, setViewAllCelebrations] = useState(false);
  const [celebrations, setCelebrations] = useState([
    {
      id: 1,
      name: 'Sarah Mitchell',
      type: 'birthday',
      subtitle: 'Birthday Tomorrow',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=100',
      actionLabel: 'WISH HER'
    },
    {
      id: 2,
      name: 'David Chen',
      type: 'anniversary',
      subtitle: '3rd Work Anniversary • May 15',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=100',
      actionLabel: 'CONGRATULATE'
    },
    {
      id: 3,
      name: 'John Doe',
      type: 'birthday',
      subtitle: 'Birthday in 3 days',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100',
      actionLabel: 'WISH HIM'
    },
    {
      id: 4,
      name: 'Emma Watson',
      type: 'anniversary',
      subtitle: '1st Work Anniversary • May 18',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=100',
      actionLabel: 'CONGRATULATE'
    }
  ]);

  // Check In/Out handler
  const handleCheckInToggle = () => {
    if (!isCheckedIn) {
      if (onCheckInPress) {
        onCheckInPress();
      } else {
        // Check In Fallback
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
      }
    } else {
      if (onCheckOutPress) {
        onCheckOutPress();
      } else {
        // Check Out Fallback
        setIsCheckedIn(false);
        setCheckInTime('00:00 AM/PM');
        setWorkedHours('00.00 Hr');
        if (timerIntervalId) {
          clearInterval(timerIntervalId);
          setTimerIntervalId(null);
        }
        Alert.alert('Success', 'Successfully checked out!');
      }
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



  // Dynamic Attendance Overview Chart States
  const [selectedWeekLabel, setSelectedWeekLabel] = useState('This Week');
  const [overviewViewMode, setOverviewViewMode] = useState<'chart' | 'week_select'>('chart');
  const [chartData, setChartData] = useState([
    { h: '50%', l: 'Mon' },
    { h: '75%', l: 'Tue' },
    { h: '40%', l: 'Wed' },
    { h: '95%', l: 'Thu' },
    { h: '70%', l: 'Fri' }
  ]);

  const handleSelectWeek = (week: string) => {
    setSelectedWeekLabel(week);
    if (week === 'This Week') {
      setChartData([
        { h: '50%', l: 'Mon' },
        { h: '75%', l: 'Tue' },
        { h: '40%', l: 'Wed' },
        { h: '95%', l: 'Thu' },
        { h: '70%', l: 'Fri' }
      ]);
    } else if (week === 'Last Week') {
      setChartData([
        { h: '80%', l: 'Mon' },
        { h: '60%', l: 'Tue' },
        { h: '90%', l: 'Wed' },
        { h: '50%', l: 'Thu' },
        { h: '85%', l: 'Fri' }
      ]);
    } else if (week.includes('Week 1')) {
      setChartData([
        { h: '90%', l: 'Mon' },
        { h: '95%', l: 'Tue' },
        { h: '85%', l: 'Wed' },
        { h: '90%', l: 'Thu' },
        { h: '80%', l: 'Fri' }
      ]);
    } else if (week.includes('Week 2')) {
      setChartData([
        { h: '60%', l: 'Mon' },
        { h: '70%', l: 'Tue' },
        { h: '55%', l: 'Wed' },
        { h: '80%', l: 'Thu' },
        { h: '65%', l: 'Fri' }
      ]);
    } else if (week.includes('Week 3')) {
      setChartData([
        { h: '40%', l: 'Mon' },
        { h: '50%', l: 'Tue' },
        { h: '75%', l: 'Wed' },
        { h: '60%', l: 'Thu' },
        { h: '90%', l: 'Fri' }
      ]);
    } else {
      setChartData([
        { h: '70%', l: 'Mon' },
        { h: '80%', l: 'Tue' },
        { h: '85%', l: 'Wed' },
        { h: '75%', l: 'Thu' },
        { h: '95%', l: 'Fri' }
      ]);
    }
  };

  // Calendar States & Navigation (Home Calendar)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');

  // Calendar States & Navigation (Team Calendar)
  const [teamCalendarDate, setTeamCalendarDate] = useState(new Date());
  const [teamCalendarViewMode, setTeamCalendarViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const [teamSelectedDate, setTeamSelectedDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, i) => currentYear - 6 + i);

  const getDayOfWeekLabelStr = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getMonthLabelStr = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), monthIndex, 1));
  };

  const handleSelectYear = (year: number) => {
    setCurrentCalendarDate(prev => new Date(year, prev.getMonth(), 1));
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectTeamMonth = (monthIndex: number) => {
    setTeamCalendarDate(prev => new Date(prev.getFullYear(), monthIndex, 1));
  };

  const handleSelectTeamYear = (year: number) => {
    setTeamCalendarDate(prev => new Date(year, prev.getMonth(), 1));
  };

  const handlePrevTeamMonth = () => {
    setTeamCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextTeamMonth = () => {
    setTeamCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Team members list
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: 'Sarah Jenkins',
      initials: 'SJ',
      checkInTime: '08:45 AM',
      status: 'On-time',
      avatarColor: '#E0F2FE',
      textColor: '#0284C7',
      dotColor: '#22C55E', // Green dot for on-time
    },
    {
      id: '2',
      name: 'Marcus Chen',
      initials: 'MC',
      checkInTime: '09:12 AM',
      status: 'Late',
      avatarColor: '#FFE4E6',
      textColor: '#E11D48',
      dotColor: '#F59E0B', // Orange dot for late
    },
    {
      id: '3',
      name: 'David Kim',
      initials: 'DK',
      checkInTime: '08:52 AM',
      status: 'On-time',
      avatarColor: '#F0FDF4',
      textColor: '#16A34A',
      dotColor: '#22C55E',
    },
    {
      id: '4',
      name: 'Alex Patel',
      initials: 'AP',
      checkInTime: 'No check-in',
      status: 'Absent',
      avatarColor: '#F1F5F9',
      textColor: '#64748B',
      dotColor: '#EF4444', // Red dot for absent
    },
    {
      id: '5',
      name: 'Priya Sharma',
      initials: 'PS',
      checkInTime: '08:58 AM',
      status: 'On-time',
      avatarColor: '#FAE8FF',
      textColor: '#C084FC',
      dotColor: '#22C55E',
    },
    {
      id: '6',
      name: 'Ryan Cooper',
      initials: 'RC',
      checkInTime: '09:30 AM',
      status: 'Late',
      avatarColor: '#FEF9C3',
      textColor: '#CA8A04',
      dotColor: '#F59E0B',
    },
  ]);

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && member.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getHolidayForMonth = (month: number, year: number) => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const cellDate = new Date(year, month, i);
      const dayOfWeek = cellDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const hash = (year + month * 31 + i) % 15;
        if (hash === 3) {
          return { day: i, label: 'Company Holiday' };
        }
      }
    }
    return { day: 25, label: 'Christmas Day' };
  };

  const generateDynamicCalendarGrid = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalDaysPrev = new Date(year, month, 0).getDate();

    let startDayOffset = firstDay.getDay();
    if (startDayOffset === 0) {
      startDayOffset = 6;
    } else {
      startDayOffset -= 1;
    }

    const cells: { day: number; current: boolean; status: string; selected?: boolean }[] = [];

    for (let i = startDayOffset - 1; i >= 0; i--) {
      cells.push({
        day: totalDaysPrev - i,
        current: false,
        status: 'none',
      });
    }

    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
      const cellDate = new Date(year, month, i);
      const dayOfWeek = cellDate.getDay();
      
      let status = 'none';
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const hash = (year + month * 31 + i) % 15;
        if (hash === 1) status = 'absent';
        else if (hash === 2) status = 'leave';
        else if (hash === 3) status = 'holiday';
        else if (hash === 4) status = 'halfday';
        else status = 'present';
      }

      const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;

      cells.push({
        day: i,
        current: true,
        status,
        selected: isToday,
      });
    }

    const remaining = 35 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        current: false,
        status: 'none',
      });
    }

    const finalCells = cells.slice(0, 35);
    const rows = [];
    for (let i = 0; i < finalCells.length; i += 7) {
      rows.push(finalCells.slice(i, i + 7));
    }
    return rows;
  };

  const generateDynamicTeamCalendarGrid = () => {
    const year = teamCalendarDate.getFullYear();
    const month = teamCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalDaysPrev = new Date(year, month, 0).getDate();

    let startDayOffset = firstDay.getDay();
    if (startDayOffset === 0) {
      startDayOffset = 6;
    } else {
      startDayOffset -= 1;
    }

    const cells: { day: number; current: boolean; status: string; dateObj: Date }[] = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dNum = totalDaysPrev - i;
      cells.push({
        day: dNum,
        current: false,
        status: 'none',
        dateObj: new Date(prevMonthYear, prevMonth, dNum)
      });
    }

    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (let i = 1; i <= totalDays; i++) {
      const cellDate = new Date(year, month, i);
      const dayOfWeek = cellDate.getDay();
      
      let status = 'none';
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateZero = new Date(year, month, i);
        if (dateZero < todayZero) {
          if (i === 13) {
            status = 'absent';
          } else if (i === 16) {
            status = 'halfday';
          } else if (i === 22) {
            status = 'leave';
          } else {
            status = 'present';
          }
        }
      }

      cells.push({
        day: i,
        current: true,
        status,
        dateObj: cellDate
      });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remaining = 35 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        current: false,
        status: 'none',
        dateObj: new Date(nextMonthYear, nextMonth, i)
      });
    }

    const finalCells = cells.slice(0, 35);
    const rows = [];
    for (let i = 0; i < finalCells.length; i += 7) {
      rows.push(finalCells.slice(i, i + 7));
    }
    return rows;
  };

  const renderTeamOverviewContent = () => {
    const currentCalendarGrid = generateDynamicTeamCalendarGrid();
    const holiday = getHolidayForMonth(teamCalendarDate.getMonth(), teamCalendarDate.getFullYear());
    const holidayCount = currentCalendarGrid.reduce((count, row) => count + row.filter(cell => cell.current && cell.status === 'holiday').length, 0);

    return (
      <View style={{ marginTop: 16 }}>
        {/* Search Bar Container */}
        <View style={[styles.searchBarContainer, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search team members..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsContainer}>
          {(['all', 'on-time', 'late', 'absent'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const label = filter === 'all' ? 'All' : filter === 'on-time' ? 'On-time' : filter.charAt(0).toUpperCase() + filter.slice(1);
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive
                    ? { backgroundColor: colors.brand }
                    : { backgroundColor: isDark ? colors.border : '#EFF6FF' },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive
                      ? { color: '#FFFFFF', fontWeight: '700' }
                      : { color: colors.textSecond },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Team Attendance Header */}
        <View style={styles.attendanceHeader}>
          <View>
            <Text style={[styles.attendanceTitle, { color: colors.textPrimary }]}>Team Attendance</Text>
            <Text style={[styles.attendanceSubtitle, { color: colors.textSecond }]}>
              {getDayOfWeekLabelStr(teamSelectedDate)}, {getMonthLabelStr(teamSelectedDate.getMonth())} {teamSelectedDate.getDate()}, {teamSelectedDate.getFullYear()}
            </Text>
          </View>
        </View>

        {/* Calendar Card */}
        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {teamCalendarViewMode === 'calendar' ? (
            <>
              <View style={styles.calendarHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Month Selector */}
                  <TouchableOpacity
                    onPress={() => setTeamCalendarViewMode('month')}
                    style={styles.calendarHeaderClickable}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>
                      {teamCalendarDate.toLocaleString('en-US', { month: 'long' })}
                    </Text>
                    <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 3 }} />
                  </TouchableOpacity>

                  {/* Year Selector */}
                  <TouchableOpacity
                    onPress={() => setTeamCalendarViewMode('year')}
                    style={[styles.calendarHeaderClickable, { marginLeft: 8 }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>
                      {teamCalendarDate.getFullYear()}
                    </Text>
                    <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarArrows}>
                  <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevTeamMonth}>
                    <Feather name="chevron-left" size={18} color={colors.textSecond} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arrowBtn} onPress={handleNextTeamMonth}>
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
                {currentCalendarGrid.map((row, rIdx) => (
                  <View key={rIdx} style={styles.calendarRow}>
                    {row.map((cell, cIdx) => {
                      let dotColor = 'transparent';
                      if (cell.status === 'present') dotColor = '#22C55E';
                      else if (cell.status === 'absent') dotColor = '#EF4444';
                      else if (cell.status === 'leave') dotColor = '#F59E0B';
                      else if (cell.status === 'holiday') dotColor = '#3B82F6';
                      else if (cell.status === 'halfday') dotColor = '#A855F7';

                      const isSelected = cell.current &&
                        cell.dateObj.getDate() === teamSelectedDate.getDate() &&
                        cell.dateObj.getMonth() === teamSelectedDate.getMonth() &&
                        cell.dateObj.getFullYear() === teamSelectedDate.getFullYear();

                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={styles.calendarCell}
                          onPress={() => {
                            if (cell.current) {
                              setTeamSelectedDate(cell.dateObj);
                            }
                          }}
                        >
                          <View
                            style={[
                              styles.dayNumberContainer,
                              isSelected && [styles.selectedDayNumber, { backgroundColor: colors.brand }]
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayNumberText,
                                {
                                  color: isSelected
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
                        </TouchableOpacity>
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
            </>
          ) : teamCalendarViewMode === 'month' ? (
            <>
              <View style={styles.calendarHeader}>
                <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>Select Month</Text>
                <TouchableOpacity onPress={() => setTeamCalendarViewMode('calendar')}>
                  <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectorGrid}>
                {monthNames.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.selectorGridItem,
                      { backgroundColor: colors.iconBg },
                      teamCalendarDate.getMonth() === idx && { backgroundColor: colors.brand }
                    ]}
                    onPress={() => {
                      handleSelectTeamMonth(idx);
                      setTeamCalendarViewMode('calendar');
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorGridItemText,
                        { color: teamCalendarDate.getMonth() === idx ? '#FFFFFF' : colors.textPrimary }
                      ]}
                    >
                      {m.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.calendarHeader}>
                <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>Select Year</Text>
                <TouchableOpacity onPress={() => setTeamCalendarViewMode('calendar')}>
                  <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectorGrid}>
                {yearOptions.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.selectorGridItem,
                      { backgroundColor: colors.iconBg },
                      teamCalendarDate.getFullYear() === y && { backgroundColor: colors.brand }
                    ]}
                    onPress={() => {
                      handleSelectTeamYear(y);
                      setTeamCalendarViewMode('calendar');
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorGridItemText,
                        { color: teamCalendarDate.getFullYear() === y ? '#FFFFFF' : colors.textPrimary }
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Stats Cards Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
          style={{ marginBottom: 20, marginTop: 20 }}
        >
          {/* Present card */}
          <View style={[styles.statCardTeam, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#22C55E' }]} />
              <Text style={[styles.statCardLabel, { color: colors.textSecond }]}>Present</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: colors.textPrimary }]}>42</Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#F0FDF4' }]}>
              <Feather name="arrow-up-right" size={12} color="#16A34A" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#16A34A' }]}>91%</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#22C55E' }]} />
          </View>

          {/* Late card */}
          <View style={[styles.statCardTeam, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.statCardLabel, { color: colors.textSecond }]}>Late</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: colors.textPrimary }]}>3</Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#FFFBEB' }]}>
              <Feather name="clock" size={12} color="#D97706" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#D97706' }]}>6.5%</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#F59E0B' }]} />
          </View>

          {/* Absent card */}
          <View style={[styles.statCardTeam, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.statCardLabel, { color: colors.textSecond }]}>Absent</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: colors.textPrimary }]}>1</Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="x" size={12} color="#EF4444" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#EF4444' }]}>2.1%</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#EF4444' }]} />
          </View>

          {/* Holiday card */}
          <View style={[styles.statCardTeam, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.statCardLabel, { color: colors.textSecond }]}>Holiday</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: colors.textPrimary }]}>
              {holidayCount}
            </Text>
            <View style={[styles.statCardBadge, { backgroundColor: isDark ? colors.border : '#EFF6FF' }]}>
              <Feather name="calendar" size={12} color="#3B82F6" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#3B82F6' }]}>{getMonthLabelStr(teamCalendarDate.getMonth())} {holiday.day}</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#3B82F6' }]} />
          </View>
        </ScrollView>

        {/* Today's Logs */}
        <View style={styles.teamLogsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Logs</Text>
          {filteredTeamMembers.length > 4 && (
            <TouchableOpacity onPress={() => setShowAllLogs(!showAllLogs)}>
              <Text style={[styles.viewAllText, { color: colors.brand }]}>
                {showAllLogs ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.teamLogsList}>
          {filteredTeamMembers.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No team members found</Text>
          ) : (
            (showAllLogs ? filteredTeamMembers : filteredTeamMembers.slice(0, 4)).map((member) => (
              <View key={member.id} style={[styles.teamLogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.teamLogAvatarWrap}>
                  <View style={[styles.teamLogInitialsAvatar, { backgroundColor: member.avatarColor }]}>
                    <Text style={[styles.teamLogInitialsText, { color: member.textColor }]}>
                      {member.initials}
                    </Text>
                  </View>
                  <View style={[styles.teamLogActiveDot, { backgroundColor: member.dotColor }]} />
                </View>

                <View style={styles.teamLogDetails}>
                  <Text style={[styles.teamLogName, { color: colors.textPrimary }]}>{member.name}</Text>
                  <View style={styles.teamLogCheckInWrap}>
                    {member.status === 'Absent' ? (
                      <Feather name="x" size={12} color={colors.textSecond} style={{ marginRight: 4 }} />
                    ) : (
                      <Feather name="log-in" size={12} color={colors.textSecond} style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.teamLogCheckInText, { color: colors.textSecond }]}>
                      {member.checkInTime}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        member.status === 'On-time'
                          ? '#F0FDF4'
                          : member.status === 'Late'
                          ? '#FFFBEB'
                          : '#FEF2F2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          member.status === 'On-time'
                            ? '#16A34A'
                            : member.status === 'Late'
                            ? '#D97706'
                            : '#EF4444',
                      },
                    ]}
                  >
                    {member.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderPlaceholderTab = (tabName: string) => (
    <View style={styles.placeholderContainer}>
      <MaterialCommunityIcons
        name={
          tabName === 'time'
            ? 'clock-outline'
            : 'package-variant-closed'
        }
        size={64}
        color={colors.textMuted}
        style={{ marginBottom: 16 }}
      />
      <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
        {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Screen
      </Text>
      <Text style={[styles.placeholderDesc, { color: colors.textSecond }]}>
        This section is currently under development. Please check back later.
      </Text>
    </View>
  );

  const renderApprovalsTab = () => (
    <View style={{ marginTop: 8 }}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Pending Approvals</Text>
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
  );

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
          {currentTab === 'team' && (
            <Text style={[styles.headerTitle, { color: colors.textPrimary, marginLeft: 12 }]}>
              Team Overview
            </Text>
          )}
        </View>


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

      {/* ── MAIN SCROLL CONTENT (HOME) ── */}
      {currentTab === 'home' && (
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
                <Text style={[styles.statCount, { color: '#DC2626' }]}>8</Text>
              </View>
              <View style={styles.redDecorationCircle} />
            </View>
          </View>

          {/* Attendance Overview Card */}
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {overviewViewMode === 'chart' ? (
              <>
                <View style={styles.overviewHeader}>
                  <Text style={[styles.overviewTitle, { color: colors.textPrimary }]}>Attendance Overview</Text>
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    activeOpacity={0.7}
                    onPress={() => setOverviewViewMode('week_select')}
                  >
                    <Text style={[styles.dropdownText, { color: colors.textSecond }]}>{selectedWeekLabel}</Text>
                    <Feather name="chevron-down" size={14} color={colors.textSecond} />
                  </TouchableOpacity>
                </View>

                <View style={styles.chartContainer}>
                  <View style={[styles.gridLine, { bottom: '0%', backgroundColor: colors.borderLight }]} />
                  <View style={[styles.gridLine, { bottom: '25%', backgroundColor: colors.borderLight }]} />
                  <View style={[styles.gridLine, { bottom: '50%', backgroundColor: colors.borderLight }]} />
                  <View style={[styles.gridLine, { bottom: '75%', backgroundColor: colors.borderLight }]} />
                  <View style={styles.barsRow}>
                    {chartData.map((item) => (
                      <View key={item.l} style={styles.barGroup}>
                        <View style={[styles.bar, { height: item.h as any, backgroundColor: colors.brand }]} />
                        <Text style={[styles.barLabel, { color: colors.textSecond }]}>{item.l}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.overviewHeader}>
                  <Text style={[styles.overviewTitle, { color: colors.textPrimary }]}>Select Week</Text>
                  <TouchableOpacity onPress={() => setOverviewViewMode('chart')}>
                    <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectorGrid}>
                  {[
                    'This Week',
                    'Last Week',
                    'Week 1 (1st - 7th)',
                    'Week 2 (8th - 14th)',
                    'Week 3 (15th - 21st)',
                    'Week 4 (22nd - End)'
                  ].map((week) => (
                    <TouchableOpacity
                      key={week}
                      style={[
                        styles.selectorGridItem,
                        { backgroundColor: colors.iconBg },
                        selectedWeekLabel === week && { backgroundColor: colors.brand }
                      ]}
                      onPress={() => {
                        handleSelectWeek(week);
                        setOverviewViewMode('chart');
                      }}
                    >
                      <Text
                        style={[
                          styles.selectorGridItemText,
                          { color: selectedWeekLabel === week ? '#FFFFFF' : colors.textPrimary }
                        ]}
                      >
                        {week.replace(' (1st - 7th)', '').replace(' (8th - 14th)', '').replace(' (15th - 21st)', '').replace(' (22nd - End)', '')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Calendar Card */}
          <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {calendarViewMode === 'calendar' ? (
              <>
                <View style={styles.calendarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Month Selector */}
                    <TouchableOpacity
                      onPress={() => setCalendarViewMode('month')}
                      style={styles.calendarHeaderClickable}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>
                        {currentCalendarDate.toLocaleString('en-US', { month: 'long' })}
                      </Text>
                      <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>

                    {/* Year Selector */}
                    <TouchableOpacity
                      onPress={() => setCalendarViewMode('year')}
                      style={[styles.calendarHeaderClickable, { marginLeft: 8 }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>
                        {currentCalendarDate.getFullYear()}
                      </Text>
                      <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarArrows}>
                    <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
                      <Feather name="chevron-left" size={18} color={colors.textSecond} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
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
                  {generateDynamicCalendarGrid().map((row, rIdx) => (
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
              </>
            ) : calendarViewMode === 'month' ? (
              <>
                <View style={styles.calendarHeader}>
                  <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>Select Month</Text>
                  <TouchableOpacity onPress={() => setCalendarViewMode('calendar')}>
                    <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectorGrid}>
                  {monthNames.map((m, idx) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.selectorGridItem,
                        { backgroundColor: colors.iconBg },
                        currentCalendarDate.getMonth() === idx && { backgroundColor: colors.brand }
                      ]}
                      onPress={() => {
                        handleSelectMonth(idx);
                        setCalendarViewMode('calendar');
                      }}
                    >
                      <Text
                        style={[
                          styles.selectorGridItemText,
                          { color: currentCalendarDate.getMonth() === idx ? '#FFFFFF' : colors.textPrimary }
                        ]}
                      >
                        {m.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={styles.calendarHeader}>
                  <Text style={[styles.calendarTitle, { color: colors.textPrimary }]}>Select Year</Text>
                  <TouchableOpacity onPress={() => setCalendarViewMode('calendar')}>
                    <Text style={{ color: colors.brand, fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectorGrid}>
                  {yearOptions.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.selectorGridItem,
                        { backgroundColor: colors.iconBg },
                        currentCalendarDate.getFullYear() === y && { backgroundColor: colors.brand }
                      ]}
                      onPress={() => {
                        handleSelectYear(y);
                        setCalendarViewMode('calendar');
                      }}
                    >
                      <Text
                        style={[
                          styles.selectorGridItemText,
                          { color: currentCalendarDate.getFullYear() === y ? '#FFFFFF' : colors.textPrimary }
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Pending Approvals List */}
          <View style={styles.pendingSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pending Approvals</Text>
            <TouchableOpacity onPress={() => setCurrentTab('approvals')}>
              <Text style={[styles.viewAllText, { color: colors.brand }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.approvalsList}>
            {pendingRequests.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No pending approvals</Text>
            ) : (
              pendingRequests.slice(0, 2).map((req) => (
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
            <TouchableOpacity onPress={() => setViewAllCelebrations(!viewAllCelebrations)}>
              <Text style={[styles.viewAllText, { color: colors.brand }]}>
                {viewAllCelebrations ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.celebrationsList}>
            {celebrations.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No celebrations this week</Text>
            ) : (
              (viewAllCelebrations ? celebrations : celebrations.slice(0, 2)).map((celeb) => (
                <View key={celeb.id} style={[styles.celebrationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.celebLeft}>
                    <Image source={{ uri: celeb.avatar }} style={styles.celebAvatar} />
                    <View style={styles.celebTextContainer}>
                      <Text style={[styles.celebName, { color: colors.textPrimary }]}>{celeb.name}</Text>
                      <Text style={[styles.celebSubtitle, { color: colors.textSecond }]}>{celeb.subtitle}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.celebActionBtn, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}
                    onPress={() => handleCelebrateAction(celeb.name, celeb.type as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.celebActionText, { color: colors.brand }]}>{celeb.actionLabel}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
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
        </ScrollView>
      )}

      {/* ── TEAM TAB CONTENT ── */}
      {currentTab === 'team' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderTeamOverviewContent()}
        </ScrollView>
      )}

      {/* ── TIME TAB CONTENT ── */}
      {currentTab === 'time' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderPlaceholderTab('time')}
        </ScrollView>
      )}

      {/* ── APPROVALS TAB CONTENT ── */}
      {currentTab === 'approvals' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderApprovalsTab()}
        </ScrollView>
      )}

      {/* ── ASSETS TAB CONTENT ── */}
      {currentTab === 'assets' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderPlaceholderTab('assets')}
        </ScrollView>
      )}

      {/* ── BOTTOM NAV TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('home')}>
          <Feather name="home" size={20} color={currentTab === 'home' ? colors.tabActive : colors.tabInactive} />
          <Text style={[currentTab === 'home' ? styles.tabTextActive : styles.tabText, { color: currentTab === 'home' ? colors.tabActive : colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('team')}>
          <Feather name="users" size={20} color={currentTab === 'team' ? colors.tabActive : colors.tabInactive} />
          <Text style={[currentTab === 'team' ? styles.tabTextActive : styles.tabText, { color: currentTab === 'team' ? colors.tabActive : colors.tabInactive }]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('time')}>
          <Feather name="clock" size={20} color={currentTab === 'time' ? colors.tabActive : colors.tabInactive} />
          <Text style={[currentTab === 'time' ? styles.tabTextActive : styles.tabText, { color: currentTab === 'time' ? colors.tabActive : colors.tabInactive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('approvals')}>
          <Feather name="check-square" size={20} color={currentTab === 'approvals' ? colors.tabActive : colors.tabInactive} />
          <Text style={[currentTab === 'approvals' ? styles.tabTextActive : styles.tabText, { color: currentTab === 'approvals' ? colors.tabActive : colors.tabInactive }]}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('assets')}>
          <Feather name="package" size={20} color={currentTab === 'assets' ? colors.tabActive : colors.tabInactive} />
          <Text style={[currentTab === 'assets' ? styles.tabTextActive : styles.tabText, { color: currentTab === 'assets' ? colors.tabActive : colors.tabInactive }]}>Assets</Text>
        </TouchableOpacity>
      </View>

      {/* ── SIDEBAR DRAWER OVERLAY ── */}
      <ManagerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(screen, params) => {
          setMenuOpen(false);
          if (screen === 'admin_staff') {
            setCurrentTab('team');
          } else if (onNavigate) {
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
    fontSize: 18,
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
    fontSize: 14,
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
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDecorationCircle: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    opacity: 0.15,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    zIndex: 2,
  },
  bannerCount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    zIndex: 2,
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
  weekDropdownMenu: {
    position: 'absolute',
    top: 25,
    right: 0,
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartContainer: {
    height: 180,
    position: 'relative',
    marginTop: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barGroup: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 30,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
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
  calendarHeaderClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  selectorGridItem: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectorGridItemText: {
    fontSize: 13,
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
  subTabWrapper: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  subTabActiveBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  attendanceSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsScrollContainer: {
    gap: 12,
    paddingRight: 16,
  },
  statCardTeam: {
    width: 140,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  statCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardDecoratorCircle: {
    position: 'absolute',
    right: -15,
    top: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.15,
  },
  teamLogsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamLogsList: {
    marginBottom: 20,
  },
  teamLogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  teamLogAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  teamLogInitialsAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogInitialsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamLogActiveDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  teamLogDetails: {
    flex: 1,
  },
  teamLogName: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamLogCheckInWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  teamLogCheckInText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholderDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
