import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface DashboardScreenProps {
  onSignOut?: () => void;
  onCheckIn?: () => void;
}

export default function DashboardScreen({ onSignOut, onCheckIn }: DashboardScreenProps) {
  const insets = useSafeAreaInsets();

  // Dynamic Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'home' | 'calendar' | 'team' | 'approvals' | 'profile'>('home');

  // Team Page States
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamActiveFilter, setTeamActiveFilter] = useState<'all' | 'on-time' | 'late' | 'absent'>('all');
  const [teamCalendarDate, setTeamCalendarDate] = useState(new Date());
  const [teamCalendarViewMode, setTeamCalendarViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const [teamSelectedDate, setTeamSelectedDate] = useState(new Date());
  const [showAllTeamLogs, setShowAllTeamLogs] = useState(false);

  // Month/Year Options for Selectors
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const yearOptions = [2024, 2025, 2026, 2027, 2028];

  // Mock Team Members
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: 'John Doe',
      role: 'Software Engineer',
      status: 'On-time',
      time: '09:15 AM',
      avatarColor: '#EBF2FF',
      textColor: '#0A52D6',
      initials: 'JD',
      dotColor: '#22C55E',
      attendance: { present: 20, absent: 1, leave: 1, late: 2, halfday: 0 }
    },
    {
      id: '2',
      name: 'Sarah Jenkins',
      role: 'UX Designer',
      status: 'Late',
      time: '09:45 AM',
      avatarColor: '#FFF5ED',
      textColor: '#FD8D3C',
      initials: 'SJ',
      dotColor: '#F59E0B',
      attendance: { present: 18, absent: 2, leave: 2, late: 3, halfday: 1 }
    },
    {
      id: '3',
      name: 'Michael Chang',
      role: 'Product Manager',
      status: 'On-time',
      time: '09:05 AM',
      avatarColor: '#EAF7EE',
      textColor: '#22C55E',
      initials: 'MC',
      dotColor: '#22C55E',
      attendance: { present: 22, absent: 0, leave: 1, late: 1, halfday: 0 }
    },
    {
      id: '4',
      name: 'Emily Davis',
      role: 'QA Engineer',
      status: 'Absent',
      time: '—',
      avatarColor: '#FEF2F2',
      textColor: '#EF4444',
      initials: 'ED',
      dotColor: '#EF4444',
      attendance: { present: 19, absent: 3, leave: 0, late: 1, halfday: 1 }
    },
    {
      id: '5',
      name: 'David Wilson',
      role: 'DevOps Engineer',
      status: 'On-time',
      time: '08:50 AM',
      avatarColor: '#EEF2FF',
      textColor: '#6366F1',
      initials: 'DW',
      dotColor: '#22C55E',
      attendance: { present: 21, absent: 1, leave: 1, late: 0, halfday: 0 }
    }
  ]);


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar grid (starting on Monday)
  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    // firstDayOfMonth.getDay() maps Sun=0, Mon=1, ..., Sat=6
    // We want Mon=0, Tue=1, ..., Sun=6
    let startDayOffset = firstDayOfMonth.getDay();
    if (startDayOffset === 0) {
      startDayOffset = 6;
    } else {
      startDayOffset -= 1;
    }

    const gridItems = [];

    // Previous month's trailing days
    for (let i = startDayOffset - 1; i >= 0; i--) {
      gridItems.push({
        day: totalDaysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, totalDaysInPrevMonth - i),
      });
    }

    // Current month's days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      gridItems.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month's leading days to fill up to multiple of 7
    const totalCells = Math.ceil(gridItems.length / 7) * 7;
    const remainingCells = totalCells - gridItems.length;
    for (let i = 1; i <= remainingCells; i++) {
      gridItems.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    // Chunk gridItems into arrays of 7 (representing rows of a week)
    const chunked = [];
    for (let i = 0; i < gridItems.length; i += 7) {
      chunked.push(gridItems.slice(i, i + 7));
    }
    return chunked;
  };

  // Mock status indicator based on day number for realistic visual styling
  const getDayStatusDot = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const yr = date.getFullYear();
    // Only display indicators for active view month and year
    if (month !== currentDate.getMonth() || yr !== currentDate.getFullYear()) return null;

    // Simulate markers
    if (day === 2 || day === 16) return 'absent';
    if (day === 3 || day === 17) return 'absent';
    if (day === 1 || day === 25) return 'holiday';
    if (day === 15) return 'leave';
    if (day === 20 || day === 21) return 'wfh';
    if (day > 3 && day < 15 && day !== 10) return 'present';
    if (day > 21 && day < 30) return 'present';
    return null;
  };

  const calendarRows = getCalendarGrid();

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

  const getDayOfWeekLabelStr = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getMonthLabelStr = (monthIndex: number) => {
    return months[monthIndex];
  };

  const getHolidayForMonth = (month: number, year: number) => {
    if (month === 11) return { day: 25, label: 'Christmas Day' };
    return { day: 1, label: 'National Holiday' };
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

  const renderPlaceholderTab = (tabName: string) => (
    <View style={styles.placeholderContainer}>
      <MaterialCommunityIcons
        name={
          tabName === 'approvals'
            ? 'shield-check-outline'
            : 'account-outline'
        }
        size={64}
        color="#94A3B8"
        style={{ marginBottom: 16 }}
      />
      <Text style={[styles.placeholderTitle, { color: '#0F172A' }]}>
        {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Screen
      </Text>
      <Text style={[styles.placeholderDesc, { color: '#64748B' }]}>
        This section is currently under development. Please check back later.
      </Text>
    </View>
  );

  const renderCalendarTabContent = () => {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>My Schedule</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <View style={styles.calendarControls}>
              <TouchableOpacity style={styles.calendarArrow} activeOpacity={0.6} onPress={handlePrevMonth}>
                <Feather name="chevron-left" size={18} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.calendarArrow} activeOpacity={0.6} onPress={handleNextMonth}>
                <Feather name="chevron-right" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            <View style={styles.calendarDaysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.calendarDayHeader}>{day}</Text>
              ))}
            </View>

            {calendarRows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.calendarDaysRow}>
                {row.map((item, cellIdx) => {
                  const isSelected = selectedDate.getDate() === item.day &&
                    selectedDate.getMonth() === item.date.getMonth() &&
                    selectedDate.getFullYear() === item.date.getFullYear();

                  const dotStatus = getDayStatusDot(item.date);

                  return (
                    <TouchableOpacity
                      key={cellIdx}
                      style={styles.calendarDayCell}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (item.isCurrentMonth) {
                          setSelectedDate(item.date);
                        }
                      }}
                    >
                      {isSelected ? (
                        <View style={styles.selectedDayCircle}>
                          <Text style={styles.selectedDayText}>{item.day}</Text>
                        </View>
                      ) : (
                        <Text style={item.isCurrentMonth ? styles.calendarDayText : styles.calendarDayTextGray}>
                          {item.day}
                        </Text>
                      )}

                      {!isSelected && dotStatus && (
                        <View style={[
                          {
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            position: 'absolute',
                            bottom: 2,
                          },
                          dotStatus === 'present' && { backgroundColor: '#22C55E' },
                          dotStatus === 'absent' && { backgroundColor: '#EF4444' },
                          dotStatus === 'leave' && { backgroundColor: '#D97706' },
                          dotStatus === 'holiday' && { backgroundColor: '#0A52D6' },
                          dotStatus === 'wfh' && { backgroundColor: '#9333EA' },
                        ]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Calendar Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.legendText}>PRESENT</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>ABSENT</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.legendText}>LEAVE</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0A52D6' }]} />
              <Text style={styles.legendText}>HOLIDAY</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
              <Text style={styles.legendText}>WFH</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTeamOverviewContent = () => {
    const currentCalendarGrid = generateDynamicTeamCalendarGrid();
    const holiday = getHolidayForMonth(teamCalendarDate.getMonth(), teamCalendarDate.getFullYear());
    const holidayCount = currentCalendarGrid.reduce((count, row) => count + row.filter(cell => cell.current && cell.status === 'holiday').length, 0);

    const filteredTeamMembers = teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                           member.role.toLowerCase().includes(teamSearchQuery.toLowerCase());
      
      if (teamActiveFilter === 'all') return matchesSearch;
      if (teamActiveFilter === 'on-time') return matchesSearch && member.status.toLowerCase() === 'on-time';
      if (teamActiveFilter === 'late') return matchesSearch && member.status.toLowerCase() === 'late';
      if (teamActiveFilter === 'absent') return matchesSearch && member.status.toLowerCase() === 'absent';
      return matchesSearch;
    });

    return (
      <View style={{ marginTop: 16 }}>
        {/* Search Bar Container */}
        <View style={[styles.searchBarContainer, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
          <Feather name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: '#0F172A' }]}
            placeholder="Search team members..."
            placeholderTextColor="#94A3B8"
            value={teamSearchQuery}
            onChangeText={setTeamSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsContainer}>
          {(['all', 'on-time', 'late', 'absent'] as const).map((filter) => {
            const isActive = teamActiveFilter === filter;
            const label = filter === 'all' ? 'All' : filter === 'on-time' ? 'On-time' : filter.charAt(0).toUpperCase() + filter.slice(1);
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive
                    ? { backgroundColor: '#0A52D6' }
                    : { backgroundColor: '#EFF6FF' },
                ]}
                onPress={() => setTeamActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive
                      ? { color: '#FFFFFF', fontWeight: '700' }
                      : { color: '#475569' },
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
            <Text style={[styles.attendanceTitle, { color: '#0F172A' }]}>Team Attendance</Text>
            <Text style={[styles.attendanceSubtitle, { color: '#64748B' }]}>
              {getDayOfWeekLabelStr(teamSelectedDate)}, {getMonthLabelStr(teamSelectedDate.getMonth())} {teamSelectedDate.getDate()}, {teamSelectedDate.getFullYear()}
            </Text>
          </View>
        </View>

        {/* Calendar Card */}
        <View style={[styles.calendarCard, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
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
                    <Text style={[styles.calendarTitle, { color: '#0F172A' }]}>
                      {teamCalendarDate.toLocaleString('en-US', { month: 'long' })}
                    </Text>
                    <Feather name="chevron-down" size={12} color="#64748B" style={{ marginLeft: 3 }} />
                  </TouchableOpacity>

                  {/* Year Selector */}
                  <TouchableOpacity
                    onPress={() => setTeamCalendarViewMode('year')}
                    style={[styles.calendarHeaderClickable, { marginLeft: 8 }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.calendarTitle, { color: '#0F172A' }]}>
                      {teamCalendarDate.getFullYear()}
                    </Text>
                    <Feather name="chevron-down" size={12} color="#64748B" style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarArrows}>
                  <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevTeamMonth}>
                    <Feather name="chevron-left" size={18} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arrowBtn} onPress={handleNextTeamMonth}>
                    <Feather name="chevron-right" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekday Labels */}
              <View style={styles.weekdayRow}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <Text key={idx} style={[styles.weekdayText, { color: '#94A3B8' }]}>{day}</Text>
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
                              isSelected && [styles.selectedDayNumber, { backgroundColor: '#0A52D6' }]
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayNumberText,
                                {
                                  color: isSelected
                                    ? '#FFFFFF'
                                    : cell.current
                                      ? '#0F172A'
                                      : '#CBD5E1'
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
                    <Text style={[styles.legendText, { color: '#64748B' }]}>{leg.label}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : teamCalendarViewMode === 'month' ? (
            <>
              <View style={styles.calendarHeader}>
                <Text style={[styles.calendarTitle, { color: '#0F172A' }]}>Select Month</Text>
                <TouchableOpacity onPress={() => setTeamCalendarViewMode('calendar')}>
                  <Text style={{ color: '#0A52D6', fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectorGrid}>
                {monthNames.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.selectorGridItem,
                      { backgroundColor: '#F8FAFC' },
                      teamCalendarDate.getMonth() === idx && { backgroundColor: '#0A52D6' }
                    ]}
                    onPress={() => {
                      handleSelectTeamMonth(idx);
                      setTeamCalendarViewMode('calendar');
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorGridItemText,
                        { color: teamCalendarDate.getMonth() === idx ? '#FFFFFF' : '#0F172A' }
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
                <Text style={[styles.calendarTitle, { color: '#0F172A' }]}>Select Year</Text>
                <TouchableOpacity onPress={() => setTeamCalendarViewMode('calendar')}>
                  <Text style={{ color: '#0A52D6', fontSize: 13, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectorGrid}>
                {yearOptions.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.selectorGridItem,
                      { backgroundColor: '#F8FAFC' },
                      teamCalendarDate.getFullYear() === y && { backgroundColor: '#0A52D6' }
                    ]}
                    onPress={() => {
                      handleSelectTeamYear(y);
                      setTeamCalendarViewMode('calendar');
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorGridItemText,
                        { color: teamCalendarDate.getFullYear() === y ? '#FFFFFF' : '#0F172A' }
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
          <View style={[styles.statCardTeam, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#22C55E' }]} />
              <Text style={[styles.statCardLabel, { color: '#64748B' }]}>Present</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: '#0F172A' }]}>3</Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#F0FDF4' }]}>
              <Feather name="arrow-up-right" size={12} color="#16A34A" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#16A34A' }]}>60%</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#22C55E' }]} />
          </View>

          {/* Late card */}
          <View style={[styles.statCardTeam, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.statCardLabel, { color: '#64748B' }]}>Late</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: '#0F172A' }]}>1</Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#FFFBEB' }]}>
              <Feather name="clock" size={12} color="#D97706" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#D97706' }]}>20%</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#F59E0B' }]} />
          </View>

          {/* Absent card */}
          <View style={[styles.statCardTeam, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.statCardLabel, { color: '#64748B' }]}>Absent</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: '#0F172A' }]}>1</Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="x" size={12} color="#EF4444" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#EF4444' }]}>20%</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#EF4444' }]} />
          </View>

          {/* Holiday card */}
          <View style={[styles.statCardTeam, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statCardDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.statCardLabel, { color: '#64748B' }]}>Holiday</Text>
            </View>
            <Text style={[styles.statCardNumber, { color: '#0F172A' }]}>
              {holidayCount}
            </Text>
            <View style={[styles.statCardBadge, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="calendar" size={12} color="#3B82F6" style={{ marginRight: 2 }} />
              <Text style={[styles.statCardBadgeText, { color: '#3B82F6' }]}>{getMonthLabelStr(teamCalendarDate.getMonth())} {holiday.day}</Text>
            </View>
            <View style={[styles.cardDecoratorCircle, { backgroundColor: '#3B82F6' }]} />
          </View>
        </ScrollView>

        {/* Today's Logs */}
        <View style={styles.teamLogsHeader}>
          <Text style={[styles.sectionTitle, { color: '#0F172A' }]}>Today's Logs</Text>
          {filteredTeamMembers.length > 4 && (
            <TouchableOpacity onPress={() => setShowAllTeamLogs(!showAllTeamLogs)}>
              <Text style={[styles.viewAllText, { color: '#0A52D6' }]}>
                {showAllTeamLogs ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.teamLogsList}>
          {filteredTeamMembers.length === 0 ? (
            <Text style={[styles.emptyText, { color: '#94A3B8', textAlign: 'center', marginVertical: 20 }]}>No team members found</Text>
          ) : (
            (showAllTeamLogs ? filteredTeamMembers : filteredTeamMembers.slice(0, 4)).map((member) => (
              <View key={member.id} style={[styles.teamLogCard, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
                <View style={styles.teamLogAvatarWrap}>
                  <View style={[styles.teamLogInitialsAvatar, { backgroundColor: member.avatarColor }]}>
                    <Text style={[styles.teamLogInitialsText, { color: member.textColor }]}>
                      {member.initials}
                    </Text>
                  </View>
                  <View style={[styles.teamLogActiveDot, { backgroundColor: member.dotColor }]} />
                </View>

                <View style={styles.teamLogDetails}>
                  <Text style={[styles.teamLogName, { color: '#0F172A' }]}>{member.name}</Text>
                  <View style={styles.teamLogCheckInWrap}>
                    {member.status === 'Absent' ? (
                      <Feather name="x" size={12} color="#64748B" style={{ marginRight: 4 }} />
                    ) : (
                      <Feather name="log-in" size={12} color="#64748B" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.teamLogCheckInText, { color: '#64748B' }]}>
                      {member.time}
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />

      {/* Main Scrollable Content */}
      {currentTab === 'home' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: insets.bottom + 90 }, // Added space to not overlay tab bar
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120' }}
                style={styles.avatar}
              />
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>Testing</Text>
                <Text style={styles.profileTitle}>Developer</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <Feather name="bell" size={20} color="#1E293B" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <Feather name="search" size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Current Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>CURRENT STATUS</Text>
              <View style={styles.presentBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.presentText}>PRESENT</Text>
              </View>
            </View>

            <Text style={styles.statusTitle}>Inside: HQ Block A</Text>

            <View style={styles.statusStatsRow}>
              {/* Check-In */}
              <View style={styles.statBox}>
                <View style={styles.statIconWrapper}>
                  <MaterialCommunityIcons name="login" size={20} color="#0A52D6" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>CHECK-IN</Text>
                  <Text style={styles.statValue}>09:00 AM</Text>
                </View>
              </View>

              {/* Worked */}
              <View style={styles.statBox}>
                <View style={styles.statIconWrapper}>
                  <MaterialCommunityIcons name="timer-sand-empty" size={20} color="#0A52D6" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>WORKED</Text>
                  <Text style={styles.statValue}>04h 30m</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.statusActionsRow}>
              <TouchableOpacity style={styles.checkInButton} activeOpacity={0.8} onPress={onCheckIn}>
                <Text style={styles.checkInButtonText}>Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkOutButton} activeOpacity={0.8} onPress={onSignOut}>
                <Text style={styles.checkOutButtonText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.customizeText}>CUSTOMIZE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsGrid}>
            {/* Row 1 */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#EBF2FF' }]}>
                  <MaterialCommunityIcons name="calendar-check-outline" size={22} color="#0A52D6" />
                </View>
                <Text style={styles.actionText}>Timesheet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#FFF5ED' }]}>
                  <MaterialCommunityIcons name="umbrella-beach-outline" size={22} color="#FD8D3C" />
                </View>
                <Text style={styles.actionText}>Leave</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#EAF7EE' }]}>
                  <MaterialCommunityIcons name="file-document-outline" size={22} color="#22C55E" />
                </View>
                <Text style={styles.actionText}>Expenses</Text>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#EEF2FF' }]}>
                  <MaterialCommunityIcons name="bank-outline" size={22} color="#6366F1" />
                </View>
                <Text style={styles.actionText}>Payroll</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                activeOpacity={0.8}
                onPress={() => setCurrentTab('team')}
              >
                <View style={[styles.actionIconBg, { backgroundColor: '#FDF4FF' }]}>
                  <MaterialCommunityIcons name="account-group-outline" size={22} color="#D946EF" />
                </View>
                <Text style={styles.actionText}>Team</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                  <MaterialCommunityIcons name="check-decagram-outline" size={22} color="#EF4444" />
                </View>
                <Text style={styles.actionText}>Approvals</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats / Cards Grid */}
          <View style={styles.statsCardsContainer}>
            {/* Row 1 */}
            <View style={styles.statsRow}>
              {/* Card 1: Present Days */}
              <View style={styles.statsCardItem}>
                <Text style={styles.statsLabelText}>PRESENT DAYS</Text>
                <View style={styles.statsContent}>
                  <Text style={styles.statsValueText}>18</Text>
                  <View style={styles.trendBadge}>
                    <Feather name="arrow-up-right" size={10} color="#22C55E" />
                    <Text style={styles.trendText}>12%</Text>
                  </View>
                </View>
              </View>

              {/* Card 2: Leave Balance */}
              <View style={styles.statsCardItem}>
                <Text style={styles.statsLabelText}>LEAVE BALANCE</Text>
                <View style={styles.statsContent}>
                  <Text style={styles.statsValueText}>12</Text>
                  <Text style={styles.statsSubtitleText}>Days left</Text>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.statsRow}>
              {/* Card 3: Claim Status */}
              <View style={styles.statsCardItem}>
                <Text style={styles.statsLabelText}>CLAIM STATUS</Text>
                <View style={styles.statsContent}>
                  <Text style={styles.statsValueText}>$420</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>PENDING</Text>
                  </View>
                </View>
              </View>

              {/* Card 4: Pending Tasks */}
              <View style={styles.statsCardItem}>
                <Text style={styles.statsLabelText}>PENDING TASKS</Text>
                <View style={styles.statsContent}>
                  <Text style={styles.statsValueText}>05</Text>
                  <View style={styles.urgentRow}>
                    <View style={styles.redDot} />
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Team Insights Card */}
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <View style={styles.insightsTitleWrapper}>
                <View style={styles.insightsIconBg}>
                  <Feather name="trending-up" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.insightsTitle}>Team Insights</Text>
              </View>
              <View style={styles.realtimeBadge}>
                <Text style={styles.realtimeText}>REAL-TIME</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
              {/* Box 1: Attendance */}
              <View style={styles.insightsMetricBox}>
                <Text style={styles.insightLabel}>ATTENDANCE</Text>
                <Text style={styles.insightValue}>92%</Text>
                <View style={styles.insightProgressBg}>
                  <View style={[styles.insightProgressFill, { width: '92%', backgroundColor: '#22C55E' }]} />
                </View>
              </View>

              {/* Box 2: Requests */}
              <View style={styles.insightsMetricBox}>
                <Text style={styles.insightLabel}>REQUESTS</Text>
                <Text style={styles.insightValue}>08</Text>
                <Text style={[styles.insightSubtext, { color: '#FD8D3C' }]}>Action required</Text>
              </View>

              {/* Box 3: Active Now */}
              <View style={styles.insightsMetricBox}>
                <Text style={styles.insightLabel}>ACTIVE</Text>
                <Text style={styles.insightValue}>14</Text>
                <Text style={[styles.insightSubtext, { color: '#64748B' }]}>Currently active</Text>
              </View>
            </ScrollView>
          </View>

          {/* Calendar Card */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <View style={styles.calendarControls}>
                <TouchableOpacity style={styles.calendarArrow} activeOpacity={0.6} onPress={handlePrevMonth}>
                  <Feather name="chevron-left" size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.calendarArrow} activeOpacity={0.6} onPress={handleNextMonth}>
                  <Feather name="chevron-right" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {/* Days header */}
              <View style={styles.calendarDaysRow}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <Text key={idx} style={styles.calendarDayHeader}>{day}</Text>
                ))}
              </View>

              {/* Dynamic Month Weeks */}
              {calendarRows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.calendarDaysRow}>
                  {row.map((item, cellIdx) => {
                    const isSelected = selectedDate.getDate() === item.day &&
                      selectedDate.getMonth() === item.date.getMonth() &&
                      selectedDate.getFullYear() === item.date.getFullYear();

                    const dotStatus = getDayStatusDot(item.date);

                    return (
                      <TouchableOpacity
                        key={cellIdx}
                        style={styles.calendarDayCell}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (item.isCurrentMonth) {
                            setSelectedDate(item.date);
                          }
                        }}
                      >
                        {isSelected ? (
                          <View style={styles.selectedDayCircle}>
                            <Text style={styles.selectedDayText}>{item.day}</Text>
                          </View>
                        ) : (
                          <Text style={item.isCurrentMonth ? styles.calendarDayText : styles.calendarDayTextGray}>
                            {item.day}
                          </Text>
                        )}

                        {/* Dot Indicator under date */}
                        {!isSelected && dotStatus && (
                          <View style={[
                            {
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              position: 'absolute',
                              bottom: 2,
                            },
                            dotStatus === 'present' && { backgroundColor: '#22C55E' },
                            dotStatus === 'absent' && { backgroundColor: '#EF4444' },
                            dotStatus === 'leave' && { backgroundColor: '#D97706' },
                            dotStatus === 'holiday' && { backgroundColor: '#0A52D6' },
                            dotStatus === 'wfh' && { backgroundColor: '#9333EA' },
                          ]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Calendar Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.legendText}>PRESENT</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>ABSENT</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
                <Text style={styles.legendText}>LEAVE</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#0A52D6' }]} />
                <Text style={styles.legendText}>HOLIDAY</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
                <Text style={styles.legendText}>WFH</Text>
              </View>
            </View>
          </View>

          {/* This Week's Celebrations */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week's Celebrations</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Feather name="more-horizontal" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Celebrations List */}
          <View style={styles.celebrationsList}>
            {/* Celebration 1 */}
            <View style={styles.celebrationCard}>
              <View style={styles.celebLeft}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' }}
                  style={styles.celebAvatar}
                />
                <View style={styles.celebTextContainer}>
                  <Text style={styles.celebName}>Sarah Mitchell</Text>
                  <Text style={styles.celebSubtitle}>Birthday • Tomorrow</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.celebActionBtn} activeOpacity={0.7}>
                <Text style={styles.celebActionText}>WISH HER</Text>
              </TouchableOpacity>
            </View>

            {/* Celebration 2 */}
            <View style={styles.celebrationCard}>
              <View style={styles.celebLeft}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' }}
                  style={styles.celebAvatar}
                />
                <View style={styles.celebTextContainer}>
                  <Text style={styles.celebName}>David Chen</Text>
                  <Text style={styles.celebSubtitle}>3rd Work Anniversary • May 16</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.celebActionBtn} activeOpacity={0.7}>
                <Text style={styles.celebActionText}>CONGRATULATE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.customizeText}>HISTORY</Text>
            </TouchableOpacity>
          </View>

          {/* Activity Timeline */}
          <View style={styles.activityTimeline}>
            {/* Timeline Item 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeftColumn}>
                <View style={[styles.timelineDot, { backgroundColor: '#0A52D6' }]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineRightColumn}>
                <Text style={styles.timelineTime}>TODAY, 09:00 AM</Text>
                <Text style={styles.timelineTitle}>Checked In Successfully</Text>
                <Text style={styles.timelineLocation}>Location: Headquarters Block A, Floor 4</Text>
              </View>
            </View>

            {/* Timeline Item 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeftColumn}>
                <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]} />
                {/* No line for last item */}
              </View>
              <View style={styles.timelineRightColumn}>
                <Text style={styles.timelineTime}>YESTERDAY, 04:30 PM</Text>
                <Text style={styles.timelineTitle}>Leave Approved</Text>
                <Text style={styles.timelineLocation}>Annual Leave Request: May 20 - 24 (5 days)</Text>
              </View>
            </View>
          </View>

          {/* Upcoming Events */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>

          {/* Horizontal Events List */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
            {/* Event 1 */}
            <View style={styles.eventCard}>
              <View style={[styles.eventDateBox, { backgroundColor: '#EBF2FF' }]}>
                <Text style={[styles.eventMonth, { color: '#0A52D6' }]}>MAY</Text>
                <Text style={[styles.eventDay, { color: '#0A52D6' }]}>20</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Town Hall Q2</Text>
                <Text style={styles.eventTime}>10:00 AM • Main Hall</Text>
              </View>
            </View>

            {/* Event 2 */}
            <View style={styles.eventCard}>
              <View style={[styles.eventDateBox, { backgroundColor: '#FFF5ED' }]}>
                <Text style={[styles.eventMonth, { color: '#FD8D3C' }]}>MAY</Text>
                <Text style={[styles.eventDay, { color: '#FD8D3C' }]}>22</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Team Sync</Text>
                <Text style={styles.eventTime}>11:30 AM • Conf Room 3</Text>
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {/* ── TEAM TAB CONTENT ── */}
      {currentTab === 'team' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderTeamOverviewContent()}
        </ScrollView>
      )}

      {/* ── CALENDAR TAB CONTENT ── */}
      {currentTab === 'calendar' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderCalendarTabContent()}
        </ScrollView>
      )}

      {/* ── APPROVALS TAB CONTENT ── */}
      {currentTab === 'approvals' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderPlaceholderTab('approvals')}
        </ScrollView>
      )}

      {/* ── PROFILE TAB CONTENT ── */}
      {currentTab === 'profile' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
        >
          {renderPlaceholderTab('profile')}
        </ScrollView>
      )}

      {/* Sticky Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => setCurrentTab('home')}>
          <Ionicons name="home" size={22} color={currentTab === 'home' ? '#0A52D6' : '#64748B'} />
          <Text style={currentTab === 'home' ? styles.tabTextActive : styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => setCurrentTab('calendar')}>
          <Feather name="calendar" size={22} color={currentTab === 'calendar' ? '#0A52D6' : '#64748B'} />
          <Text style={currentTab === 'calendar' ? styles.tabTextActive : styles.tabText}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => setCurrentTab('approvals')}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color={currentTab === 'approvals' ? '#0A52D6' : '#64748B'} />
          <Text style={currentTab === 'approvals' ? styles.tabTextActive : styles.tabText}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => setCurrentTab('profile')}>
          <Feather name="user" size={22} color={currentTab === 'profile' ? '#0A52D6' : '#64748B'} />
          <Text style={currentTab === 'profile' ? styles.tabTextActive : styles.tabText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => setCurrentTab('team')}>
          <MaterialCommunityIcons name="account-group-outline" size={22} color={currentTab === 'team' ? '#0A52D6' : '#64748B'} />
          <Text style={currentTab === 'team' ? styles.tabTextActive : styles.tabText}>Team</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  presentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F6E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  presentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  statusStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    marginLeft: 10,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  statusActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInButton: {
    flex: 1,
    backgroundColor: '#0A52D6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  checkOutButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  checkOutButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  customizeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A52D6',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    marginBottom: 24,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statsCardsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCardItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statsLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsValueText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F6E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    marginLeft: 2,
  },
  statsSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 8,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  insightsCard: {
    backgroundColor: '#EEF2F6',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A52D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 10,
  },
  realtimeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  realtimeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0A52D6',
  },
  insightsScroll: {
    flexDirection: 'row',
  },
  insightsMetricBox: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
  },
  insightLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 6,
  },
  insightProgressBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
  },
  insightProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  insightSubtext: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  calendarControls: {
    flexDirection: 'row',
  },
  calendarArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  calendarGrid: {
    marginBottom: 16,
  },
  calendarDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    height: 36,
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarDayCell: {
    width: '14.28%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  calendarDayTextGray: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  bulletUnderDateBlue: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A52D6',
    position: 'absolute',
    bottom: 0,
  },
  bulletUnderDateRed: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    position: 'absolute',
    bottom: 0,
  },
  selectedDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A52D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 5,
  },
  celebrationsList: {
    marginBottom: 24,
  },
  celebrationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  celebSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  celebActionBtn: {
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    backgroundColor: '#F0F6FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  celebActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A52D6',
  },
  activityTimeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  timelineRightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTime: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  timelineLocation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  eventsScroll: {
    flexDirection: 'row',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginRight: 12,
    width: 240,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  eventDateBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventMonth: {
    fontSize: 9,
    fontWeight: '700',
  },
  eventDay: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 1,
  },
  eventDetails: {
    marginLeft: 12,
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
  },
  tabTextActive: {
    fontSize: 10,
    color: '#0A52D6',
    fontWeight: '700',
    marginTop: 3,
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
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
