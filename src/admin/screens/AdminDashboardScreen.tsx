import React, { useRef, useState } from 'react';
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

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AdminDashboardScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function AdminDashboardScreen({ onNavigate }: AdminDashboardScreenProps) {
  const insets = useSafeAreaInsets();

  // ── Menu overlay state ───────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [employeeExpanded, setEmployeeExpanded] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuOpen(false);
      setEmployeeExpanded(false);
    });
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
    { id: 1, title: 'New Proj',          time: '2h ago',    desc: 'Project Alpha assigned to Dev Team A.',             dotColor: '#0A52D6' },
    { id: 2, title: 'Role Updated',      time: '1h ago',    desc: 'System Admin permissions granted to G. Smith.',     dotColor: '#F59E0B' },
    { id: 3, title: 'Workflow Deployed', time: '3h ago',    desc: 'V2 Expense Approval workflow is now active.',       dotColor: '#64748B' },
    { id: 4, title: 'System Backup',     time: 'Yesterday', desc: 'Automated daily backup completed successfully.',    dotColor: '#22C55E' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AdminConsole</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>AP</Text>
        </View>
      </View>

      {/* ── Main ScrollView ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
          <Text style={styles.welcomeSubtitle}>Here's what's happening today.</Text>
        </View>

        {/* Overview Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overviewScroll}>
          {[
            { label: 'Total Staff', value: '120', badge: '+12%', icon: 'account-group' },
            { label: 'Active Staff', value: '115', badge: '+4%',  icon: 'account-check' },
            { label: 'Clients',      value: '18',  badge: '+2',   icon: 'account-tie' },
            { label: 'Projects',     value: '32',  badge: '+5',   icon: 'briefcase-outline' },
            { label: 'Holidays',     value: '12',  badge: 'Rem',  icon: 'beach', neutral: true },
          ].map((card) => (
            <View key={card.label} style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewLabel}>{card.label}</Text>
                <View style={styles.overviewIconBg}>
                  <MaterialCommunityIcons name={card.icon as any} size={16} color="#0A52D6" />
                </View>
              </View>
              <View style={styles.overviewValueRow}>
                <Text style={styles.overviewValue}>{card.value}</Text>
                <View style={[styles.badgeContainer, card.neutral && styles.badgeNeutral]}>
                  <Text style={[styles.badgeText, card.neutral && styles.badgeTextNeutral]}>
                    {card.badge}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions — 2×3 grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionCard} activeOpacity={0.7}>
              <View style={styles.quickActionIconBg}>
                <MaterialCommunityIcons name={action.icon as any} size={24} color="#0A52D6" />
              </View>
              <Text style={styles.quickActionText}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attendance Analytics */}
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <View>
              <Text style={styles.analyticsTitle}>Attendance Analytics</Text>
              <Text style={styles.analyticsSubtitle}>This Week vs Last Week</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewFullReport}>View full Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <View style={[styles.gridLine, { bottom: '25%' }]} />
            <View style={[styles.gridLine, { bottom: '50%' }]} />
            <View style={[styles.gridLine, { bottom: '75%' }]} />
            <View style={styles.barsRow}>
              {[['50%','Mon'],['70%','Tue'],['40%','Wed'],['90%','Thu'],['60%','Fri']].map(([h, l]) => (
                <View key={l} style={styles.barGroup}>
                  <View style={[styles.bar, { height: h as any }]} />
                  <Text style={styles.barLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Feather name="more-horizontal" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.activityTimeline}>
            {activities.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <View style={[styles.timelineDot, { backgroundColor: item.dotColor }]} />
                  {index < activities.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTitleRow}>
                    <Text style={styles.timelineItemTitle}>{item.title}</Text>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.timelineDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={22} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
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
        {/* Menu tab — opens full-screen overlay */}
        <TouchableOpacity style={styles.tabItem} onPress={openMenu}>
          <Feather name="grid" size={22} color={menuOpen ? '#0A52D6' : '#64748B'} />
          <Text style={[styles.tabText, menuOpen && { color: '#0A52D6' }]}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════════════════════
          FULL-SCREEN MENU OVERLAY — slides in from right
      ══════════════════════════════════════════════════════════════ */}
      {menuOpen && (
        <>
          {/* Semi-transparent backdrop */}
          <Animated.View
            style={[styles.backdrop, { opacity: backdropAnim }]}
            pointerEvents="box-none"
          >
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeMenu} activeOpacity={1} />
          </Animated.View>

          {/* Menu panel */}
          <Animated.View
            style={[
              styles.menuOverlay,
              { paddingTop: insets.top, transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Menu Header — Profile at the top, X button on right */}
            <View style={styles.menuHeader}>
              <View style={styles.profileAvatar}>
                <MaterialCommunityIcons name="account" size={28} color="#0A52D6" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Sarah Jenkins</Text>
                <Text style={styles.profileRole}>HR Admin</Text>
              </View>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Feather name="x" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 90 }}
            >
              <View style={styles.menuDivider} />

              {/* Profile */}
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuIconWrap}>
                  <MaterialCommunityIcons name="account-outline" size={22} color="#0A52D6" />
                </View>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              {/* ERP Master — expandable */}
              <TouchableOpacity
                style={[styles.menuItem, employeeExpanded && styles.menuItemActive]}
                activeOpacity={0.7}
                onPress={() => setEmployeeExpanded(prev => !prev)}
              >
                <View style={styles.menuIconWrap}>
                  <MaterialCommunityIcons name="office-building" size={22} color="#0A52D6" />
                </View>
                <Text style={[styles.menuItemText, employeeExpanded && styles.menuItemTextActive]}>
                  ERP Master
                </Text>
                <Feather
                  name={employeeExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {employeeExpanded && (
                <View style={styles.subMenu}>
                  {['Staff', 'Client', 'Leave Settings', 'User Group', 'Project', 'Holiday', 'Company Details','Assets'].map((item) => (
                    <TouchableOpacity key={item} style={styles.subMenuItem} activeOpacity={0.7}>
                      <Text style={[
                        styles.subMenuText,
                        item === '' && { color: '#0A52D6', fontWeight: '700' } // Highlight selected item as per wireframe
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Roles & Permissions */}
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuIconWrap}>
                  <MaterialCommunityIcons name="shield-account-outline" size={22} color="#0A52D6" />
                </View>
                <Text style={styles.menuItemText}>Roles & Permissions</Text>
              </TouchableOpacity>

              {/* Help */}
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuIconWrap}>
                  <MaterialCommunityIcons name="help-circle-outline" size={22} color="#0A52D6" />
                </View>
                <Text style={styles.menuItemText}>Help</Text>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={styles.menuIconWrap}>
                  <MaterialCommunityIcons name="cog-outline" size={22} color="#0A52D6" />
                </View>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Logout button */}
            <View style={[styles.logoutContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={styles.logoutButton}
                activeOpacity={0.85}
                onPress={() => setLogoutModalVisible(true)}
              >
                <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialCommunityIcons name="logout" size={28} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure want to log out of smart timesheet?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalNoButton}
                activeOpacity={0.8}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalNoButtonText}>No, stay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                activeOpacity={0.8}
                onPress={() => {
                  setLogoutModalVisible(false);
                  closeMenu();
                  setTimeout(() => onNavigate?.('login'), 320);
                }}
              >
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  /* ── Header ── */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0A52D6', letterSpacing: -0.5 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1E3A8A', fontWeight: '700', fontSize: 14 },

  /* ── Scroll ── */
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  welcomeSection: { marginBottom: 20 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, color: '#64748B' },

  /* ── Overview Cards ── */
  overviewScroll: { paddingBottom: 20 },
  overviewCard: { width: 160, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  overviewLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  overviewIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  overviewValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  overviewValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginRight: 8 },
  badgeContainer: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  badgeNeutral: { backgroundColor: '#EFF6FF' },
  badgeTextNeutral: { color: '#0A52D6', fontSize: 10, fontWeight: '700' },

  /* ── Quick Actions ── */
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  quickActionCard: { width: '31%', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  quickActionIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionText: { fontSize: 11, fontWeight: '600', color: '#0F172A', textAlign: 'center' },

  /* ── Analytics ── */
  analyticsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  analyticsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  analyticsTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  analyticsSubtitle: { fontSize: 12, color: '#64748B' },
  viewFullReport: { fontSize: 12, fontWeight: '700', color: '#0A52D6' },
  chartContainer: { height: 180, position: 'relative', marginTop: 10 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F1F5F9' },
  barsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 10 },
  barGroup: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: 30 },
  bar: { width: 24, backgroundColor: '#0A52D6', borderRadius: 4 },
  barLabel: { fontSize: 11, color: '#64748B', marginTop: 8 },

  /* ── Activity ── */
  activityCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  activityTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  activityTimeline: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeftColumn: { alignItems: 'center', marginRight: 16, width: 12 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#F1F5F9', marginTop: -4, marginBottom: -4, zIndex: 1 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineItemTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  timelineTime: { fontSize: 11, color: '#94A3B8' },
  timelineDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  viewAllButton: { marginTop: 10, paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center' },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },

  /* ── Bottom Tab Bar ── */
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, color: '#64748B', fontWeight: '500' },

  /* ── Menu Overlay ── */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '80%',
    backgroundColor: '#FFFFFF',
    zIndex: 20,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeButton: { padding: 4 },

  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 2, borderColor: '#DBEAFE' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  profileRole: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 8 },

  /* Menu Items */
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', marginBottom: 1 },
  menuItemActive: { backgroundColor: '#EFF6FF' },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuItemText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A' },
  menuItemTextActive: { color: '#0A52D6' },

  /* Sub-menu */
  subMenu: { backgroundColor: '#FFFFFF', paddingLeft: 70, paddingBottom: 8, marginBottom: 1 },
  subMenuItem: { paddingVertical: 11, borderLeftWidth: 2, borderLeftColor: '#DBEAFE', paddingLeft: 16, marginLeft: -2 },
  subMenuText: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  /* Logout */
  logoutContainer: { paddingHorizontal: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 16, gap: 10, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  /* Custom Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalNoButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalNoButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  modalYesButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalYesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
