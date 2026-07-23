import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '@/manager/components/ManagerMenu';
import ManagerHeader from '../components/ManagerHeader';
import ManagerBottomTabNavigator from '../components/ManagerBottomTabNavigator';

interface ManagerReportsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

type ReportType = 'attendance' | 'leave' | 'claims';

export default function ManagerReportsScreen({ onNavigate, onBack }: ManagerReportsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // States
  const [selectedType, setSelectedType] = useState<ReportType>('attendance');
  const [selectedDateRange, setSelectedDateRange] = useState('Oct 01, 2023 - Oct 31, 2023');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');

  // Dropdown visibility states
  const [dateDropdownVisible, setDateDropdownVisible] = useState(false);
  const [teamDropdownVisible, setTeamDropdownVisible] = useState(false);

  // Export Loading States
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Recent Reports View All state
  const [viewAllRecent, setViewAllRecent] = useState(false);

  const dateRangeOptions = [
    'Oct 01, 2023 - Oct 31, 2023',
    'Today',
    'Yesterday',
    'This Week',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Last Month',
  ];

  const teamOptions = [
    'All Teams',
    'Engineering',
    'Design',
    'Product Management',
    'Quality Assurance',
    'Operations',
  ];

  const recentReports = [
    {
      id: '1',
      title: 'Q3 Productivity Summary',
      timestamp: 'Generated Oct 28, 09:41 AM',
      type: 'pdf',
    },
    {
      id: '2',
      title: 'Oct Attendance Log',
      timestamp: 'Generated Oct 25, 14:20 PM',
      type: 'excel',
    },
    {
      id: '3',
      title: 'Leave Balances YTD',
      timestamp: 'Generated Oct 15, 11:05 AM',
      type: 'pdf',
    },
    {
      id: '4',
      title: 'September Travel Claims',
      timestamp: 'Generated Oct 05, 16:30 PM',
      type: 'pdf',
    },
    {
      id: '5',
      title: 'Q3 Asset Distribution Log',
      timestamp: 'Generated Oct 02, 10:15 AM',
      type: 'excel',
    },
  ];

  const handleExport = (format: 'Excel' | 'PDF') => {
    if (format === 'Excel') {
      setExportingExcel(true);
      setTimeout(() => {
        setExportingExcel(false);
        Alert.alert(
          'Export Successful',
          `Report exported as Excel sheet for ${selectedTeam} (${selectedDateRange}).`
        );
      }, 1500);
    } else {
      setExportingPdf(true);
      setTimeout(() => {
        setExportingPdf(false);
        Alert.alert(
          'Export Successful',
          `Report exported as PDF document for ${selectedTeam} (${selectedDateRange}).`
        );
      }, 1500);
    }
  };

  const handleRecentReportPress = (reportTitle: string) => {
    Alert.alert('Report Details', `Opening preview for "${reportTitle}"...`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen || '#F8FAFC' }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* ── Header ── */}
<<<<<<< Updated upstream
      <ManagerHeader
        title="Reports"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('manager_alerts')}
        onProfilePress={() => onNavigate?.('manager_profile')}
      />
=======
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: colors.iconBg }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={20} color={colors.brand} />
          </TouchableOpacity>

        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: colors.iconBg, marginRight: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: colors.iconBg, marginRight: 12 }]}
            activeOpacity={0.7}
            onPress={() => onNavigate?.('manager_alerts')}
          >
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('manager_profile')}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150' }}
                style={styles.avatarImage}
              />
              <View style={styles.activeDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
>>>>>>> Stashed changes

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Reports Hub</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecond }]}>
            Generate and manage team performance and operational reports.
          </Text>
        </View>

        {/* ── Report Type Grid ── */}
        <View style={styles.gridContainer}>
          {/* Top row: Attendance & Leave */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.gridCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedType === 'attendance' && { borderColor: colors.brand, borderWidth: 1.5 },
              ]}
              onPress={() => setSelectedType('attendance')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="clock" size={18} color="#2563EB" />
              </View>
              <Text style={[styles.gridCardTitle, { color: colors.textPrimary }]}>Attendance</Text>
              <Text style={[styles.gridCardDesc, { color: colors.textSecond }]}>Timesheets & Hours</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gridCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedType === 'leave' && { borderColor: colors.brand, borderWidth: 1.5 },
              ]}
              onPress={() => setSelectedType('leave')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Feather name="calendar" size={18} color="#EA580C" />
              </View>
              <Text style={[styles.gridCardTitle, { color: colors.textPrimary }]}>Leave</Text>
              <Text style={[styles.gridCardDesc, { color: colors.textSecond }]}>Balances & History</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom row: Claims (Full Width) */}
          <TouchableOpacity
            style={[
              styles.wideGridCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedType === 'claims' && { borderColor: colors.brand, borderWidth: 1.5 },
            ]}
            onPress={() => setSelectedType('claims')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.wideCardText}>
              <Text style={[styles.gridCardTitle, { color: colors.textPrimary, marginTop: 0 }]}>Claims</Text>
              <Text style={[styles.gridCardDesc, { color: colors.textSecond, marginTop: 2 }]}>
                Expenses & Allowances
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Report Parameters Card ── */}
        <View style={[styles.paramCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.paramCardTitle, { color: colors.textPrimary }]}>Report Parameters</Text>
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Date Range Selector */}
          <View style={styles.dropdownWrapper}>
            <Text style={[styles.dropdownLabel, { color: colors.textSecond }]}>Date Range</Text>
            <TouchableOpacity
              style={[styles.dropdownSelector, { backgroundColor: colors.input || '#F8FAFC', borderColor: colors.border }]}
              onPress={() => setDateDropdownVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeft}>
                <Feather name="calendar" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                <Text style={[styles.dropdownSelectedText, { color: colors.textPrimary }]}>
                  {selectedDateRange}
                </Text>
              </View>
              <Feather name="chevron-down" size={16} color={colors.textSecond} />
            </TouchableOpacity>
          </View>

          {/* Team / Department Selector */}
          <View style={styles.dropdownWrapper}>
            <Text style={[styles.dropdownLabel, { color: colors.textSecond }]}>Team / Department</Text>
            <TouchableOpacity
              style={[styles.dropdownSelector, { backgroundColor: colors.input || '#F8FAFC', borderColor: colors.border }]}
              onPress={() => setTeamDropdownVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeft}>
                <Feather name="users" size={16} color={colors.textSecond} style={{ marginRight: 8 }} />
                <Text style={[styles.dropdownSelectedText, { color: colors.textPrimary }]}>
                  {selectedTeam}
                </Text>
              </View>
              <Feather name="chevron-down" size={16} color={colors.textSecond} />
            </TouchableOpacity>
          </View>

          {/* Export Buttons */}
          <View style={styles.buttonContainer}>
            {/* Export Excel */}
            <TouchableOpacity
              style={[styles.exportExcelBtn, { borderColor: colors.brand }]}
              onPress={() => handleExport('Excel')}
              disabled={exportingExcel || exportingPdf}
              activeOpacity={0.8}
            >
              {exportingExcel ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <>
                  <MaterialCommunityIcons name="file-excel-outline" size={18} color={colors.brand} style={{ marginRight: 8 }} />
                  <Text style={[styles.exportExcelText, { color: colors.brand }]}>Export Excel</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Export PDF */}
            <TouchableOpacity
              style={[styles.exportPdfBtn, { backgroundColor: colors.brand }]}
              onPress={() => handleExport('PDF')}
              disabled={exportingExcel || exportingPdf}
              activeOpacity={0.8}
            >
              {exportingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.exportPdfText}>Export PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Reports ── */}
        <View style={styles.recentReportsSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>Recent Reports</Text>
            <TouchableOpacity onPress={() => setViewAllRecent(!viewAllRecent)} activeOpacity={0.7}>
              <Text style={[styles.viewAllText, { color: colors.brand }]}>
                {viewAllRecent ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {(viewAllRecent ? recentReports : recentReports.slice(0, 3)).map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[styles.recentItemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleRecentReportPress(report.title)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.reportIconBg,
                    { backgroundColor: report.type === 'pdf' ? '#FFF5F5' : '#E6F4EA' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={report.type === 'pdf' ? 'file-pdf-box' : 'file-excel-outline'}
                    size={22}
                    color={report.type === 'pdf' ? '#EF4444' : '#10B981'}
                  />
                </View>

                <View style={styles.reportDetails}>
                  <Text style={[styles.reportItemTitle, { color: colors.textPrimary }]}>
                    {report.title}
                  </Text>
                  <Text style={[styles.reportTimestamp, { color: colors.textSecond }]}>
                    {report.timestamp}
                  </Text>
                </View>

                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Modals / Selectors ── */}

      {/* Date Range Modal */}
      <Modal visible={dateDropdownVisible} transparent animationType="fade" onRequestClose={() => setDateDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDateDropdownVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Date Range</Text>
            {dateRangeOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.modalOption, selectedDateRange === opt && { backgroundColor: colors.iconBg }]}
                onPress={() => {
                  setSelectedDateRange(opt);
                  setDateDropdownVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalOptionText, { color: colors.textPrimary }, selectedDateRange === opt && { color: colors.brand, fontWeight: '700' }]}>
                  {opt}
                </Text>
                {selectedDateRange === opt && <Feather name="check" size={16} color={colors.brand} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Team / Department Modal */}
      <Modal visible={teamDropdownVisible} transparent animationType="fade" onRequestClose={() => setTeamDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTeamDropdownVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Team / Department</Text>
            {teamOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.modalOption, selectedTeam === opt && { backgroundColor: colors.iconBg }]}
                onPress={() => {
                  setSelectedTeam(opt);
                  setTeamDropdownVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalOptionText, { color: colors.textPrimary }, selectedTeam === opt && { color: colors.brand, fontWeight: '700' }]}>
                  {opt}
                </Text>
                {selectedTeam === opt && <Feather name="check" size={16} color={colors.brand} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Tab Bar */}
      <ManagerBottomTabNavigator
        activeTab={undefined}
        onTabPress={(tab) => {
          if (tab === 'home' || tab === 'approvals') {
            onNavigate?.('manager_dashboard', { tab });
          } else {
            onNavigate?.(`manager_${tab}`);
          }
        }}
      />

      <ManagerMenu
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  gridContainer: {
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  gridIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gridCardDesc: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  wideGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    gap: 16,
  },
  wideCardText: {
    flex: 1,
  },
  paramCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    marginBottom: 24,
  },
  paramCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 46,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  exportExcelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  exportExcelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  exportPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  exportPdfText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recentReportsSection: {
    marginBottom: 20,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentList: {
    gap: 10,
  },
  recentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  reportIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportDetails: {
    flex: 1,
  },
  reportItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  reportTimestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
  tabTextActive: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  tabNotifDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
});
