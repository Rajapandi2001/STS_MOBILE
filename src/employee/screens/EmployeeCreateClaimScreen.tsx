import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import EmployeeMenu from '@/employee/components/EmployeeMenu';
import * as DocumentPicker from 'expo-document-picker';

interface EmployeeCreateClaimScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

type ClaimCategory = 'travel' | 'meals' | 'equipment' | 'other';

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const startYear = new Date().getFullYear() - 4;
const YEARS_LIST = Array.from({ length: 9 }, (_, i) => startYear + i);

export default function EmployeeCreateClaimScreen({
  onBack,
  onNavigate,
}: EmployeeCreateClaimScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Navigation menu drawer state
  const [menuOpen, setMenuOpen] = useState(false);

  // Wizard steps: 1 = Details, 2 = Attach Receipt, 3 = Review, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [category, setCategory] = useState<ClaimCategory>('travel');
  const [amount, setAmount] = useState('450.00'); // default amount
  const [currency, setCurrency] = useState('$'); // default currency symbol
  const [date, setDate] = useState('Oct 26, 2023'); // default date
  const [description, setDescription] = useState('Business trip expenses');
  
  // Attached files state (Step 2)
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([
    { name: 'taxi_receipt_june2024.jpg', size: '1.2 MB' },
  ]);

  // Currency and Calendar Selector States
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const [selectedReceiptUri, setSelectedReceiptUri] = useState<string | null>('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?fit=crop&w=600');

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleSelectMonth = (monthIdx: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), monthIdx, 1));
    setCalendarViewMode('calendar');
  };

  const handleSelectYear = (year: number) => {
    setCalendarDate(new Date(year, calendarDate.getMonth(), 1));
    setCalendarViewMode('calendar');
  };

  const handleSelectDate = (dateObj: Date) => {
    const formatted = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    setDate(formatted);
    setShowCalendar(false);
  };

  const generateDynamicCalendarGrid = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayIdx = firstDay.getDay(); // Sun = 0
    const adjustedStartIdx = startDayIdx === 0 ? 6 : startDayIdx - 1; // Mon = 0

    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: { isCurrent: boolean; num: number; dateObj: Date }[] = [];

    // Prev month padding
    for (let i = adjustedStartIdx - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      cells.push({
        isCurrent: false,
        num: dayNum,
        dateObj: new Date(year, month - 1, dayNum)
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        isCurrent: true,
        num: i,
        dateObj: new Date(year, month, i)
      });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        isCurrent: false,
        num: i,
        dateObj: new Date(year, month + 1, i)
      });
    }

    // Chunk into weeks
    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (step > 1 && step < 4) {
        setStep((s) => (s - 1) as any);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [step, onBack, onNavigate]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const sizeMb = file.size ? (file.size / (1024 * 1024)).toFixed(1) : '0.5';
        
        setSelectedReceiptUri(file.uri);
        setAttachedFiles(prev => [
          ...prev,
          { name: file.name, size: `${sizeMb} MB` }
        ]);
      }
    } catch (err) {
      console.log('Error picking file:', err);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid amount.');
        return;
      }
      if (!description.trim()) {
        Alert.alert('Validation Error', 'Please enter a description.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (attachedFiles.length === 0) {
        Alert.alert('Validation Error', 'Please attach a receipt image.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = [...attachedFiles];
    nextFiles.splice(index, 1);
    setAttachedFiles(nextFiles);
    if (nextFiles.length === 0) {
      setSelectedReceiptUri(null);
    }
  };

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
            <Text style={[styles.headerTitle, { color: colors.brand }]}>New Claim</Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('employee_profile')}
          >
            <Feather name="user" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar (Wizard Indicator) */}
        {step < 4 && (
          <View style={[styles.wizardBar, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.wizardProgress, { width: `${(step / 3) * 100}%`, backgroundColor: colors.brand }]} />
            <View style={styles.wizardLabels}>
              <Text style={[styles.wizardLabelText, step >= 1 && { color: colors.brand, fontWeight: '700' }]}>Details</Text>
              <Text style={[styles.wizardLabelText, step >= 2 && { color: colors.brand, fontWeight: '700' }]}>Receipt</Text>
              <Text style={[styles.wizardLabelText, step >= 3 && { color: colors.brand, fontWeight: '700' }]}>Review</Text>
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {/* STEP 1: FORM DETAILS */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Enter Claim Details</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecond }]}>Fill out the basic information for your reimbursement.</Text>

              {/* Categories Grid */}
              <View style={styles.categoriesGrid}>
                {[
                  { key: 'travel', label: 'Travel', icon: 'car-outline', activeColor: '#3B82F6', activeBg: '#EFF6FF', darkActiveBg: '#1e293b' },
                  { key: 'meals', label: 'Meals', icon: 'food-fork-drink', activeColor: '#10B981', activeBg: '#ECFDF5', darkActiveBg: '#1a3f2a' },
                  { key: 'equipment', label: 'Hardware', icon: 'laptop', activeColor: '#EC4899', activeBg: '#FDF2F8', darkActiveBg: '#3f1a30' },
                  { key: 'other', label: 'Others', icon: 'dots-horizontal', activeColor: '#F59E0B', activeBg: '#FFFBEB', darkActiveBg: '#3f321a' },
                ].map((item) => {
                  const isSelected = category === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.categoryGridCard,
                        { backgroundColor: colors.card, borderColor: colors.borderLight },
                        isSelected && {
                          backgroundColor: isDark ? item.darkActiveBg : item.activeBg,
                          borderColor: item.activeColor,
                          borderWidth: 1.5,
                        }
                      ]}
                      onPress={() => setCategory(item.key as any)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name={item.icon as any} size={22} color={isSelected ? item.activeColor : colors.textSecond} />
                      <Text style={[styles.categoryCardLabel, { color: isSelected ? item.activeColor : colors.textPrimary }]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Form Input fields */}
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                {/* Amount Row */}
                <View style={styles.formRow}>
                  <Text style={[styles.inputLabel, { color: colors.textSecond }]}>Claim Amount</Text>
                  <View style={styles.amountInputRow}>
                    <TouchableOpacity
                      style={[styles.currencySelector, { backgroundColor: colors.iconBg, borderColor: colors.borderLight }]}
                      onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.currencySymbol, { color: colors.brand }]}>{currency}</Text>
                      <Feather name="chevron-down" size={14} color={colors.brand} />
                    </TouchableOpacity>

                    {showCurrencyDropdown && (
                      <View style={[styles.currencyMenu, { backgroundColor: colors.dropdownMenu, borderColor: colors.borderLight }]}>
                        {['$', '₹', '€', '£'].map((sym) => (
                          <TouchableOpacity
                            key={sym}
                            style={styles.currencyOption}
                            onPress={() => {
                              setCurrency(sym);
                              setShowCurrencyDropdown(false);
                            }}
                          >
                            <Text style={[styles.currencyOptionText, { color: colors.textPrimary }]}>{sym}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    <TextInput
                      style={[styles.amountInput, { color: colors.textPrimary, borderBottomColor: colors.borderLight }]}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

                {/* Date Picker */}
                <View style={styles.formRow}>
                  <Text style={[styles.inputLabel, { color: colors.textSecond }]}>Date of Expense</Text>
                  <TouchableOpacity
                    style={[styles.dateSelectorButton, { backgroundColor: colors.iconBg, borderColor: colors.borderLight }]}
                    onPress={() => setShowCalendar(!showCalendar)}
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={16} color={colors.brand} />
                    <Text style={[styles.dateSelectorText, { color: colors.textPrimary }]}>{date}</Text>
                  </TouchableOpacity>

                  {/* Calendar dropdown */}
                  {showCalendar && (
                    <View style={[styles.calendarDropCard, { backgroundColor: colors.dropdownMenu, borderColor: colors.borderLight }]}>
                      <View style={styles.calendarDropHeader}>
                        <Text style={[styles.calendarDropTitle, { color: colors.textPrimary }]}>
                          {MONTHS_LIST[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity style={[styles.calendarArrow, { backgroundColor: colors.iconBg }]} onPress={handlePrevMonth}>
                            <Feather name="chevron-left" size={14} color={colors.brand} />
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.calendarArrow, { backgroundColor: colors.iconBg }]} onPress={handleNextMonth}>
                            <Feather name="chevron-right" size={14} color={colors.brand} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Days row */}
                      <View style={styles.calendarDropDaysRow}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                          <Text key={dIdx} style={[styles.calendarDropDayHeader, { color: colors.textMuted }]}>{day}</Text>
                        ))}
                      </View>

                      {/* Calendar days grid */}
                      {generateDynamicCalendarGrid().map((week, wIdx) => (
                        <View key={wIdx} style={styles.calendarDropDaysRow}>
                          {week.map((cell, cIdx) => (
                            <TouchableOpacity
                              key={cIdx}
                              style={styles.calendarDropDateCell}
                              onPress={() => handleSelectDate(cell.dateObj)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.calendarDropDateText,
                                  { color: cell.isCurrent ? colors.textPrimary : colors.textMuted }
                                ]}
                              >
                                {cell.num}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

                {/* Description */}
                <View style={styles.formRow}>
                  <Text style={[styles.inputLabel, { color: colors.textSecond }]}>Description</Text>
                  <TextInput
                    style={[styles.descriptionInput, { color: colors.textPrimary }]}
                    placeholder="Enter reason or item details..."
                    placeholderTextColor={colors.textMuted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>
          )}

          {/* STEP 2: RECEIPT ATTACHMENT */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Upload Receipt</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecond }]}>Scan or attach your supporting invoice/receipt image.</Text>

              {selectedReceiptUri ? (
                <View style={[styles.receiptPreviewCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <Image source={{ uri: selectedReceiptUri }} style={styles.receiptPreviewImage} />
                  <TouchableOpacity
                    style={styles.changeReceiptButton}
                    onPress={handlePickDocument}
                    activeOpacity={0.7}
                  >
                    <Feather name="refresh-cw" size={14} color="#FFFFFF" />
                    <Text style={styles.changeReceiptText}>Replace receipt</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.receiptUploadBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={handlePickDocument}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="file-image-plus-outline" size={48} color={colors.brand} />
                  <Text style={[styles.uploadBoxTitle, { color: colors.textPrimary }]}>Scan receipt / Invoice</Text>
                  <Text style={[styles.uploadBoxSubtitle, { color: colors.textSecond }]}>JPEG, PNG, or PDF (Max 5MB)</Text>
                </TouchableOpacity>
              )}

              {/* Uploaded Files list */}
              {attachedFiles.map((file, idx) => (
                <View key={idx} style={[styles.attachedFileRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                  <MaterialCommunityIcons name="receipt-outline" size={24} color={colors.brand} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.attachedFileName, { color: colors.textPrimary }]} numberOfLines={1}>{file.name}</Text>
                    <Text style={[styles.attachedFileSize, { color: colors.textSecond }]}>{file.size}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveFile(idx)} style={styles.removeFileButton}>
                    <Feather name="trash-2" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* STEP 3: REVIEW DETAILS */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Review Claim</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecond }]}>Ensure all reimbursement details and attachments are correct.</Text>

              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                {/* Header review category */}
                <View style={styles.reviewHeaderRow}>
                  <View style={[styles.reviewIconCircle, { backgroundColor: colors.brandBg }]}>
                    <MaterialCommunityIcons
                      name={
                        category === 'travel'
                          ? 'car-outline'
                          : category === 'meals'
                          ? 'food-fork-drink'
                          : category === 'equipment'
                          ? 'laptop'
                          : 'dots-horizontal'
                      }
                      size={24}
                      color={colors.brand}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[styles.reviewCategoryName, { color: colors.textPrimary }]}>
                      {category.toUpperCase()} CLAIM
                    </Text>
                    <Text style={[styles.reviewDate, { color: colors.textSecond }]}>Date: {date}</Text>
                  </View>
                  <Text style={[styles.reviewAmountText, { color: colors.brand }]}>{currency}{amount}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

                {/* Details */}
                <View style={styles.reviewDetailBlock}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecond }]}>Description</Text>
                  <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{description}</Text>
                </View>

                {/* Attachments preview list */}
                {attachedFiles.length > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.reviewLabel, { color: colors.textSecond, marginBottom: 8 }]}>Receipts</Text>
                    {attachedFiles.map((file, idx) => (
                      <View key={idx} style={[styles.reviewFileItem, { backgroundColor: colors.iconBg }]}>
                        <Feather name="image" size={14} color={colors.brand} />
                        <Text style={[styles.reviewFileName, { color: colors.textPrimary }]} numberOfLines={1}>{file.name}</Text>
                        <Text style={[styles.reviewFileSize, { color: colors.textSecond }]}>{file.size}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* STEP 4: SUCCESS VIEW */}
          {step === 4 && (
            <View style={[styles.successContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={[styles.successCheckIconCircle, { backgroundColor: colors.successBg }]}>
                <Feather name="check-circle" size={48} color={colors.success} />
              </View>
              <Text style={[styles.successTitleText, { color: colors.textPrimary }]}>Claim Submitted!</Text>
              <Text style={[styles.successDescriptionText, { color: colors.textSecond }]}>
                Your claim of {currency}{amount} has been successfully uploaded and is pending manager review.
              </Text>
              <TouchableOpacity
                style={[styles.successCloseButton, { backgroundColor: colors.brand }]}
                onPress={() => onNavigate?.('dashboard')}
              >
                <Text style={styles.successCloseButtonText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Navigation Control Buttons */}
          {step < 4 && (
            <View style={styles.navigationButtonsRow}>
              {step > 1 && (
                <TouchableOpacity
                  style={[styles.backStepButton, { borderColor: colors.borderLight }]}
                  onPress={() => setStep((s) => (s - 1) as any)}
                >
                  <Text style={[styles.backStepButtonText, { color: colors.textSecond }]}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.nextStepButton, { backgroundColor: colors.brand, flex: step > 1 ? 2 : 1 }]}
                onPress={handleNextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStepButtonText}>
                  {step === 3 ? 'Confirm & Submit' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Sticky Bottom Tab Bar */}
        <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard')}>
            <Feather name="home" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <MaterialCommunityIcons name="receipt" size={22} color={colors.tabActive} />
            <Text style={[styles.tabText, { color: colors.tabActive }]}>Claim</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard', { openCalendar: true })}>
            <Feather name="clock" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_apply_leave')}>
            <Feather name="calendar" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Leave</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_assets')}>
            <MaterialCommunityIcons name="laptop" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Asset</Text>
          </TouchableOpacity>
        </View>

        {/* Side Drawer Menu */}
        <EmployeeMenu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={onNavigate}
        />
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
  wizardBar: { height: 4, position: 'relative', marginTop: 0 },
  wizardProgress: { height: '100%' },
  wizardLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 8 },
  wizardLabelText: { fontSize: 11, fontWeight: '500', color: '#94A3B8' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  stepContainer: {},
  stepTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  stepDesc: { fontSize: 14, marginBottom: 20 },
  categoriesGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  categoryGridCard: { width: '48%', borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  categoryCardLabel: { fontSize: 12, fontWeight: '700' },
  formCard: { borderRadius: 20, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  formRow: {},
  inputLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, zIndex: 999 },
  currencySelector: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 42, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  currencySymbol: { fontSize: 16, fontWeight: '700' },
  currencyMenu: { position: 'absolute', top: 48, left: 0, borderRadius: 10, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 4, zIndex: 9999 },
  currencyOption: { width: 60, height: 38, justifyContent: 'center', alignItems: 'center' },
  currencyOptionText: { fontSize: 15, fontWeight: '700' },
  amountInput: { flex: 1, height: 42, borderBottomWidth: 1.5, fontSize: 22, fontWeight: '800', padding: 0 },
  dateSelectorButton: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 42, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  dateSelectorText: { fontSize: 14, fontWeight: '700' },
  calendarDropCard: { position: 'absolute', top: 48, left: 0, right: 0, borderRadius: 16, borderWidth: 1, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 6, zIndex: 9999 },
  calendarDropHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarDropTitle: { fontSize: 14, fontWeight: '700' },
  calendarArrow: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  calendarDropDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  calendarDropDayHeader: { width: 28, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  calendarDropDateCell: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  calendarDropDateText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 16 },
  descriptionInput: { fontSize: 14, padding: 0, minHeight: 60 },
  receiptUploadBox: { borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', padding: 32, alignItems: 'center', justifyContent: 'center' },
  uploadBoxTitle: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 4 },
  uploadBoxSubtitle: { fontSize: 12 },
  receiptPreviewCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', height: 240, position: 'relative', marginBottom: 16 },
  receiptPreviewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  changeReceiptButton: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15,23,42,0.75)', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  changeReceiptText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  attachedFileRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 12, marginTop: 12 },
  attachedFileName: { fontSize: 13, fontWeight: '700' },
  attachedFileSize: { fontSize: 11, marginTop: 2 },
  removeFileButton: { padding: 4 },
  reviewCard: { borderRadius: 20, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  reviewHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  reviewIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  reviewCategoryName: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  reviewDate: { fontSize: 12, marginTop: 2 },
  reviewAmountText: { fontSize: 20, fontWeight: '800' },
  reviewDetailBlock: { gap: 6 },
  reviewLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewValue: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  reviewFileItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginTop: 6 },
  reviewFileName: { fontSize: 12, fontWeight: '600', flex: 1 },
  reviewFileSize: { fontSize: 11 },
  navigationButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backStepButton: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  backStepButtonText: { fontSize: 14, fontWeight: '700' },
  nextStepButton: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  nextStepButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  successContainer: { borderRadius: 24, borderWidth: 1, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4, marginVertical: 12 },
  successCheckIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitleText: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  successDescriptionText: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  successCloseButton: { height: 46, borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  successCloseButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
