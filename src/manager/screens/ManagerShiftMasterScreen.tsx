import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ManagerMenu from '../components/ManagerMenu';
import ManagerHeader from '../components/ManagerHeader';
import ManagerBottomTabNavigator from '../components/ManagerBottomTabNavigator';

interface ManagerShiftMasterScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface Shift {
  id: string; // Shift ID (editable)
  code: string; // Shift Code
  name: string; // Shift Name (e.g. General Shift, Work From Home)
  type: 'Morning' | 'Evening' | 'Nights'; // Shift Type
  startTime: string;
  endTime: string;
  graceTime: number; // grace period in minutes
  minimumHours: number; // minimum hours to be counted as present
  halfDayHours: number; // hours required for a half day
  status: 'Active' | 'Inactive';
}

const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 'SFT-001',
    code: 'GEN-01',
    name: 'General Shift',
    type: 'Morning',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    graceTime: 15,
    minimumHours: 8,
    halfDayHours: 4,
    status: 'Active',
  },
  {
    id: 'SFT-002',
    code: 'WFH-02',
    name: 'Work From Home',
    type: 'Morning',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    graceTime: 30,
    minimumHours: 8,
    halfDayHours: 4,
    status: 'Active',
  },
  {
    id: 'SFT-003',
    code: 'EVE-03',
    name: 'Evening Shift',
    type: 'Evening',
    startTime: '02:00 PM',
    endTime: '11:00 PM',
    graceTime: 15,
    minimumHours: 8,
    halfDayHours: 4,
    status: 'Active',
  },
  {
    id: 'SFT-004',
    code: 'NGT-04',
    name: 'Night Shift',
    type: 'Nights',
    startTime: '10:00 PM',
    endTime: '06:00 AM',
    graceTime: 15,
    minimumHours: 8,
    halfDayHours: 4,
    status: 'Inactive',
  },
];

export default function ManagerShiftMasterScreen({ onNavigate, onBack }: ManagerShiftMasterScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>(DEFAULT_SHIFTS);
  
  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Form fields (all 9 fields have edit option)
  const [formId, setFormId] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'Morning' | 'Evening' | 'Nights'>('Morning');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formGrace, setFormGrace] = useState('');
  const [formMinHours, setFormMinHours] = useState('');
  const [formHalfDayHours, setFormHalfDayHours] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = () => {
    setEditingShift(null);
    setFormId(`SFT-0${shifts.length + 1}`);
    setFormCode('');
    setFormName('');
    setFormType('Morning');
    setFormStart('09:00 AM');
    setFormEnd('06:00 PM');
    setFormGrace('15');
    setFormMinHours('8');
    setFormHalfDayHours('4');
    setFormStatus('Active');
    setModalVisible(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setFormId(shift.id);
    setFormCode(shift.code);
    setFormName(shift.name);
    setFormType(shift.type);
    setFormStart(shift.startTime);
    setFormEnd(shift.endTime);
    setFormGrace(shift.graceTime.toString());
    setFormMinHours(shift.minimumHours.toString());
    setFormHalfDayHours(shift.halfDayHours.toString());
    setFormStatus(shift.status);
    setModalVisible(true);
  };

  const handleSave = () => {
    const trimmedId = formId.trim();
    const trimmedName = formName.trim();
    const trimmedStart = formStart.trim();
    const trimmedEnd = formEnd.trim();

    if (!trimmedId) return Alert.alert('Validation Error', 'Please enter a Shift ID.');
    if (!trimmedName) return Alert.alert('Validation Error', 'Please enter a Shift Name.');
    if (!trimmedStart) return Alert.alert('Validation Error', 'Please enter a Start Time.');
    if (!trimmedEnd) return Alert.alert('Validation Error', 'Please enter an End Time.');

    let trimmedCode = '';
    if (editingShift) {
      trimmedCode = formCode.trim().toUpperCase();
      if (!trimmedCode) return Alert.alert('Validation Error', 'Please enter a Shift Code.');
    } else {
      const words = trimmedName.split(/\s+/).filter(Boolean);
      let prefix = '';
      if (words.length > 1) {
        prefix = words.map(w => w[0]).join('').toUpperCase();
      } else {
        prefix = trimmedName.substring(0, 3).toUpperCase();
      }
      const suffix = trimmedId.split('-').pop() || '01';
      trimmedCode = `${prefix}-${suffix}`;
    }
    
    // Validate Grace Period
    const graceNum = parseInt(formGrace, 10);
    if (isNaN(graceNum) || graceNum < 0) {
      return Alert.alert('Validation Error', 'Please enter a valid grace time (in minutes).');
    }

    // Validate Minimum Hours
    const minHoursNum = parseFloat(formMinHours);
    if (isNaN(minHoursNum) || minHoursNum < 0 || minHoursNum > 24) {
      return Alert.alert('Validation Error', 'Please enter a valid minimum hours (between 0 and 24).');
    }

    // Validate Half Day Hours
    const halfDayHoursNum = parseFloat(formHalfDayHours);
    if (isNaN(halfDayHoursNum) || halfDayHoursNum < 0 || halfDayHoursNum > minHoursNum) {
      return Alert.alert('Validation Error', 'Please enter a valid half day hours (must be less than minimum hours).');
    }

    // Check unique ID
    const duplicateId = shifts.some(s => 
      s.id.toLowerCase() === trimmedId.toLowerCase() && 
      (!editingShift || s.id.toLowerCase() !== editingShift.id.toLowerCase())
    );
    if (duplicateId) {
      return Alert.alert('Validation Error', 'A shift with this Shift ID already exists. Please choose a unique ID.');
    }

    if (editingShift) {
      // Edit mode
      setShifts(prev =>
        prev.map(s =>
          s.id === editingShift.id
            ? {
                ...s,
                id: trimmedId,
                code: trimmedCode,
                name: trimmedName,
                type: formType,
                startTime: trimmedStart,
                endTime: trimmedEnd,
                graceTime: graceNum,
                minimumHours: minHoursNum,
                halfDayHours: halfDayHoursNum,
                status: formStatus,
              }
            : s
        )
      );
      Alert.alert('Success', 'Shift configuration updated successfully.');
    } else {
      // Add mode
      const newShift: Shift = {
        id: trimmedId,
        code: trimmedCode,
        name: trimmedName,
        type: formType,
        startTime: trimmedStart,
        endTime: trimmedEnd,
        graceTime: graceNum,
        minimumHours: minHoursNum,
        halfDayHours: halfDayHoursNum,
        status: formStatus,
      };
      setShifts(prev => [...prev, newShift]);
      Alert.alert('Success', 'Shift configuration added successfully.');
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this shift configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setShifts(prev => prev.filter(s => s.id !== id));
            Alert.alert('Success', 'Shift configuration deleted successfully.');
          },
        },
      ]
    );
  };

  const filteredShifts = shifts.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ManagerHeader
        title="Shift Master"
        showBackButton={true}
        onBackPress={onBack}
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('manager_alerts')}
        onProfilePress={() => onNavigate?.('manager_profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
      >
        <View style={styles.topInfoRow}>
          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Configure and assign shift schedules, grace periods, minimum hours, and half day thresholds.
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brand }]}
            activeOpacity={0.8}
            onPress={openAddModal}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Shift</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search shifts by name or ID..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>SHIFT MASTER INDEX</Text>

        {/* Shift List */}
        {filteredShifts.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecond, marginTop: 30 }}>
            No shift configurations found.
          </Text>
        ) : (
          filteredShifts.map(shift => (
            <View
              key={shift.id}
              style={[styles.shiftCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardInfoRow}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shiftName, { color: colors.textPrimary }]}>{shift.name}</Text>
                    <View style={styles.badgeRow}>
                      <Text style={[styles.codeText, { color: colors.textSecond }]}>ID: {shift.id}</Text>
                      <Text style={[styles.bullet, { color: colors.textSecond }]}>•</Text>
                      <Text style={[styles.codeText, { color: colors.brand, fontWeight: '600' }]}>{shift.type}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Working Hours</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {shift.startTime} - {shift.endTime}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Grace Time</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{shift.graceTime} Mins</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Minimum Hours</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{shift.minimumHours} Hrs</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Half Day Hours</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{shift.halfDayHours} Hrs</Text>
                </View>
              </View>

              <View style={[styles.actionRow, { borderTopColor: colors.borderLight }]}>
                <View style={[styles.statusBadge, { backgroundColor: shift.status === 'Active' ? colors.successBg : colors.iconBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: shift.status === 'Active' ? colors.success : colors.textSecond }]} />
                  <Text style={[styles.statusText, { color: shift.status === 'Active' ? colors.success : colors.textSecond }]}>
                    {shift.status}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.btnEdit, { borderColor: colors.brandBorder, backgroundColor: colors.brandBg }]} 
                    onPress={() => openEditModal(shift)}
                  >
                    <Feather name="edit-2" size={13} color={colors.brand} />
                    <Text style={[styles.btnEditText, { color: colors.brand }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btnDelete, { borderColor: isDark ? '#7F1D1D' : '#FCA5A5', backgroundColor: colors.dangerBg }]} 
                    onPress={() => handleDelete(shift.id)}
                  >
                    <Feather name="trash-2" size={13} color={colors.danger} />
                    <Text style={[styles.btnDeleteText, { color: colors.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Save Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editingShift ? 'Edit Shift Settings' : 'Create New Shift'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Shift ID *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. SFT-001"
                placeholderTextColor={colors.textSecond}
                value={formId}
                onChangeText={setFormId}
              />

              {editingShift ? (
                <>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Code *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.textSecond,
                        borderColor: colors.border,
                        backgroundColor: isDark ? '#2D2D2D' : '#F0F0F0',
                      },
                      { opacity: 0.8 }
                    ]}
                    placeholder="e.g. GEN-01"
                    placeholderTextColor={colors.textSecond}
                    value={formCode}
                    editable={false}
                  />
                </>
              ) : null}

              <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Name *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. General Shift"
                placeholderTextColor={colors.textSecond}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Type *</Text>
              <View style={styles.typeSelectRow}>
                {(['Morning', 'Evening', 'Nights'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeSelectorOption,
                      { borderColor: colors.border },
                      formType === type && { backgroundColor: colors.brand, borderColor: colors.brand },
                    ]}
                    onPress={() => setFormType(type)}
                  >
                    <Text style={[styles.typeSelectorText, { color: colors.textPrimary }, formType === type && { color: '#FFFFFF' }]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>Start Time *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                    placeholder="e.g. 09:00 AM"
                    placeholderTextColor={colors.textSecond}
                    value={formStart}
                    onChangeText={setFormStart}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>End Time *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                    placeholder="e.g. 06:00 PM"
                    placeholderTextColor={colors.textSecond}
                    value={formEnd}
                    onChangeText={setFormEnd}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textPrimary }]}>Grace Time (minutes) *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. 15"
                placeholderTextColor={colors.textSecond}
                keyboardType="number-pad"
                value={formGrace}
                onChangeText={setFormGrace}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>Minimum Hours *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                    placeholder="e.g. 8"
                    placeholderTextColor={colors.textSecond}
                    keyboardType="numeric"
                    value={formMinHours}
                    onChangeText={setFormMinHours}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>Half Day Hours *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                    placeholder="e.g. 4"
                    placeholderTextColor={colors.textSecond}
                    keyboardType="numeric"
                    value={formHalfDayHours}
                    onChangeText={setFormHalfDayHours}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textPrimary }]}>Status</Text>
              <View style={styles.statusSelectRow}>
                <TouchableOpacity
                  style={[
                    styles.statusSelectorOption,
                    { borderColor: colors.border },
                    formStatus === 'Active' && { backgroundColor: colors.brand, borderColor: colors.brand },
                  ]}
                  onPress={() => setFormStatus('Active')}
                >
                  <Text style={[styles.statusSelectorText, { color: colors.textPrimary }, formStatus === 'Active' && { color: '#FFFFFF' }]}>
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusSelectorOption,
                    { borderColor: colors.border },
                    formStatus === 'Inactive' && { backgroundColor: colors.textSecond, borderColor: colors.textSecond },
                  ]}
                  onPress={() => setFormStatus('Inactive')}
                >
                  <Text style={[styles.statusSelectorText, { color: colors.textPrimary }, formStatus === 'Inactive' && { color: '#FFFFFF' }]}>
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalNoButton, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.textSecond, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalYesButton, { backgroundColor: colors.brand }]} onPress={handleSave}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ManagerBottomTabNavigator
        activeTab={null}
        onTabPress={tab => {
          if (tab === 'home') onNavigate?.('manager_dashboard');
          else onNavigate?.(`manager_${tab}`);
        }}
      />

      <ManagerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  topInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  pageDescription: { flex: 1, fontSize: 14, lineHeight: 20 },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 8 },
  divider: { height: 1, marginBottom: 16 },
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 1.0, marginBottom: 12 },
  shiftCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  shiftName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  bullet: { marginHorizontal: 6, fontSize: 10 },
  codeText: { fontSize: 13, fontWeight: '500' },
  cardDivider: { height: 1, marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { fontSize: 13, fontWeight: '700' },
  actionRow: { borderTopWidth: 1, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  btnEdit: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  btnEditText: { fontSize: 13, fontWeight: '700' },
  btnDelete: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  btnDeleteText: { fontSize: 13, fontWeight: '700' },
  iconBtn: { padding: 4 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { borderRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  row: { flexDirection: 'row' },
  typeSelectRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  typeSelectorOption: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  typeSelectorText: { fontWeight: '700', fontSize: 13 },
  statusSelectRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  statusSelectorOption: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statusSelectorText: { fontWeight: '700', fontSize: 13 },
  modalButtonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalNoButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  modalYesButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
