import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface OtpScreenProps {
  onBack: () => void;
  onVerify: () => void;
}

export default function OtpScreen({ onBack, onVerify }: OtpScreenProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(59);
  const [canResend, setCanResend] = useState<boolean>(false);

  // References for the 6 OTP input elements to control focus
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timerSeconds <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerSeconds]);

  const handleResendOtp = () => {
    if (!canResend) return;
    setTimerSeconds(59);
    setCanResend(false);
    Alert.alert('OTP Resent', 'A new 6-digit code has been sent to your device.');
  };

  const handleTextChange = (text: string, index: number) => {
    const singleDigit = text.slice(-1); // Only keep the last character typed
    const updatedOtp = [...otp];
    updatedOtp[index] = singleDigit;
    setOtp(updatedOtp);

    // Auto-focus next input
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveInputIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, delete previous digit and focus it
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = '';
        setOtp(updatedOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveInputIndex(index - 1);
      } else if (otp[index]) {
        // Clear current value
        const updatedOtp = [...otp];
        updatedOtp[index] = '';
        setOtp(updatedOtp);
      }
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Validation Error', 'Please enter the complete 6-digit verification code.');
      return;
    }
    
    // For demo purposes, we will accept '123456' as correct code, or any if not restricted
    if (otpCode === '123456' || otpCode === '000000') {
      onVerify();
    } else {
      Alert.alert(
        'Verification Failed',
        'The security code you entered is invalid. Try "123456" for demo testing.'
      );
    }
  };

  // Helper to format timer as (0:SS)
  const formatTime = (seconds: number) => {
    const secs = seconds < 10 ? `0${seconds}` : seconds;
    return `(0:${secs})`;
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
          <Text style={styles.headerTitle}>Verification</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered Circular Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#0c44ac" />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Enter Security Code</Text>
          <Text style={styles.description}>
            We've sent a 6-digit code to your registered device. Please enter it below to confirm your identity.
          </Text>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.statusText}>AWAITING VERIFICATION</Text>
          </View>

          {/* 6-Digit OTP Inputs Row */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                style={[
                  styles.otpInput,
                  activeInputIndex === idx && styles.otpInputActive,
                  digit !== '' && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleTextChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                onFocus={() => setActiveInputIndex(idx)}
                keyboardType="number-pad"
                maxLength={2} // Allows backspace detection reliably
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {/* Resend Link Timer */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={!canResend}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                <MaterialCommunityIcons name="cached" size={14} style={styles.resendIcon} />
                {` RESEND OTP ${canResend ? '' : formatTime(timerSeconds)}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <View style={styles.buttonSpacer} />
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Verify Identity</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" style={styles.buttonIcon} />
          </TouchableOpacity>

          {/* Security Footer */}
          <View style={styles.footer}>
            <MaterialCommunityIcons name="lock-outline" size={14} color="#94a3b8" />
            <Text style={styles.footerText}>Secured by STS Banking Standard</Text>
          </View>
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
    paddingTop: 32,
    paddingBottom: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 24,
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ea580c', // Orange status dot
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  otpInputActive: {
    borderColor: '#0c44ac',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  otpInputFilled: {
    backgroundColor: '#f8fafc',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309', // Warm orange/gold link
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLinkDisabled: {
    color: '#94a3b8',
  },
  resendIcon: {
    marginRight: 4,
  },
  buttonSpacer: {
    flex: 1,
    minHeight: 40,
  },
  button: {
    flexDirection: 'row',
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
    marginBottom: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
