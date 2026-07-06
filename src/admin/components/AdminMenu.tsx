import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface AdminMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function AdminMenu({ visible, onClose, onNavigate }: AdminMenuProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { logout, user } = useAuth();

  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [employeeExpanded, setEmployeeExpanded] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  useEffect(() => {
    slideAnim.stopAnimation();
    backdropAnim.stopAnimation();

    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();

      const onBackPress = () => {
        onClose();
        return true; // prevent default (don't navigate back or exit app)
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 280, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start(() => {
        if (!visibleRef.current) {
          setIsRendered(false);
          setEmployeeExpanded(false);
        }
      });
    }
  }, [visible]);

  if (!isRendered) return null;

  const handleNavigate = (screen: string, params?: any) => {
    onClose();
    setTimeout(() => {
      onNavigate?.(screen, params);
    }, 320);
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    onClose();
    try {
      await logout();
    } catch (e) {
      console.error('Error during logout:', e);
    }
    setTimeout(() => {
      onNavigate?.('login');
    }, 320);
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} pointerEvents="box-none">
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.menuOverlay, { paddingTop: insets.top, backgroundColor: colors.card, transform: [{ translateX: slideAnim }] }]}>
        {/* Menu Header */}
        <View style={[styles.menuHeader, { borderBottomColor: colors.borderLight }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.iconBg, borderColor: colors.brandBorder }]}>
            <MaterialCommunityIcons name="account" size={28} color={colors.brand} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.displayName || 'Admin'}</Text>
            <Text style={[styles.profileRole, { color: colors.textSecond }]} numberOfLines={1}>{user?.userName || 'admin@cybervault.in'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 90 }}>
          <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />

          {/* Profile */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => handleNavigate('admin_profile', { source: 'menu' })}
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
              {['Staff', 'Client', 'Leave Setting', 'User Group', 'Project', 'Holiday', 'Company Detail', 'Asset'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.subMenuItem, { borderLeftColor: colors.brandBorder }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item === 'Staff') handleNavigate('admin_staff', { source: 'menu' });
                    else if (item === 'Client') handleNavigate('admin_client', { source: 'menu' });
                    else if (item === 'Leave Setting') handleNavigate('admin_leave_settings', { source: 'menu' });
                    else if (item === 'User Group') handleNavigate('admin_user_groups', { source: 'menu' });
                    else if (item === 'Project') handleNavigate('admin_projects', { source: 'menu' });
                    else if (item === 'Holiday') handleNavigate('admin_holidays', { source: 'menu' });
                    else if (item === 'Company Detail') handleNavigate('admin_companies', { source: 'menu' });
                    else if (item === 'Asset') handleNavigate('admin_assets', { source: 'menu' });
                  }}
                >
                  <Text style={[styles.subMenuText, { color: colors.textSecond }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Roles & Permissions */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => handleNavigate('admin_roles_permissions')}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="shield-account-outline" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Roles & Permissions</Text>
          </TouchableOpacity>

          {/* Help */}
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => handleNavigate('admin_help', { source: 'menu' })}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.brand} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Help</Text>
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
              <TouchableOpacity style={styles.modalYesButton} activeOpacity={0.8} onPress={handleLogout}>
                <Text style={styles.modalYesButtonText}>Yes, logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* ── Menu Overlay ── */
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 100 },
  menuOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '80%', zIndex: 110, elevation: 20 },
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
  logoutContainer: { paddingHorizontal: 20, position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 16, gap: 10, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  /* Modal */
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 200 },
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
