import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import AdminMenu from '@/admin/components/AdminMenu';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AdminDashboardScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  routeParams?: { menuOpen?: boolean };
}

export default function AdminDashboardScreen({ onNavigate, routeParams }: AdminDashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme, colors } = useTheme();

  // ── Menu overlay state ───────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (routeParams?.menuOpen) {
      openMenu();
    }
  }, [routeParams]);

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ── Dashboard data ───────────────────────────────────────────────────────────
  const quickActions = [
    { id: 1, name: 'Client',    icon: 'account-tie-outline' },
    { id: 2, name: 'Project',   icon: 'briefcase-outline' },
    { id: 3, name: 'Holiday',   icon: 'beach' },
    { id: 4, name: 'Leave Set', icon: 'calendar-remove-outline' },
    { id: 5, name: 'Company',   icon: 'office-building-outline' },
    { id: 6, name: 'Assets',    icon: 'package-variant-closed' },
  ];

  const activities = [
    { id: 1, title: 'New Proj',          time: '2h ago',    desc: 'Project Alpha assigned to Dev Team A.',          dotColor: colors.brand },
    { id: 2, title: 'Role Updated',      time: '1h ago',    desc: 'System Admin permissions granted to G. Smith.',  dotColor: colors.amber },
    { id: 3, title: 'Workflow Deployed', time: '3h ago',    desc: 'V2 Expense Approval workflow is now active.',    dotColor: colors.textSecond },
    { id: 4, title: 'System Backup',     time: 'Yesterday', desc: 'Automated daily backup completed successfully.', dotColor: colors.success },
  ];

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bgScreen }, { paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
        {/* Left: Hamburger */}
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
          onPress={openMenu}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        {/* Title */}
        <Text style={[styles.headerTitle, { color: colors.brand }]}>Admin</Text>
        {/* Right: Theme toggle + Bell + Avatar */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.iconBg }]} activeOpacity={0.8} onPress={toggleTheme}>
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIconBtn, { backgroundColor: colors.iconBg }]} 
            activeOpacity={0.8}
            onPress={() => onNavigate?.('admin_alerts')}
          >
            <View>
              <Feather name="bell" size={18} color={colors.brand} />
              <View style={[styles.notifDot, { borderColor: colors.header }]} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('admin_profile', { source: 'header' })}
          >
            <Text style={[styles.avatarText, { color: colors.brandDark }]}>AP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main ScrollView ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Welcome, Admin</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecond }]}>Here's what's happening today.</Text>
        </View>

        {/* Overview Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overviewScroll}>
          {[
            { label: 'Total Staff',  value: '120', badge: '+12%', icon: 'account-group' },
            { label: 'Active Staff', value: '115', badge: '+4%',  icon: 'account-check' },
            { label: 'Clients',      value: '18',  badge: '+2',   icon: 'account-tie' },
            { label: 'Projects',     value: '32',  badge: '+5',   icon: 'briefcase-outline' },
            { label: 'Holidays',     value: '12',  badge: 'Rem',  icon: 'beach', neutral: true },
          ].map((card) => (
            <View key={card.label} style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.overviewHeader}>
                <Text style={[styles.overviewLabel, { color: colors.textSecond }]}>{card.label}</Text>
                <View style={[styles.overviewIconBg, { backgroundColor: colors.iconBg }]}>
                  <MaterialCommunityIcons name={card.icon as any} size={16} color={colors.brand} />
                </View>
              </View>
              <View style={styles.overviewValueRow}>
                <Text style={[styles.overviewValue, { color: colors.textPrimary }]}>{card.value}</Text>
                <View style={[styles.badgeContainer, card.neutral && styles.badgeNeutral, card.neutral && { backgroundColor: colors.iconBg }]}>
                  <Text style={[styles.badgeText, card.neutral && { color: colors.brand }]}>{card.badge}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              activeOpacity={0.7}
              onPress={() => {
                if (action.name === 'Client') onNavigate?.('admin_client', { source: 'dashboard' });
                else if (action.name === 'Leave Set') onNavigate?.('admin_leave_settings', { source: 'dashboard' });
                else if (action.name === 'Project') onNavigate?.('admin_projects', { source: 'dashboard' });
                else if (action.name === 'Holiday') onNavigate?.('admin_holidays', { source: 'dashboard' });
                else if (action.name === 'Company') onNavigate?.('admin_companies', { source: 'dashboard' });
                else if (action.name === 'Assets') onNavigate?.('admin_assets', { source: 'dashboard' });
              }}
            >
              <View style={[styles.quickActionIconBg, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons name={action.icon as any} size={24} color={colors.brand} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attendance Analytics */}
        <View style={[styles.analyticsCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.analyticsHeader}>
            <View>
              <Text style={[styles.analyticsTitle, { color: colors.textPrimary }]}>Attendance Analytics</Text>
              <Text style={[styles.analyticsSubtitle, { color: colors.textSecond }]}>This Week vs Last Week</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.viewFullReport, { color: colors.brand }]}>View full Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <View style={[styles.gridLine, { bottom: '25%', backgroundColor: colors.borderLight }]} />
            <View style={[styles.gridLine, { bottom: '50%', backgroundColor: colors.borderLight }]} />
            <View style={[styles.gridLine, { bottom: '75%', backgroundColor: colors.borderLight }]} />
            <View style={styles.barsRow}>
              {[['50%','Mon'],['70%','Tue'],['40%','Wed'],['90%','Thu'],['60%','Fri']].map(([h, l]) => (
                <View key={l} style={styles.barGroup}>
                  <View style={[styles.bar, { height: h as any, backgroundColor: colors.brand }]} />
                  <Text style={[styles.barLabel, { color: colors.textSecond }]}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={20} color={colors.textSecond} />
            </TouchableOpacity>
          </View>
          <View style={styles.activityTimeline}>
            {activities.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <View style={[styles.timelineDot, { backgroundColor: item.dotColor }]} />
                  {index < activities.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.borderLight }]} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTitleRow}>
                    <Text style={[styles.timelineItemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{item.time}</Text>
                  </View>
                  <Text style={[styles.timelineDesc, { color: colors.textSecond }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={[styles.viewAllButton, { borderColor: colors.border }]}>
            <Text style={[styles.viewAllText, { color: colors.textPrimary }]}>View All Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={22} color={colors.tabActive} />
          <Text style={[styles.tabText, { color: colors.tabActive }]}>Home</Text>
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

      {/* ══ MENU OVERLAY — slides in from left ══ */}
      <AdminMenu
        visible={menuOpen}
        onClose={closeMenu}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Header ── */
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '700', fontSize: 14 },

  /* ── Scroll ── */
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  welcomeSection: { marginBottom: 20 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14 },

  /* ── Overview Cards ── */
  overviewScroll: { paddingBottom: 20 },
  overviewCard: { width: 160, borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  overviewLabel: { fontSize: 12, fontWeight: '600' },
  overviewIconBg: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  overviewValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  overviewValue: { fontSize: 24, fontWeight: '800', marginRight: 8 },
  badgeContainer: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  badgeNeutral: { backgroundColor: '#EFF6FF' },

  /* ── Quick Actions ── */
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  quickActionCard: { width: '31%', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 14, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  quickActionIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  /* ── Analytics ── */
  analyticsCard: { borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  analyticsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  analyticsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  analyticsSubtitle: { fontSize: 12 },
  viewFullReport: { fontSize: 12, fontWeight: '700' },
  chartContainer: { height: 180, position: 'relative', marginTop: 10 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1 },
  barsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 10 },
  barGroup: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: 30 },
  bar: { width: 24, borderRadius: 4 },
  barLabel: { fontSize: 11, marginTop: 8 },

  /* ── Activity ── */
  activityCard: { borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  activityTitle: { fontSize: 16, fontWeight: '700' },
  activityTimeline: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeftColumn: { alignItems: 'center', marginRight: 16, width: 12 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, zIndex: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: -4, marginBottom: -4, zIndex: 1 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineItemTitle: { fontSize: 14, fontWeight: '700' },
  timelineTime: { fontSize: 11 },
  timelineDesc: { fontSize: 13, lineHeight: 18 },
  viewAllButton: { marginTop: 10, paddingVertical: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  viewAllText: { fontSize: 14, fontWeight: '600' },

  /* ── Bottom Tab Bar ── */
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },

});
