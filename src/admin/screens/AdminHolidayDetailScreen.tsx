import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HolidayDetail {
  id: string;
  name: string;
  emoji: string;
  date: string;
  dayOfWeek: string;
  month: string;
  year: string;
  type: string;
  region: string;
  applicableTo: string;
  description: string;
  status: string;
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

function formatDateStringDetail(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminHolidayDetailScreenProps {
  holidayId?: string;
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

function Divider() {
  return <View style={styles.rowDivider} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminHolidayDetailScreen({
  holidayId,
  onBack,
  onNavigate,
}: AdminHolidayDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [holidayData, setHolidayData] = useState<HolidayDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!holidayId) {
      setError('No holiday selected.');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<{ status: boolean; data: HolidayAPIItem }>('/Holiday/' + holidayId);
      
      if (response.data && response.data.status && response.data.data) {
        const item = response.data.data;
        const d = new Date(item.date);
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = isNaN(d.getTime()) ? '---' : days[d.getDay()];
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = isNaN(d.getTime()) ? '---' : months[d.getMonth()];
        const year = isNaN(d.getTime()) ? '---' : String(d.getFullYear());
        
        const status = getHolidayStatus(item.date);
        const emoji = getHolidayEmoji(item.holidayName);
        const formattedDate = formatDateStringDetail(item.date);
        
        const mappedHoliday: HolidayDetail = {
          id: String(item.holidayId),
          name: item.holidayName,
          emoji,
          date: formattedDate,
          dayOfWeek,
          month,
          year,
          type: 'Public Holiday',
          region: 'Nationwide',
          applicableTo: 'All Employees',
          description: `Observed public holiday for ${item.holidayName}.`,
          status,
        };
        
        setHolidayData(mappedHoliday);
      } else {
        setError('Holiday not found.');
      }
    } catch (err: any) {
      console.error('Error fetching holiday details:', err);
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
        } else if (status === 404) {
          msg = 'Holiday not found.';
        } else if (status === 500) {
          msg = 'An internal server error occurred. Please try again later.';
        } else if (status === 502 || status === 503 || status === 504) {
          msg = 'Server is currently unavailable. Please try again later.';
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [holidayId]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ color: colors.textSecond, marginTop: 12, fontSize: 14 }}>Loading holiday details...</Text>
      </View>
    );
  }

  if (error || !holidayData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.brand} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Holiday Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
            {error || 'Holiday not found.'}
          </Text>
          <TouchableOpacity
            onPress={fetchDetails}
            style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.brand, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const holiday = holidayData;

  const statusColors: Record<string, { bg: string; text: string }> = {
    Active:  { bg: colors.successBg, text: colors.success },
    Passed:  { bg: colors.iconBg,    text: colors.textSecond },
    Pending: { bg: colors.amberBg,   text: colors.amber },
  };
  const sc = statusColors[holiday.status] ?? { bg: colors.iconBg, text: colors.textSecond };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <AdminHeader
        title="Holiday Details"
        showBackButton={true}
        onBackPress={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: colors.brandBorder }]}>
              <Feather name="calendar" size={30} color={colors.brand} />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: colors.textPrimary }]}>{holiday.name}</Text>
              <Text style={[styles.heroId, { color: colors.textSecond }]}>ID: {holiday.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
                <Text style={[styles.statusText, { color: sc.text }]}>{holiday.status}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="calendar-today" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Date</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{holiday.date}</Text>
              </View>
            </View>
            <View style={[styles.pillDivider, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.pill, { backgroundColor: colors.bgScreen }]}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={colors.textSecond} />
              <View style={styles.pillText}>
                <Text style={[styles.pillLabel, { color: colors.textSecond }]}>Type</Text>
                <Text style={[styles.pillValue, { color: colors.textPrimary }]}>{holiday.type}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Holiday Information ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-star" title="Holiday Information" color="#2563EB" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Holiday Name" value={holiday.name} />
          <Divider />
          <InfoRow label="Holiday ID" value={holiday.id} />
          <Divider />
          <InfoRow label="Type" value={holiday.type} />
          <Divider />
          <InfoRow label="Status" value={holiday.status} />
        </View>

        {/* ── Date & Schedule ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="calendar-clock-outline" title="Date & Schedule" color="#059669" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Date" value={holiday.date} />
          <Divider />
          <InfoRow label="Day" value={holiday.dayOfWeek} />
          <Divider />
          <InfoRow label="Month" value={holiday.month} />
          <Divider />
          <InfoRow label="Year" value={holiday.year} />
        </View>

        {/* ── Applicability ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="account-group-outline" title="Applicability" color="#7C3AED" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow label="Region" value={holiday.region} />
          <Divider />
          <InfoRow label="Applicable To" value={holiday.applicableTo} />
        </View>

        {/* ── Description ── */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <SectionHeader icon="note-text-outline" title="Description" color="#D97706" />
          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.descText, { color: colors.textSecond }]}>{holiday.description}</Text>
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
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

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  heroCard: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  heroEmoji: { fontSize: 30 },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  heroId: { fontSize: 12, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  heroDivider: { height: 1, marginVertical: 16 },
  pillsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pillText: { gap: 2 },
  pillLabel: { fontSize: 11, fontWeight: '500' },
  pillValue: { fontSize: 13, fontWeight: '700' },
  pillDivider: { width: 1, height: 36 },

  section: { borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', letterSpacing: 0.2 },
  sectionDivider: { height: 1, marginBottom: 4 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1.5, textAlign: 'right' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9' },

  descText: { fontSize: 13, lineHeight: 20, fontWeight: '400', paddingBottom: 14, paddingTop: 4 },

  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
