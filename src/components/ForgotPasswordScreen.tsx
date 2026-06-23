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

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSendCode: (emailOrId: string) => void;
}

export default function ForgotPasswordScreen({ onBack, onSendCode }: ForgotPasswordScreenProps) {
  const [emailOrId, setEmailOrId] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Reference for programmatically triggering input focus
  const emailInputRef = useRef<TextInput>(null);

  const handleSendCode = () => {
    if (!emailOrId.trim()) {
      Alert.alert('Validation Error', 'Please enter your Employee ID or email address.');
      return;
    }
    onSendCode(emailOrId.trim());
  };

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
          <Text style={styles.headerTitle}>Reset Password</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered Circular Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="lock-reset" size={32} color="#0c44ac" />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Enter your registered Employee ID or email address. We'll send you a verification code to reset your password.
          </Text>

          {/* Input field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Employee ID or Email</Text>
            <TouchableWithoutFeedback onPress={() => emailInputRef.current?.focus()}>
              <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
                <MaterialCommunityIcons
                  name="badge-account-outline"
                  size={20}
                  color={isFocused ? '#0c44ac' : '#94a3b8'}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={emailInputRef}
                  style={styles.textInput}
                  placeholder="e.g. EMP-0192 or email"
                  placeholderTextColor="#94a3b8"
                  value={emailOrId}
                  onChangeText={setEmailOrId}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>

          {/* Action Button at the bottom of content scroll */}
          <View style={styles.buttonSpacer} />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendCode}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Send Verification Code</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0c44ac',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#0f172a',
    fontSize: 15,
  },
  buttonSpacer: {
    flex: 1,
    minHeight: 40,
  },
  button: {
    width: '100%',
    backgroundColor: '#0c44ac',
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
