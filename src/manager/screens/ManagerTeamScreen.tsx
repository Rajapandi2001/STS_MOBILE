import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';

interface ManagerTeamScreenProps {
  onNavigate?: (screen: any, params?: any) => void;
  routeParams?: any;
}

export default function ManagerTeamScreen({
  onNavigate,
  routeParams,
}: ManagerTeamScreenProps = {}) {
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

  // Tab Navigation and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'on-time' | 'late' | 'absent'>('all');
  const [showAllLogs, setShowAllLogs] = useState(false);

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

  const currentCalendarGrid = generateDynamicTeamCalendarGrid();
  const holiday = getHolidayForMonth(teamCalendarDate.getMonth(), teamCalendarDate.getFullYear());
  const holidayCount = currentCalendarGrid.reduce((count, row) => count + row.filter(cell => cell.current && cell.status === 'holiday').length, 0);

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
            Team Overview
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
      </ScrollView>

      {/* ── BOTTOM NAV TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard')}>
          <Feather name="home" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
          <Feather name="users" size={20} color={colors.tabActive} />
          <Text style={[styles.tabTextActive, { color: colors.tabActive }]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_time')}>
          <Feather name="clock" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
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
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
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
