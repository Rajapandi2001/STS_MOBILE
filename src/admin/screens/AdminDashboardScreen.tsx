import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface AdminDashboardScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function AdminDashboardScreen({ onNavigate }: AdminDashboardScreenProps) {
  const insets = useSafeAreaInsets();

  const quickActions = [
    { id: 1, name: 'Create User', icon: 'account-plus-outline', solid: true },
    { id: 2, name: 'Manage Roles', icon: 'shield-account-outline', solid: false },
    { id: 3, name: 'Departments', icon: 'office-building-outline', solid: false },
    { id: 4, name: 'Settings', icon: 'cog-outline', solid: false },
    { id: 5, name: 'Holiday Cal', icon: 'calendar-month-outline', solid: false },
    { id: 6, name: 'Workflow', icon: 'sitemap-outline', solid: false },
    { id: 7, name: 'Reports', icon: 'chart-line', solid: false },
    { id: 8, name: 'Audit Logs', icon: 'clipboard-text-outline', solid: false },
  ];

  const activities = [
    {
      id: 1,
      title: 'New User Created',
      time: '10m ago',
      desc: 'Admin added Sarah Connor to Engineering Dept.',
      dotColor: '#0A52D6', // blue
    },
    {
      id: 2,
      title: 'Role Updated',
      time: '1h ago',
      desc: 'System Admin permissions granted to G. Smith.',
      dotColor: '#F59E0B', // orange
    },
    {
      id: 3,
      title: 'Workflow Deployed',
      time: '3h ago',
      desc: 'V2 Expense Approval workflow is now active.',
      dotColor: '#64748B', // gray
    },
    {
      id: 4,
      title: 'System Backup',
      time: 'Yesterday',
      desc: 'Automated daily backup completed successfully.',
      dotColor: '#22C55E', // green
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="menu" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AdminConsole</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>AP</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, Admin</Text>
          <Text style={styles.welcomeSubtitle}>Here's what's happening today.</Text>
        </View>

        {/* Overview Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.overviewScroll}
        >
          {/* Card 1 */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewLabel}>Total Employees</Text>
              <View style={styles.overviewIconBg}>
                <MaterialCommunityIcons name="account-group" size={16} color="#0A52D6" />
              </View>
            </View>
            <View style={styles.overviewValueRow}>
              <Text style={styles.overviewValue}>12,450</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>+12%</Text>
              </View>
            </View>
          </View>

          {/* Card 2 */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewLabel}>Active Users</Text>
              <View style={styles.overviewIconBg}>
                <MaterialCommunityIcons name="account-check" size={16} color="#0A52D6" />
              </View>
            </View>
            <View style={styles.overviewValueRow}>
              <Text style={styles.overviewValue}>842</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>+4%</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionCard} activeOpacity={0.7}>
              <View
                style={[
                  styles.quickActionIconBg,
                  action.solid ? { backgroundColor: '#0A52D6' } : { backgroundColor: '#EBF2FF' },
                ]}
              >
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={24}
                  color={action.solid ? '#FFFFFF' : '#0A52D6'}
                />
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

          {/* Chart Mockup */}
          <View style={styles.chartContainer}>
            {/* Grid Lines */}
            <View style={[styles.gridLine, { bottom: '25%' }]} />
            <View style={[styles.gridLine, { bottom: '50%' }]} />
            <View style={[styles.gridLine, { bottom: '75%' }]} />

            {/* Bars */}
            <View style={styles.barsRow}>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: '50%' }]} />
                <Text style={styles.barLabel}>Mon</Text>
              </View>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: '70%' }]} />
                <Text style={styles.barLabel}>Tue</Text>
              </View>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: '40%' }]} />
                <Text style={styles.barLabel}>Wed</Text>
              </View>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: '90%' }]} />
                <Text style={styles.barLabel}>Thu</Text>
              </View>
              <View style={styles.barGroup}>
                <View style={[styles.bar, { height: '60%' }]} />
                <Text style={styles.barLabel}>Fri</Text>
              </View>
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

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="view-grid" size={24} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={24} color="#64748B" />
          <Text style={styles.tabText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="chart-box-outline" size={24} color="#64748B" />
          <Text style={styles.tabText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bell" size={22} color="#64748B" />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="settings" size={22} color="#64748B" />
          <Text style={styles.tabText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // very light bluish-gray background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A52D6',
    letterSpacing: -0.5,
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
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  overviewScroll: {
    paddingBottom: 20,
  },
  overviewCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  overviewIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 10,
  },
  badgeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  quickActionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  analyticsSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  viewFullReport: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A52D6',
  },
  chartContainer: {
    height: 180,
    position: 'relative',
    marginTop: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barGroup: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 30,
  },
  bar: {
    width: 24,
    backgroundColor: '#0A52D6',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityTimeline: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timelineDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  viewAllButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
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
});
