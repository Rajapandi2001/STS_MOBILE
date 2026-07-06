import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AdminMenu from '@/admin/components/AdminMenu';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StaffDetail {
  id: string;
  // Personal
  firstName: string;
  lastName: string;
  employeeId: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  designation: string;
  dateOfJoin: string;
  jobGroup: string;
  clientName: string;
  reportManager: string;
  email: string;
  mobile: string;
  salary: string;
  avatar?: string;
  initials?: string;
  status: string;
  // Emergency
  relationName: string;
  relationship: string;
  emergencyPhone: string;
  // Bank
  bankName: string;
  bankAccountNo: string;
  ifscCode: string;
  // Login
  userName: string;
  loginType: string;
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const STAFF_DETAILS: Record<string, StaffDetail> = {
  '1': {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    employeeId: 'EMP-8492',
    nationality: 'American',
    dateOfBirth: '15 Mar 1990',
    gender: 'Female',
    designation: 'Senior Analyst',
    dateOfJoin: '01 Jun 2018',
    jobGroup: 'Engineering',
    clientName: 'ACME Corporation',
    reportManager: 'James Wilson',
    email: 'sarah.jenkins@company.com',
    mobile: '+1 (555) 012-3456',
    salary: '$8,500 / month',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'Active',
    relationName: 'Mark Jenkins',
    relationship: 'Spouse',
    emergencyPhone: '+1 (555) 098-7654',
    bankName: 'Bank of America',
    bankAccountNo: '****  ****  4872',
    ifscCode: 'BOA0001234',
    userName: 'sarah.jenkins',
    loginType: 'Employee',
  },
  '2': {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    employeeId: 'EMP-8211',
    nationality: 'Canadian',
    dateOfBirth: '22 Jul 1988',
    gender: 'Male',
    designation: 'Product Manager',
    dateOfJoin: '15 Feb 2019',
    jobGroup: 'Product',
    clientName: 'Nexus Global Tech',
    reportManager: 'Linda Park',
    email: 'michael.chen@company.com',
    mobile: '+1 (555) 234-5678',
    salary: '$9,200 / month',
    initials: 'MC',
    status: 'Active',
    relationName: 'Wei Chen',
    relationship: 'Parent',
    emergencyPhone: '+1 (555) 876-5432',
    bankName: 'TD Canada Trust',
    bankAccountNo: '****  ****  3301',
    ifscCode: 'TDCT0005678',
    userName: 'michael.chen',
    loginType: 'Employee',
  },
  '3': {
    id: '3',
    firstName: 'David',
    lastName: 'Rossi',
    employeeId: 'EMP-7944',
    nationality: 'Italian',
    dateOfBirth: '08 Nov 1985',
    gender: 'Male',
    designation: 'Finance Director',
    dateOfJoin: '03 Jan 2016',
    jobGroup: 'Finance',
    clientName: 'Starlight Ventures',
    reportManager: 'CEO — Board',
    email: 'david.rossi@company.com',
    mobile: '+39 06 1234 5678',
    salary: '$12,000 / month',
    avatar: 'https://i.pravatar.cc/150?img=11',
    status: 'Inactive',
    relationName: 'Giulia Rossi',
    relationship: 'Spouse',
    emergencyPhone: '+39 06 8765 4321',
    bankName: 'UniCredit',
    bankAccountNo: '****  ****  9910',
    ifscCode: 'UNCR0009910',
    userName: 'david.rossi',
    loginType: 'Manager',
  },
  '4': {
    id: '4',
    firstName: 'Amanda',
    lastName: 'Patel',
    employeeId: 'EMP-8633',
    nationality: 'Indian',
    dateOfBirth: '30 Apr 1995',
    gender: 'Female',
    designation: 'UX Designer',
    dateOfJoin: '10 Aug 2021',
    jobGroup: 'Design',
    clientName: 'Apex Innovations',
    reportManager: 'Riya Sharma',
    email: 'amanda.patel@company.com',
    mobile: '+91 98765 43210',
    salary: '$4,500 / month',
    initials: 'AP',
    status: 'Pending',
    relationName: 'Raj Patel',
    relationship: 'Father',
    emergencyPhone: '+91 99887 76655',
    bankName: 'HDFC Bank',
    bankAccountNo: '****  ****  7723',
    ifscCode: 'HDFC0007723',
    userName: 'amanda.patel',
    loginType: 'Employee',
  },
  '5': {
    id: '5',
    firstName: 'Manikandan',
    lastName: 'Rajan',
    employeeId: 'EMP-8812',
    nationality: 'Indian',
    dateOfBirth: '12 Jan 1993',
    gender: 'Male',
    designation: 'Developer',
    dateOfJoin: '20 Mar 2022',
    jobGroup: 'Engineering',
    clientName: 'ACME Corporation',
    reportManager: 'Sarah Jenkins',
    email: 'manikandan.rajan@company.com',
    mobile: '+91 93456 78901',
    salary: '₹55,000 / month',
    initials: 'MR',
    status: 'Active',
    relationName: 'Kavitha Rajan',
    relationship: 'Mother',
    emergencyPhone: '+91 94567 89012',
    bankName: 'State Bank of India',
    bankAccountNo: '****  ****  5521',
    ifscCode: 'SBIN0005521',
    userName: 'manikandan.rajan',
    loginType: 'Employee',
  },
  '6': {
    id: '6',
    firstName: 'Manish',
    lastName: 'Sharma',
    employeeId: 'EMP-8813',
    nationality: 'Indian',
    dateOfBirth: '05 Sep 1991',
    gender: 'Male',
    designation: 'QA Engineer',
    dateOfJoin: '01 Nov 2021',
    jobGroup: 'Quality Assurance',
    clientName: 'Nexus Global Tech',
    reportManager: 'Michael Chen',
    email: 'manish.sharma@company.com',
    mobile: '+91 87654 32109',
    salary: '₹60,000 / month',
    initials: 'MS',
    status: 'Active',
    relationName: 'Priya Sharma',
    relationship: 'Spouse',
    emergencyPhone: '+91 76543 21098',
    bankName: 'ICICI Bank',
    bankAccountNo: '****  ****  8834',
    ifscCode: 'ICIC0008834',
    userName: 'manish.sharma',
    loginType: 'Employee',
  },
  '7': {
    id: '7',
    firstName: 'Manoj',
    lastName: 'Kumar',
    employeeId: 'EMP-8814',
    nationality: 'Indian',
    dateOfBirth: '18 Feb 1987',
    gender: 'Male',
    designation: 'Lead Engineer',
    dateOfJoin: '15 Jul 2017',
    jobGroup: 'Engineering',
    clientName: 'ACME Corporation',
    reportManager: 'James Wilson',
    email: 'manoj.kumar@company.com',
    mobile: '+91 81234 56789',
    salary: '₹90,000 / month',
    initials: 'MK',
    status: 'Pending',
    relationName: 'Sunita Kumar',
    relationship: 'Spouse',
    emergencyPhone: '+91 82345 67890',
    bankName: 'Axis Bank',
    bankAccountNo: '****  ****  6645',
    ifscCode: 'UTIB0006645',
    userName: 'manoj.kumar',
    loginType: 'Manager',
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminStaffDetailScreenProps {
  staffId?: string;
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminStaffDetailScreen({
  staffId,
  onBack,
  onNavigate,
}: AdminStaffDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const staff = staffId ? STAFF_DETAILS[staffId] : STAFF_DETAILS['1'];

  if (!staff) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Staff not found.
        </Text>
      </View>
    );
  }

  const [pickedFiles, setPickedFiles] = useState<{ name: string; uri: string; size?: number }[]>([]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newFiles = result.assets.map((a) => ({
          name: a.name,
          uri: a.uri,
          size: a.size ?? undefined,
        }));
        setPickedFiles((prev) => {
          const existing = new Set(prev.map((f) => f.uri));
          return [...prev, ...newFiles.filter((f) => !existing.has(f.uri))];
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick file. Please try again.');
    }
  };

  const removeFile = (uri: string) => {
    setPickedFiles((prev) => prev.filter((f) => f.uri !== uri));
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusColors = {
    Active: { bg: colors.successBg, text: colors.success },
    Inactive: { bg: colors.iconBg, text: colors.textSecond },
    Pending: { bg: colors.amberBg, text: colors.amber },
  }[staff.status] ?? { bg: colors.iconBg, text: colors.textSecond };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Staff Details</Text>
        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
          activeOpacity={0.8}
          onPress={() => onNavigate?.('admin_profile', { source: 'header' })}
        >
          <Feather name="user" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* ── Profile Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            {staff.avatar ? (
              <Image source={{ uri: staff.avatar }} style={styles.heroAvatar} />
            ) : (
              <View style={[styles.heroAvatarInitials, { backgroundColor: colors.brandBorder }]}>
                <Text style={[styles.heroInitialsText, { color: colors.brand }]}>
                  {staff.initials ?? `${staff.firstName[0]}${staff.lastName[0]}`}
                </Text>
              </View>
            )}
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>
                {staff.firstName} {staff.lastName}
              </Text>
              <Text style={[styles.heroEmpId, { color: colors.textSecond }]}>{staff.employeeId}</Text>
              <Text style={[styles.heroDesig, { color: colors.brand }]}>{staff.designation}</Text>
            </View>
          </View>
          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <MaterialCommunityIcons name="briefcase-outline" size={14} color={colors.textSecond} />
              <Text style={[styles.heroMetaText, { color: colors.textSecond }]}>{staff.jobGroup}</Text>
            </View>
            <View style={[styles.heroMetaDot, { backgroundColor: colors.borderLight }]} />
            <View style={styles.heroMetaItem}>
              <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textSecond} />
              <Text style={[styles.heroMetaText, { color: colors.textSecond }]}>Joined {staff.dateOfJoin}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
              <Text style={[styles.statusText, { color: statusColors.text }]}>{staff.status}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 1: Personal Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="card-account-details-outline" title="Personal Information" color="#3B82F6" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="First Name" value={staff.firstName} />
          <InfoRow label="Last Name" value={staff.lastName} />
          <InfoRow label="Employee ID" value={staff.employeeId} />
          <InfoRow label="Nationality" value={staff.nationality} />
          <InfoRow label="Date of Birth" value={staff.dateOfBirth} />
          <InfoRow label="Gender" value={staff.gender} />
          <InfoRow label="Designation" value={staff.designation} />
          <InfoRow label="Date of Join" value={staff.dateOfJoin} />
          <InfoRow label="Job Group" value={staff.jobGroup} />
          <InfoRow label="Client Name" value={staff.clientName} />
          <InfoRow label="Report Manager" value={staff.reportManager} />

          {/* Contact chips */}
          <View style={[styles.contactChipRow]}>
            <View style={[styles.contactChip, { backgroundColor: colors.iconBg }]}>
              <Feather name="mail" size={13} color={colors.brand} style={{ marginRight: 6 }} />
              <Text style={[styles.contactChipText, { color: colors.brand }]} numberOfLines={1}>
                {staff.email}
              </Text>
            </View>
          </View>
          <View style={[styles.contactChipRow]}>
            <View style={[styles.contactChip, { backgroundColor: colors.iconBg }]}>
              <Feather name="phone" size={13} color={colors.brand} style={{ marginRight: 6 }} />
              <Text style={[styles.contactChipText, { color: colors.brand }]}>{staff.mobile}</Text>
            </View>
          </View>

          <InfoRow label="Salary" value={staff.salary} />

          {/* ── Add Files ── */}
          <View style={styles.filesSectionHeader}>
            <SectionHeader icon="attachment" title="Add Files" color="#3B82F6" />
          </View>

          {/* Picked files list */}
          {pickedFiles.map((file) => (
            <View
              key={file.uri}
              style={[styles.fileItem, { backgroundColor: colors.bgScreen, borderColor: colors.borderLight }]}
            >
              <MaterialCommunityIcons
                name={file.name.endsWith('.pdf') ? 'file-pdf-box' : file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'file-image-outline' : 'file-document-outline'}
                size={22}
                color={colors.brand}
              />
              <View style={styles.fileItemInfo}>
                <Text style={[styles.fileItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {file.name}
                </Text>
                {file.size ? (
                  <Text style={[styles.fileItemSize, { color: colors.textSecond }]}>
                    {formatSize(file.size)}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => removeFile(file.uri)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={colors.textSecond} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Upload button */}
          <TouchableOpacity
            onPress={pickFile}
            activeOpacity={0.8}
            style={[styles.filesBox, { backgroundColor: colors.bgScreen, borderColor: colors.borderLight }]}
          >
            <MaterialCommunityIcons name="paperclip" size={18} color={colors.brand} />
            <Text style={[styles.filesText, { color: colors.brand }]}>Tap to attach files</Text>
            <Feather name="plus" size={16} color={colors.brand} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* ── Section 2: Emergency Contact ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="alert-circle-outline" title="Emergency Contact Information" color="#EF4444" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Contact Name" value={staff.relationName} />
          <InfoRow label="Relationship" value={staff.relationship} />
          <View style={[styles.contactChipRow]}>
            <View style={[styles.contactChip, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="phone" size={13} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={[styles.contactChipText, { color: '#EF4444' }]}>{staff.emergencyPhone}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 3: Bank Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="bank" title="Bank Information" color="#10B981" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Bank Name" value={staff.bankName} />
          <InfoRow label="Account No." value={staff.bankAccountNo} />
          <InfoRow label="IFSC Code" value={staff.ifscCode} />
        </View>

        {/* ── Section 4: User Login Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="shield-key-outline" title="User Login Information" color="#8B5CF6" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="User Name" value={staff.userName} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <Text style={[styles.infoValue, { letterSpacing: 3 }]}>••••••••</Text>
            </View>
          </View>
          <InfoRow label="Login Type" value={staff.loginType} />
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff')}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabActive} />
          <Text style={[styles.tabText, { color: colors.tabActive }]}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_reports')}>
          <Feather name="bar-chart-2" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      <AdminMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Scroll */
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },

  /* Hero Card */
  heroCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  heroAvatar: { width: 70, height: 70, borderRadius: 35, marginRight: 16 },
  heroAvatarInitials: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroInitialsText: { fontSize: 24, fontWeight: '800' },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '800', marginBottom: 3 },
  heroEmpId: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  heroDesig: { fontSize: 13, fontWeight: '600' },
  heroDivider: { height: 1, marginBottom: 12 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaText: { fontSize: 12, fontWeight: '500' },
  heroMetaDot: { width: 4, height: 4, borderRadius: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 11, fontWeight: '700' },

  /* Sections */
  section: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  sectionDivider: { height: 1, marginBottom: 14 },

  /* Info Rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1.4,
    textAlign: 'right',
  },

  /* Contact chips */
  contactChipRow: { paddingVertical: 6 },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contactChipText: { fontSize: 12, fontWeight: '600' },

  /* Files box */
  filesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  filesText: { fontSize: 13, fontWeight: '500' },

  /* Files section */
  filesSectionHeader: { marginTop: 10, marginBottom: 4 },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  fileItemInfo: { flex: 1 },
  fileItemName: { fontSize: 13, fontWeight: '600' },
  fileItemSize: { fontSize: 11, fontWeight: '500', marginTop: 2 },

  /* Password row */
  passwordRow: { flex: 1.4, alignItems: 'flex-end' },

  /* Bottom Tab Bar */
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
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
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, color: '#64748B', fontWeight: '500' },
});
