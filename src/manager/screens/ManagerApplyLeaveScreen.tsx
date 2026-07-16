import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import ManagerMenu from '../components/ManagerMenu';

interface ManagerApplyLeaveScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

const LEAVE_TYPES = [
  { name: 'Annual Leave', icon: 'calendar-blank-outline', iconColor: '#3B82F6', lightBg: '#EFF6FF', darkBg: '#1e293b', days: '12 Days' },
  { name: 'Medical Leave', icon: 'heart-pulse', iconColor: '#EF4444', lightBg: '#FEF2F2', darkBg: '#3f1a1a', days: '14 Days' },
  { name: 'Maternity Leave', icon: 'baby-carriage', iconColor: '#EC4899', lightBg: '#FDF2F8', darkBg: '#3f1a30', days: '84 Days' },
  { name: 'LOP', icon: 'cash-off', iconColor: '#F59E0B', lightBg: '#FFFBEB', darkBg: '#3f321a', days: '0 Days' },
  { name: 'Flexi Leave', icon: 'clock-outline', iconColor: '#10B981', lightBg: '#ECFDF5', darkBg: '#1a3f2a', days: '2 Days' },
];

export default function ManagerApplyLeaveScreen({
  onBack,
  onNavigate,
}: ManagerApplyLeaveScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();

  // Navigation states & forms
  const [activeTab, setActiveTab] = useState<'my_logs' | 'team_logs'>('my_logs');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('Annual Leave');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Search and filter inside Team Logs
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(15);

  // Interactive logs calendar states
  const [selectedLogsDate, setSelectedLogsDate] = useState<Date>(new Date());
  const [currentLogsCalendarDate, setCurrentLogsCalendarDate] = useState<Date>(new Date());

  // Mock Logs States
  const [myLogs, setMyLogs] = useState([
    {
      id: 1,
      type: 'Annual Leave',
      dates: 'Oct 5, 2023',
      days: '1 Day',
      reason: 'Family vacation trip.',
      status: 'Approved',
      icon: 'calendar-blank-outline',
      iconColor: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      id: 2,
      type: 'Sick Leave',
      dates: 'Sep 12 - Sep 13, 2023',
      days: '2 Days',
      reason: 'Medical appointment and recovery.',
      status: 'Approved',
      icon: 'heart-pulse',
      iconColor: '#EF4444',
      bg: '#FEF2F2',
    },
    {
      id: 3,
      type: 'Annual Leave',
      dates: 'Nov 20 - Nov 24, 2023',
      days: '5 Days',
      reason: 'Thanksgiving holiday travel.',
      status: 'Pending',
      icon: 'calendar-blank-outline',
      iconColor: '#3B82F6',
      bg: '#EFF6FF',
    },
  ]);

  const [teamLogs, setTeamLogs] = useState([
    {
      id: 1,
      name: 'Alex Rivers',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100',
      type: 'ANNUAL',
      dates: 'Oct 24 - Oct 27',
      days: 4,
      status: 'Pending',
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100',
      type: 'SICK',
      dates: 'Oct 21',
      days: 1,
      status: 'Approved',
    },
    {
      id: 3,
      name: 'Michael Chen',
      avatar: null, //MC initials
      type: 'ANNUAL',
      dates: 'Nov 10 - Nov 24',
      days: 10,
      status: 'Pending',
    },
  ]);

  const currentLeaveDetails = LEAVE_TYPES.find(item => item.name === selectedLeaveType);
  
  // Date Picker States
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2023, 9, 1)); // Default to October 2023
  const [startDateStr, setStartDateStr] = useState<string | null>(null);
  const [endDateStr, setEndDateStr] = useState<string | null>(null);
  
  // Attached document state
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; uri: string } | null>(null);

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (showApplyForm) {
        setShowApplyForm(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('manager_dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate, showApplyForm]);

  // Utility to format date string YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Convert YYYY-MM-DD to readable format like "Oct 12"
  const getReadableDate = (dateStr: string | null, placeholder: string) => {
    if (!dateStr) return placeholder;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate Business/Requested Days (excluding weekends)
  const calculateRequestedDays = () => {
    if (!startDateStr) return 0;
    if (!endDateStr) {
      // Single day selected
      const date = new Date(startDateStr);
      const day = date.getDay();
      return (day === 0 || day === 6) ? 0 : 1;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (start > end) return 0;

    let count = 0;
    let cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  // Date selection click handler
  const handleDatePress = (dateObj: Date) => {
    const dateStr = formatDateString(dateObj);

    if (!startDateStr || (startDateStr && endDateStr)) {
      setStartDateStr(dateStr);
      setEndDateStr(null);
    } else {
      // startDateStr is set and endDateStr is null
      const start = new Date(startDateStr);
      if (dateObj < start) {
        // Selected date is before start date, so reset start date
        setStartDateStr(dateStr);
      } else {
        setEndDateStr(dateStr);
      }
    }
  };

  // File Uploader
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const sizeMb = ((asset.size || 0) / (1024 * 1024)).toFixed(1);
        setAttachedFile({
          name: asset.name,
          size: `${sizeMb} MB`,
          uri: asset.uri,
        });
      }
    } catch (err) {
      console.log('Document picking error:', err);
      Alert.alert('Error', 'Unable to pick a document.');
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  // Month Navigation
  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  // Generate Calendar Days
  const generateCalendarCells = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1, ...
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prior Month Fillers
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next Month Fillers to reach multiple of 7
    const remaining = 42 - cells.length; // standard 6 rows
    const finalRemaining = remaining >= 7 ? remaining - 7 : remaining; // optimize to 5 rows if possible
    const totalTarget = cells.length + (cells.length + finalRemaining <= 35 ? finalRemaining : remaining);
    
    const nextCellsCount = totalTarget - cells.length;
    for (let i = 1; i <= nextCellsCount; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    // Chunk into rows of 7
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  };

  const handleSubmit = () => {
    if (!startDateStr) {
      Alert.alert('Selection Required', 'Please select at least a start date for your leave.');
      return;
    }
    setConfirmModalVisible(true);
  };

  // Render Calendar Month Grid
  const renderCalendar = () => {
    const calendarRows = generateCalendarCells();
    const monthYearLabel = currentCalendarDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Start Date & End Date Headers */}
        <View style={styles.dateSelectorRow}>
          <View style={styles.dateSelectorBlock}>
            <Text style={[styles.dateSelectorLabel, { color: colors.textMuted }]}>Start Date</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.dateValWrapper, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.dateSelectorValue, { color: colors.textPrimary }]}>
                {getReadableDate(startDateStr, 'Select Date')}
              </Text>
              <Feather name="calendar" size={16} color={colors.brand} />
            </TouchableOpacity>
          </View>

          <Feather name="arrow-right" size={18} color={colors.textMuted} style={styles.arrowBetween} />

          <View style={styles.dateSelectorBlock}>
            <Text style={[styles.dateSelectorLabel, { color: colors.textMuted }]}>End Date</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.dateValWrapper, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.dateSelectorValue, { color: colors.textPrimary }]}>
                {getReadableDate(endDateStr, 'Select Date')}
              </Text>
              <Feather name="calendar" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Calendar month header */}
        <View style={styles.calendarHeader}>
          <Text style={[styles.calendarMonthTitle, { color: colors.textPrimary }]}>{monthYearLabel}</Text>
          <View style={styles.monthNavButtons}>
            <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { backgroundColor: colors.iconBg }]}>
              <Feather name="chevron-left" size={16} color={colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { backgroundColor: colors.iconBg }]}>
              <Feather name="chevron-right" size={16} color={colors.brand} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Days of Week */}
        <View style={styles.weekdaysRow}>
          {weekdayLabels.map((day, idx) => (
            <Text key={idx} style={[styles.weekdayLabelText, { color: colors.textMuted }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Grid Cells */}
        <View style={styles.gridCellsContainer}>
          {calendarRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map((cell, cellIdx) => {
                const cellStr = formatDateString(cell.date);
                const isSelectedStart = cellStr === startDateStr;
                const isSelectedEnd = cellStr === endDateStr;
                
                let isMiddle = false;
                if (startDateStr && endDateStr) {
                  const cellTime = cell.date.getTime();
                  const startTime = new Date(startDateStr).getTime();
                  const endTime = new Date(endDateStr).getTime();
                  isMiddle = cellTime > startTime && cellTime < endTime;
                }

                const isToday = formatDateString(new Date()) === cellStr;

                return (
                  <TouchableOpacity
                    key={cellIdx}
                    activeOpacity={0.8}
                    onPress={() => handleDatePress(cell.date)}
                    style={[
                      styles.cellContainer,
                      isMiddle && { backgroundColor: isDark ? colors.brand + '25' : '#EFF6FF' },
                      isSelectedStart && styles.cellStartRound,
                      isSelectedEnd && styles.cellEndRound,
                    ]}
                  >
                    <View
                      style={[
                        styles.cellCircle,
                        (isSelectedStart || isSelectedEnd) && { backgroundColor: colors.brand },
                        isToday && !isSelectedStart && !isSelectedEnd && { borderWidth: 1, borderColor: colors.brand }
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          { color: cell.isCurrentMonth ? colors.textPrimary : colors.textMuted },
                          (isSelectedStart || isSelectedEnd) && { color: '#FFFFFF', fontWeight: '700' },
                          isMiddle && { color: colors.brand, fontWeight: '600' },
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Total Days Count Pill */}
        <View style={[styles.totalDaysContainer, { backgroundColor: isDark ? colors.brand + '15' : '#F0F7FF' }]}>
          <Text style={[styles.totalDaysLabel, { color: colors.textSecond }]}>Total requested days</Text>
          <View style={styles.daysCountPill}>
            <Text style={styles.daysCountText}>{calculateRequestedDays()} Days</Text>
          </View>
        </View>
      </View>
    );
  };

  // No success wizard page rendered. We redirect directly back upon submission.

  // No success wizard page rendered. We redirect directly back upon submission.

  const renderHeader = () => {
    if (showApplyForm) {
      return (
        <View style={[styles.headerContainer, { paddingTop: insets.top || 16, backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.iconBg }]}
            onPress={() => setShowApplyForm(false)}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.brand} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Apply Leave</Text>

          <View style={{ width: 38 }} />
        </View>
      );
    }

    return (
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
            Leave Management
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
            onPress={() => Alert.alert('Notifications', 'No new notifications')}
          >
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('manager_profile')}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150' }}
              style={styles.avatarImage}
            />
            <View style={styles.activeDot} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isDateInLog = (checkDate: Date, log: any) => {
    if (!log.dates) return false;
    
    const parts = log.dates.split('-');
    
    const parseSingleDate = (str: string, defaultYear?: number) => {
      const cleanStr = str.trim();
      const currentYear = defaultYear || new Date().getFullYear();
      
      const hasYear = /,\s*\d{4}$/.test(cleanStr) || /\s+\d{4}$/.test(cleanStr);
      
      let d = Date.parse(cleanStr);
      if (!isNaN(d)) {
        const parsedDate = new Date(d);
        if (!hasYear && defaultYear !== undefined) {
          parsedDate.setFullYear(defaultYear);
        }
        return parsedDate;
      }
      
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const words = cleanStr.toLowerCase().replace(/,/g, '').split(' ');
      if (words.length >= 2) {
        const mIdx = months.findIndex(m => words[0].startsWith(m) || words[1].startsWith(m));
        const dayWord = words.find(w => !isNaN(parseInt(w)));
        if (mIdx !== -1 && dayWord) {
          const day = parseInt(dayWord);
          const year = words.find(w => w.length === 4 && !isNaN(parseInt(w))) || currentYear;
          return new Date(Number(year), mIdx, day);
        }
      }
      return null;
    };

    if (parts.length === 1) {
      const d = parseSingleDate(parts[0]);
      if (!d) return false;
      return checkDate.getDate() === d.getDate() &&
             checkDate.getMonth() === d.getMonth() &&
             checkDate.getFullYear() === d.getFullYear();
    } else if (parts.length === 2) {
      let end = parseSingleDate(parts[1]);
      const extractedYear = end ? end.getFullYear() : new Date().getFullYear();
      let start = parseSingleDate(parts[0], extractedYear);
      
      if (!start) return false;
      if (!end) {
        const cleanEnd = parts[1].trim();
        const startYear = start.getFullYear();
        const startMonth = start.getMonth();
        const d = Date.parse(`${cleanEnd} ${startYear}`);
        if (!isNaN(d)) {
          end = new Date(d);
        } else {
          const dayNum = parseInt(cleanEnd);
          if (!isNaN(dayNum)) {
            end = new Date(startYear, startMonth, dayNum);
          }
        }
      }
      
      if (!end) return false;
      
      const checkTime = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()).getTime();
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      
      return checkTime >= startTime && checkTime <= endTime;
    }
    
    return false;
  };

  const generateLogsCalendarCells = () => {
    const year = currentLogsCalendarDate.getFullYear();
    const month = currentLogsCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prior Month Fillers
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next Month Fillers
    const remaining = 42 - cells.length;
    const finalRemaining = remaining >= 7 ? remaining - 7 : remaining;
    const totalTarget = cells.length + (cells.length + finalRemaining <= 35 ? finalRemaining : remaining);
    
    const nextCellsCount = totalTarget - cells.length;
    for (let i = 1; i <= nextCellsCount; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  };

  const renderMyLogsCalendar = () => {
    const calendarRows = generateLogsCalendarCells();
    const monthYearLabel = currentLogsCalendarDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.calendarHeader}>
          <Text style={[styles.calendarMonthTitle, { color: colors.textPrimary }]}>{monthYearLabel}</Text>
          <View style={styles.monthNavButtons}>
            <TouchableOpacity 
              onPress={() => setCurrentLogsCalendarDate(new Date(currentLogsCalendarDate.getFullYear(), currentLogsCalendarDate.getMonth() - 1, 1))} 
              style={[styles.navBtn, { backgroundColor: colors.iconBg }]}
            >
              <Feather name="chevron-left" size={16} color={colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setCurrentLogsCalendarDate(new Date(currentLogsCalendarDate.getFullYear(), currentLogsCalendarDate.getMonth() + 1, 1))} 
              style={[styles.navBtn, { backgroundColor: colors.iconBg }]}
            >
              <Feather name="chevron-right" size={16} color={colors.brand} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Days of Week */}
        <View style={styles.weekdaysRow}>
          {weekdayLabels.map((day, idx) => (
            <Text key={idx} style={[styles.weekdayLabelText, { color: colors.textMuted }]}>
              {day}
            </Text>
          ))}
        </View>
        
        {/* Grid Cells */}
        <View style={styles.gridCellsContainer}>
          {calendarRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map((cell, cellIdx) => {
                const isSelected = selectedLogsDate.getDate() === cell.date.getDate() &&
                                   selectedLogsDate.getMonth() === cell.date.getMonth() &&
                                   selectedLogsDate.getFullYear() === cell.date.getFullYear();
                
                const hasLeave = myLogs.find(l => isDateInLog(cell.date, l));

                return (
                  <TouchableOpacity
                    key={cellIdx}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedLogsDate(cell.date);
                    }}
                    style={[
                      styles.cellContainer,
                      hasLeave && { backgroundColor: isDark ? colors.brand + '25' : '#EFF6FF', borderRadius: 18 }
                    ]}
                  >
                    <View
                      style={[
                        styles.cellCircle,
                        hasLeave && { backgroundColor: hasLeave.iconColor || colors.brand },
                        isSelected && { borderWidth: 1.5, borderColor: colors.brand }
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          { color: cell.isCurrentMonth ? colors.textPrimary : colors.textMuted },
                          hasLeave && { color: '#FFFFFF', fontWeight: '700' },
                          isSelected && { color: colors.brand, fontWeight: '700' }
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActivityCard = () => {
    const dayOfWeek = selectedLogsDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Check if there is an approved or pending leave on this day
    const matchingLeave = myLogs.find(l => isDateInLog(selectedLogsDate, l));
    
    let title = "Regular Working Day";
    let icon = "clock-outline";
    let iconColor = colors.brand;
    let badgeText = "Present";
    let badgeBg = colors.successBg;
    let badgeTextColor = colors.successText;
    let details = [
      { label: "Shift", value: "Regular Shift (09:00 AM - 05:30 PM)" },
      { label: "Check-In", value: "08:52 AM (On-Time)" },
      { label: "Check-Out", value: "05:30 PM" },
      { label: "Worked Hours", value: "8.5 Hrs" }
    ];

    if (matchingLeave) {
      title = matchingLeave.type;
      icon = matchingLeave.icon;
      iconColor = matchingLeave.iconColor || '#3B82F6';
      badgeText = matchingLeave.status;
      badgeBg = matchingLeave.status === 'Approved' ? colors.successBg : colors.amberBg;
      badgeTextColor = matchingLeave.status === 'Approved' ? colors.successText : colors.amber;
      details = [
        { label: "Duration", value: matchingLeave.days },
        { label: "Reason", value: matchingLeave.reason },
        { label: "Applied On", value: matchingLeave.dates.split(' - ')[0] },
        { label: "Approved By", value: matchingLeave.status === 'Approved' ? "HR Department" : "Pending Review" }
      ];
    } else if (isWeekend) {
      title = "Weekly Off";
      icon = "calendar-clock";
      iconColor = colors.textSecond;
      badgeText = "Weekend";
      badgeBg = colors.iconBg;
      badgeTextColor = colors.textSecond;
      details = [
        { label: "Day Type", value: "Weekly Off" },
        { label: "Status", value: "Non-working day" },
        { label: "Activity", value: "No check-in required" }
      ];
    } else {
      // Check if selectedLogsDate is in the future
      const today = new Date();
      const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const selectedZero = new Date(selectedLogsDate.getFullYear(), selectedLogsDate.getMonth(), selectedLogsDate.getDate()).getTime();
      
      if (selectedZero > todayZero) {
        title = "Scheduled Working Day";
        icon = "clock-outline";
        iconColor = colors.brand;
        badgeText = "Scheduled";
        badgeBg = colors.iconBg;
        badgeTextColor = colors.brand;
        details = [
          { label: "Shift", value: "Regular Shift (09:00 AM - 05:30 PM)" },
          { label: "Status", value: "Scheduled" },
          { label: "Activity", value: "Check-in required on that day" }
        ];
      }
    }

    const dateLabel = selectedLogsDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: -8, marginBottom: 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.logIconBg, { backgroundColor: colors.iconBg, width: 36, height: 36, borderRadius: 18, marginRight: 0 }]}>
              <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
              <Text style={{ fontSize: 11, color: colors.textSecond }}>{dateLabel}</Text>
            </View>
          </View>

          <View style={[styles.teamLogStatus, { backgroundColor: badgeBg }]}>
            <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>
              {badgeText}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {details.map((detail, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: idx < details.length - 1 ? 1 : 0, borderBottomColor: colors.borderLight, paddingBottom: 6 }}>
              <Text style={{ fontSize: 12, color: colors.textSecond, fontWeight: '500' }}>{detail.label}</Text>
              <Text style={{ fontSize: 12, color: colors.textPrimary, fontWeight: '600', maxWidth: '70%' }} numberOfLines={1}>{detail.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMyLogs = () => {
    return (
      <View style={{ flex: 1, marginTop: 16 }}>
        {/* Total Annual Leave Balance Card */}
        <LinearGradient
          colors={isDark ? ['#1e3a8a', '#172554'] : ['#0A52D6', '#1E40AF']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Accent decoration circles */}
          <View style={styles.cardCircle1} />
          <View style={styles.cardCircle2} />
          
          <Text style={styles.balanceCardTitle}>Total Annual Leave Balance</Text>
          <Text style={styles.balanceCardValue}>14 Days</Text>
          <Text style={styles.balanceCardSub}>Valid until Dec 31, 2023</Text>
          
          <View style={styles.balanceButtonsRow}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.balanceBtnPrimary}
              onPress={() => setShowApplyForm(true)}
            >
              <Text style={styles.balanceBtnPrimaryText}>Leave</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.balanceBtnSecondary}
              onPress={() => onNavigate?.('manager_leave_history')}
            >
              <Text style={styles.balanceBtnSecondaryText}>View History</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Row of sub-cards (Sick / Unpaid) */}
        <View style={styles.rowCardsContainer}>
          <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowCardHeader}>
              <MaterialCommunityIcons name="heart-pulse" size={18} color="#EF4444" />
              <Text style={[styles.rowCardLabel, { color: colors.textSecond }]}>Sick Leave</Text>
            </View>
            <Text style={[styles.rowCardValue, { color: colors.textPrimary }]}>5 Days</Text>
          </View>

          <View style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rowCardHeader}>
              <MaterialCommunityIcons name="cash-off" size={18} color="#F59E0B" />
              <Text style={[styles.rowCardLabel, { color: colors.textSecond }]}>Unpaid Leave</Text>
            </View>
            <Text style={[styles.rowCardValue, { color: colors.textPrimary }]}>0 Days</Text>
          </View>
        </View>

        {/* Leave History Quick Link */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.historyLinkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigate?.('manager_leave_history')}
        >
          <View style={[styles.uploadIconWrapper, { backgroundColor: colors.iconBg, marginBottom: 0 }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.brand} />
          </View>
          <View style={styles.historyLinkContent}>
            <Text style={[styles.historyLinkTitle, { color: colors.textPrimary }]}>Leave History</Text>
            <Text style={[styles.historyLinkSub, { color: colors.textSecond }]}>View all past requests and balances</Text>
          </View>
          <View style={styles.historyLinkAction}>
            <Text style={[styles.historyLinkActionText, { color: colors.brand }]}>View Full History</Text>
            <Feather name="chevron-right" size={16} color={colors.brand} />
          </View>
        </TouchableOpacity>

        {/* Calendar */}
        {renderMyLogsCalendar()}

        {/* Calendar Activity Card */}
        {renderActivityCard()}

        {/* Recent Logs List */}
        <Text style={[styles.logsHeader, { color: colors.textPrimary }]}>Recent Logs</Text>
        <View style={{ marginBottom: 20 }}>
          {myLogs.map((log) => (
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
                styles.teamLogStatus, 
                { backgroundColor: log.status === 'Approved' ? colors.successBg : colors.amberBg }
              ]}>
                <Text style={[
                  styles.statusBadgeText, 
                  { color: log.status === 'Approved' ? colors.successText : colors.amber }
                ]}>
                  {log.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Full History Link */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.historyLinkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigate?.('manager_leave_history')}
        >
          <View style={[styles.uploadIconWrapper, { backgroundColor: colors.iconBg, marginBottom: 0 }]}>
            <MaterialCommunityIcons name="archive-outline" size={20} color={colors.brand} />
          </View>
          <View style={styles.historyLinkContent}>
            <Text style={[styles.historyLinkTitle, { color: colors.textPrimary }]}>Archive & History</Text>
            <Text style={[styles.historyLinkSub, { color: colors.textSecond }]}>Access all past leave requests and balance adjustments.</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textSecond} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTeamLogs = () => {
    // Filter logic
    const filteredLogs = teamLogs.filter(log => {
      const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = teamFilter === 'all' || log.status.toLowerCase() === teamFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    return (
      <View style={{ flex: 1, marginTop: 16 }}>
        {/* Row of two stats cards styled with brand blue gradient background */}
        <View style={styles.teamStatsRow}>
          <LinearGradient
            colors={isDark ? ['#1e3a8a', '#172554'] : ['#0A52D6', '#1E40AF']}
            style={styles.teamStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardCircle1} />
            <Text style={styles.teamStatLabel}>Pending Requests</Text>
            <Text style={styles.teamStatValue}>12</Text>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#1e3a8a', '#172554'] : ['#0A52D6', '#1E40AF']}
            style={styles.teamStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardCircle2} />
            <Text style={styles.teamStatLabel}>On Leave Today</Text>
            <Text style={styles.teamStatValue}>3</Text>
          </LinearGradient>
        </View>

        {/* Search Bar Container */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search team members..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Alert.alert('Filter', 'Opening search filters...')}
          >
            <Feather name="sliders" size={18} color={colors.textSecond} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsContainer}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => {
            const isActive = teamFilter === filter;
            const label = filter.charAt(0).toUpperCase() + filter.slice(1);
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                style={[
                  styles.chip, 
                  { 
                    backgroundColor: isActive ? colors.brand : colors.card,
                    borderColor: isActive ? colors.brand : colors.border
                  }
                ]}
                onPress={() => setTeamFilter(filter)}
              >
                <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : colors.textSecond }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Applications List */}
        <Text style={[styles.logsHeader, { color: colors.textPrimary }]}>Recent Applications</Text>
        <View style={{ marginBottom: 20 }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              // Set up colors for type badge
              const isAnnual = log.type === 'ANNUAL';
              const badgeBg = isAnnual ? '#EEF2FF' : '#FFF1F2';
              const badgeText = isAnnual ? '#4F46E5' : '#E11D48';

              return (
                <TouchableOpacity 
                  key={log.id} 
                  activeOpacity={0.7}
                  style={[styles.teamLogItem, { borderBottomColor: colors.borderLight }]}
                  onPress={() => Alert.alert('Application Details', `Viewing details for ${log.name}`)}
                >
                  {/* Avatar rendering */}
                  {log.avatar ? (
                    <Image source={{ uri: log.avatar }} style={styles.teamLogAvatar} />
                  ) : (
                    <View style={[styles.teamLogAvatar, { backgroundColor: '#E2E8F0' }]}>
                      <Text style={[styles.teamLogAvatarText, { color: '#475569' }]}>MC</Text>
                    </View>
                  )}

                  <View style={styles.teamLogInfo}>
                    <Text style={[styles.teamLogName, { color: colors.textPrimary }]}>{log.name}</Text>
                    <View style={styles.teamLogMeta}>
                      <View style={[styles.teamLogBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.teamLogBadgeText, { color: badgeText }]}>{log.type}</Text>
                      </View>
                      <Text style={[styles.teamLogDates, { color: colors.textSecond }]}>{log.dates} ({log.days} Days)</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[
                      styles.teamLogStatus, 
                      { backgroundColor: log.status === 'Approved' ? colors.successBg : colors.amberBg }
                    ]}>
                      <Text style={[
                        styles.statusBadgeText, 
                        { color: log.status === 'Approved' ? colors.successText : colors.amber }
                      ]}>
                        {log.status.toUpperCase()}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>No applications found matching search criteria.</Text>
            </View>
          )}
        </View>

        {/* Full History Link */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.historyLinkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('History', 'Navigating to archive...')}
        >
          <View style={[styles.uploadIconWrapper, { backgroundColor: colors.iconBg, marginBottom: 0 }]}>
            <MaterialCommunityIcons name="archive-outline" size={20} color={colors.brand} />
          </View>
          <View style={styles.historyLinkContent}>
            <Text style={[styles.historyLinkTitle, { color: colors.textPrimary }]}>Archive & History</Text>
            <Text style={[styles.historyLinkSub, { color: colors.textSecond }]}>Access all past leave requests and balance adjustments.</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textSecond} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {renderHeader()}

      {!showApplyForm && (
        <View style={[styles.tabsBar, { backgroundColor: colors.header, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'my_logs' && { borderBottomColor: colors.brand }]}
            onPress={() => setActiveTab('my_logs')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'my_logs' ? colors.brand : colors.textSecond }, activeTab === 'my_logs' && { fontWeight: '700' }]}>
              My Logs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'team_logs' && { borderBottomColor: colors.brand }]}
            onPress={() => setActiveTab('team_logs')}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === 'team_logs' ? colors.brand : colors.textSecond }, activeTab === 'team_logs' && { fontWeight: '700' }]}>
              Team Logs
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 12) + 80 }]}
        >
          {showApplyForm ? (
            <>
              {/* Screen Subtitle */}
              <Text style={[styles.screenSubtitleText, { color: colors.textSecond }]}>
                Provide details to apply for a leave.
              </Text>

              {/* Leave Type Cards */}
              <View style={styles.cardsGrid}>
                {LEAVE_TYPES.map((item) => {
                  const isSelected = selectedLeaveType === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      activeOpacity={0.7}
                      onPress={() => setSelectedLeaveType(item.name)}
                      style={[
                        styles.leaveCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: isSelected ? colors.brand : colors.border,
                          borderWidth: isSelected ? 1.5 : 1,
                        },
                        isSelected && {
                          shadowColor: colors.brand,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.08,
                          shadowRadius: 6,
                          elevation: 2,
                        }
                      ]}
                    >
                      {/* Badge in top right corner showing number of leaves */}
                      <View style={[styles.cardBadge, { backgroundColor: isDark ? '#1e293b' : '#F1F5F9' }]}>
                        <Text style={[styles.cardBadgeText, { color: item.iconColor }]}>
                          {item.days}
                        </Text>
                      </View>

                      <View style={[styles.cardIconCircle, { backgroundColor: isDark ? item.darkBg : item.lightBg }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                      </View>
                      <Text style={[styles.cardTitleText, { color: colors.textPrimary }]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Calendar Range Picker */}
              {renderCalendar()}

              {/* Reason for Leave */}
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Reason for Leave</Text>
              <View style={[styles.textAreaWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textArea, { color: colors.textPrimary }]}
                  placeholder="Provide a brief reason (Optional)..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={reason}
                  onChangeText={setReason}
                  textAlignVertical="top"
                />
              </View>

              {/* Supporting Document */}
              <View style={styles.supportingDocHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Supporting Document</Text>
                <Text style={[styles.optionalLabel, { color: colors.textMuted }]}>Optional</Text>
              </View>

              {attachedFile ? (
                <View style={[styles.fileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.fileIconWrapper}>
                    <Feather name="file-text" size={24} color={colors.brand} />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {attachedFile.name}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.textMuted }]}>{attachedFile.size}</Text>
                  </View>
                  <TouchableOpacity onPress={handleRemoveFile} style={styles.removeFileBtn}>
                    <Feather name="x" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleFileUpload}
                  style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <View style={[styles.uploadIconWrapper, { backgroundColor: colors.iconBg }]}>
                    <Feather name="upload-cloud" size={22} color={colors.brand} />
                  </View>
                  <Text style={[styles.uploadText, { color: colors.brand }]}>Tap to upload file</Text>
                  <Text style={[styles.uploadSubtext, { color: colors.textMuted }]}>PDF, JPG or PNG (Max 5MB)</Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                style={[styles.continueButton, { backgroundColor: colors.brand }]}
              >
                <Text style={styles.continueBtnText}>Submit</Text>
                <Feather name="check" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </>
          ) : activeTab === 'my_logs' ? (
            renderMyLogs()
          ) : (
            renderTeamLogs()
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'home' })}>
          <Feather name="home" size={20} color={colors.brand} />
          <Text style={[styles.tabText, { color: colors.brand, fontWeight: '700' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'team' })}>
          <Feather name="users" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'time' })}>
          <Feather name="clock" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'approvals' })}>
          <Feather name="check-square" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_assets')}>
          <Feather name="package" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Assets</Text>
        </TouchableOpacity>
      </View>

      {/* Attractive Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Colored Icon at the top of the card */}
            <View 
              style={[
                styles.modalIconCircle, 
                { 
                  backgroundColor: isDark 
                    ? currentLeaveDetails?.darkBg || '#1e293b' 
                    : currentLeaveDetails?.lightBg || '#EFF6FF' 
                }
              ]}
            >
              <MaterialCommunityIcons 
                name={(currentLeaveDetails?.icon || 'calendar-blank-outline') as any} 
                size={30} 
                color={currentLeaveDetails?.iconColor || colors.brand} 
              />
            </View>

            <Text style={[styles.modalTitleText, { color: colors.textPrimary }]}>
              Submit {selectedLeaveType}
            </Text>
            
            <Text style={[styles.modalDescriptionText, { color: colors.textSecond }]}>
              Are you sure you want to apply for {selectedLeaveType}?
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecond }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.brand }]}
                onPress={() => {
                  setConfirmModalVisible(false);
                  
                  // Create dynamic applied leave request
                  const newLog = {
                    id: Date.now(),
                    type: selectedLeaveType,
                    dates: startDateStr && endDateStr 
                      ? `${getReadableDate(startDateStr, '')} - ${getReadableDate(endDateStr, '')}` 
                      : getReadableDate(startDateStr, ''),
                    days: `${calculateRequestedDays()} Day${calculateRequestedDays() > 1 ? 's' : ''}`,
                    reason: reason || 'No reason provided.',
                    status: 'Pending',
                    icon: LEAVE_TYPES.find(item => item.name === selectedLeaveType)?.icon || 'calendar-blank-outline',
                    iconColor: LEAVE_TYPES.find(item => item.name === selectedLeaveType)?.iconColor || colors.brand,
                    bg: LEAVE_TYPES.find(item => item.name === selectedLeaveType)?.lightBg || colors.iconBg,
                  };
                  
                  setMyLogs(prev => [newLog, ...prev]);
                  setShowApplyForm(false);
                  
                  // Reset form fields
                  setReason('');
                  setStartDateStr(null);
                  setEndDateStr(null);
                  setAttachedFile(null);
                  
                  Alert.alert('Success', 'Leave request submitted successfully!');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ManagerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    rowGap: 12,
  },
  leaveCard: {
    width: '48.5%',
    borderRadius: 20,
    padding: 16,
    minHeight: 104,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
  },
  cardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  screenSubtitleText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#10B981',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateSelectorBlock: {
    flex: 1,
  },
  dateSelectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  dateSelectorValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  arrowBetween: {
    paddingHorizontal: 12,
    marginTop: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonthTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  monthNavButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabelText: {
    fontSize: 12,
    width: 36,
    textAlign: 'center',
    fontWeight: '600',
  },
  gridCellsContainer: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cellContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cellStartRound: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cellEndRound: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  totalDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    borderRadius: 16,
  },
  totalDaysLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysCountPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  daysCountText: {
    color: '#0A52D6',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  textAreaWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  textArea: {
    minHeight: 80,
    fontSize: 14,
    lineHeight: 20,
  },
  supportingDocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  optionalLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  uploadIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  uploadSubtext: {
    fontSize: 11,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 28,
  },
  fileIconWrapper: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
  },
  fileSize: {
    fontSize: 11,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 4,
  },
  continueButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 48,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCircle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCircle2: {
    position: 'absolute',
    right: 40,
    bottom: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  balanceCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: 6,
  },
  balanceCardValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  balanceCardSub: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
    marginBottom: 20,
  },
  balanceButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceBtnPrimary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceBtnPrimaryText: {
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
  balanceBtnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    padding: 16,
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
    fontSize: 18,
    fontWeight: '700',
  },
  historyLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  historyLinkContent: {
    flex: 1,
    marginLeft: 12,
  },
  historyLinkTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyLinkSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyLinkAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyLinkActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logsHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  teamStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  teamStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  teamStatLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.9,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamStatValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    marginLeft: 8,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  teamLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  teamLogAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  teamLogInfo: {
    flex: 1,
  },
  teamLogName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  teamLogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamLogBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  teamLogBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  teamLogDates: {
    fontSize: 12,
    fontWeight: '500',
  },
  teamLogStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
