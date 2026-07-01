import React, { useState, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
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
import AdminStaffScreen from '@/admin/screens/AdminStaffScreen';
import AdminClientScreen from '@/admin/screens/AdminClientScreen';
import AdminLeaveSettingsScreen from '@/admin/screens/AdminLeaveSettingsScreen';
import AdminUserGroupsScreen from '@/admin/screens/AdminUserGroupsScreen';
import AdminProjectsScreen from '@/admin/screens/AdminProjectsScreen';
import AdminProfileScreen from '@/admin/screens/AdminProfileScreen';

type ScreenName =
  | 'splash'
  | 'login'
  | 'forgot_password'
  | 'otp_verification'
  | 'new_password'
  | 'dashboard'
  | 'admin_dashboard'
  | 'checkin_location'
  | 'checkin_success'
  | 'location_failed'
  | 'attendance_history'
  | 'admin_staff'
  | 'admin_client'
  | 'admin_leave_settings'
  | 'admin_user_groups'
  | 'admin_projects'
  | 'admin_profile';

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
  const [navSource, setNavSource] = useState<'dashboard' | 'menu'>('dashboard');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [failedDistance, setFailedDistance] = useState<number>(0);
  const [checkInHistory, setCheckInHistory] = useState<AttendanceRecord[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const SCREEN_WIDTH = Dimensions.get('window').width;

  /** Standard fade transition for most screens */
  const transitionTo = (nextScreen: ScreenName, params?: any) => {
    setScreenParams(params);
    if ((nextScreen === 'admin_staff' || nextScreen === 'admin_client' || nextScreen === 'admin_leave_settings' || nextScreen === 'admin_user_groups' || nextScreen === 'admin_projects') && params?.source) {
      setNavSource(params.source);
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
        return (
          <AdminDashboardScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            routeParams={screenParams}
          />
        );

      case 'admin_staff':
        return (
          <AdminStaffScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true });
              } else {
                transitionTo('admin_dashboard');
              }
            }}
          />
        );

      case 'admin_client':
        return (
          <AdminClientScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true });
              } else {
                transitionTo('admin_dashboard');
              }
            }}
          />
        );

      case 'admin_leave_settings':
        return (
          <AdminLeaveSettingsScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true });
              } else {
                transitionTo('admin_dashboard');
              }
            }}
          />
        );

      case 'admin_user_groups':
        return (
          <AdminUserGroupsScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true });
              } else {
                transitionTo('admin_dashboard');
              }
            }}
          />
        );

      case 'admin_projects':
        return (
          <AdminProjectsScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true });
              } else {
                transitionTo('admin_dashboard');
              }
            }}
          />
        );

      case 'admin_profile':
        return (
          <AdminProfileScreen
            onBack={() => transitionTo('admin_dashboard', { menuOpen: true })}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

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
    <ThemeProvider>
      <View style={styles.container}>
        {/* Fade layer for all screens */}
        <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
          {renderScreen()}
        </Animated.View>
      </View>
    </ThemeProvider>
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

