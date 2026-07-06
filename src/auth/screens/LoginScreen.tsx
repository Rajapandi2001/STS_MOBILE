import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useWindowDimensions,
  Alert,
  Animated,
  Keyboard,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { storageService, DEFAULT_BASE_URL } from '@/services/storageService';
import CustomInput from '@/components/CustomInput';
import PasswordInput from '@/components/PasswordInput';
import CustomButton from '@/components/CustomButton';
import Loader from '@/components/Loader';

interface LoginScreenProps {
  onForgotPassword: () => void;
  onSignInSuccess: () => void;
  onAdminSignIn?: () => void;
}

export default function LoginScreen({ onForgotPassword, onSignInSuccess, onAdminSignIn }: LoginScreenProps) {
  const { height } = useWindowDimensions();
  
  // Slide-in and fade-in animations for the sign-in card on mount
  const slideAnim = useRef(new Animated.Value(200)).current; // starts 200px down
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardShift = useRef(new Animated.Value(0)).current;

  const { login } = useAuth();

  // Developer Settings States
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [serverUrl, setServerUrl] = useState(DEFAULT_BASE_URL);
  const [tempUrl, setTempUrl] = useState('');

  useEffect(() => {
    async function loadServerUrl() {
      const url = await storageService.getBaseUrl();
      if (url) {
        setServerUrl(url);
      }
    }
    loadServerUrl();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Smoothly shift the sign-in card up when the keyboard opens
    const showListener = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideListener = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showListener, (e) => {
      Animated.timing(keyboardShift, {
        toValue: -150, // Move only the card up by 150px
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideListener, () => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // State variables for the form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // References for programmatically triggering input focus
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Offline Bypass Sign In handler
  const handleOfflineLogin = async (userVal: string) => {
    setIsLoading(true);
    try {
      // Simulate brief loading for smooth transition UX
      await new Promise((resolve) => setTimeout(resolve, 800));
      const result = await login(userVal, 'offline_bypass', true);
      if (result.success && result.user) {
        const loggedInUser = result.user;
        if (loggedInUser.displayName.toUpperCase() === 'ADMIN' || loggedInUser.groupID === 5) {
          if (onAdminSignIn) {
            onAdminSignIn();
          } else {
            onSignInSuccess();
          }
        } else {
          onSignInSuccess();
        }
      } else {
        Alert.alert('Offline Bypass Failed', result.message);
      }
    } catch (e: any) {
      Alert.alert('Offline Login Error', e.message || 'An unexpected bypass error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = async () => {
    const url = await storageService.getBaseUrl() || DEFAULT_BASE_URL;
    setTempUrl(url);
    setIsSettingsVisible(true);
  };

  const handleSaveSettings = async () => {
    if (!tempUrl.trim()) {
      Alert.alert('Error', 'Base URL cannot be empty.');
      return;
    }
    await storageService.setBaseUrl(tempUrl.trim());
    setServerUrl(tempUrl.trim());
    setIsSettingsVisible(false);
    Alert.alert('Settings Saved', 'API Server URL updated successfully.');
  };

  const handleResetSettings = async () => {
    await storageService.removeBaseUrl();
    setServerUrl(DEFAULT_BASE_URL);
    setTempUrl(DEFAULT_BASE_URL);
    setIsSettingsVisible(false);
    Alert.alert('Settings Reset', 'Reverted to default API Server URL.');
  };

  const handleQuickLogin = async (role: 'admin' | 'employee') => {
    setIsSettingsVisible(false);
    await handleOfflineLogin(role);
  };

  // Form submission handler
  const handleSignIn = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      Alert.alert('Validation Error', 'Please enter your Username.');
      return;
    }
    
    if (!password) {
      Alert.alert('Validation Error', 'Please enter your Password.');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await login(trimmedUsername, password);
      if (result.success && result.user) {
        const loggedInUser = result.user;
        if (loggedInUser.displayName.toUpperCase() === 'ADMIN' || loggedInUser.groupID === 5) {
          if (onAdminSignIn) {
            onAdminSignIn();
          } else {
            onSignInSuccess();
          }
        } else {
          onSignInSuccess();
        }
      } else {
        if (result.isNetworkError) {
          Alert.alert(
            'Connection Issue',
            'Network Error: The login server is unreachable. Would you like to use Offline Demo Mode for testing?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Use Demo Mode',
                onPress: () => handleOfflineLogin(trimmedUsername)
              }
            ]
          );
        } else {
          Alert.alert('Login Failed', result.message);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onForgotPassword();
  };

  const handleContactSupport = () => {
    Alert.alert('IT Support', 'Opening support chat or ticket portal...');
  };

  // Dynamically set the height of the hero section (approx 36% of screen)
  const heroHeight = height * 0.36;

  return (
    <KeyboardAvoidingView
      behavior={undefined}
      style={styles.container}
    >
      <Loader visible={isLoading} />

      {/* Settings Gear Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={openSettings}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="cog" size={22} color="#ffffff" />
      </TouchableOpacity>

      {/* Developer Settings Modal */}
      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Developer Settings</Text>
              <TouchableOpacity onPress={() => setIsSettingsVisible(false)} activeOpacity={0.7}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>API SERVER URL (CURRENT: {serverUrl})</Text>
              <TextInput
                style={styles.modalInput}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://example.com/api"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#94a3b8"
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveSettings}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.resetButton]}
                  onPress={handleResetSettings}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetButtonText}>Reset to Default</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionHeaderTitle}>Testing Quick Bypass</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Bypass the server and login immediately with offline mock data.
              </Text>

              <View style={styles.quickLoginRow}>
                <TouchableOpacity
                  style={[styles.quickLoginButton, { backgroundColor: '#e2f6e9' }]}
                  onPress={() => handleQuickLogin('admin')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="shield-account" size={20} color="#16a34a" />
                  <Text style={[styles.quickLoginText, { color: '#16a34a' }]}>Login as Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickLoginButton, { backgroundColor: '#ebf2ff' }]}
                  onPress={() => handleQuickLogin('employee')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="account" size={20} color="#0a52d6" />
                  <Text style={[styles.quickLoginText, { color: '#0a52d6' }]}>Login as Staff</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Upper Portion: Hero Background Image */}
        <ImageBackground
          source={require('@/assets/images/office_hero.png')}
          style={[styles.heroBackground, { height: heroHeight }]}
          resizeMode="cover"
        >
          {/* Dark Overlay to ensure text readability */}
          <View style={styles.overlay} />

          <View style={styles.heroContent}>
            {/* Logo Row */}
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="office-building" size={20} color="#0c44ac" />
              </View>
              <Text style={styles.logoText}>STS</Text>
            </View>

            {/* Title / Slogan */}
            <Text style={styles.welcomeTitle}>Welcome to STS</Text>
            <Text style={styles.welcomeSubtitle}>Executive Enterprise Extension</Text>
          </View>
        </ImageBackground>

        {/* Lower Portion: Card Container */}
        <Animated.View 
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateY: keyboardShift }
              ],
            }
          ]}
        >
          <Text style={styles.signInTitle}>Sign In</Text>
          <Text style={styles.signInSubtitle}>
            Please enter your credentials to access the portal.
          </Text>

          {/* Username Field */}
          <CustomInput
            label="username"
            iconName="email-outline"
            inputRef={usernameInputRef}
            placeholder="Enter your email"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
          />

          {/* Password Field */}
          <PasswordInput
            label="password"
            inputRef={passwordInputRef}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
          />

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.rowActions}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={rememberMe ? '#0c44ac' : '#cbd5e1'}
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <CustomButton
            title="Sign In"
            onPress={handleSignIn}
            isLoading={isLoading}
            iconName="arrow-right"
          />

          {/* Support Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Facing issues signing in?</Text>
            <TouchableOpacity onPress={handleContactSupport} activeOpacity={0.7}>
              <Text style={styles.supportLink}>Contact IT Support</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heroBackground: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 20, 60, 0.45)', // Premium dark blue-ish overlay
  },
  heroContent: {
    padding: 24,
    paddingBottom: 40, // More bottom padding to handle overlap
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '400',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20, // Negative margin to overlap the hero section slightly
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  signInTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  signInSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 28,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0c44ac',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  supportLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b45309', // Warm orange/brown link
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    right: 20,
    zIndex: 99,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#0c44ac',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  resetButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  quickLoginRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLoginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  quickLoginText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
