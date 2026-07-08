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

export default function AdminStaffScreen({ onNavigate, onBack }: AdminStaffScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          let msg = 'An unexpected error occurred. Please try again later.';
          if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            msg = 'Request timed out. Please try again later.';
          } else if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
            msg = 'No internet connection. Please check your network and try again.';
          } else if (err.response) {
            const status = err.response.status;
            if (status === 401) {
              msg = 'Session expired. Redirecting to login...';
            } else if (status === 500) {
              msg = 'An internal server error occurred. Please try again later.';
            } else if (status === 502 || status === 503 || status === 504) {
              msg = 'Server is currently unavailable. Please try again later.';
            }
          }
          setError(msg);
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

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

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
        ) : staffList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-off-outline" size={48} color={colors.textSecond} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No staff records found.</Text>
          </View>
        ) : (
          staffList.filter((staff) => {
            const query = search.toLowerCase().trim();
            if (!query) return true;

            const nameWords = staff.name.toLowerCase().split(' ');
            const nameMatch = nameWords.some(word => word.startsWith(query)) || staff.name.toLowerCase().includes(query);
            const empIdMatch = (staff.empID || '').toLowerCase().includes(query);
            const roleMatch = (staff.designation || '').toLowerCase().includes(query);
            const deptMatch = (staff.reportManager || '').toLowerCase().includes(query);

            return nameMatch || empIdMatch || roleMatch || deptMatch;
          }).map((staff) => {
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
          })
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
});
