import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ClientDetail {
  id: string;
  companyName: string;
  clientId: string;
  reference: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  postalCode: string;
  status: string;
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const CLIENT_DETAILS: Record<string, ClientDetail> = {
  '1': {
    id: '1',
    companyName: 'ACME Corporation',
    clientId: 'CLN-2026-901',
    reference: 'REF-ACME-001',
    email: 'info@acme.com',
    mobile: '+1 (555) 234-5678',
    addressLine1: '100 Industrial Blvd',
    addressLine2: 'Suite 400',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    status: 'Active',
  },
  '2': {
    id: '2',
    companyName: 'Nexus Global Tech',
    clientId: 'CLN-2026-443',
    reference: 'REF-NGT-002',
    email: 'contact@nexus.io',
    mobile: '+44 20 7946 0982',
    addressLine1: '22 Tech Park Avenue',
    addressLine2: 'Floor 3',
    city: 'London',
    country: 'United Kingdom',
    postalCode: 'EC1A 1BB',
    status: 'Active',
  },
  '3': {
    id: '3',
    companyName: 'Starlight Ventures',
    clientId: 'CLN-2025-012',
    reference: 'REF-SLV-003',
    email: 'partnerships@star.co',
    mobile: '+65 6123 4567',
    addressLine1: '8 Marina Boulevard',
    addressLine2: '',
    city: 'Singapore',
    country: 'Singapore',
    postalCode: '018981',
    status: 'Inactive',
  },
  '4': {
    id: '4',
    companyName: 'Apex Innovations',
    clientId: 'CLN-2026-778',
    reference: 'REF-APX-004',
    email: 'partnerships@apex.in',
    mobile: '+91 98765 12340',
    addressLine1: '14 Cyber Hub, DLF Phase 2',
    addressLine2: 'Block B, 2nd Floor',
    city: 'Gurugram',
    country: 'India',
    postalCode: '122002',
    status: 'Pending',
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminClientDetailScreenProps {
  clientId?: string;
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.rowDivider} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminClientDetailScreen({
  clientId,
  onBack,
  onNavigate,
}: AdminClientDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const client = clientId ? CLIENT_DETAILS[clientId] : CLIENT_DETAILS['1'];

  if (!client) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Client not found.
        </Text>
      </View>
    );
  }

  const statusColors = {
    Active:   { bg: colors.successBg, text: colors.success },
    Inactive: { bg: colors.iconBg,    text: colors.textSecond },
    Pending:  { bg: colors.amberBg,   text: colors.amber },
  }[client.status] ?? { bg: colors.iconBg, text: colors.textSecond };

  const initials = client.companyName
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
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Client Details</Text>
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
            <View style={[styles.heroAvatar, { backgroundColor: colors.brandBorder }]}>
              <Text style={[styles.heroInitials, { color: colors.brand }]}>{initials}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{client.companyName}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {client.clientId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
                <Text style={[styles.statusText, { color: statusColors.text }]}>{client.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Contact Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="card-account-details-outline" title="Contact Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Company Name" value={client.companyName} />
          <Divider />
          <InfoRow label="Reference" value={client.reference} />
          <Divider />
          <InfoRow label="Email" value={client.email} />
          <Divider />
          <InfoRow label="Mobile" value={client.mobile} />
        </View>

        {/* ── Address ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="map-marker-outline" title="Address" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Address Line 1" value={client.addressLine1} />
          {!!client.addressLine2 && (
            <>
              <Divider />
              <InfoRow label="Address Line 2" value={client.addressLine2} />
            </>
          )}
          <Divider />
          <InfoRow label="City" value={client.city} />
          <Divider />
          <InfoRow label="Country" value={client.country} />
          <Divider />
          <InfoRow label="Postal Code" value={client.postalCode} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },

  // Hero Card
  heroCard: {
    borderRadius: 16,
    padding: 20,
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
    gap: 16,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInitials: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroId: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Sections
  section: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  sectionDivider: {
    height: 1,
    marginBottom: 4,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Bottom Tab Bar
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
});
