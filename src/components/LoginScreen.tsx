import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LoginScreenProps {
  onForgotPassword: () => void;
}

export default function LoginScreen({ onForgotPassword }: LoginScreenProps) {
  const { height } = useWindowDimensions();
  
  // State variables for the form
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Focus states for input styling
  const [isIdFocused, setIsIdFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // References for programmatically triggering input focus
  const employeeIdInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Form submission handler
  const handleSignIn = () => {
    if (!employeeId.trim()) {
      Alert.alert('Validation Error', 'Please enter your Employee ID.');
      return;
    }
    if (!password) {
      Alert.alert('Validation Error', 'Please enter your Password.');
      return;
    }
    
    // Simulate authentication
    Alert.alert(
      'Sign In Successful',
      `Welcome to STS, ID: ${employeeId}!\nRemember Me: ${rememberMe ? 'Enabled' : 'Disabled'}`
    );
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
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
        <View style={styles.cardContainer}>
          <Text style={styles.signInTitle}>Sign In</Text>
          <Text style={styles.signInSubtitle}>
            Please enter your credentials to access the portal.
          </Text>

          {/* Employee ID Field */}
          <Text style={styles.label}>EMPLOYEE ID</Text>
          <TouchableWithoutFeedback onPress={() => employeeIdInputRef.current?.focus()}>
            <View
              style={[
                styles.inputWrapper,
                isIdFocused && styles.inputWrapperFocused,
              ]}
            >
              <MaterialCommunityIcons
                name="badge-account-outline"
                size={20}
                color={isIdFocused ? '#0c44ac' : '#94a3b8'}
                style={styles.inputIcon}
              />
              <TextInput
                ref={employeeIdInputRef}
                style={styles.textInput}
                placeholder="Enter your ID"
                placeholderTextColor="#94a3b8"
                value={employeeId}
                onChangeText={setEmployeeId}
                onFocus={() => setIsIdFocused(true)}
                onBlur={() => setIsIdFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Password Field */}
          <Text style={styles.label}>PASSWORD</Text>
          <TouchableWithoutFeedback onPress={() => passwordInputRef.current?.focus()}>
            <View
              style={[
                styles.inputWrapper,
                isPasswordFocused && styles.inputWrapperFocused,
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={isPasswordFocused ? '#0c44ac' : '#94a3b8'}
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordInputRef}
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#94a3b8"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>

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
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Sign In</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" style={styles.buttonIcon} />
          </TouchableOpacity>

          {/* Support Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Facing issues signing in?</Text>
            <TouchableOpacity onPress={handleContactSupport} activeOpacity={0.7}>
              <Text style={styles.supportLink}>Contact IT Support</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
  },
  inputWrapperFocused: {
    borderColor: '#0c44ac',
    backgroundColor: '#ffffff',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#0f172a',
    fontSize: 15,
  },
  eyeIcon: {
    marginLeft: 8,
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
  button: {
    flexDirection: 'row',
    backgroundColor: '#0c44ac',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 32,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
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
});
