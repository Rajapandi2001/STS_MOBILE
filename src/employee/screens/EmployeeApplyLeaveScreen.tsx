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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import EmployeeMenu from '@/employee/components/EmployeeMenu';

interface EmployeeApplyLeaveScreenProps {
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

export default function EmployeeApplyLeaveScreen({
  onBack,
  onNavigate,
}: EmployeeApplyLeaveScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [reason, setReason] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('Annual Leave');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const currentLeaveDetails = LEAVE_TYPES.find(item => item.name === selectedLeaveType);
  
  // Date Picker States
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [startDateStr, setStartDateStr] = useState<string | null>('2023-10-12');
  const [endDateStr, setEndDateStr] = useState<string | null>('2023-10-16');
  
  // Attached document state
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; uri: string } | null>(null);

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate]);

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getReadableDate = (dateStr: string | null, placeholder: string) => {
    if (!dateStr) return placeholder;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateRequestedDays = () => {
    if (!startDateStr) return 0;
    if (!endDateStr) {
      const date = new Date(startDateStr);
      const day = date.getDay();
      return (day === 0 || day === 6) ? 0 : 1;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    let count = 0;
    const curDate = new Date(start.getTime());

    while (curDate <= end) {
      const day = curDate.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const sizeMb = file.size ? (file.size / (1024 * 1024)).toFixed(1) : '0.1';
        setAttachedFile({
          name: file.name,
          size: `${sizeMb} MB`,
          uri: file.uri,
        });
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const handleSubmit = () => {
    if (!startDateStr) {
      Alert.alert('Validation Error', 'Please select start date.');
      return;
    }
    if (!endDateStr) {
      Alert.alert('Validation Error', 'Please select end date.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for the leave.');
      return;
    }

    setConfirmModalVisible(true);
  };

  const executeSubmitLeave = () => {
    setConfirmModalVisible(false);
    Alert.alert(
      'Success',
      'Your leave application has been submitted successfully.',
      [{ text: 'OK', onPress: () => onNavigate?.('dashboard') }]
    );
  };

  // Calendar dates renderer
  const generateLeaveCalendarGrid = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay(); // Sun = 0
    const adjustedStartIndex = startDayIndex === 0 ? 6 : startDayIndex - 1; // Mon = 0

    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const gridCells: { dateStr: string; isCurrentMonth: boolean; dayNum: number }[] = [];

    // Prev month padding
    for (let i = adjustedStartIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      gridCells.push({
        dateStr: formatDateString(prevDate),
        isCurrentMonth: false,
        dayNum: d
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      gridCells.push({
        dateStr: formatDateString(curDate),
        isCurrentMonth: true,
        dayNum: d
      });
    }

    // Next month padding to fill grid
    const totalCellsFilled = gridCells.length;
    const remainingCells = 42 - totalCellsFilled;
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(year, month + 1, d);
      gridCells.push({
        dateStr: formatDateString(nextDate),
        isCurrentMonth: false,
        dayNum: d
      });
    }

    // Chunk into weeks
    const weeks: typeof gridCells[] = [];
    for (let i = 0; i < gridCells.length; i += 7) {
      weeks.push(gridCells.slice(i, i + 7));
    }

    return weeks;
  };

  const handleDateCellPress = (dateStr: string) => {
    if (!startDateStr || (startDateStr && endDateStr)) {
      setStartDateStr(dateStr);
      setEndDateStr(null);
    } else {
      const start = new Date(startDateStr);
      const clicked = new Date(dateStr);

      if (clicked < start) {
        setStartDateStr(dateStr);
        setEndDateStr(null);
      } else {
        setEndDateStr(dateStr);
      }
    }
  };

  const isDateSelected = (dateStr: string) => {
    if (startDateStr === dateStr) return true;
    if (endDateStr === dateStr) return true;
    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const cur = new Date(dateStr);
      return cur >= start && cur <= end;
    }
    return false;
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.bgScreen, paddingTop: insets.top }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.hamburgerBtn, { backgroundColor: colors.iconBg }]}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.7}
            >
              <Feather name="menu" size={20} color={colors.brand} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.brand }]}>Apply Leave</Text>
          </View>

          <TouchableOpacity
            style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('employee_profile')}
          >
            <Feather name="user" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {/* Leave Categories */}
          <Text style={[styles.sectionTitleLabel, { color: colors.textPrimary }]}>Select Leave Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {LEAVE_TYPES.map((type) => {
              const isSelected = selectedLeaveType === type.name;
              return (
                <TouchableOpacity
                  key={type.name}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isDark ? type.darkBg : type.lightBg,
                      borderColor: isSelected ? type.iconColor : 'transparent',
                      borderWidth: isSelected ? 1.5 : 0
                    }
                  ]}
                  onPress={() => setSelectedLeaveType(type.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: colors.card }]}>
                    <MaterialCommunityIcons name={type.icon as any} size={20} color={type.iconColor} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{type.name}</Text>
                  <Text style={[styles.categoryDays, { color: type.iconColor }]}>{type.days} left</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Date Picker Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.calendarHeaderRow}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                {months[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </Text>
              <View style={styles.calendarControls}>
                <TouchableOpacity
                  style={[styles.arrowButton, { backgroundColor: colors.iconBg }]}
                  onPress={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                >
                  <Feather name="chevron-left" size={16} color={colors.brand} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.arrowButton, { backgroundColor: colors.iconBg }]}
                  onPress={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
                >
                  <Feather name="chevron-right" size={16} color={colors.brand} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Days of Week */}
            <View style={styles.daysOfWeekRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} style={[styles.dayOfWeekText, { color: colors.textMuted }]}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            {generateLeaveCalendarGrid().map((week, wIdx) => (
              <View key={wIdx} style={styles.calendarGridRow}>
                {week.map((cell, cIdx) => {
                  const selected = isDateSelected(cell.dateStr);
                  const isWeekend = cIdx === 5 || cIdx === 6;
                  const isStart = startDateStr === cell.dateStr;
                  const isEnd = endDateStr === cell.dateStr;

                  return (
                    <TouchableOpacity
                      key={cIdx}
                      style={[
                        styles.calendarDateCell,
                        selected && { backgroundColor: colors.brandBg },
                        isStart && { backgroundColor: colors.brand, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
                        isEnd && { backgroundColor: colors.brand, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
                        isStart && !endDateStr && { borderRadius: 10 }
                      ]}
                      onPress={() => handleDateCellPress(cell.dateStr)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dateCellText,
                          { color: cell.isCurrentMonth ? colors.textPrimary : colors.textMuted },
                          isWeekend && !selected && { color: colors.danger },
                          selected && { color: colors.brand, fontWeight: '700' },
                          (isStart || isEnd) && { color: '#FFFFFF', fontWeight: '800' }
                        ]}
                      >
                        {cell.dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.selectedDatesSummaryRow}>
              <View>
                <Text style={[styles.summaryLabelText, { color: colors.textSecond }]}>Start Date</Text>
                <Text style={[styles.summaryValueText, { color: colors.textPrimary }]}>
                  {getReadableDate(startDateStr, 'Select Date')}
                </Text>
              </View>
              <Feather name="arrow-right" size={16} color={colors.textSecond} />
              <View>
                <Text style={[styles.summaryLabelText, { color: colors.textSecond }]}>End Date</Text>
                <Text style={[styles.summaryValueText, { color: colors.textPrimary }]}>
                  {getReadableDate(endDateStr, 'Select Date')}
                </Text>
              </View>
              <View style={[styles.requestedDaysBadge, { backgroundColor: colors.brand }]}>
                <Text style={styles.requestedDaysText}>{calculateRequestedDays()} Days</Text>
              </View>
            </View>
          </View>

          {/* Form Reason */}
          <Text style={[styles.sectionTitleLabel, { color: colors.textPrimary, marginTop: 12 }]}>Reason for Leave</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight, padding: 16 }]}>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              placeholder="Explain the reason for leave here..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
          </View>

          {/* Attachments */}
          <Text style={[styles.sectionTitleLabel, { color: colors.textPrimary, marginTop: 12 }]}>Attachments (Optional)</Text>
          <TouchableOpacity
            style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            {attachedFile ? (
              <View style={styles.attachedRow}>
                <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.attachedName, { color: colors.textPrimary }]} numberOfLines={1}>{attachedFile.name}</Text>
                  <Text style={[styles.attachedSize, { color: colors.textSecond }]}>{attachedFile.size}</Text>
                </View>
                <TouchableOpacity onPress={() => setAttachedFile(null)}>
                  <Feather name="trash-2" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Feather name="upload-cloud" size={32} color={colors.brand} />
                <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>Upload Supporting Document</Text>
                <Text style={[styles.uploadSubtitle, { color: colors.textSecond }]}>PDF, PNG, JPG, or DOC (Max 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.brand }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sticky Bottom Tab Bar */}
        <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard')}>
            <Feather name="home" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_create_claim')}>
            <MaterialCommunityIcons name="receipt-outline" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Claim</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard', { openCalendar: true })}>
            <Feather name="clock" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <Feather name="calendar" size={22} color={colors.tabActive} />
            <Text style={[styles.tabText, { color: colors.tabActive }]}>Leave</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_assets')}>
            <MaterialCommunityIcons name="laptop" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Asset</Text>
          </TouchableOpacity>
        </View>

        {/* Side Menu Drawer overlay */}
        <EmployeeMenu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={onNavigate}
        />

        {/* Confirmation Modal */}
        <Modal
          visible={confirmModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={[styles.modalIconCircle, { backgroundColor: colors.brandBg }]}>
                <Feather name="help-circle" size={32} color={colors.brand} />
              </View>
              <Text style={[styles.modalTitleText, { color: colors.textPrimary }]}>Submit Leave Application?</Text>
              <Text style={[styles.modalDescriptionText, { color: colors.textSecond }]}>
                Your request for {calculateRequestedDays()} business days of {selectedLeaveType} will be submitted for approval.
              </Text>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: colors.borderLight }]}
                  onPress={() => setConfirmModalVisible(false)}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.textSecond }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: colors.brand }]}
                  onPress={executeSubmitLeave}
                >
                  <Text style={styles.modalConfirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginLeft: 12 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitleLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoriesScroll: { gap: 12, paddingBottom: 16 },
  categoryCard: { width: 120, padding: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  categoryIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  categoryDays: { fontSize: 11, fontWeight: '600' },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  calendarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  calendarControls: { flexDirection: 'row', gap: 8 },
  arrowButton: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  daysOfWeekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayOfWeekText: { width: 32, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  calendarGridRow: { flexDirection: 'row', justifyContent: 'space-around', height: 36, alignItems: 'center' },
  calendarDateCell: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  dateCellText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 16 },
  selectedDatesSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabelText: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  summaryValueText: { fontSize: 14, fontWeight: '700' },
  requestedDaysBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  requestedDaysText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  textInput: { minHeight: 90, fontSize: 14, padding: 0 },
  uploadBox: { borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', padding: 24, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 4 },
  uploadSubtitle: { fontSize: 12 },
  attachedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  attachedName: { fontSize: 14, fontWeight: '700' },
  attachedSize: { fontSize: 12, marginTop: 2 },
  submitButton: { height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 320, borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  modalIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitleText: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  modalDescriptionText: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  modalButtonsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  modalCancelBtnText: { fontSize: 14, fontWeight: '700' },
  modalConfirmBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalConfirmBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
