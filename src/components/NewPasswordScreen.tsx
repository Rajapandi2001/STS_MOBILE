import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NewPasswordScreenProps {
  onBack: () => void;
  onResetComplete: () => void;
}

export default function NewPasswordScreen({ onBack, onResetComplete }: NewPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  // Focus states
  const [isNewFocused, setIsNewFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  // References for programmatically triggering input focus
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Live password validation criteria checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar;
  const isFormValid = isPasswordValid && passwordsMatch;

  const handleResetPassword = () => {
    if (!isFormValid) return;
    Alert.alert(
      'Password Reset Successful',
      'Your password has been changed. Please log in with your new credentials.',
      [{ text: 'OK', onPress: onResetComplete }]
    );
  };

  // Determine password strength for the meter bar
  const getStrengthData = () => {
    if (newPassword.length === 0) return { width: '0%', color: '#e2e8f0', text: '' };
    
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;

    if (score === 1) return { width: '33%', color: '#ef4444', text: 'Weak' };
    if (score === 2) return { width: '66%', color: '#f97316', text: 'Medium' };
    return { width: '100%', color: '#22c55e', text: 'Strong' };
  };

  const strength = getStrengthData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.6} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0c44ac" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Texts */}
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.description}>
            Please create a new password that you don't use on any other site.
          </Text>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TouchableWithoutFeedback onPress={() => newPasswordInputRef.current?.focus()}>
              <View style={[styles.inputWrapper, isNewFocused && styles.inputWrapperFocused]}>
                <TextInput
                  ref={newPasswordInputRef}
                  style={styles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!isNewVisible}
                  onFocus={() => setIsNewFocused(true)}
                  onBlur={() => setIsNewFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setIsNewVisible(!isNewVisible)}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons
                    name={isNewVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>

            {/* Dynamic Strength Meter */}
            <View style={styles.strengthRow}>
              <View style={styles.meterContainer}>
                <View style={[styles.meterBar, { width: strength.width as any, backgroundColor: strength.color }]} />
              </View>
              {strength.text !== '' && (
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.text} strength
                </Text>
              )}
            </View>
          </View>

          {/* Confirm New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TouchableWithoutFeedback onPress={() => confirmPasswordInputRef.current?.focus()}>
              <View style={[styles.inputWrapper, isConfirmFocused && styles.inputWrapperFocused]}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={styles.textInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmVisible}
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={() => setIsConfirmFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setIsConfirmVisible(!isConfirmVisible)}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons
                    name={isConfirmVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>

          {/* Validation Checklist Items */}
          <View style={styles.checklist}>
            {/* Rule 1 */}
            <View style={styles.checkRow}>
              <MaterialCommunityIcons
                name={hasMinLength ? 'checkbox-marked-circle-outline' : 'circle-outline'}
                size={20}
                color={hasMinLength ? '#22c55e' : '#94a3b8'}
                style={styles.checkIcon}
              />
              <Text style={[styles.checkText, hasMinLength && styles.checkTextActive]}>
                At least 8 characters
              </Text>
            </View>

            {/* Rule 2 */}
            <View style={styles.checkRow}>
              <MaterialCommunityIcons
                name={hasNumber ? 'checkbox-marked-circle-outline' : 'circle-outline'}
                size={20}
                color={hasNumber ? '#22c55e' : '#94a3b8'}
                style={styles.checkIcon}
              />
              <Text style={[styles.checkText, hasNumber && styles.checkTextActive]}>
                Contains a number
              </Text>
            </View>

            {/* Rule 3 */}
            <View style={styles.checkRow}>
              <MaterialCommunityIcons
                name={hasSpecialChar ? 'checkbox-marked-circle-outline' : 'circle-outline'}
                size={20}
                color={hasSpecialChar ? '#22c55e' : '#94a3b8'}
                style={styles.checkIcon}
              />
              <Text style={[styles.checkText, hasSpecialChar && styles.checkTextActive]}>
                Contains a special character
              </Text>
            </View>

            {/* Confirm Passwords Match (subtle helper) */}
            {confirmPassword.length > 0 && (
              <View style={styles.checkRow}>
                <MaterialCommunityIcons
                  name={passwordsMatch ? 'checkbox-marked-circle-outline' : 'alert-circle-outline'}
                  size={20}
                  color={passwordsMatch ? '#22c55e' : '#ef4444'}
                  style={styles.checkIcon}
                />
                <Text style={[styles.checkText, passwordsMatch && styles.checkTextActive, !passwordsMatch && styles.checkTextError]}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          {/* Reset Button */}
          <View style={styles.buttonSpacer} />
          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={!isFormValid}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 32,
    textAlign: 'left',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
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
    backgroundColor: '#ffffff',
  },
  inputWrapperFocused: {
    borderColor: '#0c44ac',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#0f172a',
    fontSize: 15,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meterContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden',
  },
  meterBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  checklist: {
    width: '100%',
    marginTop: 12,
    gap: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 10,
  },
  checkText: {
    fontSize: 14,
    color: '#64748b',
  },
  checkTextActive: {
    color: '#334155',
    fontWeight: '500',
  },
  checkTextError: {
    color: '#ef4444',
  },
  buttonSpacer: {
    flex: 1,
    minHeight: 40,
  },
  button: {
    width: '100%',
    backgroundColor: '#0c44ac', // Active deep blue
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#82a1d8', // Disabled light blue
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
