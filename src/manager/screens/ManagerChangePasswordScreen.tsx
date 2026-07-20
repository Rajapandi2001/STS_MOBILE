import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '../components/ManagerMenu';

interface ManagerChangePasswordScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function ManagerChangePasswordScreen({
  onBack,
  onNavigate,
}: ManagerChangePasswordScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Navigation drawer menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('manager_dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate]);

  const handleUpdatePassword = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    Alert.alert(
      'Success',
      'Your password has been updated successfully.',
      [{ text: 'OK', onPress: () => onNavigate?.('manager_dashboard') }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.bgScreen, paddingTop: insets.top }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.hamburgerBtn, { backgroundColor: colors.iconBg }]}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.7}
            >
              <Feather name="menu" size={20} color={colors.brand} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.brand }]}>Change Password</Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('manager_profile')}
          >
            <Feather name="user" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Update Security</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecond }]}>
            Change your password regularly to keep your account secure.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecond }]}>Current Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.textSecond} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                  <Feather name={showCurrent ? 'eye-off' : 'eye'} size={16} color={colors.textSecond} />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecond }]}>New Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name="shield" size={16} color={colors.textSecond} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                  <Feather name={showNew ? 'eye-off' : 'eye'} size={16} color={colors.textSecond} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecond }]}>Confirm New Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name="check-square" size={16} color={colors.textSecond} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Feather name={showConfirm ? 'eye-off' : 'eye'} size={16} color={colors.textSecond} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.brand }]}
              onPress={handleUpdatePassword}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sticky Bottom Tab Bar */}
        <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard')}>
            <Feather name="home" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'team' })}>
            <Feather name="users" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Team</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_time')}>
            <Feather name="clock" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_dashboard', { tab: 'approvals' })}>
            <Feather name="check-square" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Approvals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('manager_assets')}>
            <Feather name="package" size={22} color={colors.tabInactive} />
            <Text style={[styles.tabText, { color: colors.tabInactive }]}>Assets</Text>
          </TouchableOpacity>
        </View>

        {/* Side Menu Drawer overlay */}
        <ManagerMenu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={onNavigate}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginLeft: 12 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2, gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '700' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, gap: 8 },
  textInput: { flex: 1, fontSize: 14, padding: 0 },
  eyeBtn: { padding: 4 },
  submitButton: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
