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

interface AdminAttendanceRulesScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface AttendanceRule {
  id: string;
  name: string;
  description: string;
  value: string; // Threshold value (e.g. "09:30 AM", "8 Hours")
  status: 'Active' | 'Inactive';
}

const DEFAULT_RULES: AttendanceRule[] = [
  {
    id: '1',
    name: 'Late Arrival Policy',
    description: "Mark attendance as 'late' if checked in after this time.",
    value: '09:30 AM',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Half-Day Cutoff',
    description: "Mark attendance as 'half-day' if checked in after this time.",
    value: '01:30 PM',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Minimum Daily Working Hours',
    description: 'Minimum required work hours for a full-day presence credit.',
    value: '8 Hours',
    status: 'Active',
  },
  {
    id: '4',
    name: 'Overtime Threshold',
    description: 'Minimum hours after shift end time to qualify for overtime hours.',
    value: '30 Mins',
    status: 'Inactive',
  },
];

export default function AdminAttendanceRulesScreen({ onNavigate, onBack }: AdminAttendanceRulesScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [rules, setRules] = useState<AttendanceRule[]>(DEFAULT_RULES);
  
  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AttendanceRule | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = () => {
    setEditingRule(null);
    setFormName('');
    setFormDesc('');
    setFormValue('');
    setFormStatus('Active');
    setModalVisible(true);
  };

  const openEditModal = (rule: AttendanceRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormDesc(rule.description);
    setFormValue(rule.value);
    setFormStatus(rule.status);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return Alert.alert('Validation Error', 'Please enter a rule name.');
    if (!formDesc.trim()) return Alert.alert('Validation Error', 'Please enter a rule description.');
    if (!formValue.trim()) return Alert.alert('Validation Error', 'Please enter a rule value/threshold.');

    if (editingRule) {
      // Edit
      setRules(prev =>
        prev.map(r =>
          r.id === editingRule.id
            ? {
                ...r,
                name: formName.trim(),
                description: formDesc.trim(),
                value: formValue.trim(),
                status: formStatus,
              }
            : r
        )
      );
      Alert.alert('Success', 'Attendance rule updated successfully.');
    } else {
      // Add
      const newRule: AttendanceRule = {
        id: Math.random().toString(),
        name: formName.trim(),
        description: formDesc.trim(),
        value: formValue.trim(),
        status: formStatus,
      };
      setRules(prev => [...prev, newRule]);
      Alert.alert('Success', 'Attendance rule added successfully.');
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this attendance rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRules(prev => prev.filter(r => r.id !== id));
            Alert.alert('Success', 'Attendance rule deleted successfully.');
          },
        },
      ]
    );
  };

  const filteredRules = rules.filter(
    r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
      >
        <View style={styles.topInfoRow}>
          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Set the parameters governing presence, shift exceptions, late mark cutoffs, and daily hours rules.
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brand }]}
            activeOpacity={0.8}
            onPress={openAddModal}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Rule</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search rules by name or description..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>ATTENDANCE CONTROL LAWS</Text>

        {/* Rules List */}
        {filteredRules.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecond, marginTop: 30 }}>
            No attendance rules found.
          </Text>
        ) : (
          filteredRules.map(rule => (
            <View
              key={rule.id}
              style={[styles.ruleCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardInfoRow}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                    <MaterialCommunityIcons name="gavel" size={24} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ruleName, { color: colors.textPrimary }]}>{rule.name}</Text>
                    <Text style={[styles.descText, { color: colors.textSecond }]}>
                      {rule.description}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.detailsRow}>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Threshold Value</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{rule.value}</Text>
                </View>
              </View>

              <View style={[styles.actionRow, { borderTopColor: colors.borderLight }]}>
                <View style={[styles.statusBadge, { backgroundColor: rule.status === 'Active' ? colors.successBg : colors.iconBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: rule.status === 'Active' ? colors.success : colors.textSecond }]} />
                  <Text style={[styles.statusText, { color: rule.status === 'Active' ? colors.success : colors.textSecond }]}>
                    {rule.status}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(rule)}>
                    <Feather name="edit-2" size={16} color={colors.brand} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(rule.id)}>
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
              {editingRule ? 'Edit Attendance Rule' : 'Add Attendance Rule'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Rule Name *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. Late Arrival Policy"
                placeholderTextColor={colors.textSecond}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.label, { color: colors.textPrimary }]}>Description *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen, height: 60 }]}
                placeholder="Brief description of the rule impact..."
                placeholderTextColor={colors.textSecond}
                multiline
                numberOfLines={2}
                value={formDesc}
                onChangeText={setFormDesc}
              />

              <Text style={[styles.label, { color: colors.textPrimary }]}>Threshold/Limit Value *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgScreen }]}
                placeholder="e.g. 09:30 AM or 8 Hours"
                placeholderTextColor={colors.textSecond}
                value={formValue}
                onChangeText={setFormValue}
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
  ruleCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ruleName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  descText: { fontSize: 13, lineHeight: 17 },
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
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, textAlignVertical: 'top' },
  statusSelectRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  statusSelectorOption: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statusSelectorText: { fontWeight: '700', fontSize: 13 },
  modalButtonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalNoButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  modalYesButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
