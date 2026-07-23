import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';
import { getShiftById, addShift, updateShift, getShifts, Shift } from './mockShiftStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseTimeString(timeStr: string) {
  const regex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = timeStr.match(regex);
  if (match) {
    return {
      hour: parseInt(match[1], 10),
      minute: parseInt(match[2], 10),
      period: match[3].toUpperCase() as 'AM' | 'PM',
    };
  }
  return { hour: 9, minute: 0, period: 'AM' as const };
}

function formatTimeComponents(hour: number, minute: number, period: 'AM' | 'PM'): string {
  const hStr = hour.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr} ${period}`;
}

function parseDurationString(durationStr: string) {
  const parts = durationStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    hour: isNaN(h) ? 8 : h,
    minute: isNaN(m) ? 0 : m,
  };
}

function formatDurationComponents(hour: number, minute: number): string {
  const hStr = hour.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminShiftDetailScreenProps {
  shiftId?: string;
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

export default function AdminShiftDetailScreen({
  shiftId,
  onNavigate,
  onBack,
}: AdminShiftDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [formStart, setFormStart] = useState('09:00 AM');
  const [formEnd, setFormEnd] = useState('06:00 PM');
  const [formGrace, setFormGrace] = useState('15');
  const [formMinHours, setFormMinHours] = useState('08:00');
  const [formHalfHours, setFormHalfHours] = useState('04:00');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Custom picker state
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'startTime' | 'endTime'>('startTime');
  const [tempTime, setTempTime] = useState({ hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' });

  const [durationPickerVisible, setDurationPickerVisible] = useState(false);
  const [durationPickerTarget, setDurationPickerTarget] = useState<'minWorkingHours' | 'halfDayHours'>('minWorkingHours');
  const [tempDuration, setTempDuration] = useState({ hour: 8, minute: 0 });

  // Pre-fill if Edit mode
  useEffect(() => {
    if (shiftId) {
      const existing = getShiftById(shiftId);
      if (existing) {
        setFormCode(existing.code);
        setFormName(existing.name);
        setFormType(existing.type);
        setFormStart(existing.startTime);
        setFormEnd(existing.endTime);
        setFormGrace(existing.graceTime.toString());
        setFormMinHours(existing.minWorkingHours);
        setFormHalfHours(existing.halfDayHours);
        setFormStatus(existing.status);
      }
    }
  }, [shiftId]);

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('admin_shift_master');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate]);

  // Validation
  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (shiftId) {
      if (!formCode.trim()) {
        nextErrors.code = 'Shift code is required.';
      } else {
        // Check for uniqueness
        const dupe = getShifts().find(
          (s) => s.code.toUpperCase() === formCode.trim().toUpperCase() && s.id !== shiftId
        );
        if (dupe) {
          nextErrors.code = 'Shift code must be unique.';
        }
      }
    }

    if (!formName.trim()) {
      nextErrors.name = 'Shift name is required.';
    }

    if (!formStart.trim()) {
      nextErrors.startTime = 'Start time is required.';
    }

    if (!formEnd.trim()) {
      nextErrors.endTime = 'End time is required.';
    }

    const graceNum = parseInt(formGrace, 10);
    if (!formGrace.trim()) {
      nextErrors.graceTime = 'Grace time is required.';
    } else if (isNaN(graceNum) || graceNum < 0) {
      nextErrors.graceTime = 'Grace time must be a non-negative number.';
    }

    if (!formMinHours.trim()) {
      nextErrors.minWorkingHours = 'Minimum working hours are required.';
    }

    if (!formHalfHours.trim()) {
      nextErrors.halfDayHours = 'Half day hours are required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    let finalCode = '';
    if (shiftId) {
      finalCode = formCode.trim().toUpperCase();
    } else {
      // Auto-generate Shift Code (e.g. SHFT-REG01)
      const cleanName = formName.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
      const prefix = cleanName.substring(0, 3) || 'SFT';
      let count = 1;
      let code = `SHFT-${prefix}${count.toString().padStart(2, '0')}`;
      const existingShifts = getShifts();
      while (existingShifts.some(s => s.code === code)) {
        count++;
        code = `SHFT-${prefix}${count.toString().padStart(2, '0')}`;
      }
      finalCode = code;
    }

    const shiftData = {
      code: finalCode,
      name: formName.trim(),
      type: formType,
      startTime: formStart,
      endTime: formEnd,
      graceTime: parseInt(formGrace.trim(), 10),
      minWorkingHours: formMinHours,
      halfDayHours: formHalfHours,
      status: formStatus,
    };

    if (shiftId) {
      updateShift(shiftId, shiftData);
      showToast('Shift updated successfully!', () => {
        onBack ? onBack() : onNavigate?.('admin_shift_master');
      });
    } else {
      addShift(shiftData);
      showToast('Shift created successfully!', () => {
        onBack ? onBack() : onNavigate?.('admin_shift_master');
      });
    }
  };

  const showToast = (message: string, callback: () => void) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setToastMessage(null);
      callback();
    });
  };

  // Custom Time Picker handlers
  const openTimePicker = (target: 'startTime' | 'endTime') => {
    setTimePickerTarget(target);
    const initialTimeStr = target === 'startTime' ? formStart : formEnd;
    const parsed = parseTimeString(initialTimeStr);
    setTempTime(parsed);
    setTimePickerVisible(true);
  };

  const adjustTimeHour = (amt: number) => {
    setTempTime((prev) => {
      let next = prev.hour + amt;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return { ...prev, hour: next };
    });
  };

  const adjustTimeMinute = (amt: number) => {
    setTempTime((prev) => {
      let next = prev.minute + amt;
      if (next >= 60) next = 0;
      if (next < 0) next = 55;
      return { ...prev, minute: next };
    });
  };

  const confirmTimeSelection = () => {
    const formatted = formatTimeComponents(tempTime.hour, tempTime.minute, tempTime.period);
    if (timePickerTarget === 'startTime') {
      setFormStart(formatted);
      if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
    } else {
      setFormEnd(formatted);
      if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: '' }));
    }
    setTimePickerVisible(false);
  };

  // Custom Duration Picker handlers
  const openDurationPicker = (target: 'minWorkingHours' | 'halfDayHours') => {
    setDurationPickerTarget(target);
    const initialDurationStr = target === 'minWorkingHours' ? formMinHours : formHalfHours;
    const parsed = parseDurationString(initialDurationStr);
    setTempDuration(parsed);
    setDurationPickerVisible(true);
  };

  const adjustDurationHour = (amt: number) => {
    setTempDuration((prev) => {
      let next = prev.hour + amt;
      if (next > 23) next = 0;
      if (next < 0) next = 23;
      return { ...prev, hour: next };
    });
  };

  const adjustDurationMinute = (amt: number) => {
    setTempDuration((prev) => {
      let next = prev.minute + amt;
      if (next >= 60) next = 0;
      if (next < 0) next = 55;
      return { ...prev, minute: next };
    });
  };

  const confirmDurationSelection = () => {
    const formatted = formatDurationComponents(tempDuration.hour, tempDuration.minute);
    if (durationPickerTarget === 'minWorkingHours') {
      setFormMinHours(formatted);
      if (errors.minWorkingHours) setErrors((prev) => ({ ...prev, minWorkingHours: '' }));
    } else {
      setFormHalfHours(formatted);
      if (errors.halfDayHours) setErrors((prev) => ({ ...prev, halfDayHours: '' }));
    }
    setDurationPickerVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

        <AdminHeader
          title={shiftId ? 'Edit Shift Settings' : 'Create New Shift'}
          onMenuPress={() => setMenuOpen(true)}
          onNotificationPress={() => onNavigate?.('admin_alerts')}
          onProfilePress={() => onNavigate?.('admin_profile')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        >
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            
            {/* Shift Code Field */}
            {shiftId ? (
              <>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Code *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.textSecond,
                      borderColor: colors.border,
                      backgroundColor: isDark ? '#2D2D2D' : '#F0F0F0',
                      opacity: 0.8
                    }
                  ]}
                  placeholder="e.g. SHFT-REG01"
                  placeholderTextColor={colors.textSecond}
                  value={formCode}
                  editable={false}
                />
              </>
            ) : null}

            {/* Shift Name Field */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Name *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.textPrimary, borderColor: errors.name ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
              ]}
              placeholder="e.g. Regular Day Shift"
              placeholderTextColor={colors.textSecond}
              value={formName}
              onChangeText={(text) => {
                setFormName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
            />
            {errors.name && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>}

            {/* Shift Type Field */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Type *</Text>
            <View style={styles.typeSelectorContainer}>
              {(['Morning', 'Evening', 'Night'] as const).map((type) => {
                const active = formType === type;
                let iconName: 'weather-sunny' | 'weather-sunset' | 'weather-night' = 'weather-sunny';
                let iconCol = colors.textSecond;
                if (type === 'Evening') {
                  iconName = 'weather-sunset';
                  if (active) iconCol = '#F97316';
                } else if (type === 'Night') {
                  iconName = 'weather-night';
                  if (active) iconCol = '#8B5CF6';
                } else {
                  if (active) iconCol = colors.brand;
                }

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      { borderColor: colors.border, backgroundColor: colors.bgScreen },
                      active && {
                        backgroundColor: active && type === 'Morning' ? '#EFF6FF' : type === 'Evening' ? '#FFF7ED' : '#F5F3FF',
                        borderColor: iconCol,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => {
                      setFormType(type);
                    }}
                  >
                    <MaterialCommunityIcons name={iconName} size={20} color={iconCol} />
                    <Text
                      style={[
                        styles.typeOptionText,
                        { color: colors.textPrimary },
                        active && { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Start and End Times */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Start Time *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.startTime ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => openTimePicker('startTime')}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{formStart}</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.startTime && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.startTime}</Text>}
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>End Time *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.endTime ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => openTimePicker('endTime')}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{formEnd}</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.endTime && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.endTime}</Text>}
              </View>
            </View>

            {/* Grace Time Field */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Grace Period (Minutes) *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.textPrimary, borderColor: errors.graceTime ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
              ]}
              placeholder="e.g. 15"
              placeholderTextColor={colors.textSecond}
              keyboardType="number-pad"
              value={formGrace}
              onChangeText={(text) => {
                setFormGrace(text);
                if (errors.graceTime) setErrors((prev) => ({ ...prev, graceTime: '' }));
              }}
            />
            {errors.graceTime && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.graceTime}</Text>}

            {/* Min Working Hours and Half Day Hours */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Min Work Hours *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.minWorkingHours ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => openDurationPicker('minWorkingHours')}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{formMinHours} Hrs</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.minWorkingHours && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.minWorkingHours}</Text>}
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Half Day Hours *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.halfDayHours ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => openDurationPicker('halfDayHours')}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{formHalfHours} Hrs</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.halfDayHours && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.halfDayHours}</Text>}
              </View>
            </View>



            {/* Form Actions */}
            <View style={styles.formButtonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => (onBack ? onBack() : onNavigate?.('admin_shift_master'))}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecond }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.brand }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {shiftId ? 'Update Shift' : 'Save Shift'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* Reusable Time Picker Modal */}
        <Modal
          visible={timePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select {timePickerTarget === 'startTime' ? 'Start Time' : 'End Time'}
              </Text>

              <View style={styles.pickerSelectorRow}>
                {/* Hour */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustTimeHour(1)}
                  >
                    <Feather name="chevron-up" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerNum, { color: colors.textPrimary }]}>
                    {tempTime.hour.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustTimeHour(-1)}
                  >
                    <Feather name="chevron-down" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerColLabel, { color: colors.textSecond }]}>Hour</Text>
                </View>

                <Text style={[styles.pickerColon, { color: colors.textPrimary }]}>:</Text>

                {/* Minute */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustTimeMinute(5)}
                  >
                    <Feather name="chevron-up" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerNum, { color: colors.textPrimary }]}>
                    {tempTime.minute.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustTimeMinute(-5)}
                  >
                    <Feather name="chevron-down" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerColLabel, { color: colors.textSecond }]}>Minute</Text>
                </View>

                {/* AM/PM */}
                <View style={[styles.pickerCol, { marginLeft: 12 }]}>
                  <TouchableOpacity
                    style={[
                      styles.periodBtn,
                      { borderColor: colors.border, backgroundColor: colors.bgScreen },
                      tempTime.period === 'AM' && { backgroundColor: colors.brand, borderColor: colors.brand }
                    ]}
                    onPress={() => setTempTime((prev) => ({ ...prev, period: 'AM' }))}
                  >
                    <Text style={[
                      styles.periodBtnText,
                      { color: colors.textPrimary },
                      tempTime.period === 'AM' && { color: '#FFFFFF', fontWeight: '700' }
                    ]}>
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.periodBtn,
                      { borderColor: colors.border, marginTop: 8, backgroundColor: colors.bgScreen },
                      tempTime.period === 'PM' && { backgroundColor: colors.brand, borderColor: colors.brand }
                    ]}
                    onPress={() => setTempTime((prev) => ({ ...prev, period: 'PM' }))}
                  >
                    <Text style={[
                      styles.periodBtnText,
                      { color: colors.textPrimary },
                      tempTime.period === 'PM' && { color: '#FFFFFF', fontWeight: '700' }
                    ]}>
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalNoButton, { borderColor: colors.border }]}
                  onPress={() => setTimePickerVisible(false)}
                >
                  <Text style={{ color: colors.textSecond, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalYesButton, { backgroundColor: colors.brand }]}
                  onPress={confirmTimeSelection}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Reusable Duration Picker Modal */}
        <Modal
          visible={durationPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDurationPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select Duration
              </Text>

              <View style={styles.pickerSelectorRow}>
                {/* Hours */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustDurationHour(1)}
                  >
                    <Feather name="chevron-up" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerNum, { color: colors.textPrimary }]}>
                    {tempDuration.hour.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustDurationHour(-1)}
                  >
                    <Feather name="chevron-down" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerColLabel, { color: colors.textSecond }]}>Hours</Text>
                </View>

                <Text style={[styles.pickerColon, { color: colors.textPrimary }]}>:</Text>

                {/* Minutes */}
                <View style={styles.pickerCol}>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustDurationMinute(5)}
                  >
                    <Feather name="chevron-up" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerNum, { color: colors.textPrimary }]}>
                    {tempDuration.minute.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.bgScreen }]}
                    onPress={() => adjustDurationMinute(-5)}
                  >
                    <Feather name="chevron-down" size={24} color={colors.brand} />
                  </TouchableOpacity>
                  <Text style={[styles.pickerColLabel, { color: colors.textSecond }]}>Minutes</Text>
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalNoButton, { borderColor: colors.border }]}
                  onPress={() => setDurationPickerVisible(false)}
                >
                  <Text style={{ color: colors.textSecond, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalYesButton, { backgroundColor: colors.brand }]}
                  onPress={confirmDurationSelection}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Success Animated Toast */}
        {toastMessage && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                backgroundColor: colors.successText,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 20 + insets.top],
                    }),
                  },
                ],
                opacity: toastOpacity,
              },
            ]}
          >
            <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}

        <AdminBottomTabNavigator
          activeTab={null}
          onTabPress={(tab) => {
            if (tab === 'home') onNavigate?.('admin_dashboard');
            else onNavigate?.(`admin_${tab}`);
          }}
        />

        <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  errorText: { fontSize: 11, fontWeight: '600', marginTop: 4, marginLeft: 2 },
  row: { flexDirection: 'row', marginTop: 4 },
  typeSelectorContainer: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 4 },
  typeOption: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  typeOptionText: { fontSize: 13, fontWeight: '600' },
  pickerButtonInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerValueText: { fontSize: 14, fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', marginTop: 6, marginBottom: 4 },
  toggleBtnLeft: { flex: 1, height: 44, borderWidth: 1, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, justifyContent: 'center', alignItems: 'center' },
  toggleBtnRight: { flex: 1, height: 44, borderWidth: 1, borderTopRightRadius: 10, borderBottomRightRadius: 10, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 0 },
  toggleText: { fontSize: 13, fontWeight: '600' },
  formButtonContainer: { flexDirection: 'row', gap: 12, marginTop: 28, marginBottom: 10 },
  cancelButton: { flex: 1, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  cancelButtonText: { fontWeight: '700', fontSize: 14 },
  saveButton: { flex: 2, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  /* Picker Modals */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  pickerSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  pickerCol: { alignItems: 'center', width: 68 },
  pickerBtn: { width: 52, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pickerNum: { fontSize: 28, fontWeight: '800', marginVertical: 10, width: 60, textAlign: 'center' },
  pickerColLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  pickerColon: { fontSize: 28, fontWeight: '800', marginHorizontal: 8, bottom: 12 },
  periodBtn: { width: 56, height: 36, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  periodBtnText: { fontSize: 13, fontWeight: '600' },
  modalButtonContainer: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  modalNoButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  modalYesButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  /* Toast notification */
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
