import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface DashboardScreenProps {
  onSignOut?: () => void;
}

export default function DashboardScreen({ onSignOut }: DashboardScreenProps) {
  const insets = useSafeAreaInsets();

  // Dynamic Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar grid (starting on Monday)
  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    // firstDayOfMonth.getDay() maps Sun=0, Mon=1, ..., Sat=6
    // We want Mon=0, Tue=1, ..., Sun=6
    let startDayOffset = firstDayOfMonth.getDay();
    if (startDayOffset === 0) {
      startDayOffset = 6;
    } else {
      startDayOffset -= 1;
    }

    const gridItems = [];

    // Previous month's trailing days
    for (let i = startDayOffset - 1; i >= 0; i--) {
      gridItems.push({
        day: totalDaysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, totalDaysInPrevMonth - i),
      });
    }

    // Current month's days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      gridItems.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month's leading days to fill up to multiple of 7
    const totalCells = Math.ceil(gridItems.length / 7) * 7;
    const remainingCells = totalCells - gridItems.length;
    for (let i = 1; i <= remainingCells; i++) {
      gridItems.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    // Chunk gridItems into arrays of 7 (representing rows of a week)
    const chunked = [];
    for (let i = 0; i < gridItems.length; i += 7) {
      chunked.push(gridItems.slice(i, i + 7));
    }
    return chunked;
  };

  // Mock status indicator based on day number for realistic visual styling
  const getDayStatusDot = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const yr = date.getFullYear();
    // Only display indicators for active view month and year
    if (month !== currentDate.getMonth() || yr !== currentDate.getFullYear()) return null;

    // Simulate markers
    if (day === 2 || day === 16) return 'absent';
    if (day === 3 || day === 17) return 'absent';
    if (day === 1 || day === 25) return 'holiday';
    if (day === 15) return 'leave';
    if (day === 20 || day === 21) return 'wfh';
    if (day > 3 && day < 15 && day !== 10) return 'present';
    if (day > 21 && day < 30) return 'present';
    return null;
  };

  const calendarRows = getCalendarGrid();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 90 }, // Added space to not overlay tab bar
        ]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120' }}
              style={styles.avatar}
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>Testing</Text>
              <Text style={styles.profileTitle}>Developer</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Feather name="bell" size={20} color="#1E293B" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Feather name="search" size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>CURRENT STATUS</Text>
            <View style={styles.presentBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.presentText}>PRESENT</Text>
            </View>
          </View>

          <Text style={styles.statusTitle}>Inside: HQ Block A</Text>

          <View style={styles.statusStatsRow}>
            {/* Check-In */}
            <View style={styles.statBox}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons name="login" size={20} color="#0A52D6" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>CHECK-IN</Text>
                <Text style={styles.statValue}>09:00 AM</Text>
              </View>
            </View>

            {/* Worked */}
            <View style={styles.statBox}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons name="hourglass-outline" size={20} color="#0A52D6" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>WORKED</Text>
                <Text style={styles.statValue}>04h 30m</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.statusActionsRow}>
            <TouchableOpacity style={styles.checkInButton} activeOpacity={0.8}>
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkOutButton} activeOpacity={0.8} onPress={onSignOut}>
              <Text style={styles.checkOutButtonText}>Check Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.customizeText}>CUSTOMIZE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsGrid}>
          {/* Row 1 */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: '#EBF2FF' }]}>
                <MaterialCommunityIcons name="calendar-check-outline" size={22} color="#0A52D6" />
              </View>
              <Text style={styles.actionText}>Timesheet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: '#FFF5ED' }]}>
                <MaterialCommunityIcons name="umbrella-beach-outline" size={22} color="#FD8D3C" />
              </View>
              <Text style={styles.actionText}>Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: '#EAF7EE' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={22} color="#22C55E" />
              </View>
              <Text style={styles.actionText}>Expenses</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: '#EEF2FF' }]}>
                <MaterialCommunityIcons name="bank-outline" size={22} color="#6366F1" />
              </View>
              <Text style={styles.actionText}>Payroll</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: '#FDF4FF' }]}>
                <MaterialCommunityIcons name="account-group-outline" size={22} color="#D946EF" />
              </View>
              <Text style={styles.actionText}>Team</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                <MaterialCommunityIcons name="check-decagram-outline" size={22} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Approvals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats / Cards Grid */}
        <View style={styles.statsCardsContainer}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            {/* Card 1: Present Days */}
            <View style={styles.statsCardItem}>
              <Text style={styles.statsLabelText}>PRESENT DAYS</Text>
              <View style={styles.statsContent}>
                <Text style={styles.statsValueText}>18</Text>
                <View style={styles.trendBadge}>
                  <Feather name="arrow-up-right" size={10} color="#22C55E" />
                  <Text style={styles.trendText}>12%</Text>
                </View>
              </View>
            </View>

            {/* Card 2: Leave Balance */}
            <View style={styles.statsCardItem}>
              <Text style={styles.statsLabelText}>LEAVE BALANCE</Text>
              <View style={styles.statsContent}>
                <Text style={styles.statsValueText}>12</Text>
                <Text style={styles.statsSubtitleText}>Days left</Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            {/* Card 3: Claim Status */}
            <View style={styles.statsCardItem}>
              <Text style={styles.statsLabelText}>CLAIM STATUS</Text>
              <View style={styles.statsContent}>
                <Text style={styles.statsValueText}>$420</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>PENDING</Text>
                </View>
              </View>
            </View>

            {/* Card 4: Pending Tasks */}
            <View style={styles.statsCardItem}>
              <Text style={styles.statsLabelText}>PENDING TASKS</Text>
              <View style={styles.statsContent}>
                <Text style={styles.statsValueText}>05</Text>
                <View style={styles.urgentRow}>
                  <View style={styles.redDot} />
                  <Text style={styles.urgentText}>Urgent</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Team Insights Card */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <View style={styles.insightsTitleWrapper}>
              <View style={styles.insightsIconBg}>
                <Feather name="trending-up" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.insightsTitle}>Team Insights</Text>
            </View>
            <View style={styles.realtimeBadge}>
              <Text style={styles.realtimeText}>REAL-TIME</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
            {/* Box 1: Attendance */}
            <View style={styles.insightsMetricBox}>
              <Text style={styles.insightLabel}>ATTENDANCE</Text>
              <Text style={styles.insightValue}>92%</Text>
              <View style={styles.insightProgressBg}>
                <View style={[styles.insightProgressFill, { width: '92%', backgroundColor: '#22C55E' }]} />
              </View>
            </View>

            {/* Box 2: Requests */}
            <View style={styles.insightsMetricBox}>
              <Text style={styles.insightLabel}>REQUESTS</Text>
              <Text style={styles.insightValue}>08</Text>
              <Text style={[styles.insightSubtext, { color: '#FD8D3C' }]}>Action required</Text>
            </View>

            {/* Box 3: Active Now */}
            <View style={styles.insightsMetricBox}>
              <Text style={styles.insightLabel}>ACTIVE</Text>
              <Text style={styles.insightValue}>14</Text>
              <Text style={[styles.insightSubtext, { color: '#64748B' }]}>Currently active</Text>
            </View>
          </ScrollView>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <View style={styles.calendarControls}>
              <TouchableOpacity style={styles.calendarArrow} activeOpacity={0.6} onPress={handlePrevMonth}>
                <Feather name="chevron-left" size={18} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.calendarArrow} activeOpacity={0.6} onPress={handleNextMonth}>
                <Feather name="chevron-right" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Days header */}
            <View style={styles.calendarDaysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.calendarDayHeader}>{day}</Text>
              ))}
            </View>

            {/* Dynamic Month Weeks */}
            {calendarRows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.calendarDaysRow}>
                {row.map((item, cellIdx) => {
                  const isSelected = selectedDate.getDate() === item.day &&
                    selectedDate.getMonth() === item.date.getMonth() &&
                    selectedDate.getFullYear() === item.date.getFullYear();

                  const dotStatus = getDayStatusDot(item.date);

                  return (
                    <TouchableOpacity
                      key={cellIdx}
                      style={styles.calendarDayCell}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (item.isCurrentMonth) {
                          setSelectedDate(item.date);
                        }
                      }}
                    >
                      {isSelected ? (
                        <View style={styles.selectedDayCircle}>
                          <Text style={styles.selectedDayText}>{item.day}</Text>
                        </View>
                      ) : (
                        <Text style={item.isCurrentMonth ? styles.calendarDayText : styles.calendarDayTextGray}>
                          {item.day}
                        </Text>
                      )}

                      {/* Dot Indicator under date */}
                      {!isSelected && dotStatus && (
                        <View style={[
                          {
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            position: 'absolute',
                            bottom: 2,
                          },
                          dotStatus === 'present' && { backgroundColor: '#22C55E' },
                          dotStatus === 'absent' && { backgroundColor: '#EF4444' },
                          dotStatus === 'leave' && { backgroundColor: '#D97706' },
                          dotStatus === 'holiday' && { backgroundColor: '#0A52D6' },
                          dotStatus === 'wfh' && { backgroundColor: '#9333EA' },
                        ]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Calendar Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.legendText}>PRESENT</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>ABSENT</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.legendText}>LEAVE</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0A52D6' }]} />
              <Text style={styles.legendText}>HOLIDAY</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
              <Text style={styles.legendText}>WFH</Text>
            </View>
          </View>
        </View>

        {/* This Week's Celebrations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week's Celebrations</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Feather name="more-horizontal" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Celebrations List */}
        <View style={styles.celebrationsList}>
          {/* Celebration 1 */}
          <View style={styles.celebrationCard}>
            <View style={styles.celebLeft}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' }}
                style={styles.celebAvatar}
              />
              <View style={styles.celebTextContainer}>
                <Text style={styles.celebName}>Sarah Mitchell</Text>
                <Text style={styles.celebSubtitle}>Birthday • Tomorrow</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.celebActionBtn} activeOpacity={0.7}>
              <Text style={styles.celebActionText}>WISH HER</Text>
            </TouchableOpacity>
          </View>

          {/* Celebration 2 */}
          <View style={styles.celebrationCard}>
            <View style={styles.celebLeft}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' }}
                style={styles.celebAvatar}
              />
              <View style={styles.celebTextContainer}>
                <Text style={styles.celebName}>David Chen</Text>
                <Text style={styles.celebSubtitle}>3rd Work Anniversary • May 16</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.celebActionBtn} activeOpacity={0.7}>
              <Text style={styles.celebActionText}>CONGRATULATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.customizeText}>HISTORY</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Timeline */}
        <View style={styles.activityTimeline}>
          {/* Timeline Item 1 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.timelineDot, { backgroundColor: '#0A52D6' }]} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineRightColumn}>
              <Text style={styles.timelineTime}>TODAY, 09:00 AM</Text>
              <Text style={styles.timelineTitle}>Checked In Successfully</Text>
              <Text style={styles.timelineLocation}>Location: Headquarters Block A, Floor 4</Text>
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeftColumn}>
              <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]} />
              {/* No line for last item */}
            </View>
            <View style={styles.timelineRightColumn}>
              <Text style={styles.timelineTime}>YESTERDAY, 04:30 PM</Text>
              <Text style={styles.timelineTitle}>Leave Approved</Text>
              <Text style={styles.timelineLocation}>Annual Leave Request: May 20 - 24 (5 days)</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>

        {/* Horizontal Events List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
          {/* Event 1 */}
          <View style={styles.eventCard}>
            <View style={[styles.eventDateBox, { backgroundColor: '#EBF2FF' }]}>
              <Text style={[styles.eventMonth, { color: '#0A52D6' }]}>MAY</Text>
              <Text style={[styles.eventDay, { color: '#0A52D6' }]}>20</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Town Hall Q2</Text>
              <Text style={styles.eventTime}>10:00 AM • Main Hall</Text>
            </View>
          </View>

          {/* Event 2 */}
          <View style={styles.eventCard}>
            <View style={[styles.eventDateBox, { backgroundColor: '#FFF5ED' }]}>
              <Text style={[styles.eventMonth, { color: '#FD8D3C' }]}>MAY</Text>
              <Text style={[styles.eventDay, { color: '#FD8D3C' }]}>22</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Team Sync</Text>
              <Text style={styles.eventTime}>11:30 AM • Conf Room 3</Text>
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Sticky Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="home" size={22} color="#0A52D6" />
          <Text style={styles.tabTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Feather name="calendar" size={22} color="#64748B" />
          <Text style={styles.tabText}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color="#64748B" />
          <Text style={styles.tabText}>Approvals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Feather name="user" size={22} color="#64748B" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="grid-large" size={22} color="#64748B" />
          <Text style={styles.tabText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  presentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F6E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  presentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  statusStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    marginLeft: 10,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  statusActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInButton: {
    flex: 1,
    backgroundColor: '#0A52D6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  checkOutButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  checkOutButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  customizeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A52D6',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    marginBottom: 24,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statsCardsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCardItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statsLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsValueText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F6E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
    marginLeft: 2,
  },
  statsSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 8,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  insightsCard: {
    backgroundColor: '#EEF2F6',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A52D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 10,
  },
  realtimeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  realtimeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0A52D6',
  },
  insightsScroll: {
    flexDirection: 'row',
  },
  insightsMetricBox: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
  },
  insightLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 6,
  },
  insightProgressBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
  },
  insightProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  insightSubtext: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  calendarControls: {
    flexDirection: 'row',
  },
  calendarArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  calendarGrid: {
    marginBottom: 16,
  },
  calendarDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    height: 36,
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarDayCell: {
    width: '14.28%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  calendarDayTextGray: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  bulletUnderDateBlue: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A52D6',
    position: 'absolute',
    bottom: 0,
  },
  bulletUnderDateRed: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    position: 'absolute',
    bottom: 0,
  },
  selectedDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A52D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 5,
  },
  celebrationsList: {
    marginBottom: 24,
  },
  celebrationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  celebLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  celebAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  celebTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  celebName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  celebSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  celebActionBtn: {
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    backgroundColor: '#F0F6FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  celebActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A52D6',
  },
  activityTimeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  timelineRightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTime: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  timelineLocation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  eventsScroll: {
    flexDirection: 'row',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginRight: 12,
    width: 240,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  eventDateBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventMonth: {
    fontSize: 9,
    fontWeight: '700',
  },
  eventDay: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 1,
  },
  eventDetails: {
    marginLeft: 12,
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
  },
  tabTextActive: {
    fontSize: 10,
    color: '#0A52D6',
    fontWeight: '700',
    marginTop: 3,
  },
});
