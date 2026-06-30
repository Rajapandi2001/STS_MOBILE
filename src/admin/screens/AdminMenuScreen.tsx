import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdminMenuScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function AdminMenuScreen({ onNavigate }: AdminMenuScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // ── Fix: starts CLOSED — only opens when the user taps "Employee" ──
  const [employeeExpanded, setEmployeeExpanded] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Responsive scale helpers
  const isSmall = height < 700;           // small phones (e.g. SE)
  const hPad   = width  < 380 ? 14 : 20; // horizontal padding
  const vPad   = isSmall ? 12  : 16;     // vertical padding for menu rows
  const avatarSize = width < 380 ? 44 : 52;
  const iconSize   = width < 380 ? 18 : 22;
  const tabBarH    = 62 + Math.max(insets.bottom, 12);
  const logoutBottom = tabBarH + (isSmall ? 8 : 16);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={styles.headerTitle}>AdminConsole</Text>
        <View style={[styles.avatarCircle, { width: 36, height: 36, borderRadius: 18 }]}>
          <Text style={styles.avatarText}>AP</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: logoutBottom + 64 },
        ]}
      >
        {/* User Profile Card */}
        <View style={[styles.profileCard, { paddingHorizontal: hPad, paddingVertical: isSmall ? 14 : 20 }]}>
          <View
            style={[
              styles.profileAvatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, marginRight: hPad - 4 },
            ]}
          >
            <MaterialCommunityIcons name="account" size={avatarSize * 0.6} color="#0A52D6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { fontSize: width < 380 ? 14 : 16 }]}>Sarah Jenkins</Text>
            <Text style={styles.profileRole}>HR Admin</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* ── Profile ── */}
        <TouchableOpacity
          style={[styles.menuItem, { paddingHorizontal: hPad, paddingVertical: vPad }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconWrap}>
            <MaterialCommunityIcons name="account-outline" size={iconSize} color="#0A52D6" />
          </View>
          <Text style={styles.menuItemText}>Profile</Text>
        </TouchableOpacity>

        {/* ── Employee (Expandable) — only this toggles the dropdown ── */}
        <TouchableOpacity
          style={[
            styles.menuItem,
            { paddingHorizontal: hPad, paddingVertical: vPad },
            employeeExpanded && styles.menuItemActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setEmployeeExpanded(prev => !prev)}
        >
          <View style={styles.menuIconWrap}>
            <MaterialCommunityIcons name="account-multiple-outline" size={iconSize} color="#0A52D6" />
          </View>
          <Text style={[styles.menuItemText, employeeExpanded && styles.menuItemTextActive]}>
            Employee
          </Text>
          <Feather
            name={employeeExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#64748B"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Employee Sub-items */}
        {employeeExpanded && (
          <View style={[styles.subMenu, { paddingLeft: hPad + 50 }]}>
            <TouchableOpacity style={styles.subMenuItem} activeOpacity={0.7}>
              <Text style={styles.subMenuText}>Directory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subMenuItem} activeOpacity={0.7}>
              <Text style={styles.subMenuText}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subMenuItem} activeOpacity={0.7}>
              <Text style={styles.subMenuText}>Leave Management</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Clients ── */}
        <TouchableOpacity
          style={[styles.menuItem, { paddingHorizontal: hPad, paddingVertical: vPad }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconWrap}>
            <MaterialCommunityIcons name="briefcase-outline" size={iconSize} color="#0A52D6" />
          </View>
          <Text style={styles.menuItemText}>Clients</Text>
        </TouchableOpacity>

        {/* ── Payroll ── */}
        <TouchableOpacity
          style={[styles.menuItem, { paddingHorizontal: hPad, paddingVertical: vPad }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconWrap}>
            <MaterialCommunityIcons name="credit-card-outline" size={iconSize} color="#0A52D6" />
          </View>
          <Text style={styles.menuItemText}>Payroll</Text>
        </TouchableOpacity>

        {/* ── Support ── */}
        <TouchableOpacity
          style={[styles.menuItem, { paddingHorizontal: hPad, paddingVertical: vPad }]}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconWrap}>
            <MaterialCommunityIcons name="help-circle-outline" size={iconSize} color="#0A52D6" />
          </View>
          <Text style={styles.menuItemText}>Support</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Button — sits just above the tab bar */}
      <View
        style={[
          styles.logoutContainer,
          { bottom: logoutBottom, left: hPad, right: hPad },
        ]}
      >
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color="#64748B" />
          <Text style={styles.tabText}>Home</Text>
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

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="grid" size={22} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Menu</Text>
        </TouchableOpacity>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A52D6',
    letterSpacing: -0.5,
  },
  avatarCircle: {
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileAvatar: {
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  /* Menu Items */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuItemTextActive: {
    color: '#0A52D6',
  },
  chevron: {
    marginLeft: 8,
  },
  /* Sub-menu */
  subMenu: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    marginBottom: 1,
  },
  subMenuItem: {
    paddingVertical: 11,
    borderLeftWidth: 2,
    borderLeftColor: '#DBEAFE',
    paddingLeft: 16,
    marginLeft: -2,
  },
  subMenuText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  /* Logout */
  logoutContainer: {
    position: 'absolute',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
