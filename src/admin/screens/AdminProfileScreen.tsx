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
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable && fieldKey ? (
        <TextInput
          style={styles.fieldInput}
          value={editBuffer[fieldKey]}
          onChangeText={(t) => onChangeBuffer(fieldKey, t)}
          placeholder={label}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      ) : (
        <View style={styles.fieldRow}>
          {icon && <View style={styles.fieldIcon}>{icon}</View>}
          <Text style={[styles.fieldValue, !value && styles.fieldValueEmpty]}>{value || '—'}</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TwoColRow  — defined OUTSIDE
// ─────────────────────────────────────────────────────────────────────────────
type ColDef = {
  label: string; value: string; icon?: React.ReactNode;
  editable?: boolean; fieldKey?: keyof ProfileShape;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
};
type TwoColRowProps = {
  left: ColDef; right: ColDef;
  isEditing: boolean; editBuffer: ProfileShape;
  onChangeBuffer: (key: keyof ProfileShape, val: string) => void;
};

function TwoColRow({ left, right, isEditing, editBuffer, onChangeBuffer }: TwoColRowProps) {
  return (
    <View style={styles.twoColRow}>
      <View style={styles.twoColCell}>
        <InfoField {...left} isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={onChangeBuffer} />
      </View>
      <View style={styles.twoColDivider} />
      <View style={styles.twoColCell}>
        <InfoField {...right} isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={onChangeBuffer} />
      </View>
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
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <View>
          <TouchableOpacity style={styles.dropdownButton} onPress={onToggle} activeOpacity={0.8}>
            <Text style={[styles.dropdownButtonText, !editBuffer[fieldKey] && { color: '#94A3B8' }]}>
              {editBuffer[fieldKey] || `Select ${label}`}
            </Text>
            <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
          </TouchableOpacity>
          {open && (
            <View style={styles.dropdownMenu}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropdownOption, editBuffer[fieldKey] === opt && styles.dropdownOptionSelected]}
                  onPress={() => { onChangeBuffer(fieldKey, opt); onToggle(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownOptionText, editBuffer[fieldKey] === opt && styles.dropdownOptionTextSelected]}>{opt}</Text>
                  {editBuffer[fieldKey] === opt && <Feather name="check" size={14} color="#0A52D6" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldValue, { flex: 1 }, !value && styles.fieldValueEmpty]}>{value || '—'}</Text>
          <Feather name="chevron-down" size={16} color="#94A3B8" />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen props
// ─────────────────────────────────────────────────────────────────────────────
interface AdminProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminProfileScreen({ onBack, onNavigate }: AdminProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<ProfileShape>({
    fullName: 'Admin', role: 'Admin', employeeId: 'EMP02100',
    name: 'Admin', phone: '', designation: '', email: 'admin@cybervault.in',
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar Card ── */}
        <View style={styles.avatarCard}>
          {/* Left: Avatar */}
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <MaterialCommunityIcons name="account" size={60} color="#0A52D6" />
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          {/* Right: Details */}
          <View style={styles.avatarDetails}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileRole}>{profile.role}</Text>
            <Text style={styles.profileId}>Employee ID : {profile.employeeId}</Text>
            <View style={styles.activeChip}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* ══ Personal Information ══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#0A52D6" />
            </View>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <TwoColRow
            left={{ label: 'Name', value: profile.name, editable: true, fieldKey: 'name' }}
            right={{ label: 'Phone', value: profile.phone, icon: <Feather name="phone" size={14} color="#64748B" />, editable: true, fieldKey: 'phone', keyboardType: 'phone-pad' }}
            isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
          />
          <View style={styles.rowDivider} />

          <TwoColRow
            left={{ label: 'Designation', value: profile.designation, editable: true, fieldKey: 'designation' }}
            right={{ label: 'Email', value: profile.email, icon: <Feather name="mail" size={14} color="#64748B" />, editable: true, fieldKey: 'email', keyboardType: 'email-address' }}
            isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
          />
          <View style={styles.rowDivider} />

          <TwoColRow
            left={{ label: 'Date of Joining', value: profile.dateOfJoining, icon: <Feather name="calendar" size={14} color="#64748B" />, editable: true, fieldKey: 'dateOfJoining' }}
            right={{ label: 'Date of Birth', value: profile.dateOfBirth, icon: <Feather name="gift" size={14} color="#64748B" />, editable: true, fieldKey: 'dateOfBirth' }}
            isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
          />
          <View style={styles.rowDivider} />

          <View style={styles.twoColRow}>
            <View style={styles.twoColCell}>
              <InfoField label="Nationality" value={profile.nationality} editable fieldKey="nationality"
                isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            </View>
            <View style={styles.twoColDivider} />
            <View style={styles.twoColCell}>
              <DropdownField
                label="Gender" value={profile.gender} options={genderOptions}
                open={genderDropdownOpen}
                onToggle={() => { setGenderDropdownOpen((p) => !p); setMaritalDropdownOpen(false); }}
                fieldKey="gender"
                isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
              />
            </View>
          </View>
        </View>

        {/* ══ Contact Information ══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="map-marker-outline" size={22} color="#0A52D6" />
            </View>
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>

          <TwoColRow
            left={{ label: 'Address', value: profile.address, icon: <Feather name="home" size={14} color="#64748B" />, editable: true, fieldKey: 'address' }}
            right={{ label: 'Postal Code', value: profile.postalCode, editable: true, fieldKey: 'postalCode', keyboardType: 'numeric' }}
            isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
          />
          <View style={styles.rowDivider} />

          <TwoColRow
            left={{ label: 'City', value: profile.city, icon: <Feather name="map-pin" size={14} color="#64748B" />, editable: true, fieldKey: 'city' }}
            right={{ label: 'Salary', value: profile.salary, icon: <MaterialCommunityIcons name="currency-inr" size={14} color="#64748B" />, editable: true, fieldKey: 'salary', keyboardType: 'numeric' }}
            isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
          />
          <View style={styles.rowDivider} />

          <View style={styles.twoColRow}>
            <View style={styles.twoColCell}>
              <InfoField label="Country" value={profile.country} icon={<Feather name="globe" size={14} color="#64748B" />} editable fieldKey="country"
                isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            </View>
            <View style={styles.twoColDivider} />
            <View style={styles.twoColCell}>
              <DropdownField
                label="Marital Status" value={profile.maritalStatus} options={maritalOptions}
                open={maritalDropdownOpen}
                onToggle={() => { setMaritalDropdownOpen((p) => !p); setGenderDropdownOpen(false); }}
                fieldKey="maritalStatus"
                isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer}
              />
            </View>
          </View>
        </View>

        {/* ══ Emergency Contact + Bank Information ══ */}
        <View style={styles.bottomCardRow}>
          {/* Emergency Contact */}
          <View style={[styles.sectionCard, styles.halfCard]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <MaterialCommunityIcons name="phone-alert-outline" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>{'Emergency\nContact'}</Text>
            </View>
            <InfoField label="Name" value={profile.emergencyName} editable fieldKey="emergencyName"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Relationship" value={profile.relationship} editable fieldKey="relationship"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Phone" value={profile.emergencyPhone} icon={<Feather name="phone" size={14} color="#64748B" />} editable fieldKey="emergencyPhone" keyboardType="phone-pad"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
          </View>

          {/* Bank Information */}
          <View style={[styles.sectionCard, styles.halfCard]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons name="bank-outline" size={20} color="#0A52D6" />
              </View>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>{'Bank\nInformation'}</Text>
            </View>
            <InfoField label="Bank Name" value={profile.bankName} icon={<MaterialCommunityIcons name="bank" size={14} color="#64748B" />} editable fieldKey="bankName"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="Account No" value={profile.accountNo} editable fieldKey="accountNo" keyboardType="numeric"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
            <InfoField label="IFSC Code" value={profile.ifscCode} editable fieldKey="ifscCode"
              isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={handleChangeBuffer} />
          </View>
        </View>

        {/* ══ Security ══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#0A52D6" />
            </View>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>

          <TouchableOpacity style={styles.securityRow} activeOpacity={0.7}>
            <View style={styles.securityLeft}>
              <View style={[styles.securityIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="lock" size={16} color="#0A52D6" />
              </View>
              <View>
                <Text style={styles.securityLabel}>Change Password</Text>
                <Text style={styles.securitySub}>Last changed 30 days ago</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.securityDivider} />

          <TouchableOpacity style={styles.securityRow} activeOpacity={0.7}>
            <View style={styles.securityLeft}>
              <View style={[styles.securityIconBg, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="smartphone" size={16} color="#22C55E" />
              </View>
              <View>
                <Text style={styles.securityLabel}>Two-Factor Auth</Text>
                <Text style={[styles.securitySub, { color: '#22C55E' }]}>Enabled</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Save Confirmation Modal ── */}
      <Modal visible={saveConfirmVisible} transparent animationType="fade" onRequestClose={() => setSaveConfirmVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialCommunityIcons name="content-save-outline" size={28} color="#0A52D6" />
            </View>
            <Text style={styles.modalTitle}>Save Changes?</Text>
            <Text style={styles.modalMessage}>Your profile information will be updated. Do you want to continue?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalNoButton} activeOpacity={0.8} onPress={() => setSaveConfirmVisible(false)}>
                <Text style={styles.modalNoButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalYesButton} activeOpacity={0.8} onPress={confirmSave}>
                <Text style={styles.modalYesButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
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

  /* Two-column layout */
  twoColRow: { flexDirection: 'row', alignItems: 'flex-start' },
  twoColCell: { flex: 1 },
  twoColDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 10, marginTop: 20, alignSelf: 'stretch' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6 },

  /* Bottom side-by-side cards */
  bottomCardRow: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1, padding: 14 },

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
});
