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
  },
  {
    id: '2',
    name: 'BETA FINTECH PORTAL',
    projectId: 'PRJ-2026-002',
    startDate: '2026-02-01',
    endDate: '2026-09-15',
    color: '#F0FDF4',
    iconColor: '#16A34A',
  },
  {
    id: '3',
    name: 'GAMMA SECURITY AUDIT',
    projectId: 'PRJ-2026-003',
    startDate: '2026-03-10',
    endDate: '2026-05-20',
    color: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    id: '4',
    name: 'DELTA MOBILE APPLICATION',
    projectId: 'PRJ-2026-004',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    color: '#FFF7ED',
    iconColor: '#EA580C',
  },
];

export default function AdminProjectsScreen({ onNavigate, onBack }: AdminProjectsScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      project.name.toLowerCase().includes(query) ||
      project.projectId.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack?.()}>
          <Feather name="arrow-left" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Projects</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>AP</Text>
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
        {filteredProjects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: project.color }]}>
                <MaterialCommunityIcons name="rocket-launch" size={24} color={project.iconColor} />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectIdText}>ID: {project.projectId}</Text>
              </View>
            </View>

            <View style={styles.projectDivider} />

            <View style={styles.projectDetailsRow}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Start Date</Text>
                <Text style={styles.detailValue}>{project.startDate}</Text>
              </View>
              <View style={styles.detailColRight}>
                <Text style={styles.detailLabelRight}>End Date</Text>
                <Text style={styles.detailValueRight}>{project.endDate}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color="#64748B" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color="#64748B" />
          <Text style={styles.tabText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color="#64748B" />
          <Text style={styles.tabText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bell" size={22} color="#64748B" />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard', { menuOpen: true })}>
          <Feather name="grid" size={22} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Menu</Text>
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
  titleCol: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  projectIdText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  projectDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  projectDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  detailLabelRight: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    textAlign: 'right',
  },
  detailValueRight: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'right',
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
