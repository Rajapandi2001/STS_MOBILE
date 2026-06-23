import React, { useState, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import SplashScreen from '@/components/SplashScreen';
import LoginScreen from '@/components/LoginScreen';
import ForgotPasswordScreen from '@/components/ForgotPasswordScreen';
import OtpScreen from '@/components/OtpScreen';
import NewPasswordScreen from '@/components/NewPasswordScreen';
import DashboardScreen from '@/components/DashboardScreen';
import CheckInLocationScreen from '@/components/CheckInLocationScreen';
import CheckInSuccessScreen from '@/components/CheckInSuccessScreen';
import LocationFailedScreen from '@/components/LocationFailedScreen';
import AttendanceHistoryScreen from '@/components/AttendanceHistoryScreen';

type ScreenName =
  | 'splash'
  | 'login'
  | 'forgot_password'
  | 'otp_verification'
  | 'new_password'
  | 'dashboard'
  | 'checkin_location'
  | 'checkin_success'
  | 'location_failed'
  | 'attendance_history';

export default function MainApp() {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [failedDistance, setFailedDistance] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Transition to a different screen with a smooth cross-fade animation
  const transitionTo = (nextScreen: ScreenName) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onFinish={() => transitionTo('login')} />;

      case 'login':
        return (
          <LoginScreen
            onForgotPassword={() => transitionTo('forgot_password')}
            onSignInSuccess={() => transitionTo('dashboard')}
          />
        );

      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onBack={() => transitionTo('login')}
            onSendCode={() => transitionTo('otp_verification')}
          />
        );

      case 'otp_verification':
        return (
          <OtpScreen
            onBack={() => transitionTo('forgot_password')}
            onVerify={() => transitionTo('new_password')}
          />
        );

      case 'new_password':
        return (
          <NewPasswordScreen
            onBack={() => transitionTo('otp_verification')}
            onResetComplete={() => transitionTo('login')}
          />
        );

      case 'dashboard':
        return (
          <DashboardScreen
            onSignOut={() => transitionTo('login')}
            onCheckIn={() => transitionTo('checkin_location')}
          />
        );

      // ─── CHECK-IN FLOW ──────────────────────────────────────────────────────
      case 'checkin_location':
        return (
          <CheckInLocationScreen
            onBack={() => transitionTo('dashboard')}
            onConfirm={(coords) => {
              setCheckInTime(new Date());
              transitionTo('checkin_success');
            }}
            onValidationFailed={(distance) => {
              setFailedDistance(distance);
              transitionTo('location_failed');
            }}
          />
        );

      case 'checkin_success':
        return (
          <CheckInSuccessScreen
            checkInTime={checkInTime}
            locationName="HQ Block A"
            onGoToHistory={() => transitionTo('attendance_history')}
          />
        );

      case 'location_failed':
        return (
          <LocationFailedScreen
            distance={failedDistance}
            onRetry={() => transitionTo('checkin_location')}
            onBack={() => transitionTo('dashboard')}
          />
        );

      case 'attendance_history':
        return (
          <AttendanceHistoryScreen
            onReturnHome={() => transitionTo('dashboard')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00133c',
  },
  innerContainer: {
    flex: 1,
  },
});

