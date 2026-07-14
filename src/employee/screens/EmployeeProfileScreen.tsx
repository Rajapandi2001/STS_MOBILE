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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import EmployeeMenu from '@/employee/components/EmployeeMenu';

type ProfileShape = {
  fullName: string; role: string; employeeId: string;
  name: string; phone: string; designation: string; email: string;
  dateOfJoining: string; dateOfBirth: string; nationality: string; gender: string;
  address: string; postalCode: string; city: string; salary: string;
  country: string; maritalStatus: string;
  emergencyName: string; relationship: string; emergencyPhone: string;
  bankName: string; accountNo: string; ifscCode: string;
};

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
  const { colors } = useTheme();
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
  const { colors } = useTheme();
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
            <View style={[styles.dropdownMenu, { backgroundColor: colors.dropdownMenu, borderColor: colors.border }]}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropdownOption, editBuffer[fieldKey] === opt && { backgroundColor: colors.brandBg }]}
                  onPress={() => {
                    onChangeBuffer(fieldKey, opt);
                    onToggle();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownOptionText, { color: colors.textPrimary }, editBuffer[fieldKey] === opt && { color: colors.brand, fontWeight: '700' }]}>
                    {opt}
                  </Text>
                  {editBuffer[fieldKey] === opt && <Feather name="check" size={14} color={colors.brand} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.fieldRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Text style={[styles.fieldValue, { color: colors.textPrimary }, !value && { color: colors.textMuted, fontStyle: 'italic' }]}>{value || '—'}</Text>
        </View>
      )}
    </View>
  );
}

interface EmployeeProfileScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function EmployeeProfileScreen({ onBack, onNavigate }: EmployeeProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<ProfileShape>({
    fullName: 'Testing Developer',
    role: 'Employee',
    employeeId: 'EMP2026998',
    name: 'Testing Developer',
    phone: '9876543210',
    designation: 'Developer',
    email: 'testing@cybervault.in',
    dateOfJoining: '15 Jan 2024',
    dateOfBirth: '22 May 1998',
    nationality: 'Indian',
    gender: 'Male',
    address: 'HQ Block A, Floor 4, Cyber City',
    postalCode: '600001',
    city: 'Chennai',
    salary: '₹60,000 / Month',
    country: 'India',
    maritalStatus: 'Single',
    emergencyName: 'John Doe',
    relationship: 'Father',
    emergencyPhone: '9876543211',
    bankName: 'State Bank of India',
    accountNo: '34589021234',
    ifscCode: 'SBIN0001234',
  });

  const [editBuffer, setEditBuffer] = useState<ProfileShape>({ ...profile });
  const [dropdownOpen, setDropdownOpen] = useState<'gender' | 'marital' | null>(null);

  const handleEditPress = () => {
    setEditBuffer({ ...profile });
    setIsEditing(true);
  };

  const handleCancelPress = () => {
    setIsEditing(false);
    setDropdownOpen(null);
  };

  const handleSavePress = () => {
    setProfile({ ...editBuffer });
    setIsEditing(false);
    setDropdownOpen(null);
  };

  const changeBuffer = (key: keyof ProfileShape, val: string) => {
    setEditBuffer((p) => ({ ...p, [key]: val }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen, paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.iconBg }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.brand }]}>My Profile</Text>

        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelPress} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.brand }]} onPress={handleSavePress} activeOpacity={0.7}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.brand }]} onPress={handleEditPress} activeOpacity={0.7}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.card, shadowColor: colors.brand }]}>
          <View style={styles.avatarOuter}>
            <View style={[styles.avatarInner, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120' }}
                style={styles.avatarImage}
              />
            </View>
            {isEditing && (
              <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.brand }]} activeOpacity={0.7}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.avatarDetails}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{profile.fullName}</Text>
            <Text style={[styles.profileRole, { color: colors.textSecond }]}>{profile.role}</Text>
            <Text style={[styles.profileId, { color: colors.brand }]}>{profile.employeeId}</Text>
            <View style={[styles.activeChip, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.activeText, { color: colors.successText }]}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* Personal Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.brand }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <Feather name="user" size={18} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Details</Text>
          </View>

          <InfoField label="Full Name" value={profile.fullName} editable fieldKey="fullName" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Mobile Number" value={profile.phone} editable fieldKey="phone" keyboardType="phone-pad" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Email Address" value={profile.email} editable fieldKey="email" keyboardType="email-address" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Designation" value={profile.designation} isEditing={false} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />

          <DropdownField
            label="Gender"
            value={profile.gender}
            options={['Male', 'Female', 'Other']}
            open={dropdownOpen === 'gender'}
            onToggle={() => setDropdownOpen(dropdownOpen === 'gender' ? null : 'gender')}
            fieldKey="gender"
            isEditing={isEditing}
            editBuffer={editBuffer}
            onChangeBuffer={changeBuffer}
          />

          <DropdownField
            label="Marital Status"
            value={profile.maritalStatus}
            options={['Single', 'Married', 'Divorced', 'Widowed']}
            open={dropdownOpen === 'marital'}
            onToggle={() => setDropdownOpen(dropdownOpen === 'marital' ? null : 'marital')}
            fieldKey="maritalStatus"
            isEditing={isEditing}
            editBuffer={editBuffer}
            onChangeBuffer={changeBuffer}
          />
        </View>

        {/* Address Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.brand }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <Feather name="map-pin" size={18} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Address Details</Text>
          </View>

          <InfoField label="Address" value={profile.address} editable fieldKey="address" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="City" value={profile.city} editable fieldKey="city" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Postal Code" value={profile.postalCode} editable fieldKey="postalCode" keyboardType="numeric" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Country" value={profile.country} editable fieldKey="country" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
        </View>

        {/* Emergency Contact */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.brand }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <Feather name="phone-call" size={18} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Emergency Contact</Text>
          </View>

          <InfoField label="Contact Name" value={profile.emergencyName} editable fieldKey="emergencyName" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Relationship" value={profile.relationship} editable fieldKey="relationship" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Contact Phone" value={profile.emergencyPhone} editable fieldKey="emergencyPhone" keyboardType="phone-pad" isEditing={isEditing} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
        </View>

        {/* Bank Account */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.brand }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="bank-outline" size={18} color={colors.brand} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bank Account Details</Text>
          </View>

          <InfoField label="Bank Name" value={profile.bankName} isEditing={false} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="Account Number" value={profile.accountNo} isEditing={false} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
          <InfoField label="IFSC Code" value={profile.ifscCode} isEditing={false} editBuffer={editBuffer} onChangeBuffer={changeBuffer} />
        </View>
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

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_apply_leave')}>
          <Feather name="calendar" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_assets')}>
          <MaterialCommunityIcons name="laptop" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Asset</Text>
        </TouchableOpacity>
      </View>

      <EmployeeMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginLeft: 12 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1' },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },
  avatarCard: { borderRadius: 24, paddingVertical: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  avatarOuter: { position: 'relative' },
  avatarInner: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', borderWidth: 2 },
  avatarImage: { width: '100%', height: '100%' },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFFFFF' },
  avatarDetails: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  profileRole: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  profileId: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, borderWidth: 1, alignSelf: 'flex-start' },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  sectionCard: { borderRadius: 20, padding: 18, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  fieldWrapper: { marginBottom: 12 },
  fieldLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, gap: 8, minHeight: 40 },
  fieldIcon: { width: 18, alignItems: 'center' },
  fieldValue: { fontSize: 13, fontWeight: '500', flex: 1 },
  fieldInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, fontSize: 13, fontWeight: '500', minHeight: 40 },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, justifyContent: 'space-between', minHeight: 40 },
  dropdownButtonText: { fontSize: 13, fontWeight: '500', flex: 1 },
  dropdownMenu: { borderRadius: 12, borderWidth: 1, marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  dropdownOptionText: { fontSize: 13, fontWeight: '500' },
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
