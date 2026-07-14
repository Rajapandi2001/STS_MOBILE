import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

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
  {
    id: '5',
    name: 'EPSILON E-COMMERCE API',
    projectId: 'PRJ-2026-005',
    startDate: '2026-06-01',
    endDate: '2026-11-30',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
    status: 'Active',
  },
  {
    id: '6',
    name: 'ZETA DATACENTER MIGRATION',
    projectId: 'PRJ-2026-006',
    startDate: '2026-07-01',
    endDate: '2026-10-31',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    status: 'Active',
  },
  {
    id: '7',
    name: 'ETA DEVOPS PIPELINE',
    projectId: 'PRJ-2026-007',
    startDate: '2026-08-01',
    endDate: '2027-01-31',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    status: 'Pending',
  },
  {
    id: '8',
    name: 'THETA AI CHATBOT',
    projectId: 'PRJ-2026-008',
    startDate: '2026-09-01',
    endDate: '2027-03-31',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
    status: 'Active',
  },
  {
    id: '9',
    name: 'IOTA BLOCKCHAIN NETWORK',
    projectId: 'PRJ-2026-009',
    startDate: '2026-10-01',
    endDate: '2027-04-30',
    color: '#FEE2E2',
    iconColor: '#DC2626',
    status: 'Inactive',
  },
  {
    id: '10',
    name: 'KAPPA LOGISTICS SYSTEM',
    projectId: 'PRJ-2026-010',
    startDate: '2026-11-01',
    endDate: '2027-05-31',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    status: 'Completed',
  },
  {
    id: '11',
    name: 'LAMBDA ANNOTATION TOOL',
    projectId: 'PRJ-2026-011',
    startDate: '2026-12-01',
    endDate: '2027-02-28',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    status: 'Active',
  },
  {
    id: '12',
    name: 'MU CORE REFACTORING',
    projectId: 'PRJ-2026-012',
    startDate: '2027-01-01',
    endDate: '2027-06-30',
    color: '#EFF6FF',
    iconColor: '#0A52D6',
    status: 'Pending',
  },
];

export default function AdminProjectsScreen({ onNavigate, onBack }: AdminProjectsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const renderStatusBadge = (status: string) => {
    let bgColor = colors.successBg;
    let textColor = colors.success;
    if (status === 'Hold' || status === 'Inactive') {
      bgColor = colors.iconBg;
      textColor = colors.textSecond;
    } else if (status === 'Pending') {
      bgColor = colors.amberBg;
      textColor = colors.amber;
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

  const filteredProjects = (() => {
    let list = [...PROJECTS_DATA];

    // 1. Apply selected letter filter
    if (selectedLetter) {
      list = list.filter((project) => {
        const name = (project.name || '').trim();
        return name.toLowerCase().startsWith(selectedLetter.toLowerCase());
      });
    }

    // 2. Apply search filter
    const query = search.toLowerCase().trim();
    if (query) {
      list = list.filter((project) => {
        return (
          project.name.toLowerCase().includes(query) ||
          project.projectId.toLowerCase().includes(query)
        );
      });

      // 3. Sort so that names starting with query show at the top
      list.sort((a, b) => {
        const aName = (a.name || '').trim().toLowerCase();
        const bName = (b.name || '').trim().toLowerCase();
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Fallback to alphabetical sort
        return aName.localeCompare(bName);
      });
    } else {
      // Sort alphabetically by name
      list.sort((a, b) => {
        const aName = (a.name || '').trim().toLowerCase();
        const bName = (b.name || '').trim().toLowerCase();
        return aName.localeCompare(bName);
      });
    }

    return list;
  })();

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedLetter]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Projects</Text>
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
        <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
          Search projects and monitor their progress.
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search Projects..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color={colors.textSecond} />
          </TouchableOpacity>
        </View>

        {/* Alphabet Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetContainer}
        >
          {['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')].map((letter) => {
            const isSelected = selectedLetter === letter || (letter === 'All' && !selectedLetter);
            return (
              <TouchableOpacity
                key={letter}
                onPress={() => setSelectedLetter(letter === 'All' ? null : letter)}
                style={[
                  styles.alphabetButton,
                  {
                    backgroundColor: isSelected ? colors.brand : colors.card,
                    borderColor: isSelected ? colors.brand : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.alphabetButtonText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecond,
                    },
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 8 }]} />

        {/* Section Header */}
        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>COMPANY PROJECT INDEX LEDGER</Text>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-off-outline" size={48} color={colors.textSecond} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No projects found.</Text>
          </View>
        ) : (
          <>
            {paginatedProjects.map((project) => {
              return (
                <TouchableOpacity
                  key={project.id}
                  activeOpacity={0.8}
                  onPress={() => onNavigate?.('admin_project_detail', { projectId: project.id })}
                  style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardInfoRow}>
                      <View style={[styles.iconContainer, { backgroundColor: project.color }]}>
                        <MaterialCommunityIcons name="rocket-launch" size={24} color={project.iconColor} />
                      </View>
                      <View>
                        <Text style={[styles.projectName, { color: colors.textPrimary }]}>{project.name}</Text>
                        <Text style={[styles.projectIdText, { color: colors.textSecond }]}>ID: {project.projectId}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.projectDivider, { backgroundColor: colors.borderLight }]} />

                  <View style={styles.projectDetailsRow}>
                    <View style={styles.detailCol}>
                      <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Start Date</Text>
                      <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{project.startDate}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={[styles.detailLabel, { color: colors.textSecond }]}>End Date</Text>
                      <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{project.endDate}</Text>
                    </View>
                  </View>

                  <View style={styles.statusContainer}>
                    {renderStatusBadge(project.status)}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={[
                    styles.paginationArrowButton,
                    currentPage === 1 && styles.paginationButtonDisabled,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={currentPage === 1 ? colors.textMuted : colors.textPrimary}
                  />
                </TouchableOpacity>

                <View style={styles.pageNumbersRow}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    if (totalPages > 5) {
                      const shouldShow =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1;

                      if (!shouldShow) {
                        if (pageNum === 2 && currentPage > 3) {
                          return (
                            <Text key="ellipsis-start" style={[styles.paginationEllipsis, { color: colors.textSecond }]}>
                              ...
                            </Text>
                          );
                        }
                        if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                          return (
                            <Text key="ellipsis-end" style={[styles.paginationEllipsis, { color: colors.textSecond }]}>
                              ...
                            </Text>
                          );
                        }
                        return null;
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={pageNum}
                        onPress={() => setCurrentPage(pageNum)}
                        style={[
                          styles.pageNumberButton,
                          isActive
                            ? { backgroundColor: colors.brand, borderColor: colors.brand, borderWidth: 1 }
                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pageNumberText,
                            { color: isActive ? '#FFFFFF' : colors.textSecond },
                          ]}
                        >
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={[
                    styles.paginationArrowButton,
                    currentPage === totalPages && styles.paginationButtonDisabled,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={currentPage === totalPages ? colors.textMuted : colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
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
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
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
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 12,
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
  alphabetContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alphabetButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 0.5,
  },
  alphabetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },
  paginationArrowButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 0.5,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }) as any,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  pageNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageNumberButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 0.5,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }) as any,
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  paginationEllipsis: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
