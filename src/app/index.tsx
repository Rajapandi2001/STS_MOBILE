import React, { useState, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import SplashScreen from '@/common/screens/SplashScreen';
import LoginScreen from '@/auth/screens/LoginScreen';
import ForgotPasswordScreen from '@/auth/screens/ForgotPasswordScreen';
import OtpScreen from '@/auth/screens/OtpScreen';
import NewPasswordScreen from '@/auth/screens/NewPasswordScreen';
import DashboardScreen from '@/employee/screens/DashboardScreen';
import CheckInLocationScreen from '@/employee/screens/CheckInLocationScreen';
import CheckInSuccessScreen from '@/employee/screens/CheckInSuccessScreen';
import LocationFailedScreen from '@/employee/screens/LocationFailedScreen';
import AttendanceHistoryScreen, { AttendanceRecord } from '@/employee/screens/AttendanceHistoryScreen';
import AdminDashboardScreen from '@/admin/screens/AdminDashboardScreen';
import AdminMenuScreen from '@/admin/screens/AdminMenuScreen';

type ScreenName =
  | 'splash'
  | 'login'
  | 'forgot_password'
  | 'otp_verification'
  | 'new_password'
  | 'dashboard'
  | 'admin_dashboard'
  | 'admin_menu'
  | 'checkin_location'
  | 'checkin_success'
  | 'location_failed'
  | 'attendance_history';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Format a Date object to "09:05 AM" */
function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
}

/** Format a Date object to "Jun 23" */
function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Determine if the check-in time is "late" (after 09:30 AM) */
function getStatus(d: Date): 'on_time' | 'late' {
  const totalMinutes = d.getHours() * 60 + d.getMinutes();
  return totalMinutes > 9 * 60 + 30 ? 'late' : 'on_time';
}

/** Build a real AttendanceRecord from a Date */
function buildCheckInRecord(d: Date): AttendanceRecord {
  return {
    date: formatDate(d),
    dayLabel: 'Today',
    shift: 'Regular Shift',
    status: getStatus(d),
    checkIn: formatTime(d),
    checkOut: '—',
    total: '—',
  };
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function MainApp() {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [failedDistance, setFailedDistance] = useState<number>(0);
  const [checkInHistory, setCheckInHistory] = useState<AttendanceRecord[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const SCREEN_WIDTH = Dimensions.get('window').width;
  // slideAnim drives the admin_menu right-to-left entrance
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  /** Standard fade transition for most screens */
  const transitionTo = (nextScreen: ScreenName) => {
    if (nextScreen === 'admin_menu') {
      // Slide in from right — no fade needed
      slideAnim.setValue(SCREEN_WIDTH);
      setScreen('admin_menu');
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
      return;
    }
    if (screen === 'admin_menu') {
      // Slide back out to the right, then switch screen
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setScreen(nextScreen);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
      return;
    }
    // Default fade for all other transitions
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

  const handleCheckInConfirmed = () => {
    const now = new Date();
    setCheckInTime(now);
    // Save the real record with correct time & date
    setCheckInHistory(prev => [buildCheckInRecord(now), ...prev]);
    transitionTo('checkin_success');
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
            onAdminSignIn={() => transitionTo('admin_dashboard')}
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

      case 'admin_dashboard':
        return <AdminDashboardScreen onNavigate={(s) => transitionTo(s as ScreenName)} />;

      case 'admin_menu':
        return <AdminMenuScreen onNavigate={(s) => transitionTo(s as ScreenName)} />;

      // ── CHECK-IN FLOW ─────────────────────────────────────────────────────
      case 'checkin_location':
        return (
          <CheckInLocationScreen
            onBack={() => transitionTo('dashboard')}
            onConfirm={handleCheckInConfirmed}
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
            liveRecords={checkInHistory}
            onReturnHome={() => transitionTo('dashboard')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {screen === 'admin_menu' ? (
        // Slide-in layer for admin_menu (right → left)
        <Animated.View
          style={[
            styles.innerContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {renderScreen()}
        </Animated.View>
      ) : (
        // Fade layer for all other screens
        <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
          {renderScreen()}
        </Animated.View>
      )}
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

