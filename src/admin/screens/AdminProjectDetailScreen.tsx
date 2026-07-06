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

export interface ProjectDetail {
  id: string;
  projectName: string;
  projectId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  projectLeader: string;
  status: string;
  color: string;
  iconColor: string;
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  '1': {
    id: '1',
    projectName: 'Alpha Cloud Migration',
    projectId: 'PRJ-2026-001',
    clientName: 'ACME Corporation',
    startDate: '15 Jan 2026',
    endDate: '30 Jun 2026',
    projectLeader: 'James Wilson',
    status: 'Completed',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
  },
  '2': {
    id: '2',
    projectName: 'Beta Fintech Portal',
    projectId: 'PRJ-2026-002',
    clientName: 'Nexus Global Tech',
    startDate: '01 Feb 2026',
    endDate: '15 Sep 2026',
    projectLeader: 'Sarah Jenkins',
    status: 'Active',
    color: '#F0FDF4',
    iconColor: '#16A34A',
  },
  '3': {
    id: '3',
    projectName: 'Gamma Security Audit',
    projectId: 'PRJ-2026-003',
    clientName: 'Starlight Ventures',
    startDate: '10 Mar 2026',
    endDate: '20 May 2026',
    projectLeader: 'Michael Chen',
    status: 'Inactive',
    color: '#FEE2E2',
    iconColor: '#DC2626',
  },
  '4': {
    id: '4',
    projectName: 'Delta Mobile Application',
    projectId: 'PRJ-2026-004',
    clientName: 'Apex Innovations',
    startDate: '01 May 2026',
    endDate: '31 Dec 2026',
    projectLeader: 'Riya Sharma',
    status: 'Pending',
    color: '#FFF7ED',
    iconColor: '#EA580C',
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminProjectDetailScreenProps {
  projectId?: string;
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

export default function AdminProjectDetailScreen({
  projectId,
  onBack,
  onNavigate,
}: AdminProjectDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const project = projectId ? PROJECT_DETAILS[projectId] : PROJECT_DETAILS['1'];

  if (!project) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 40 }}>
          Project not found.
        </Text>
      </View>
    );
  }

  const statusColors = {
    Active:    { bg: colors.successBg,  text: colors.success },
    Inactive:  { bg: colors.iconBg,     text: colors.textSecond },
    Pending:   { bg: colors.amberBg,    text: colors.amber },
    Completed: { bg: '#E0F2FE',         text: '#0284C7' },
  }[project.status] ?? { bg: colors.iconBg, text: colors.textSecond };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Project Details</Text>
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
            <View style={[styles.heroIcon, { backgroundColor: project.color }]}>
              <MaterialCommunityIcons name="rocket-launch" size={28} color={project.iconColor} />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{project.projectName}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {project.projectId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
                <Text style={[styles.statusText, { color: statusColors.text }]}>{project.status}</Text>
              </View>
            </View>
          </View>

          {/* Date pills row */}
          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.datePillsRow}>
            <View style={[styles.datePill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="calendar-start" size={14} color={colors.textSecond} />
              <View style={styles.datePillText}>
                <Text style={[styles.datePillLabel, { color: colors.textSecond }]}>Start Date</Text>
                <Text style={[styles.datePillValue, { color: colors.textPrimary }]}>{project.startDate}</Text>
              </View>
            </View>
            <View style={[styles.datePillArrow, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.datePill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="calendar-end" size={14} color={colors.textSecond} />
              <View style={styles.datePillText}>
                <Text style={[styles.datePillLabel, { color: colors.textSecond }]}>End Date</Text>
                <Text style={[styles.datePillValue, { color: colors.textPrimary }]}>{project.endDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Project Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="briefcase-outline" title="Project Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Project Name" value={project.projectName} />
          <Divider />
          <InfoRow label="Project ID" value={project.projectId} />
          <Divider />
          <InfoRow label="Status" value={project.status} />
        </View>

        {/* ── Client & Team ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="account-tie-outline" title="Client & Team" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Client Name" value={project.clientName} />
          <Divider />
          <InfoRow label="Project Leader" value={project.projectLeader} />
        </View>

        {/* ── Timeline ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-range-outline" title="Timeline" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />

          <InfoRow label="Start Date" value={project.startDate} />
          <Divider />
          <InfoRow label="End Date" value={project.endDate} />
        </View>

      </ScrollView>

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
  container: {
    flex: 1,
  },

  // Header
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
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  heroDivider: {
    height: 1,
    marginVertical: 16,
  },
  datePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePillText: {
    gap: 2,
  },
  datePillLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  datePillValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  datePillArrow: {
    width: 1,
    height: 36,
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
