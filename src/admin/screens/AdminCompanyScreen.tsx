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
import { useAuth } from '@/context/AuthContext';

interface AdminCompanyScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface CompanyAPIItem {
  companyDetailsID: number;
  logoPath: string | null;
  companyCode: string;
  companyName: string;
  city: string;
  country: string;
}

export default function AdminCompanyScreen({ onNavigate, onBack }: AdminCompanyScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { logout } = useAuth();

  const [companies, setCompanies] = useState<CompanyAPIItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCardPress = (id: number) => {
    onNavigate?.('admin_company_detail', { companyDetailsID: id });
  };

  useEffect(() => {
    let active = true;
    async function fetchCompanies() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<{ status: boolean; data: CompanyAPIItem[] }>('/Company');
        if (active) {
          if (response.data && response.data.status && Array.isArray(response.data.data)) {
            setCompanies(response.data.data);
          } else {
            setError('Failed to load company records.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching companies in screen:', err);
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
              await logout();
              onNavigate?.('login');
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

    fetchCompanies();

    return () => {
      active = false;
    };
  }, [logout, onNavigate]);

  const mappedCompanies = companies.map((item) => {
    return {
      companyDetailsID: item.companyDetailsID,
      code: item.companyCode,
      name: item.companyName,
      country: item.country,
      type: item.city || 'Private Limited',
      status: 'Active',
    };
  });

  const filteredCompanies = mappedCompanies.filter((company) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      company.name.toLowerCase().includes(query) ||
      company.country.toLowerCase().includes(query) ||
      company.code.toLowerCase().includes(query)
    );
  });

  const renderStatusBadge = (status: string) => {
    let bgColor = colors.successBg;
    let textColor = colors.success;
    if (status === 'Inactive') {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Companies</Text>
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
          Manage company information and organizational details.
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search companies..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Company List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={[styles.loadingText, { color: colors.textSecond }]}>Loading companies...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
          </View>
        ) : filteredCompanies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="office-building" size={48} color={colors.textSecond} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No companies found.</Text>
          </View>
        ) : (
          filteredCompanies.map((company) => {
            return (
              <TouchableOpacity
                key={company.companyDetailsID}
                activeOpacity={0.8}
                onPress={() => handleCardPress(company.companyDetailsID)}
                style={[
                  styles.staffCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderLight
                  }
                ]}
              >
                <View style={styles.staffHeaderRow}>
                  <View style={[styles.staffInfoRow, { flex: 1 }]}>
                    <View style={[styles.staffAvatarInitials, { backgroundColor: colors.brandBorder }]}>
                      <MaterialCommunityIcons
                        name="office-building"
                        size={22}
                        color={colors.brand}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.staffName, { color: colors.textPrimary }]}>{company.name}</Text>
                      <Text style={[styles.staffEmpId, { color: colors.textSecond }]}>{company.code}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.staffDivider, { backgroundColor: colors.borderLight }]} />

                <View style={styles.staffDetailsRow}>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Country</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{company.country}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Entity Type</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{company.type}</Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  {renderStatusBadge(company.status)}
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
    borderWidth: 1.5,
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
  staffAvatarInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
