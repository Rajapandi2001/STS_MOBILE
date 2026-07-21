import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '@/manager/components/ManagerMenu';
import ManagerHeader from '../components/ManagerHeader';
import ManagerBottomTabNavigator from '../components/ManagerBottomTabNavigator';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ProfileShape = {
  fullName: string; role: string; employeeId: string;
  name: string; phone: string; designation: string; email: string;
  dateOfJoining: string; dateOfBirth: string; nationality: string; gender: string;
  address: string; postalCode: string; city: string; salary: string;
  country: string; maritalStatus: string;
  emergencyName: string; relationship: string; emergencyPhone: string;
  bankName: string; accountNo: string; ifscCode: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoField  — defined OUTSIDE the screen so it never remounts on state change
// ─────────────────────────────────────────────────────────────────────────────
type InfoFieldProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  editable?: boolean;
  fieldKey?: keyof ProfileShape;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  isEditing: boolean;
  editBuffer: ProfileShape;
  onChangeBuffer: (key: keyof ProfileShape, val: string) => void;
};

function InfoField({
  label, value, icon, editable = false, fieldKey,
  keyboardType = 'default', isEditing, editBuffer, onChangeBuffer,
}: InfoFieldProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { color: colors.textSecond }]}>{label}</Text>
      {isEditing && editable && fieldKey ? (
        <TextInput
          style={[styles.fieldInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
          value={editBuffer[fieldKey]}
          onChangeText={(t) => onChangeBuffer(fieldKey, t)}
          placeholder={label}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      ) : (
        <View style={[styles.fieldRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
          {icon && <View style={styles.fieldIcon}>{icon}</View>}
          <Text style={[styles.fieldValue, { color: colors.textPrimary }, !value && { color: colors.textMuted, fontStyle: 'italic' }]}>{value || '—'}</Text>
        </View>
      )}
    </View>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// DropdownField  — defined OUTSIDE
// ─────────────────────────────────────────────────────────────────────────────
type DropdownFieldProps = {
  label: string; value: string; options: string[];
  open: boolean; onToggle: () => void; fieldKey: keyof ProfileShape;
  isEditing: boolean; editBuffer: ProfileShape;
  onChangeBuffer: (key: keyof ProfileShape, val: string) => void;
};

function DropdownField({
  label, value, options, open, onToggle, fieldKey,
  isEditing, editBuffer, onChangeBuffer,
}: DropdownFieldProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { color: colors.textSecond }]}>{label}</Text>
      {isEditing ? (
        <View>
          <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: colors.input, borderColor: colors.border }]} onPress={onToggle} activeOpacity={0.8}>
            <Text style={[styles.dropdownButtonText, { color: colors.textPrimary }, !editBuffer[fieldKey] && { color: colors.textMuted }]}>
              {editBuffer[fieldKey] || `Select ${label}`}
            </Text>
            <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecond} />
          </TouchableOpacity>
          {open && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropdownOption, editBuffer[fieldKey] === opt && { backgroundColor: colors.iconBg }]}
                  onPress={() => { onChangeBuffer(fieldKey, opt); onToggle(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownOptionText, { color: colors.textPrimary }, editBuffer[fieldKey] === opt && { color: colors.brand, fontWeight: '700' }]}>{opt}</Text>
                  {editBuffer[fieldKey] === opt && <Feather name="check" size={14} color={colors.brand} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.fieldRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Text style={[styles.fieldValue, { flex: 1, color: colors.textPrimary }, !value && { color: colors.textMuted, fontStyle: 'italic' }]}>{value || '—'}</Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen props
// ─────────────────────────────────────────────────────────────────────────────
interface ManagerProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// ManagerProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ManagerProfileScreen({ onNavigate, onBack }: ManagerProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<ProfileShape>({
    fullName: 'Manager', role: 'Manager', employeeId: 'EMP02100',
    name: 'Manager', phone: '', designation: '', email: 'manager@cybervault.in',
    dateOfJoining: '', dateOfBirth: '', nationality: '', gender: '',
    address: '', postalCode: '', city: '', salary: '', country: '', maritalStatus: '',
    emergencyName: '', relationship: '', emergencyPhone: '',
    bankName: '', accountNo: '', ifscCode: '',
  });

  const [editBuffer, setEditBuffer] = useState<ProfileShape>({ ...profile });
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [maritalDropdownOpen, setMaritalDropdownOpen] = useState(false);
  const [saveConfirmVisible, setSaveConfirmVisible] = useState(false);

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

  const handleEdit = () => { setEditBuffer({ ...profile }); setIsEditing(true); };
  const handleSave = () => setSaveConfirmVisible(true);
  const confirmSave = () => { setProfile({ ...editBuffer }); setIsEditing(false); setSaveConfirmVisible(false); };
  const handleCancel = () => {
    setEditBuffer({ ...profile });
    setIsEditing(false);
    setGenderDropdownOpen(false);
    setMaritalDropdownOpen(false);
  };

  // Stable callback — updates editBuffer without recreating components
  const handleChangeBuffer = (key: keyof ProfileShape, val: string) => {
    setEditBuffer((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* ── Header ── */}
      <ManagerHeader
        title="Profile"
        onMenuPress={() => setMenuOpen(true)}
        rightComponent={
          isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.brand }]} onPress={handleEdit} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar Card ── */}
        <View style={[styles.avatarCard, { backgroundColor: colors.card }]}>
          {/* Left: Avatar */}
          <View style={styles.avatarOuter}>
            <View style={[styles.avatarInner, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}>
              <MaterialCommunityIcons name="account" size={60} color={colors.brand} />
            </View>
            {isEditing && (
              <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.brand, borderColor: colors.card }]} activeOpacity={0.8}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          {/* Right: Details */}
          <View style={styles.avatarDetails}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{profile.fullName}</Text>
            <Text style={[styles.profileRole, { color: colors.textSecond }]}>{profile.role}</Text>
            <Text style={[styles.profileId, { color: colors.brand }]}>Employee ID : {profile.employeeId}</Text>
            <View style={[styles.activeChip, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.activeText, { color: colors.successText }]}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* ══ Personal Information ══ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="account-outline" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Information</Text>
          </View>

          <View style={styles.cardScrollContent}>
            <InfoField label="Name" value={profile.name} editable={true} fieldKey="name"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Phone" value={profile.phone} icon={<Feather name="phone" size={14} color={colors.textSecond} />} editable={true} fieldKey="phone" keyboardType="phone-pad"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Designation" value={profile.designation} editable={true} fieldKey="designation"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Email" value={profile.email} icon={<Feather name="mail" size={14} color={colors.textSecond} />} editable={true} fieldKey="email" keyboardType="email-address"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Date of Joining" value={profile.dateOfJoining} icon={<Feather name="calendar" size={14} color={colors.textSecond} />} editable={true} fieldKey="dateOfJoining"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Date of Birth" value={profile.dateOfBirth} icon={<Feather name="gift" size={14} color={colors.textSecond} />} editable={true} fieldKey="dateOfBirth"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Nationality" value={profile.nationality} editable={true} fieldKey="nationality"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <DropdownField
              label="Gender" value={profile.gender} options={genderOptions}
              open={genderDropdownOpen}
              onToggle={() => { setGenderDropdownOpen((p) => !p); setMaritalDropdownOpen(false); }}
              fieldKey="gender"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
            />
          </View>
        </View>

        {/* ══ Contact Information ══ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Information</Text>
          </View>

          <View style={styles.cardScrollContent}>
            <InfoField label="Address" value={profile.address} icon={<Feather name="home" size={14} color={colors.textSecond} />} editable={true} fieldKey="address"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Postal Code" value={profile.postalCode} editable={true} fieldKey="postalCode" keyboardType="numeric"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="City" value={profile.city} icon={<Feather name="map-pin" size={14} color={colors.textSecond} />} editable={true} fieldKey="city"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Salary" value={profile.salary} icon={<MaterialCommunityIcons name="currency-inr" size={14} color={colors.textSecond} />} editable={true} fieldKey="salary" keyboardType="numeric"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Country" value={profile.country} icon={<Feather name="globe" size={14} color={colors.textSecond} />} editable={true} fieldKey="country"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <DropdownField
              label="Marital Status" value={profile.maritalStatus} options={maritalOptions}
              open={maritalDropdownOpen}
              onToggle={() => { setMaritalDropdownOpen((p) => !p); setGenderDropdownOpen(false); }}
              fieldKey="maritalStatus"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
            />
          </View>
        </View>

        {/* ══ Emergency Contact ══ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.dangerBg }]}>
              <MaterialCommunityIcons name="phone-alert-outline" size={20} color={colors.danger} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Emergency Contact</Text>
          </View>
          <View style={styles.cardScrollContent}>
            <InfoField label="Name" value={profile.emergencyName} editable={true} fieldKey="emergencyName"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Relationship" value={profile.relationship} editable={true} fieldKey="relationship"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Phone" value={profile.emergencyPhone} icon={<Feather name="phone" size={14} color={colors.textSecond} />} editable={true} fieldKey="emergencyPhone" keyboardType="phone-pad"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
          </View>
        </View>

        {/* ══ Bank Information ══ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="bank-outline" size={20} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bank Information</Text>
          </View>
          <View style={styles.cardScrollContent}>
            <InfoField label="Bank Name" value={profile.bankName} icon={<MaterialCommunityIcons name="bank" size={14} color={colors.textSecond} />} editable={true} fieldKey="bankName"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Account No" value={profile.accountNo} editable={true} fieldKey="accountNo" keyboardType="numeric"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="IFSC Code" value={profile.ifscCode} editable={true} fieldKey="ifscCode"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
          </View>
        </View>

        {/* ══ Security ══ */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security</Text>
          </View>

          <TouchableOpacity style={styles.securityRow} activeOpacity={0.7}>
            <View style={styles.securityLeft}>
              <View style={[styles.securityIconBg, { backgroundColor: colors.iconBg }]}>
                <Feather name="lock" size={16} color={colors.brand} />
              </View>
              <View>
                <Text style={[styles.securityLabel, { color: colors.textPrimary }]}>Change Password</Text>
                <Text style={[styles.securitySub, { color: colors.textSecond }]}>Last changed 30 days ago</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Save Confirmation Modal ── */}
      <Modal visible={saveConfirmVisible} transparent animationType="fade" onRequestClose={() => setSaveConfirmVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="content-save-outline" size={28} color={colors.brand} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Save Changes?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecond }]}>Your profile information will be updated. Do you want to continue?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalNoButton, { borderColor: colors.border }]} activeOpacity={0.8} onPress={() => setSaveConfirmVisible(false)}>
                <Text style={[styles.modalNoButtonText, { color: colors.textSecond }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalYesButton} activeOpacity={0.8} onPress={confirmSave}>
                <Text style={styles.modalYesButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <ManagerBottomTabNavigator
        activeTab={undefined}
        onTabPress={(tab) => {
          if (tab === 'home' || tab === 'approvals') {
            onNavigate?.('manager_dashboard', { tab });
          } else {
            onNavigate?.(`manager_${tab}`);
          }
        }}
      />

      <ManagerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0F172A', marginHorizontal: 8 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#0A52D6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1' },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  saveBtn: { backgroundColor: '#0A52D6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  /* Scroll */
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },

  /* Avatar Card */
  avatarCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 36, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, shadowColor: '#0A52D6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  avatarOuter: { position: 'relative' },
  avatarInner: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#DBEAFE' },
  cameraButton: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: '#0A52D6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarDetails: { justifyContent: 'center' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  profileRole: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  profileId: { fontSize: 13, color: '#0A52D6', fontWeight: '600', marginBottom: 12 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#BBF7D0', alignSelf: 'flex-start' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  activeText: { fontSize: 11, fontWeight: '700', color: '#16A34A', letterSpacing: 0.5 },

  /* Section Card */
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, shadowColor: '#0A52D6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },

  /* Card Scrolling */
  cardScroll: {
    maxHeight: 240,
  },
  cardScrollContent: {
    paddingBottom: 8,
  },

  /* Fields */
  fieldWrapper: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: '#E2E8F0', gap: 8, minHeight: 42 },
  fieldIcon: { width: 18, alignItems: 'center' },
  fieldValue: { fontSize: 13, fontWeight: '500', color: '#1E293B', flex: 1 },
  fieldValueEmpty: { color: '#CBD5E1', fontStyle: 'italic' },
  fieldInput: { backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1.5, borderColor: '#0A52D6', fontSize: 13, color: '#1E293B', fontWeight: '500', minHeight: 42 },

  /* Dropdown */
  dropdownButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1.5, borderColor: '#0A52D6', justifyContent: 'space-between', minHeight: 42 },
  dropdownButtonText: { fontSize: 13, fontWeight: '500', color: '#1E293B', flex: 1 },
  dropdownMenu: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6, overflow: 'hidden', zIndex: 999 },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  dropdownOptionSelected: { backgroundColor: '#EFF6FF' },
  dropdownOptionText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  dropdownOptionTextSelected: { color: '#0A52D6', fontWeight: '700' },

  /* Security */
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  securityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  securityIconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  securityLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  securitySub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  securityDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },

  /* Modal */
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  modalIconContainer: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  modalButtonContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  modalNoButton: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  modalNoButtonText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  modalYesButton: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#0A52D6', alignItems: 'center' },
  modalYesButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  /* Bottom Tab Bar */
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    color: '#64748B',
    fontWeight: '500',
  },
});
