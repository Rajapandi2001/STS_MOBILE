import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssetDetail {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  cost: string;
  assignedTo: string;
  department: string;
  location: string;
  condition: string;
  status: string;
  notes: string;
  image: any;
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const ASSET_DETAILS: Record<string, AssetDetail> = {
  'AST-001': {
    id: 'AST-001',
    name: 'MacBook Pro 16"',
    category: 'Computing',
    brand: 'Apple',
    model: 'MacBook Pro 16" M3',
    serialNumber: 'C02F9823MD6R',
    purchaseDate: '10 Jan 2025',
    warrantyExpiry: '10 Jan 2028',
    cost: '$1,200',
    assignedTo: 'John D.',
    department: 'Engineering',
    location: 'HQ – Desk 12B',
    condition: 'Good',
    status: 'In Use',
    notes: 'Primary work machine. SSD upgraded to 1TB.',
    image: require('../../../assets/images/asset_macbook.png'),
  },
  'AST-002': {
    id: 'AST-002',
    name: 'iPhone 14 Pro',
    category: 'Mobile',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    serialNumber: 'F4G987HKL2',
    purchaseDate: '05 Mar 2024',
    warrantyExpiry: '05 Mar 2026',
    cost: '$999',
    assignedTo: 'Sarah J.',
    department: 'Design',
    location: 'HQ – Desk 07A',
    condition: 'Minor Wear',
    status: 'In Use',
    notes: 'Minor screen scratch on bottom-left corner.',
    image: require('../../../assets/images/asset_iphone.png'),
  },
  'AST-003': {
    id: 'AST-003',
    name: 'Dell UltraSharp 27"',
    category: 'Peripherals',
    brand: 'Dell',
    model: 'UltraSharp U2723QE',
    serialNumber: 'CN-0YVW33-74261',
    purchaseDate: '20 Jun 2024',
    warrantyExpiry: '20 Jun 2027',
    cost: '$620',
    assignedTo: 'Emily W.',
    department: 'Operations',
    location: 'HQ – Desk 03C',
    condition: 'Good',
    status: 'Available',
    notes: 'No damage. USB-C and HDMI ports functional.',
    image: require('../../../assets/images/asset_monitor.png'),
  },
  'AST-004': {
    id: 'AST-004',
    name: 'Mechanical Keyboard',
    category: 'Peripherals',
    brand: 'Keychron',
    model: 'K8 Pro',
    serialNumber: 'KB-20234-MX87',
    purchaseDate: '15 Sep 2023',
    warrantyExpiry: '15 Sep 2025',
    cost: '$150',
    assignedTo: 'Robert K.',
    department: 'Engineering',
    location: 'IT Workshop',
    condition: 'Good',
    status: 'In Use',
    notes: 'RGB backlit. Switches recently lubed.',
    image: require('../../../assets/images/asset_keyboard.png'),
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminAssetDetailScreenProps {
  assetId?: string;
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
  assetId,
  onBack,
  onNavigate,
}: AdminAssetDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const asset = assetId ? ASSET_DETAILS[assetId] : ASSET_DETAILS['AST-001'];

  if (!asset) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Asset not found.
        </Text>
      </View>
    );
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    'In Use':    { bg: colors.successBg, text: colors.success },
    Available:   { bg: colors.amberBg,   text: colors.amber },
    Maintenance: { bg: colors.iconBg,    text: colors.textSecond },
    Retired:     { bg: '#FEE2E2',         text: '#DC2626' },
  };
  const sc = statusColors[asset.status] ?? { bg: colors.iconBg, text: colors.textSecond };

  const conditionColors: Record<string, { bg: string; text: string; icon: 'check-circle' | 'alert-triangle' | 'info' }> = {
    Good:        { bg: colors.successBg, text: colors.success, icon: 'check-circle' },
    'Minor Wear':{ bg: colors.amberBg,   text: colors.amber,   icon: 'alert-triangle' },
    Excellent:   { bg: colors.successBg, text: colors.success, icon: 'check-circle' },
    Fair:        { bg: colors.iconBg,    text: colors.textSecond, icon: 'info' },
  };
  const cc = conditionColors[asset.condition] ?? conditionColors['Fair'];

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Asset Details</Text>
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
            {/* Product Image */}
            <View style={[styles.heroImageBox, { backgroundColor: colors.iconBg }]}>
              <Image source={asset.image} style={styles.heroImage} resizeMode="contain" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{asset.name}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {asset.id}</Text>
              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                <Text style={[styles.statusText, { color: sc.text }]}>{asset.status}</Text>
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
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{asset.category}</Text>
              </View>
            </View>
            <View style={[styles.pillDivider, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="currency-usd" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Cost</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{asset.cost}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Asset Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="package-variant-closed" title="Asset Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Asset Name" value={asset.name} />
          <RowDivider />
          <InfoRow label="Asset ID" value={asset.id} />
          <RowDivider />
          <InfoRow label="Category" value={asset.category} />
          <RowDivider />
          <InfoRow label="Brand" value={asset.brand} />
          <RowDivider />
          <InfoRow label="Model" value={asset.model} />
          <RowDivider />
          <InfoRow label="Serial Number" value={asset.serialNumber} />
        </View>

        {/* ── Condition & Status ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="shield-check-outline" title="Condition & Status" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          {/* Condition with badge */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Condition</Text>
            <View style={[styles.condBadge, { backgroundColor: cc.bg }]}>
              <Feather name={cc.icon} size={12} color={cc.text} />
              <Text style={[styles.condBadgeText, { color: cc.text }]}>{asset.condition}</Text>
            </View>
          </View>
          <RowDivider />
          <InfoRow label="Status" value={asset.status} />
        </View>

        {/* ── Assignment ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="account-arrow-right-outline" title="Assignment" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Assigned To" value={asset.assignedTo} />
          <RowDivider />
          <InfoRow label="Department" value={asset.department} />
          <RowDivider />
          <InfoRow label="Location" value={asset.location} />
        </View>

        {/* ── Lifecycle ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-clock-outline" title="Lifecycle" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Purchase Date" value={asset.purchaseDate} />
          <RowDivider />
          <InfoRow label="Warranty Expiry" value={asset.warrantyExpiry} />
          <RowDivider />
          <InfoRow label="Cost" value={asset.cost} />
        </View>

        {/* ── Notes ── */}
        {asset.notes ? (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <SectionHeader icon="note-text-outline" title="Notes" color="#64748B" />
            <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
            <Text style={[styles.notesText, { color: colors.textSecond }]}>{asset.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_assets', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="cube-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Assets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Staff</Text>
        </TouchableOpacity>
      </View>

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
