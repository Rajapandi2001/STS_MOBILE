import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Switch,
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
import { getShifts, Shift } from './mockShiftStore';

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface PolicyData {
  id: string;
  name: string;
  shiftRequired: boolean;
  shiftId: string;
  gracePeriod: string;
  minWorkingHours: string;
  halfDayHours: string;
  overtimeStartsAfter: string;
  gpsRequired: boolean;
  geofenceRequired: boolean;
  photoRequired: boolean;
  allowWfh: boolean;
  autoCheckout: boolean;
  normalCheckinTime: string;
  normalCheckoutTime: string;
}

const DEFAULT_POLICY: PolicyData = {
  id: 'POL-2026-001',
  name: 'Standard Attendance Policy',
  shiftRequired: true,
  shiftId: '1', // Regular Shift
  gracePeriod: '15',
  minWorkingHours: '08:00',
  halfDayHours: '04:00',
  overtimeStartsAfter: '09:00',
  gpsRequired: true,
  geofenceRequired: false,
  photoRequired: true,
  allowWfh: false,
  autoCheckout: true,
  normalCheckinTime: '09:00 AM',
  normalCheckoutTime: '06:00 PM',
};

interface AdminAttendanceRulesScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

export default function AdminAttendanceRulesScreen({
  onNavigate,
  onBack,
}: AdminAttendanceRulesScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Form State
  const [policyName, setPolicyName] = useState(DEFAULT_POLICY.name);
  const [shiftRequired, setShiftRequired] = useState(DEFAULT_POLICY.shiftRequired);
  const [selectedShiftId, setSelectedShiftId] = useState(DEFAULT_POLICY.shiftId);
  const [gracePeriod, setGracePeriod] = useState(DEFAULT_POLICY.gracePeriod);
  const [minWorkingHours, setMinWorkingHours] = useState(DEFAULT_POLICY.minWorkingHours);
  const [halfDayHours, setHalfDayHours] = useState(DEFAULT_POLICY.halfDayHours);
  const [overtimeStartsAfter, setOvertimeStartsAfter] = useState(DEFAULT_POLICY.overtimeStartsAfter);
  
  const [gpsRequired, setGpsRequired] = useState(DEFAULT_POLICY.gpsRequired);
  const [geofenceRequired, setGeofenceRequired] = useState(DEFAULT_POLICY.geofenceRequired);
  const [photoRequired, setPhotoRequired] = useState(DEFAULT_POLICY.photoRequired);
  const [allowWfh, setAllowWfh] = useState(DEFAULT_POLICY.allowWfh);
  
  const [autoCheckout, setAutoCheckout] = useState(DEFAULT_POLICY.autoCheckout);
  const [normalCheckinTime, setNormalCheckinTime] = useState(DEFAULT_POLICY.normalCheckinTime);
  const [normalCheckoutTime, setNormalCheckoutTime] = useState(DEFAULT_POLICY.normalCheckoutTime);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Custom Time Picker state
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'normalCheckinTime' | 'normalCheckoutTime'>('normalCheckinTime');
  const [tempTime, setTempTime] = useState({ hour: 9, minute: 0, period: 'AM' as 'AM' | 'PM' });

  // Custom Duration Picker state
  const [durationPickerVisible, setDurationPickerVisible] = useState(false);
  const [durationPickerTarget, setDurationPickerTarget] = useState<'minWorkingHours' | 'halfDayHours' | 'overtimeStartsAfter'>('minWorkingHours');
  const [tempDuration, setTempDuration] = useState({ hour: 8, minute: 0 });

  // Shift List selector modal state
  const [shiftListVisible, setShiftListVisible] = useState(false);
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);

  // Load shifts on mount
  useEffect(() => {
    setAvailableShifts(getShifts());
  }, []);

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('admin_dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate]);

  const selectedShiftName = availableShifts.find(s => s.id === selectedShiftId)?.name || 'Select Shift';

  // Validation
  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!policyName.trim()) {
      nextErrors.policyName = 'Policy Name is required.';
    }

    if (shiftRequired && !selectedShiftId) {
      nextErrors.shiftId = 'Please select a required shift.';
    }

    const graceNum = parseInt(gracePeriod, 10);
    if (!gracePeriod.trim()) {
      nextErrors.gracePeriod = 'Grace Period is required.';
    } else if (isNaN(graceNum) || graceNum < 0) {
      nextErrors.gracePeriod = 'Grace Period must be a positive integer.';
    }

    if (!minWorkingHours.trim()) {
      nextErrors.minWorkingHours = 'Minimum daily hours are required.';
    }

    if (!halfDayHours.trim()) {
      nextErrors.halfDayHours = 'Half day threshold hours are required.';
    }

    if (!overtimeStartsAfter.trim()) {
      nextErrors.overtimeStartsAfter = 'Overtime cutoff starts after is required.';
    }

    if (!normalCheckinTime.trim()) {
      nextErrors.normalCheckinTime = 'Normal check-in time is required.';
    }

    if (!normalCheckoutTime.trim()) {
      nextErrors.normalCheckoutTime = 'Normal check-out time is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    showToast('Attendance rules saved successfully!', () => {
      // Logic for saving completed. No API needed.
    });
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
      Animated.delay(1800),
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

  // Custom Time Picker Handlers
  const openTimePicker = (target: 'normalCheckinTime' | 'normalCheckoutTime') => {
    setTimePickerTarget(target);
    const initialTimeStr = target === 'normalCheckinTime' ? normalCheckinTime : normalCheckoutTime;
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
    if (timePickerTarget === 'normalCheckinTime') {
      setNormalCheckinTime(formatted);
      if (errors.normalCheckinTime) setErrors((prev) => ({ ...prev, normalCheckinTime: '' }));
    } else {
      setNormalCheckoutTime(formatted);
      if (errors.normalCheckoutTime) setErrors((prev) => ({ ...prev, normalCheckoutTime: '' }));
    }
    setTimePickerVisible(false);
  };

  // Custom Duration Picker Handlers
  const openDurationPicker = (target: 'minWorkingHours' | 'halfDayHours' | 'overtimeStartsAfter') => {
    setDurationPickerTarget(target);
    const initialDurationStr =
      target === 'minWorkingHours'
        ? minWorkingHours
        : target === 'halfDayHours'
        ? halfDayHours
        : overtimeStartsAfter;
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
      setMinWorkingHours(formatted);
      if (errors.minWorkingHours) setErrors((prev) => ({ ...prev, minWorkingHours: '' }));
    } else if (durationPickerTarget === 'halfDayHours') {
      setHalfDayHours(formatted);
      if (errors.halfDayHours) setErrors((prev) => ({ ...prev, halfDayHours: '' }));
    } else {
      setOvertimeStartsAfter(formatted);
      if (errors.overtimeStartsAfter) setErrors((prev) => ({ ...prev, overtimeStartsAfter: '' }));
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
          title="Attendance Rules"
          onMenuPress={() => setMenuOpen(true)}
          onNotificationPress={() => onNavigate?.('admin_alerts')}
          onProfilePress={() => onNavigate?.('admin_profile')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        >
          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Set active attendance tracking parameters, geolocation requirements, WFH provisions, and overtime schedules.
          </Text>

          {/* Section 1: Policy Information */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconWrap, { backgroundColor: colors.brandBg }]}>
                <Feather name="file-text" size={18} color={colors.brand} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Policy Information</Text>
            </View>

            <Text style={[styles.label, { color: colors.textPrimary }]}>Policy ID (Read-only)</Text>
            <TextInput
              style={[
                styles.inputDisabled,
                { color: colors.textMuted, borderColor: colors.border, backgroundColor: colors.bgScreen }
              ]}
              value={DEFAULT_POLICY.id}
              editable={false}
            />

            <Text style={[styles.label, { color: colors.textPrimary }]}>Policy Name *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.textPrimary, borderColor: errors.policyName ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
              ]}
              placeholder="e.g. Standard Attendance Policy"
              placeholderTextColor={colors.textSecond}
              value={policyName}
              onChangeText={(text) => {
                setPolicyName(text);
                if (errors.policyName) setErrors((prev) => ({ ...prev, policyName: '' }));
              }}
            />
            {errors.policyName && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.policyName}</Text>}

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Shift Required</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecond }]}>Shift scheduling linked check-in validation.</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.brandBorder }}
                thumbColor={shiftRequired ? colors.brand : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={(val) => {
                  setShiftRequired(val);
                  if (!val) {
                    if (errors.shiftId) setErrors((prev) => ({ ...prev, shiftId: '' }));
                  }
                }}
                value={shiftRequired}
              />
            </View>

            {shiftRequired && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Link Shift Dropdown *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.shiftId ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => setShiftListVisible(true)}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{selectedShiftName}</Text>
                  <Feather name="chevron-down" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.shiftId && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.shiftId}</Text>}
              </View>
            )}
          </View>

          {/* Section 2: Attendance Configuration */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="sliders" size={18} color="#16A34A" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attendance Configuration</Text>
            </View>

            <Text style={[styles.label, { color: colors.textPrimary }]}>Grace Period (Minutes) *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.textPrimary, borderColor: errors.gracePeriod ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
              ]}
              placeholder="e.g. 15"
              placeholderTextColor={colors.textSecond}
              keyboardType="number-pad"
              value={gracePeriod}
              onChangeText={(text) => {
                setGracePeriod(text);
                if (errors.gracePeriod) setErrors((prev) => ({ ...prev, gracePeriod: '' }));
              }}
            />
            {errors.gracePeriod && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.gracePeriod}</Text>}

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
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{minWorkingHours} Hrs</Text>
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
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{halfDayHours} Hrs</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.halfDayHours && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.halfDayHours}</Text>}
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textPrimary }]}>Overtime starts after (Hours) *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButtonInput,
                { borderColor: errors.overtimeStartsAfter ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
              ]}
              onPress={() => openDurationPicker('overtimeStartsAfter')}
            >
              <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{overtimeStartsAfter} Hrs</Text>
              <Feather name="clock" size={16} color={colors.textSecond} />
            </TouchableOpacity>
            {errors.overtimeStartsAfter && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.overtimeStartsAfter}</Text>}
          </View>

          {/* Section 3: Attendance Requirements */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="shield" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attendance Requirements</Text>
            </View>

            {/* GPS switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>GPS Required</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecond }]}>Requires real-time coordinate logging during punch-in.</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.brandBorder }}
                thumbColor={gpsRequired ? colors.brand : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={setGpsRequired}
                value={gpsRequired}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

            {/* Geofence switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Geofence Required</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecond }]}>Restricts check-in to designated office spatial circles.</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.brandBorder }}
                thumbColor={geofenceRequired ? colors.brand : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={setGeofenceRequired}
                value={geofenceRequired}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

            {/* Photo switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Photo Required</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecond }]}>Capture selfie during check-in for verification check.</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.brandBorder }}
                thumbColor={photoRequired ? colors.brand : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={setPhotoRequired}
                value={photoRequired}
              />
            </View>

            <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

            {/* Allow WFH switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Allow Work From Home</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecond }]}>Permits remote spatial locations without geofencing validation.</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.brandBorder }}
                thumbColor={allowWfh ? colors.brand : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={setAllowWfh}
                value={allowWfh}
              />
            </View>
          </View>

          {/* Section 4: Automation */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Feather name="cpu" size={18} color="#D97706" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Automation</Text>
            </View>

            {/* Auto Checkout switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Auto Checkout</Text>
                <Text style={[styles.switchDesc, { color: colors.textSecond }]}>Performs automatic clock-out at end-of-day cutoff.</Text>
              </View>
              <Switch
                trackColor={{ false: '#CBD5E1', true: colors.brandBorder }}
                thumbColor={autoCheckout ? colors.brand : '#F1F5F9'}
                ios_backgroundColor="#CBD5E1"
                onValueChange={setAutoCheckout}
                value={autoCheckout}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Normal Check-in *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.normalCheckinTime ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => openTimePicker('normalCheckinTime')}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{normalCheckinTime}</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.normalCheckinTime && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.normalCheckinTime}</Text>}
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Normal Check-out *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButtonInput,
                    { borderColor: errors.normalCheckoutTime ? colors.danger : colors.border, backgroundColor: colors.bgScreen }
                  ]}
                  onPress={() => openTimePicker('normalCheckoutTime')}
                >
                  <Text style={[styles.pickerValueText, { color: colors.textPrimary }]}>{normalCheckoutTime}</Text>
                  <Feather name="clock" size={16} color={colors.textSecond} />
                </TouchableOpacity>
                {errors.normalCheckoutTime && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.normalCheckoutTime}</Text>}
              </View>
            </View>
          </View>

          {/* Save Policy Button */}
          <TouchableOpacity
            style={[styles.savePolicyBtn, { backgroundColor: colors.brand }]}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.savePolicyBtnText}>Save Policy</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Custom Dropdown Dialog for Shifts */}
        <Modal
          visible={shiftListVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setShiftListVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card, maxHeight: '60%' }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary, marginBottom: 16 }]}>Select Shift Schedule</Text>
              
              <ScrollView showsVerticalScrollIndicator={true} style={{ width: '100%' }}>
                {availableShifts.map((shift) => {
                  const isSelected = shift.id === selectedShiftId;
                  return (
                    <TouchableOpacity
                      key={shift.id}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: colors.borderLight },
                        isSelected && { backgroundColor: colors.brandBg }
                      ]}
                      onPress={() => {
                        setSelectedShiftId(shift.id);
                        if (errors.shiftId) setErrors((prev) => ({ ...prev, shiftId: '' }));
                        setShiftListVisible(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdownItemCode, { color: colors.textPrimary, fontWeight: isSelected ? '700' : '500' }]}>
                          {shift.code}
                        </Text>
                        <Text style={[styles.dropdownItemName, { color: colors.textSecond }]}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </Text>
                      </View>
                      {isSelected && <Feather name="check" size={18} color={colors.brand} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.modalNoButton, { borderColor: colors.border, marginTop: 16, width: '100%' }]}
                onPress={() => setShiftListVisible(false)}
              >
                <Text style={{ color: colors.textSecond, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Time Picker Modal */}
        <Modal
          visible={timePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select {timePickerTarget === 'normalCheckinTime' ? 'Check-in Time' : 'Check-out Time'}
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

        {/* Custom Duration Picker Modal */}
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
  pageDescription: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  inputDisabled: { height: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 4 },
  switchLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  switchDesc: { fontSize: 12, lineHeight: 16 },
  row: { flexDirection: 'row', marginTop: 4 },
  rowDivider: { height: 1, marginVertical: 14 },
  errorText: { fontSize: 11, fontWeight: '600', marginTop: 4, marginLeft: 2 },
  savePolicyBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  savePolicyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  /* Dropdown Selector Modal */
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  dropdownItemCode: { fontSize: 14, marginBottom: 2 },
  dropdownItemName: { fontSize: 12 },

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
