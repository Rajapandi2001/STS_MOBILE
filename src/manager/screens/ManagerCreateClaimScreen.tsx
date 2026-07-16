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
import ManagerMenu from '../components/ManagerMenu';
import * as DocumentPicker from 'expo-document-picker';

interface ManagerCreateClaimScreenProps {
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

export default function ManagerCreateClaimScreen({
  onBack,
  onNavigate,
}: ManagerCreateClaimScreenProps) {
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
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalDaysPrev = new Date(year, month, 0).getDate();

    let startDayOffset = firstDay.getDay();
    if (startDayOffset === 0) {
      startDayOffset = 6;
    } else {
      startDayOffset -= 1;
    }

    const cells: { day: number; current: boolean; dateObj: Date }[] = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const dNum = totalDaysPrev - i;
      cells.push({
        day: dNum,
        current: false,
        dateObj: new Date(prevMonthYear, prevMonth, dNum)
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        current: true,
        dateObj: new Date(year, month, i)
      });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remaining = 35 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        current: false,
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

  // Intercept mobile hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (step === 2) {
        setStep(1);
        return true;
      }
      if (step === 3) {
        setStep(2);
        return true;
      }
      if (step === 4) {
        onNavigate?.('manager_dashboard');
        return true;
      }
      // Step 1: Let the parent navigator go back to dashboard
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [step]);

  // Auto-redirect to claim list page after 2 seconds on success screen (step 4)
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        onNavigate?.('manager_claims');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onNavigate]);

  const handleNextStep1 = () => {
    if (!amount.trim()) {
      Alert.alert('Required Info', 'Please enter a valid amount.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (attachedFiles.length === 0) {
      Alert.alert('Required Info', 'Please attach at least one receipt.');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    setStep(4);
  };

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedAsset = result.assets[0];
        const sizeMb = ((pickedAsset.size || 0) / (1024 * 1024)).toFixed(1);
        const newFile = {
          name: pickedAsset.name,
          size: `${sizeMb} MB`,
        };
        
        setAttachedFiles([newFile]);
        setSelectedReceiptUri(pickedAsset.uri);
      }
    } catch (error) {
      console.log('Error picking document:', error);
      Alert.alert('Error', 'Could not pick the receipt document.');
    }
  };

  const handleDeleteFile = (fileName: string) => {
    setAttachedFiles([]);
    setSelectedReceiptUri(null);
  };

  const handleTabPress = (tabName: string) => {
    onNavigate?.('manager_dashboard', { tab: tabName });
  };

  // Render Category Name Helper
  const getCategoryLabel = (cat: ClaimCategory) => {
    switch (cat) {
      case 'travel': return 'Travel';
      case 'meals': return 'Meals';
      case 'equipment': return 'Equipment';
      case 'other': return 'Other';
    }
  };

  const getCategoryIcon = (cat: ClaimCategory) => {
    switch (cat) {
      case 'travel': return 'airplane';
      case 'meals': return 'silverware-fork-knife';
      case 'equipment': return 'laptop';
      case 'other': return 'dots-horizontal';
    }
  };

  // Header Title matching Step
  const getHeaderTitle = () => {
    switch (step) {
      case 1: return 'Create Claim';
      case 2: return 'Attach Receipt';
      case 3: return 'Review Claim';
      case 4: return 'Claim Submitted';
    }
  };

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

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{getHeaderTitle()}</Text>

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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
            step === 4 && { flexGrow: 1, justifyContent: 'center', paddingBottom: insets.bottom + 20 }
          ]}
        >
          {/* Progress Indicators (Hidden on step 4) */}
          {step <= 3 && (
            <>
              <Text style={[styles.stepText, { color: colors.textSecond }]}>Step {step} of 3: Details</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressPill, { backgroundColor: colors.brand }]} />
                <View style={[styles.progressPill, { backgroundColor: step >= 2 ? colors.brand : (isDark ? colors.border : '#DBEAFE'), opacity: step >= 2 ? 1 : 0.4 }]} />
                <View style={[styles.progressPill, { backgroundColor: step >= 3 ? colors.brand : (isDark ? colors.border : '#DBEAFE'), opacity: step >= 3 ? 1 : 0.4 }]} />
              </View>
            </>
          )}

          {/* ── STEP 1: DETAILS FORM ── */}
          {step === 1 && (
            <View style={[styles.formCard, { backgroundColor: isDark ? colors.card : '#F3F6FC', borderColor: colors.border }]}>
              
              {/* Category selection */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Claim Category</Text>
              <View style={styles.categoryGrid}>
                
                {/* Travel */}
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    category === 'travel' && [styles.categoryCardSelected, { borderColor: colors.brand }]
                  ]}
                  onPress={() => setCategory('travel')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="airplane" size={24} color={category === 'travel' ? colors.brand : colors.textSecond} />
                  <Text style={[styles.categoryName, { color: colors.textPrimary }]}>Travel</Text>
                  {category === 'travel' && (
                    <View style={[styles.checkedIconWrapper, { backgroundColor: colors.brand }]}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Meals */}
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    category === 'meals' && [styles.categoryCardSelected, { borderColor: colors.brand }]
                  ]}
                  onPress={() => setCategory('meals')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={category === 'meals' ? colors.brand : colors.textSecond} />
                  <Text style={[styles.categoryName, { color: colors.textPrimary }]}>Meals</Text>
                  {category === 'meals' && (
                    <View style={[styles.checkedIconWrapper, { backgroundColor: colors.brand }]}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Equipment */}
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    category === 'equipment' && [styles.categoryCardSelected, { borderColor: colors.brand }]
                  ]}
                  onPress={() => setCategory('equipment')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="laptop" size={24} color={category === 'equipment' ? colors.brand : colors.textSecond} />
                  <Text style={[styles.categoryName, { color: colors.textPrimary }]}>Equipment</Text>
                  {category === 'equipment' && (
                    <View style={[styles.checkedIconWrapper, { backgroundColor: colors.brand }]}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Other */}
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    category === 'other' && [styles.categoryCardSelected, { borderColor: colors.brand }]
                  ]}
                  onPress={() => setCategory('other')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="dots-horizontal" size={24} color={category === 'other' ? colors.brand : colors.textSecond} />
                  <Text style={[styles.categoryName, { color: colors.textPrimary }]}>Other</Text>
                  {category === 'other' && (
                    <View style={[styles.checkedIconWrapper, { backgroundColor: colors.brand }]}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

              </View>

              {/* Amount */}
              <View style={{ zIndex: 10 }}>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Amount</Text>
                <View style={[styles.amountInputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.currencySelector, { borderRightColor: colors.border }]}
                    onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.currencyText, { color: colors.textPrimary }]}>{currency}</Text>
                    <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.amountInput, { color: colors.textPrimary }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>

                {showCurrencyDropdown && (
                  <View style={[styles.currencyDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {['$', '₹', '€', '£', '¥'].map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        style={[styles.currencyDropdownItem, { borderBottomColor: colors.borderLight }]}
                        onPress={() => {
                          setCurrency(curr);
                          setShowCurrencyDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                          {curr === 'Rs' ? '₹' : curr === '$' ? '$' : curr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Date of Expense */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Date of Expense</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => {
                  setCalendarViewMode('calendar');
                  setShowCalendar(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: date ? colors.textPrimary : colors.textMuted }}>
                  {date || 'Select Date'}
                </Text>
                <Feather name="calendar" size={16} color={colors.textSecond} />
              </TouchableOpacity>

              {/* Description */}
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Description</Text>
              <View style={[styles.descriptionInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.descriptionInput, { color: colors.textPrimary }]}
                  placeholder="Briefly describe the expense..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: colors.brand }]}
                activeOpacity={0.8}
                onPress={handleNextStep1}
              >
                <Text style={styles.nextButtonText}>Attach Receipt</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

            </View>
          )}

          {/* ── STEP 2: ATTACH RECEIPT ── */}
          {step === 2 && (
            <View style={[styles.formCard, { backgroundColor: isDark ? colors.card : '#F3F6FC', borderColor: colors.border }]}>
              <Text style={[styles.sectionTitleReview, { color: colors.textPrimary }]}>Upload Document</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecond }]}>
                Please provide a clear image or PDF of your receipt to process your claim.
              </Text>

              {/* Upload Box Container */}
              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.brand, backgroundColor: colors.card }]}
                activeOpacity={0.7}
                onPress={handleUploadFile}
              >
                <View style={[styles.uploadIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Feather name="upload-cloud" size={24} color={colors.brand} />
                </View>
                <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>Tap to upload or take a photo</Text>
                <Text style={[styles.uploadDesc, { color: colors.textSecond }]}>Supported formats: PDF, JPG, PNG (Max 5MB)</Text>
              </TouchableOpacity>

              {/* Attached Files List */}
              <Text style={[styles.filesHeader, { color: colors.textPrimary }]}>
                ATTACHED FILES ({attachedFiles.length})
              </Text>
              {attachedFiles.map((file) => (
                <View key={file.name} style={[styles.fileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.fileIconWrapper}>
                    <Feather name="file-text" size={20} color={colors.brand} />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.textSecond }]}>
                      {file.size} • Uploaded just now
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteFile(file.name)} style={styles.deleteButton}>
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Buttons */}
              <View style={styles.wizardButtonsRow}>
                <TouchableOpacity
                  style={[styles.wizardNextBtn, { backgroundColor: colors.brand, flex: 1 }]}
                  activeOpacity={0.8}
                  onPress={handleNextStep2}
                >
                  <Text style={styles.wizardNextBtnText}>Review Claim</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>

            </View>
          )}

          {/* ── STEP 3: REVIEW CLAIM ── */}
          {step === 3 && (
            <View style={styles.reviewStepContainer}>
              
              {/* Claim Details Card */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.reviewCardHeader, { color: colors.textSecond }]}>CLAIM DETAILS</Text>
                
                {/* Date */}
                <View style={[styles.reviewRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={styles.reviewLabelRow}>
                    <Feather name="calendar" size={18} color={colors.brand} style={styles.reviewIcon} />
                    <Text style={[styles.reviewLabel, { color: colors.textPrimary }]}>Date</Text>
                  </View>
                  <Text style={[styles.reviewValue, { color: colors.textSecond }]}>{date}</Text>
                </View>

                {/* Claim Type */}
                <View style={[styles.reviewRow, { borderBottomColor: colors.borderLight }]}>
                  <View style={styles.reviewLabelRow}>
                    <MaterialCommunityIcons name={getCategoryIcon(category) as any} size={18} color={colors.brand} style={styles.reviewIcon} />
                    <Text style={[styles.reviewLabel, { color: colors.textPrimary }]}>Claim Type</Text>
                  </View>
                  <Text style={[styles.reviewValue, { color: colors.textSecond }]}>{getCategoryLabel(category)}</Text>
                </View>

                {/* Total Amount */}
                <View style={styles.reviewRowLast}>
                  <View style={styles.reviewLabelRow}>
                    <Feather name="credit-card" size={18} color={colors.brand} style={styles.reviewIcon} />
                    <Text style={[styles.reviewLabel, { color: colors.textPrimary }]}>Total Amount</Text>
                  </View>
                  <Text style={[styles.reviewAmount, { color: colors.brand }]}>
                    {currency}{parseFloat(amount || '0').toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Attached Receipt Image */}
              <Text style={[styles.reviewSubHeader, { color: colors.textSecond }]}>ATTACHED RECEIPT</Text>
              <View style={[styles.receiptImageContainer, { borderColor: colors.border }]}>
                <Image
                  source={{ uri: selectedReceiptUri || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?fit=crop&w=600' }}
                  style={styles.receiptPreviewImage}
                />
                <View style={styles.receiptSearchOverlay}>
                  <View style={styles.searchCircle}>
                    <Feather name="search" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              {/* Approving Manager Card */}
              <View style={[styles.approvingManagerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.managerAvatarWrapper, { backgroundColor: '#EFF6FF' }]}>
                  <Feather name="user" size={20} color={colors.brand} />
                </View>
                <View style={styles.managerInfo}>
                  <Text style={[styles.managerTitle, { color: colors.textSecond }]}>Approving Manager</Text>
                  <Text style={[styles.managerName, { color: colors.textPrimary }]}>Elena Rostova</Text>
                </View>
              </View>

              {/* Warning/Caution Banner */}
              <View style={[styles.cautionBanner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Feather name="alert-circle" size={18} color="#D97706" style={styles.cautionIcon} />
                <Text style={styles.cautionText}>
                  This claim will be processed in the next payroll cycle upon approval. Ensure all details are correct before submitting.
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.brand }]}
                activeOpacity={0.8}
                onPress={handleNextStep3}
              >
                <Feather name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Submit Claim</Text>
              </TouchableOpacity>

            </View>
          )}

          {/* ── STEP 4: SUCCESS SCREEN ── */}
          {step === 4 && (
            <View style={styles.successContainer}>
              <View style={[styles.successIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="check" size={32} color="#16A34A" />
              </View>

              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Claim Submitted Successfully</Text>
              <Text style={[styles.successDesc, { color: colors.textSecond }]}>
                Your claim for {currency}{parseFloat(amount || '0').toFixed(2)} has been sent to your manager for review. You can track its status in the Claims History.
              </Text>

              {/* Reference ID Card */}
              <View style={[styles.referenceCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', marginBottom: 0 }]}>
                <Text style={styles.referenceLabel}>REFERENCE ID</Text>
                <Text style={[styles.referenceCode, { color: colors.brand }]}>#CLM-2023-OCT-42</Text>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── BOTTOM NAV TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('home')}>
          <Feather name="home" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('team')}>
          <Feather name="users" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('time')}>
          <Feather name="clock" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('approvals')}>
          <Feather name="check-square" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('assets')}>
          <Feather name="package" size={20} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Assets</Text>
        </TouchableOpacity>
      </View>

      {showCalendar && (
        <View style={[styles.calendarModalOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
          <View style={[styles.calendarModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              {calendarViewMode === 'calendar' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Month */}
                  <TouchableOpacity onPress={() => setCalendarViewMode('month')} style={styles.calendarHeaderBtn}>
                    <Text style={[styles.calendarHeaderTitle, { color: colors.textPrimary }]}>
                      {calendarDate.toLocaleString('en-US', { month: 'long' })}
                    </Text>
                    <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                  {/* Year */}
                  <TouchableOpacity onPress={() => setCalendarViewMode('year')} style={[styles.calendarHeaderBtn, { marginLeft: 10 }]}>
                    <Text style={[styles.calendarHeaderTitle, { color: colors.textPrimary }]}>
                      {calendarDate.getFullYear()}
                    </Text>
                    <Feather name="chevron-down" size={12} color={colors.textSecond} style={{ marginLeft: 3 }} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setCalendarViewMode('calendar')} style={styles.calendarHeaderBtn}>
                  <Feather name="arrow-left" size={14} color={colors.brand} />
                  <Text style={[styles.calendarHeaderTitle, { color: colors.brand, marginLeft: 6 }]}>Back</Text>
                </TouchableOpacity>
              )}

              {calendarViewMode === 'calendar' && (
                <View style={styles.calendarArrows}>
                  <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
                    <Feather name="chevron-left" size={18} color={colors.textSecond} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
                    <Feather name="chevron-right" size={18} color={colors.textSecond} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Calendar Views */}
            {calendarViewMode === 'calendar' && (
              <>
                {/* Weekdays */}
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
                        const isSelected = date === cell.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                          <TouchableOpacity
                            key={cIdx}
                            style={styles.calendarCell}
                            onPress={() => handleSelectDate(cell.dateObj)}
                          >
                            <View style={[styles.dayNumberContainer, isSelected && { backgroundColor: colors.brand }]}>
                              <Text style={[
                                styles.dayNumberText,
                                { color: isSelected ? '#FFFFFF' : cell.current ? colors.textPrimary : colors.textEmpty }
                              ]}>
                                {cell.day}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </>
            )}

            {calendarViewMode === 'month' && (
              <View style={styles.gridSelectorContainer}>
                {MONTHS_LIST.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.gridSelectorItem, calendarDate.getMonth() === idx && { backgroundColor: colors.brand }]}
                    onPress={() => handleSelectMonth(idx)}
                  >
                    <Text style={[styles.gridSelectorItemText, { color: calendarDate.getMonth() === idx ? '#FFFFFF' : colors.textPrimary }]}>
                      {m.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {calendarViewMode === 'year' && (
              <View style={styles.gridSelectorContainer}>
                {YEARS_LIST.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.gridSelectorItem, calendarDate.getFullYear() === y && { backgroundColor: colors.brand }]}
                    onPress={() => handleSelectYear(y)}
                  >
                    <Text style={[styles.gridSelectorItemText, { color: calendarDate.getFullYear() === y ? '#FFFFFF' : colors.textPrimary }]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.calendarCancelBtn, { borderColor: colors.border }]}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── SIDEBAR DRAWER OVERLAY ── */}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  progressPill: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  formCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryCardSelected: {
    borderWidth: 2,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  checkedIconWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
    overflow: 'hidden',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    height: '100%',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionInputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    height: 90,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  descriptionInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── STEP 2 SPECIFIC STYLES ── */
  sectionTitleReview: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  uploadDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  filesHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  fileIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 6,
  },
  wizardButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  draftButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  wizardNextBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardNextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── STEP 3 SPECIFIC STYLES ── */
  reviewStepContainer: {
    gap: 16,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  reviewCardHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reviewRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  reviewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewIcon: {
    marginRight: 10,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  reviewSubHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  receiptImageContainer: {
    borderWidth: 1,
    borderRadius: 16,
    height: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  receiptPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  receiptSearchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvingManagerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  managerAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  managerInfo: {
    flex: 1,
  },
  managerTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  managerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  cautionBanner: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  cautionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  cautionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── STEP 4 SPECIFIC STYLES ── */
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  successDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  referenceCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  referenceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  referenceCode: {
    fontSize: 15,
    fontWeight: '800',
  },
  successButtonsWrapper: {
    width: '100%',
    gap: 12,
  },
  successDashboardBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDashboardBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successHistoryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successHistoryBtnText: {
    fontSize: 14,
    fontWeight: '600',
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
  currencyDropdown: {
    position: 'absolute',
    top: 75,
    left: 0,
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  currencyDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  calendarModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  calendarModalCard: {
    width: '90%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calendarHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  calendarArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    gap: 6,
    marginBottom: 16,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gridSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  gridSelectorItem: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  gridSelectorItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarCancelBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
});
