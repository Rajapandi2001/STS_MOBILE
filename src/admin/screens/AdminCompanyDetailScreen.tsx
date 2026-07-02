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

export interface CompanyDetail {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  pincode: string;
  email?: string;
  phone?: string;
  logo?: { name: string; uri: string; size?: number };
  status: string;
  type: string;
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const COMPANY_DETAILS: Record<string, CompanyDetail> = {
  'CMP-2026-01': {
    id: 'CMP-2026-01',
    name: 'GLOBAL TECH SOLUTIONS',
    addressLine1: '100 Innovation Way',
    addressLine2: 'Suite 500',
    city: 'San Francisco',
    country: 'United States',
    pincode: '94105',
    email: 'contact@globaltech.com',
    phone: '+1 (555) 019-2834',
    status: 'Active',
    type: 'HQ - Global Tech',
  },
  'CMP-2026-02': {
    id: 'CMP-2026-02',
    name: 'EURO SYSTEMS LTD',
    addressLine1: 'Kaiserstraße 12',
    addressLine2: 'Gebäude B',
    city: 'Frankfurt',
    country: 'Germany',
    pincode: '60311',
    email: 'info@eurosystems.de',
    phone: '+49 69 1234 5678',
    status: 'Active',
    type: 'Branch Office',
  },
  'CMP-2026-03': {
    id: 'CMP-2026-03',
    name: 'PACIFIC TECH CORP',
    addressLine1: '400 George Street',
    addressLine2: 'Level 22',
    city: 'Sydney',
    country: 'Australia',
    pincode: '2000',
    email: 'support@pacifictech.com.au',
    phone: '+61 2 9876 5432',
    status: 'Pending',
    type: 'Subsidiary',
  },
  'CMP-2026-04': {
    id: 'CMP-2026-04',
    name: 'ORIENT INNOVATIONS',
    addressLine1: '1-2-1 Otemachi',
    addressLine2: 'Otemachi Building 7F',
    city: 'Chiyoda-ku, Tokyo',
    country: 'Japan',
    pincode: '100-0004',
    email: 'tokyo@orientinnov.jp',
    phone: '+81 3 5555 1234',
    status: 'Inactive',
    type: 'Branch Office',
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminCompanyDetailScreenProps {
  companyId?: string;
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || '—'}</Text>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminCompanyDetailScreen({
  companyId,
  onBack,
  onNavigate,
}: AdminCompanyDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickedLogo, setPickedLogo] = useState<{ name: string; uri: string; size?: number } | null>(null);

  const company = companyId ? COMPANY_DETAILS[companyId] : COMPANY_DETAILS['CMP-2026-01'];

  if (!company) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Company not found.
        </Text>
      </View>
    );
  }

  const pickLogo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: 'image/*',
        copyToCacheDirectory: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setPickedLogo({
          name: asset.name,
          uri: asset.uri,
          size: asset.size ?? undefined,
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick logo file. Please try again.');
    }
  };

  const removeLogo = () => {
    setPickedLogo(null);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusColors = {
    Active:   { bg: colors.successBg, text: colors.success },
    Inactive: { bg: colors.iconBg,    text: colors.textSecond },
    Pending:  { bg: colors.amberBg,   text: colors.amber },
  }[company.status] ?? { bg: colors.iconBg, text: colors.textSecond };

  const initials = company.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Company Details</Text>
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
        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            {pickedLogo ? (
              <Image source={{ uri: pickedLogo.uri }} style={styles.heroLogoImage} />
            ) : (
              <View style={[styles.heroAvatar, { backgroundColor: colors.brandBorder }]}>
                <Text style={[styles.heroInitials, { color: colors.brand }]}>{initials}</Text>
              </View>
            )}
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]} numberOfLines={1}>{company.name}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {company.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
                <Text style={[styles.statusText, { color: statusColors.text }]}>{company.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── General Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="office-building" title="General Information" color="#10B981" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Company Name" value={company.name} />
          <Divider />
          <InfoRow label="Entity Type" value={company.type} />
          <Divider />
          <InfoRow label="E-Mail" value={company.email || ''} />
          <Divider />
          <InfoRow label="Phone Number" value={company.phone || ''} />
        </View>

        {/* ── Address ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="map-marker-outline" title="Address" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Address Line 1" value={company.addressLine1} />
          <Divider />
          <InfoRow label="Address Line 2" value={company.addressLine2} />
          <Divider />
          <InfoRow label="City" value={company.city} />
          <Divider />
          <InfoRow label="Country" value={company.country} />
          <Divider />
          <InfoRow label="Pincode" value={company.pincode} />
        </View>

        {/* ── Logo Branding (File Upload) ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="image-outline" title="Logo / Branding" color="#3B82F6" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          {pickedLogo ? (
            <View
              style={[styles.fileItem, { backgroundColor: colors.bgScreen, borderColor: colors.borderLight }]}
            >
              <Image source={{ uri: pickedLogo.uri }} style={styles.logoThumbnail} />
              <View style={styles.fileItemInfo}>
                <Text style={[styles.fileItemName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {pickedLogo.name}
                </Text>
                {pickedLogo.size ? (
                  <Text style={[styles.fileItemSize, { color: colors.textSecond }]}>
                    {formatSize(pickedLogo.size)}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={removeLogo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={colors.textSecond} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickLogo}
              activeOpacity={0.8}
              style={[styles.filesBox, { backgroundColor: colors.bgScreen, borderColor: colors.borderLight }]}
            >
              <MaterialCommunityIcons name="paperclip" size={18} color={colors.brand} />
              <Text style={[styles.filesText, { color: colors.brand }]}>Upload Company Logo</Text>
              <Feather name="plus" size={16} color={colors.brand} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <AdminMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
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
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroLogoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroInitials: {
    fontSize: 24,
    fontWeight: '800',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 3,
  },
  heroId: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1.4,
    textAlign: 'right',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
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
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  // Document styles
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
  logoThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
