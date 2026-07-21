import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/apiClient';
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiAssetDetail {
  assetID: number;
  assetCode: string;
  dateOfPurchase: string | null;
  currency: string | null;
  costOfPurchase: string | null;
  assetType: string | null;
  assetDetails: string | null;
  serialNumber: string | null;
  empName: string | null;
  description: string | null;
  note: string | null;
  country: string | null;
  currencyType: number | null;
  warrenty: string | null;
  supplier_Name: string | null;
  sup_mobilenumber: string | null;
  sup_Address: string | null;
  stock: boolean;
  fromDate: string | null;
  toDate: string | null;
  createdDate: string | null;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminAssetDetailScreenProps {
  assetID?: string | number;
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminAssetDetailScreen({
  assetID,
  onBack,
  onNavigate,
}: AdminAssetDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [asset, setAsset] = useState<ApiAssetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssetDetail = async () => {
    if (!assetID) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.get(`http://smartdigitalbuild360.com:91/STSMobileAPI/api/Asset/${assetID}`);
      if (response.data && response.data.status && response.data.statusCode === 200) {
        setAsset(response.data.data);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to fetch asset details.');
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          await AsyncStorage.clear();
          onNavigate?.('login');
        } else if (error.response.status === 404) {
          Alert.alert('Not Found', 'The requested resource was not found.');
        } else if (error.response.status === 500) {
          Alert.alert('Server Error', 'Internal server error occurred.');
        } else {
          Alert.alert('Error', error.response.data?.message || 'An unexpected error occurred.');
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'No response received from the server. Please check your internet connection or timeout.');
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAssetDetail();
  }, [assetID]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${MM}/${yyyy}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!asset) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Asset not found.
        </Text>
      </View>
    );
  }

  const statusText = asset.stock ? 'In Stock' : 'Assigned';
  const sc = asset.stock 
    ? { bg: colors.successBg, text: colors.success } 
    : { bg: colors.amberBg, text: colors.amber };

  const typeLower = (asset.assetType || '').toLowerCase();
  let imageSource = require('../../../assets/images/asset_macbook.png');
  if (typeLower.includes('phone') || typeLower.includes('mobile')) {
    imageSource = require('../../../assets/images/asset_iphone.png');
  } else if (typeLower.includes('monitor') || typeLower.includes('display')) {
    imageSource = require('../../../assets/images/asset_monitor.png');
  } else if (typeLower.includes('keyboard')) {
    imageSource = require('../../../assets/images/asset_keyboard.png');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <AdminHeader
        title="Asset Details"
        showBackButton={true}
        onBackPress={onBack}
      />


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            {/* Product Image */}
            <View style={[styles.heroImageBox, { backgroundColor: colors.iconBg }]}>
              <Image source={imageSource} style={styles.heroImage} resizeMode="contain" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{asset.assetCode || '-'}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {asset.assetID}</Text>
              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                <Text style={[styles.statusText, { color: sc.text }]}>{statusText}</Text>
              </View>
            </View>
          </View>

          {/* Pills: Category + Cost */}
          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Category</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{asset.assetType || '-'}</Text>
              </View>
            </View>
            <View style={[styles.pillDivider, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="currency-usd" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Cost</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{asset.costOfPurchase || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Asset Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="package-variant-closed" title="Asset Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Asset Code" value={asset.assetCode} />
          <RowDivider />
          <InfoRow label="Asset Type" value={asset.assetType || ''} />
          <RowDivider />
          <InfoRow label="Asset Details" value={asset.assetDetails || ''} />
          <RowDivider />
          <InfoRow label="Serial Number" value={asset.serialNumber || ''} />
          <RowDivider />
          <InfoRow label="Description" value={asset.description || ''} />
        </View>

        {/* ── Assignment ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="account-arrow-right-outline" title="Assignment" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Assigned To" value={asset.empName || ''} />
          <RowDivider />
          <InfoRow label="Country" value={asset.country || ''} />
          <RowDivider />
          <InfoRow label="From Date" value={formatDate(asset.fromDate)} />
          <RowDivider />
          <InfoRow label="To Date" value={asset.toDate || ''} />
        </View>

        {/* ── Lifecycle & Cost ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-clock-outline" title="Lifecycle & Cost" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Purchase Date" value={formatDate(asset.dateOfPurchase)} />
          <RowDivider />
          <InfoRow label="Cost of Purchase" value={asset.costOfPurchase || ''} />
          <RowDivider />
          <InfoRow label="Currency" value={asset.currency || ''} />
          <RowDivider />
          <InfoRow label="Currency Type" value={asset.currencyType != null ? String(asset.currencyType) : ''} />
          <RowDivider />
          <InfoRow label="Warranty" value={asset.warrenty || ''} />
          <RowDivider />
          <InfoRow label="Created Date" value={formatDate(asset.createdDate)} />
        </View>

        {/* ── Supplier Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="truck-outline" title="Supplier Information" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Supplier Name" value={asset.supplier_Name || ''} />
          <RowDivider />
          <InfoRow label="Mobile Number" value={asset.sup_mobilenumber || ''} />
          <RowDivider />
          <InfoRow label="Address" value={asset.sup_Address || ''} />
        </View>

        {/* ── Notes ── */}
        {asset.note ? (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <SectionHeader icon="note-text-outline" title="Notes" color="#64748B" />
            <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
            <Text style={[styles.notesText, { color: colors.textSecond }]}>{asset.note}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <AdminBottomTabNavigator
        activeTab={undefined}
        onTabPress={(tab) => {
          if (tab === 'home') {
            onNavigate?.('admin_dashboard');
          } else {
            onNavigate?.(`admin_${tab}`);
          }
        }}
      />

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  // Hero Card
  heroCard: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroImageBox: { width: 80, height: 80, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0, overflow: 'hidden' },
  heroImage: { width: 72, height: 72 },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  heroId:   { fontSize: 12, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  heroDivider: { height: 1, marginVertical: 16 },

  // Pills
  pillsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pillText: { gap: 2 },
  pillLabel: { fontSize: 11, fontWeight: '500' },
  pillValue: { fontSize: 13, fontWeight: '700' },
  pillDivider: { width: 1, height: 36 },

  // Sections
  section: { borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', letterSpacing: 0.2 },
  sectionDivider: { height: 1, marginBottom: 4 },

  // Info Rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1.5, textAlign: 'right' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9' },

  // Condition badge inline
  condBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  condBadgeText: { fontSize: 12, fontWeight: '600' },

  // Notes
  notesText: { fontSize: 13, lineHeight: 20, fontWeight: '400', paddingBottom: 14, paddingTop: 4 },

  // Bottom Tab Bar
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
