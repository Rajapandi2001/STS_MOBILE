import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdminProjectsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const PROJECTS_DATA = [
  {
    id: '1',
    name: 'ALPHA CLOUD MIGRATION',
    projectId: 'PRJ-2026-001',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
    status: 'Completed',
  },
  {
    id: '2',
    name: 'BETA FINTECH PORTAL',
    projectId: 'PRJ-2026-002',
    startDate: '2026-02-01',
    endDate: '2026-09-15',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    status: 'Active',
  },
  {
    id: '3',
    name: 'GAMMA SECURITY AUDIT',
    projectId: 'PRJ-2026-003',
    startDate: '2026-03-10',
    endDate: '2026-05-20',
    color: '#FEE2E2',
    iconColor: '#DC2626',
    status: 'Inactive',
  },
  {
    id: '4',
    name: 'DELTA MOBILE APPLICATION',
    projectId: 'PRJ-2026-004',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    status: 'Pending',
  },
];

export default function AdminProjectsScreen({ onNavigate, onBack }: AdminProjectsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const renderStatusBadge = (status: string) => {
    let bgColor = '#DCFCE7';
    let textColor = '#16A34A';
    if (status === 'Inactive') {
      bgColor = '#F1F5F9';
      textColor = '#64748B';
    } else if (status === 'Pending') {
      bgColor = '#FFEDD5';
      textColor = '#EA580C';
    } else if (status === 'Completed') {
      bgColor = '#E0F2FE';
      textColor = '#0284C7';
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: textColor }]} />
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      project.name.toLowerCase().includes(query) ||
      project.projectId.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack?.()}>
          <View style={{ gap: 4, alignItems: 'flex-start' }}>
            <View style={{ width: 20, height: 2, borderRadius: 2, backgroundColor: '#64748B' }} />
            <View style={{ width: 14, height: 2, borderRadius: 2, backgroundColor: '#64748B' }} />
            <View style={{ width: 20, height: 2, borderRadius: 2, backgroundColor: '#64748B' }} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Projects</Text>
        <View style={styles.avatarCircle}>
          <Feather name="user" size={20} color="#0A52D6" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Active Projects by Name or Code..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Section Header */}
        <Text style={styles.sectionHeader}>COMPANY PROJECT INDEX LEDGER</Text>

        {/* Projects List */}
        {filteredProjects.map((project) => {
          return (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardInfoRow}>
                  <View style={[styles.iconContainer, { backgroundColor: project.color }]}>
                    <MaterialCommunityIcons name="rocket-launch" size={24} color={project.iconColor} />
                  </View>
                  <View>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectIdText}>ID: {project.projectId}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.projectDivider} />

              <View style={styles.projectDetailsRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={styles.detailValue}>{project.startDate}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>End Date</Text>
                  <Text style={styles.detailValue}>{project.endDate}</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                {renderStatusBadge(project.status)}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Tab Bar */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  projectIdText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0A52D6',
    borderColor: '#0A52D6',
  },
  projectDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  projectDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
