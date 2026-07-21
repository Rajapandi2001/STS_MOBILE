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
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/context/AuthContext';

interface AdminHolidayScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface HolidayAPIItem {
  holidayId: number;
  holidayName: string;
  holidayCode: string;
  date: string;
}

function getHolidayStatus(dateStr: string): 'Passed' | 'Active' {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(dateStr);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() < today.getTime() ? 'Passed' : 'Active';
  } catch {
    return 'Active';
  }
}

function getHolidayEmoji(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('new year') || lowerName.includes('newyear')) return '🎉';
  if (lowerName.includes('pongal') || lowerName.includes('sankranti')) return '🌾';
  if (lowerName.includes('diwali') || lowerName.includes('deepavali')) return '🪔';
  if (lowerName.includes('eid') || lowerName.includes('ramadan') || lowerName.includes('milad')) return '🌙';
  if (lowerName.includes('republic') || lowerName.includes('independence') || lowerName.includes('national')) return '🇮🇳';
  if (lowerName.includes('christmas') || lowerName.includes('xmas')) return '🎄';
  if (lowerName.includes('good friday') || lowerName.includes('easter') || lowerName.includes('friday')) return '🕊️';
  if (lowerName.includes('labor') || lowerName.includes('labour') || lowerName.includes('worker') || lowerName.includes('may day')) return '🛠️';
  if (lowerName.includes('gandhi')) return '👓';
  if (lowerName.includes('shivratri') || lowerName.includes('shiva')) return '🔱';
  if (lowerName.includes('ganesh') || lowerName.includes('vinayaka')) return '🐘';
  if (lowerName.includes('dussehra') || lowerName.includes('ayudha') || lowerName.includes('pooja') || lowerName.includes('puja')) return '🌸';
  if (lowerName.includes('holi')) return '🎨';
  if (lowerName.includes('thanksgiving')) return '🦃';
  return '📅';
}

function formatDateString(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export default function AdminHolidayScreen({ onNavigate, onBack }: AdminHolidayScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { logout } = useAuth();

  const [holidays, setHolidays] = useState<HolidayAPIItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'passed'>('all');

  const handleCardPress = (id: string) => {
    onNavigate?.('admin_holiday_detail', { holidayId: id });
  };

  useEffect(() => {
    let active = true;
    async function fetchHolidays() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<{ status: boolean; data: HolidayAPIItem[] }>('/Holiday');
        if (active) {
          if (response.data && response.data.status && Array.isArray(response.data.data)) {
            setHolidays(response.data.data);
          } else {
            setError('Failed to load holiday records.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching holidays in screen:', err);
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

    fetchHolidays();

    return () => {
      active = false;
    };
  }, [logout, onNavigate]);

  const mappedHolidays = holidays.map((item) => {
    const status = getHolidayStatus(item.date);
    const emoji = getHolidayEmoji(item.holidayName);
    const formattedDate = formatDateString(item.date);
    return {
      id: item.holidayId.toString(),
      name: item.holidayName,
      code: item.holidayCode,
      date: formattedDate,
      emoji,
      status,
    };
  });

  const filteredHolidays = mappedHolidays.filter((holiday) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || (
      holiday.name.toLowerCase().includes(query) ||
      holiday.date.toLowerCase().includes(query) ||
      holiday.code.toLowerCase().includes(query)
    );

    if (filterMode === 'active') {
      return matchesSearch && holiday.status === 'Active';
    }
    if (filterMode === 'passed') {
      return matchesSearch && holiday.status === 'Passed';
    }
    return matchesSearch;
  });

  const renderStatusBadge = (status: string) => {
    let bgColor = colors.successBg;
    let textColor = colors.success;
    if (status === 'Passed') {
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
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <AdminHeader
        title="Holidays"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('admin_alerts')}
        onProfilePress={() => onNavigate?.('admin_profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
          View and manage company holiday schedules.
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search holidays..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterMode === 'all'
                ? { backgroundColor: colors.brand }
                : { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }
            ]}
            onPress={() => setFilterMode('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === 'all' ? { color: '#FFF' } : { color: colors.textSecond }
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterMode === 'active'
                ? { backgroundColor: colors.brand }
                : { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }
            ]}
            onPress={() => setFilterMode('active')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === 'active' ? { color: '#FFF' } : { color: colors.textSecond }
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterMode === 'passed'
                ? { backgroundColor: colors.brand }
                : { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }
            ]}
            onPress={() => setFilterMode('passed')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === 'passed' ? { color: '#FFF' } : { color: colors.textSecond }
              ]}
            >
              Passed
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Holiday List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={[styles.loadingText, { color: colors.textSecond }]}>Loading holidays...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
          </View>
        ) : filteredHolidays.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={colors.textSecond} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No holidays found.</Text>
          </View>
        ) : (
          filteredHolidays.map((holiday) => {
            return (
              <TouchableOpacity
                key={holiday.id}
                activeOpacity={0.8}
                onPress={() => handleCardPress(holiday.id)}
                style={[
                  styles.staffCard,
                  { backgroundColor: colors.card, borderColor: colors.borderLight }
                ]}
              >
                <View style={styles.staffHeaderRow}>
                  <View style={styles.staffInfoRow}>
                    <View style={[styles.staffAvatarInitials, { backgroundColor: colors.brandBorder }]}>
                      <Feather name="calendar" size={20} color={colors.brand} />
                    </View>
                    <View>
                      <Text style={[styles.staffName, { color: colors.textPrimary }]}>{holiday.name}</Text>
                      <Text style={[styles.staffEmpId, { color: colors.textSecond }]}>{holiday.code}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.staffDivider, { backgroundColor: colors.borderLight }]} />

                <View style={styles.staffDetailsRow}>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Date</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{holiday.date}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: colors.textSecond }]}>Type</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>Public Holiday</Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  {renderStatusBadge(holiday.status)}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
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
  emojiText: {
    fontSize: 22,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
