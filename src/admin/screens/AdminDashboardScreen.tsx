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
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [employeeExpanded, setEmployeeExpanded] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    if (routeParams?.menuOpen) {
      openMenu();
    }
  }, [routeParams]);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 280, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => { setMenuOpen(false); setEmployeeExpanded(false); });
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
        <TouchableOpacity style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]} onPress={openMenu} activeOpacity={0.7}>
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        {/* Title */}
        <Text style={[styles.headerTitle, { color: colors.brand }]}>AdminConsole</Text>
        {/* Right: Theme toggle + Bell + Avatar */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.iconBg }]} activeOpacity={0.8} onPress={toggleTheme}>
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.iconBg }]} activeOpacity={0.8}>
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
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* ══ MENU OVERLAY — slides in from left ══ */}
      {menuOpen && (
        <>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} pointerEvents="box-none">
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeMenu} activeOpacity={1} />
          </Animated.View>

          <Animated.View style={[styles.menuOverlay, { paddingTop: insets.top, backgroundColor: colors.card, transform: [{ translateX: slideAnim }] }]}>
            {/* Menu Header */}
            <View style={[styles.menuHeader, { borderBottomColor: colors.borderLight }]}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}>
                <MaterialCommunityIcons name="account" size={28} color={colors.brand} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.textPrimary }]}>Sarah Jenkins</Text>
                <Text style={[styles.profileRole, { color: colors.textSecond }]}>HR Admin</Text>
              </View>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Feather name="x" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 90 }}>
              <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />

              {/* Profile */}
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
                onPress={() => { closeMenu(); setTimeout(() => onNavigate?.('admin_profile', { source: 'menu' }), 320); }}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
                  <MaterialCommunityIcons name="account-outline" size={22} color={colors.brand} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Profile</Text>
              </TouchableOpacity>

              {/* ERP Master */}
              <TouchableOpacity
                style={[styles.menuItem, employeeExpanded && { backgroundColor: colors.iconBg }]}
                activeOpacity={0.7}
                onPress={() => setEmployeeExpanded(prev => !prev)}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
                  <MaterialCommunityIcons name="office-building" size={22} color={colors.brand} />
                </View>
                <Text style={[styles.menuItemText, employeeExpanded && { color: colors.brand }, { color: employeeExpanded ? colors.brand : colors.textPrimary }]}>
                  ERP Master
                </Text>
                <Feather name={employeeExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecond} />
              </TouchableOpacity>

              {employeeExpanded && (
                <View style={[styles.subMenu, { backgroundColor: colors.card }]}>
                  {['Staff', 'Client', 'Leave Settings', 'User Group', 'Project', 'Holiday', 'Company Details', 'Assets'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.subMenuItem, { borderLeftColor: colors.brandBorder }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (item === 'Staff') { closeMenu(); setTimeout(() => onNavigate?.('admin_staff', { source: 'menu' }), 320); }
                        else if (item === 'Client') { closeMenu(); setTimeout(() => onNavigate?.('admin_client', { source: 'menu' }), 320); }
                        else if (item === 'Leave Settings') { closeMenu(); setTimeout(() => onNavigate?.('admin_leave_settings', { source: 'menu' }), 320); }
                        else if (item === 'User Group') { closeMenu(); setTimeout(() => onNavigate?.('admin_user_groups', { source: 'menu' }), 320); }
                        else if (item === 'Project') { closeMenu(); setTimeout(() => onNavigate?.('admin_projects', { source: 'menu' }), 320); }
                      }}
                    >
                      <Text style={[styles.subMenuText, { color: colors.textSecond }]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Roles & Permissions */}
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} activeOpacity={0.7}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
                  <MaterialCommunityIcons name="shield-account-outline" size={22} color={colors.brand} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Roles & Permissions</Text>
              </TouchableOpacity>

              {/* Help */}
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} activeOpacity={0.7}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
                  <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.brand} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Help</Text>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} activeOpacity={0.7}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
                  <MaterialCommunityIcons name="cog-outline" size={22} color={colors.brand} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Settings</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Logout */}
            <View style={[styles.logoutContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={() => setLogoutModalVisible(true)}>
                <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}

      {/* Logout Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.dangerBg }]}>
              <MaterialCommunityIcons name="logout" size={28} color={colors.danger} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Confirm Logout</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecond }]}>Are you sure want to log out of smart timesheet?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalNoButton, { backgroundColor: colors.cardAlt, borderColor: colors.border }]} activeOpacity={0.8} onPress={() => setLogoutModalVisible(false)}>
                <Text style={[styles.modalNoButtonText, { color: colors.textSecond }]}>No, stay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalYesButton} activeOpacity={0.8} onPress={() => { setLogoutModalVisible(false); closeMenu(); setTimeout(() => onNavigate?.('login'), 320); }}>
                <Text style={styles.modalYesButtonText}>Yes, logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  /* ── Menu Overlay ── */
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 10 },
  menuOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '80%', zIndex: 20, elevation: 20 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1 },
  closeButton: { padding: 4 },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 2 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  profileRole: { fontSize: 13, fontWeight: '500' },
  menuDivider: { height: 1, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 1 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuItemText: { flex: 1, fontSize: 15, fontWeight: '600' },
  subMenu: { paddingLeft: 70, paddingBottom: 8, marginBottom: 1 },
  subMenuItem: { paddingVertical: 11, borderLeftWidth: 2, paddingLeft: 16, marginLeft: -2 },
  subMenuText: { fontSize: 14, fontWeight: '500' },
  logoutContainer: { paddingHorizontal: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 16, gap: 10, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  /* Modal */
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10 },
  modalIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24, fontWeight: '500' },
  modalButtonContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  modalNoButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  modalNoButtonText: { fontSize: 14, fontWeight: '700' },
  modalYesButton: { flex: 1, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  modalYesButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
