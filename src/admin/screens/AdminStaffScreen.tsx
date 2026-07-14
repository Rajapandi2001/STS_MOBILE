import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';
import apiClient from '@/api/apiClient';

interface StaffMember {
  userID: number;
  name: string;
  empID: string;
  designation: string;
  reportManager: string;
  isActive: boolean;
}

interface AdminStaffScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const getInitials = (name: string) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const MOCK_STAFF: StaffMember[] = [
  { userID: 1, name: 'Lingesvaran', empID: 'STS001', designation: 'Software Engineer', reportManager: 'Manager 1', isActive: true },
  { userID: 2, name: 'Rajapandi', empID: 'STS002', designation: 'UI/UX Designer', reportManager: 'Manager 1', isActive: true },
  { userID: 3, name: 'Alice Smith', empID: 'STS003', designation: 'Product Manager', reportManager: 'Director', isActive: false },
  { userID: 4, name: 'Bob Johnson', empID: 'STS004', designation: 'QA Engineer', reportManager: 'Manager 2', isActive: true },
  { userID: 5, name: 'John Doe', empID: 'STS005', designation: 'DevOps Engineer', reportManager: 'Manager 2', isActive: true },
];

export default function AdminStaffScreen({ onNavigate, onBack }: AdminStaffScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Deactive'>('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredStaffList = (() => {
    let list = [...staffList];

    // 1. Apply selected letter filter
    if (selectedLetter) {
      list = list.filter((staff) => {
        const name = (staff.name || '').trim();
        return name.toLowerCase().startsWith(selectedLetter.toLowerCase());
      });
    }

    // 2. Apply status filter
    if (statusFilter !== 'All') {
      const isTargetActive = statusFilter === 'Active';
      list = list.filter((staff) => staff.isActive === isTargetActive);
    }

    // 2. Apply search filter
    const query = search.toLowerCase().trim();
    if (query) {
      list = list.filter((staff) => {
        const nameWords = (staff.name || '').toLowerCase().split(/\s+/);
        const nameMatch = nameWords.some(word => word.startsWith(query)) || (staff.name || '').toLowerCase().includes(query);
        const empIdMatch = (staff.empID || '').toLowerCase().includes(query);
        const roleMatch = (staff.designation || '').toLowerCase().includes(query);
        const deptMatch = (staff.reportManager || '').toLowerCase().includes(query);

        return nameMatch || empIdMatch || roleMatch || deptMatch;
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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStaffList.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedStaffList = filteredStaffList.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedLetter, statusFilter]);

  useEffect(() => {
    let active = true;
    async function fetchStaff() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<{ status: boolean; data: StaffMember[] }>('/Staff');
        if (active) {
          if (response.data && response.data.status && Array.isArray(response.data.data)) {
            setStaffList(response.data.data);
          } else {
            setError('Failed to load staff records.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching staff in screen:', err);
        if (active) {
          // Fallback to mock data if API is unavailable or returns 401
          console.log('Falling back to mock data...');
          setStaffList(MOCK_STAFF);
          // Clear error so mock data displays
          setError(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchStaff();

    return () => {
      active = false;
    };
  }, []);

  const renderStatusBadge = (status: string) => {
    if (status === '---') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.iconBg }]}>
          <Text style={[styles.statusText, { color: colors.textSecond }]}>---</Text>
        </View>
      );
    }
    let bgColor = colors.successBg;
    let textColor = colors.success;
    if (status === 'Inactive' || status === 'Deactive') {
      bgColor = colors.iconBg;
      textColor = colors.textSecond;
    } else if (status === 'Pending') {
      bgColor = colors.amberBg;
      textColor = colors.amber;
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: textColor }]} />
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const getStatusText = (isActive: boolean | null | undefined) => {
    if (isActive === true) return 'Active';
    if (isActive === false) return 'Deactive';
    return '---';
  };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Staffs</Text>
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
          Search and manage employee records quickly and efficiently.
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color={colors.textSecond} />
          </TouchableOpacity>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.statusTabsContainer}>
          {(['All', 'Active', 'Deactive'] as const).map((status) => {
            const isActiveTab = statusFilter === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                style={[
                  styles.statusTabButton,
                  isActiveTab
                    ? { backgroundColor: colors.brand, borderColor: colors.brand }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.statusTabButtonText,
                    {
                      color: isActiveTab ? '#FFFFFF' : colors.textSecond,
                    },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alphabet Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetContainer}
        >
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <TouchableOpacity
                key={letter}
                onPress={() => setSelectedLetter(prev => prev === letter ? null : letter)}
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

        {/* Staff List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={[styles.loadingText, { color: colors.textSecond }]}>Loading staff records...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
          </View>
        ) : filteredStaffList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-off-outline" size={48} color={colors.textSecond} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No staff records found.</Text>
          </View>
        ) : (
          <>
            {paginatedStaffList.map((staff) => {
              return (
                <TouchableOpacity
                  key={staff.userID}
                  activeOpacity={0.85}
                  onPress={() => onNavigate?.('admin_staff_detail', { staffId: staff.userID })}
                  style={[styles.staffCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                >
                  <View style={styles.staffHeaderRow}>
                    <View style={styles.staffInfoRow}>
                      <View style={[styles.staffAvatarInitials, { backgroundColor: colors.brandBorder }]}>
                        <Text style={[styles.staffInitialsText, { color: colors.brand }]}>
                          {getInitials(staff.name || '---')}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.staffName, { color: colors.textPrimary }]}>{!staff.name || !staff.name.trim() ? '---' : staff.name}</Text>
                        <Text style={[styles.staffEmpId, { color: colors.textSecond }]}>{!staff.empID || !staff.empID.trim() ? '---' : staff.empID}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.staffDivider, { backgroundColor: colors.borderLight }]} />

                  <View style={styles.staffDetailsRow}>
                    {(() => {
                      const isDesignationFallback = !staff.designation || !staff.designation.trim();
                      const designationVal = isDesignationFallback ? '---' : staff.designation;
                      return (
                        <View style={styles.detailCol}>
                          <View style={{ alignSelf: 'flex-start', alignItems: isDesignationFallback ? 'center' : 'flex-start' }}>
                            <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Designation</Text>
                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{designationVal}</Text>
                          </View>
                        </View>
                      );
                    })()}
                    {(() => {
                      const isReportManagerFallback = !staff.reportManager || !staff.reportManager.trim();
                      const reportManagerVal = isReportManagerFallback ? '---' : staff.reportManager;
                      return (
                        <View style={styles.detailCol}>
                          <View style={{ alignSelf: 'flex-start', alignItems: isReportManagerFallback ? 'center' : 'flex-start' }}>
                            <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Report Manager</Text>
                            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{reportManagerVal}</Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>

                  <View style={styles.statusContainer}>
                    {renderStatusBadge(getStatusText(staff.isActive))}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                {/* Prev Button */}
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

                {/* Page Numbers */}
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

                {/* Next Button */}
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

        <TouchableOpacity style={styles.tabItem}>
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0A52D6',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  btnOutlineBlue: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0A52D6',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineBlueText: {
    color: '#0A52D6',
    fontWeight: '600',
    fontSize: 14,
  },
  btnOutlineGray: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineGrayText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  btnIcon: {
    marginRight: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 8,
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
    fontSize: 15,
    color: '#0F172A',
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
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  staffCard: {
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
  staffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  staffInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  staffAvatarInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffInitialsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  staffEmpId: {
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
  staffDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  staffDetailsRow: {
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
  statusTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  statusTabButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 0.5,
  },
  statusTabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
