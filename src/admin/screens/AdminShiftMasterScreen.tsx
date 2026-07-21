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
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';

interface AdminShiftMasterScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  gracePeriod: number; // in minutes
  status: 'Active' | 'Inactive';
}

const DEFAULT_SHIFTS: Shift[] = [
  {
    id: '1',
    name: 'Regular Shift',
    code: 'REG-01',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    gracePeriod: 15,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Night Shift',
    code: 'NGT-02',
    startTime: '09:00 PM',
    endTime: '06:00 AM',
    gracePeriod: 15,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Weekend Shift',
    code: 'WKD-03',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    gracePeriod: 30,
    status: 'Inactive',
  },
];

export default function AdminShiftMasterScreen({ onNavigate, onBack }: AdminShiftMasterScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>(DEFAULT_SHIFTS);
  
  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formGrace, setFormGrace] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = () => {
    setEditingShift(null);
    setFormName('');
    setFormCode('');
    setFormStart('09:00 AM');
    setFormEnd('06:00 PM');
    setFormGrace('15');
    setFormStatus('Active');
    setModalVisible(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setFormName(shift.name);
    setFormCode(shift.code);
    setFormStart(shift.startTime);
    setFormEnd(shift.endTime);
    setFormGrace(shift.gracePeriod.toString());
    setFormStatus(shift.status);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return Alert.alert('Validation Error', 'Please enter a shift name.');
    if (!formCode.trim()) return Alert.alert('Validation Error', 'Please enter a shift code.');
    if (!formStart.trim()) return Alert.alert('Validation Error', 'Please enter a start time.');
    if (!formEnd.trim()) return Alert.alert('Validation Error', 'Please enter an end time.');
    
    const graceNum = parseInt(formGrace, 10);
    if (isNaN(graceNum) || graceNum < 0) {
      return Alert.alert('Validation Error', 'Please enter a valid grace period (in minutes).');
    }

    if (editingShift) {
      // Edit
      setShifts(prev =>
        prev.map(s =>
          s.id === editingShift.id
            ? {
                ...s,
                name: formName.trim(),
                code: formCode.trim().toUpperCase(),
                startTime: formStart.trim(),
                endTime: formEnd.trim(),
                gracePeriod: graceNum,
                status: formStatus,
              }
            : s
        )
      );
      Alert.alert('Success', 'Shift configuration updated successfully.');
    } else {
      // Add
      const newShift: Shift = {
        id: Math.random().toString(),
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        startTime: formStart.trim(),
        endTime: formEnd.trim(),
        gracePeriod: graceNum,
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
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      <AdminHeader
        title="Shift Master"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('admin_alerts')}
        onProfilePress={() => onNavigate?.('admin_profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
      >
        <View style={styles.topInfoRow}>
          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Configure and assign shift schedules, working hours, and grace times.
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
            placeholder="Search shifts by name or code..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>SHIFT CONFIGURATION INDEX</Text>

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
                  <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#8B5CF6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shiftName, { color: colors.textPrimary }]}>{shift.name}</Text>
                    <Text style={[styles.codeText, { color: colors.textSecond }]}>
                      Shift Code: {shift.code}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.detailsRow}>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Working Hours</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {shift.startTime} - {shift.endTime}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Grace Period</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{shift.gracePeriod} Mins</Text>
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
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(shift)}>
                    <Feather name="edit-2" size={16} color={colors.brand} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(shift.id)}>
                    <Feather name="trash-2" size={16} color={colors.danger} />
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
              <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Name *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. Regular Shift"
                placeholderTextColor={colors.textSecond}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.label, { color: colors.textPrimary }]}>Shift Code *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. REG-01"
                placeholderTextColor={colors.textSecond}
                value={formCode}
                onChangeText={setFormCode}
              />

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

              <Text style={[styles.label, { color: colors.textPrimary }]}>Grace Period (minutes) *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. 15"
                placeholderTextColor={colors.textSecond}
                keyboardType="number-pad"
                value={formGrace}
                onChangeText={setFormGrace}
              />

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

      <AdminBottomTabNavigator
        activeTab={null}
        onTabPress={tab => {
          if (tab === 'home') onNavigate?.('admin_dashboard');
          else onNavigate?.(`admin_${tab}`);
        }}
      />

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
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
  codeText: { fontSize: 13, fontWeight: '500' },
  cardDivider: { height: 1, marginVertical: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { fontSize: 13, fontWeight: '700' },
  actionRow: { borderTopWidth: 1, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { borderRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  row: { flexDirection: 'row' },
  statusSelectRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  statusSelectorOption: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statusSelectorText: { fontWeight: '700', fontSize: 13 },
  modalButtonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalNoButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  modalYesButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
