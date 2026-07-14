import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AdminMenu from '@/admin/components/AdminMenu';
import apiClient from '@/api/apiClient';
import MaskedPIIText from '@/admin/components/MaskedPIIText';
import { useAuth } from '@/context/AuthContext';
import { storageService, DEFAULT_BASE_URL } from '@/services/storageService';

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

interface CompanyAPIItem {
  companyDetailsID: number;
  logoPath: string | null;
  companyCode: string;
  companyName: string;
  city: string;
  country: string;
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
  email?: string;
  phone?: string;
}

async function constructLogoUrl(logoPath: string | null): Promise<string | null> {
  if (!logoPath) return null;
  let path = logoPath;
  if (path.startsWith('~')) {
    path = path.slice(1);
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  let baseUrl = await storageService.getBaseUrl() || DEFAULT_BASE_URL;
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  return `${baseUrl}${path}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminCompanyDetailScreenProps {
  companyDetailsID?: number;
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

function InfoRow({ label, value, type }: { label: string; value: string; type?: 'email' | 'phone' | 'text' }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {type ? (
        <MaskedPIIText value={value || '—'} type={type} style={[styles.infoValue, { color: colors.textPrimary }]} />
      ) : (
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || '—'}</Text>
      )}
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminCompanyDetailScreen({
  companyDetailsID,
  onBack,
  onNavigate,
}: AdminCompanyDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickedLogo, setPickedLogo] = useState<{ name: string; uri: string; size?: number } | null>(null);

  const [companyData, setCompanyData] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!companyDetailsID) {
      setError('No company selected.');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<{ status: boolean; data: CompanyAPIItem }>('/Company/' + companyDetailsID);
      
      if (response.data && response.data.status && response.data.data) {
        const item = response.data.data;
        
        const logoUrl = await constructLogoUrl(item.logoPath);
        if (logoUrl) {
          setPickedLogo({
            name: 'company_logo.jpg',
            uri: logoUrl,
          });
        } else {
          setPickedLogo(null);
        }
        
        const mappedCompany: CompanyDetail = {
          id: item.companyCode || String(item.companyDetailsID),
          name: item.companyName,
          addressLine1: item.addressLine1 || '---',
          addressLine2: item.addressLine2 || '---',
          city: item.city || '---',
          country: item.country || '---',
          pincode: item.pincode || '---',
          email: item.email || '---',
          phone: item.phone || '---',
          status: 'Active',
          type: item.city || 'Private Limited',
        };
        
        setCompanyData(mappedCompany);
      } else {
        setError('Company not found.');
      }
    } catch (err: any) {
      console.error('Error fetching company details:', err);
      let msg = 'An unexpected error occurred. Please try again later.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'Request timed out. Please try again later.';
      } else if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        msg = 'No internet connection. Please check your network and try again.';
      } else if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          msg = 'Session expired. Redirecting to login...';
          await logout();
          onNavigate?.('login');
        } else if (status === 404) {
          msg = 'Company not found.';
        } else if (status === 500) {
          msg = 'An internal server error occurred. Please try again later.';
        } else if (status === 502 || status === 503 || status === 504) {
          msg = 'Server is currently unavailable. Please try again later.';
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [companyDetailsID]);

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

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ color: colors.textSecond, marginTop: 12, fontSize: 14 }}>Loading company details...</Text>
      </View>
    );
  }

  if (error || !companyData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.brand} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Company Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
            {error || 'Company not found.'}
          </Text>
          <TouchableOpacity
            onPress={fetchDetails}
            style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.brand, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const company = companyData;

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
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{company.name}</Text>
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
          <InfoRow label="E-Mail" value={company.email || ''} type="email" />
          <Divider />
          <InfoRow label="Phone Number" value={company.phone || ''} type="phone" />
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

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_reports')}>
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
