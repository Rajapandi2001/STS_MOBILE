import React, { useState, useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View, BackHandler, Alert } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
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
import ManagerDashboardScreen from '@/manager/screens/ManagerDashboardScreen';
import ManagerCheckInLocationScreen from '@/manager/screens/ManagerCheckInLocationScreen';
import ManagerCheckInSuccessScreen from '@/manager/screens/ManagerCheckInSuccessScreen';
import ManagerLocationFailedScreen from '@/manager/screens/ManagerLocationFailedScreen';
import ManagerAttendanceHistoryScreen from '@/manager/screens/ManagerAttendanceHistoryScreen';
import ManagerRolesPermissionsScreen from '@/manager/screens/ManagerRolesPermissionsScreen';
import ManagerRoleDetailScreen from '@/manager/screens/ManagerRoleDetailScreen';
import ManagerHelpScreen from '@/manager/screens/ManagerHelpScreen';
import ManagerProfileScreen from '@/manager/screens/ManagerProfileScreen';
import ManagerCreateClaimScreen from '@/manager/screens/ManagerCreateClaimScreen';
import AdminStaffScreen from '@/admin/screens/AdminStaffScreen';
import AdminClientScreen from '@/admin/screens/AdminClientScreen';
import AdminLeaveSettingsScreen from '@/admin/screens/AdminLeaveSettingsScreen';
import AdminUserGroupsScreen from '@/admin/screens/AdminUserGroupsScreen';
import AdminProjectsScreen from '@/admin/screens/AdminProjectsScreen';
import AdminProfileScreen from '@/admin/screens/AdminProfileScreen';
import AdminHelpScreen from '@/admin/screens/AdminHelpScreen';
import AdminHolidayScreen from '@/admin/screens/AdminHolidayScreen';
import AdminCompanyScreen from '@/admin/screens/AdminCompanyScreen';
import AdminAssetScreen from '@/admin/screens/AdminAssetScreen';
import AdminStaffDetailScreen from '@/admin/screens/AdminStaffDetailScreen';
import AdminClientDetailScreen from '@/admin/screens/AdminClientDetailScreen';
import AdminProjectDetailScreen from '@/admin/screens/AdminProjectDetailScreen';
import AdminCompanyDetailScreen from '@/admin/screens/AdminCompanyDetailScreen';
import AdminAssetDetailScreen from '@/admin/screens/AdminAssetDetailScreen';
import AdminLeaveSettingDetailScreen from '@/admin/screens/AdminLeaveSettingDetailScreen';
import AdminHolidayDetailScreen from '@/admin/screens/AdminHolidayDetailScreen';
import AdminRolesPermissionsScreen from '@/admin/screens/AdminRolesPermissionsScreen';
import AdminRoleDetailScreen from '@/admin/screens/AdminRoleDetailScreen';
import AdminAlertsScreen from '@/admin/screens/AdminAlertsScreen';
import AdminReportsScreen from '@/admin/screens/AdminReportsScreen';

type ScreenName =
  | 'splash'
  | 'login'
  | 'forgot_password'
  | 'otp_verification'
  | 'new_password'
  | 'dashboard'
  | 'admin_dashboard'
  | 'manager_dashboard'
  | 'checkin_location'
  | 'checkin_success'
  | 'location_failed'
  | 'attendance_history'
  | 'admin_staff'
  | 'admin_client'
  | 'admin_leave_settings'
  | 'admin_user_groups'
  | 'admin_projects'
  | 'admin_profile'
  | 'admin_help'
  | 'admin_holidays'
  | 'admin_companies'
  | 'admin_assets'
  | 'admin_staff_detail'
  | 'admin_client_detail'
  | 'admin_project_detail'
  | 'admin_company_detail'
  | 'admin_asset_detail'
  | 'admin_leave_setting_detail'
  | 'admin_holiday_detail'
  | 'admin_roles_permissions'
  | 'admin_role_detail'
  | 'admin_alerts'
  | 'admin_reports'
  | 'manager_roles_permissions'
  | 'manager_role_detail'
  | 'manager_help'
  | 'manager_profile'
  | 'manager_create_claim';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [navSource, setNavSource] = useState<'dashboard' | 'menu'>('dashboard');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [failedDistance, setFailedDistance] = useState<number>(0);
  const [checkInHistory, setCheckInHistory] = useState<AttendanceRecord[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  // For smooth overlapping transitions
  const [prevScreen, setPrevScreen] = useState<ScreenName | null>(null);
  const [prevScreenParams, setPrevScreenParams] = useState<any>(null);
  const [navDirection, setNavDirection] = useState<'forward' | 'backward'>('forward');
  const transitionAnim = useRef(new Animated.Value(1)).current;
  const SCREEN_WIDTH = Dimensions.get('window').width;

  // Custom hardware back handler logic
  const handleBack = (): boolean => {
    switch (screen) {
      case 'splash':
      case 'login':
      case 'dashboard':
      case 'admin_dashboard':
      case 'manager_dashboard':
        return false; // let the system handle it (exit app)

      case 'forgot_password':
        transitionTo('login', undefined, 'backward');
        return true;

      case 'otp_verification':
        transitionTo('forgot_password', undefined, 'backward');
        return true;

      case 'new_password':
        transitionTo('otp_verification', undefined, 'backward');
        return true;

      case 'admin_staff':
      case 'admin_client':
      case 'admin_leave_settings':
      case 'admin_user_groups':
      case 'admin_projects':
      case 'admin_holidays':
      case 'admin_companies':
      case 'admin_assets': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        const destDashboard = isManager ? 'manager_dashboard' : 'admin_dashboard';
        if (navSource === 'menu') {
          transitionTo(destDashboard, { menuOpen: true }, 'backward');
        } else {
          transitionTo(destDashboard, undefined, 'backward');
        }
        return true;
      }

      case 'admin_staff_detail':
        transitionTo('admin_staff', undefined, 'backward');
        return true;

      case 'admin_client_detail':
        transitionTo('admin_client', undefined, 'backward');
        return true;

      case 'admin_project_detail':
        transitionTo('admin_projects', undefined, 'backward');
        return true;

      case 'admin_company_detail':
        transitionTo('admin_companies', undefined, 'backward');
        return true;

      case 'admin_asset_detail':
        transitionTo('admin_assets', undefined, 'backward');
        return true;

      case 'admin_leave_setting_detail':
        transitionTo('admin_leave_settings', undefined, 'backward');
        return true;

      case 'admin_holiday_detail':
        transitionTo('admin_holidays', undefined, 'backward');
        return true;

      case 'admin_roles_permissions':
        transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
        return true;

      case 'admin_role_detail':
        transitionTo('admin_roles_permissions', undefined, 'backward');
        return true;

      case 'admin_profile':
      case 'admin_help':
        transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
        return true;

      case 'manager_roles_permissions':
        transitionTo('manager_dashboard', { menuOpen: true }, 'backward');
        return true;

      case 'manager_role_detail':
        transitionTo('manager_roles_permissions', undefined, 'backward');
        return true;

      case 'manager_help':
      case 'manager_profile':
        transitionTo('manager_dashboard', { menuOpen: true }, 'backward');
        return true;

      case 'manager_create_claim':
        transitionTo('manager_dashboard', undefined, 'backward');
        return true;

      case 'checkin_location':
      case 'location_failed':
      case 'checkin_success':
      case 'attendance_history': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        transitionTo(isManager ? 'manager_dashboard' : 'dashboard', undefined, 'backward');
        return true;
      }

      default:
        return false;
    }
  };

  useEffect(() => {
    const backAction = () => {
      return handleBack();
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [screen, navSource]);

  /** Super smooth native-like slide transition */
  const transitionTo = (nextScreen: ScreenName, params?: any, direction: 'forward' | 'backward' = 'forward') => {
    if ((nextScreen === 'admin_staff' || nextScreen === 'admin_client' || nextScreen === 'admin_leave_settings' || nextScreen === 'admin_user_groups' || nextScreen === 'admin_projects' || nextScreen === 'admin_holidays' || nextScreen === 'admin_companies' || nextScreen === 'admin_assets') && params?.source) {
      setNavSource(params.source);
    }

    // Set up overlapping state
    setNavDirection(direction);
    setPrevScreen(screen);
    setPrevScreenParams(screenParams);

    setScreen(nextScreen);
    setScreenParams(params);

    // Reset animation to 0 (start of transition)
    transitionAnim.setValue(0);

    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      // Clean up the old screen once transition completes
      setPrevScreen(null);
      setPrevScreenParams(null);
    });
  };

  // Redirect to login if user is not authenticated and on a protected screen
  useEffect(() => {
    const isPublicScreen = ['splash', 'login', 'forgot_password', 'otp_verification', 'new_password'].includes(screen);
    if (!isAuthenticated && !isPublicScreen) {
      transitionTo('login', undefined, 'backward');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, screen]);

  const handleCheckInConfirmed = () => {
    const now = new Date();
    setCheckInTime(now);
    setIsCheckedIn(true);
    // Save the real record with correct time & date
    setCheckInHistory(prev => [buildCheckInRecord(now), ...prev]);
    transitionTo('checkin_success');
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    // Update checkOut and total fields of the latest record
    setCheckInHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const now = new Date();
      const durationMs = now.getTime() - checkInTime.getTime();
      const hrs = Math.floor(durationMs / 3600000);
      const mins = Math.floor((durationMs % 3600000) / 60000);

      updated[0] = {
        ...updated[0],
        checkOut: formatTime(now),
        total: `${hrs.toString().padStart(2, '0')}.${mins.toString().padStart(2, '0')} Hr`,
      };
      return updated;
    });
    Alert.alert('Success', 'Successfully checked out!');
  };

  const renderScreenComponent = (s: ScreenName, p: any) => {
    switch (s) {
      case 'splash':
        return (
          <SplashScreen
            onFinish={() => {
              if (isAuthenticated && user) {
                if (user.userName?.toLowerCase() === 'manager' || user.groupID === 3) {
                  transitionTo('manager_dashboard');
                } else if (user.displayName?.toUpperCase() === 'ADMIN' || user.groupID === 5) {
                  transitionTo('admin_dashboard');
                } else {
                  transitionTo('dashboard');
                }
              } else {
                transitionTo('login');
              }
            }}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onForgotPassword={() => transitionTo('forgot_password')}
            onSignInSuccess={() => transitionTo('dashboard')}
            onAdminSignIn={() => transitionTo('admin_dashboard')}
            onManagerSignIn={() => transitionTo('manager_dashboard')}
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
            onBack={() => transitionTo('forgot_password', undefined, 'backward')}
            onVerify={() => transitionTo('new_password')}
          />
        );

      case 'new_password':
        return (
          <NewPasswordScreen
            onBack={() => transitionTo('otp_verification', undefined, 'backward')}
            onResetComplete={() => transitionTo('login')}
          />
        );

      case 'dashboard':
        return (
          <DashboardScreen
            onSignOut={() => transitionTo('login', undefined, 'backward')}
            onCheckIn={() => transitionTo('checkin_location')}
          />
        );

      case 'admin_dashboard':
        return (
          <AdminDashboardScreen
            onNavigate={(navS, navP) => transitionTo(navS as ScreenName, navP)}
            routeParams={p}
          />
        );

      case 'manager_dashboard':
        return (
          <ManagerDashboardScreen
            onNavigate={(navS, navP) => transitionTo(navS as ScreenName, navP)}
            routeParams={p}
            isCheckedInGlobal={isCheckedIn}
            checkInTimeGlobal={isCheckedIn ? checkInTime : null}
            onCheckInPress={() => transitionTo('checkin_location')}
            onCheckOutPress={handleCheckOut}
          />
        );

      case 'admin_staff':
        return (
          <AdminStaffScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
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
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
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
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
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
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
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
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
              }
            }}
          />
        );

      case 'admin_holidays':
        return (
          <AdminHolidayScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
              }
            }}
          />
        );

      case 'admin_companies':
        return (
          <AdminCompanyScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
              }
            }}
          />
        );

      case 'admin_assets':
        return (
          <AdminAssetScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('admin_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('admin_dashboard', undefined, 'backward');
              }
            }}
          />
        );

      case 'admin_staff_detail':
        return (
          <AdminStaffDetailScreen
            staffId={p?.staffId}
            onBack={() => transitionTo('admin_staff', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_client_detail':
        return (
          <AdminClientDetailScreen
            clientId={p?.clientId}
            onBack={() => transitionTo('admin_client', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_project_detail':
        return (
          <AdminProjectDetailScreen
            projectId={p?.projectId}
            onBack={() => transitionTo('admin_projects', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_company_detail':
        return (
          <AdminCompanyDetailScreen
            companyDetailsID={p?.companyDetailsID}
            onBack={() => transitionTo('admin_companies', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_asset_detail':
        return (
          <AdminAssetDetailScreen
            assetId={p?.assetId}
            onBack={() => transitionTo('admin_assets', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_leave_setting_detail':
        return (
          <AdminLeaveSettingDetailScreen
            leaveId={p?.leaveId}
            onBack={() => transitionTo('admin_leave_settings', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_holiday_detail':
        return (
          <AdminHolidayDetailScreen
            holidayId={p?.holidayId}
            onBack={() => transitionTo('admin_holidays', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_roles_permissions':
        return (
          <AdminRolesPermissionsScreen
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
            onBack={() => transitionTo('admin_dashboard', { menuOpen: true }, 'backward')}
          />
        );

      case 'admin_role_detail':
        return (
          <AdminRoleDetailScreen
            roleId={p?.roleId}
            onBack={() => transitionTo('admin_roles_permissions', undefined, 'backward')}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
          />
        );

      case 'admin_profile':
        return (
          <AdminProfileScreen
            onBack={() => transitionTo('admin_dashboard', { menuOpen: true }, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'admin_help':
        return (
          <AdminHelpScreen
            onBack={() => transitionTo('admin_dashboard', { menuOpen: true }, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_roles_permissions':
        return (
          <ManagerRolesPermissionsScreen
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
            onBack={() => transitionTo('manager_dashboard', { menuOpen: true }, 'backward')}
          />
        );

      case 'manager_role_detail':
        return (
          <ManagerRoleDetailScreen
            roleId={screenParams?.roleId}
            onBack={() => transitionTo('manager_roles_permissions', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_help':
        return (
          <ManagerHelpScreen
            onBack={() => transitionTo('manager_dashboard', { menuOpen: true }, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_profile':
        return (
          <ManagerProfileScreen
            onBack={() => transitionTo('manager_dashboard', { menuOpen: true }, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_create_claim':
        return (
          <ManagerCreateClaimScreen
            onBack={() => transitionTo('manager_dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      // ── CHECK-IN FLOW ─────────────────────────────────────────────────────
      case 'checkin_location': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        if (isManager) {
          return (
            <ManagerCheckInLocationScreen
              onBack={() => transitionTo('manager_dashboard', undefined, 'backward')}
              onConfirm={handleCheckInConfirmed}
              onValidationFailed={(distance) => {
                setFailedDistance(distance);
                transitionTo('location_failed');
              }}
            />
          );
        }
        return (
          <CheckInLocationScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onConfirm={handleCheckInConfirmed}
            onValidationFailed={(distance) => {
              setFailedDistance(distance);
              transitionTo('location_failed');
            }}
          />
        );
      }

      case 'checkin_success': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        if (isManager) {
          return (
            <ManagerCheckInSuccessScreen
              checkInTime={checkInTime}
              locationName="HQ Block A"
              onGoToHistory={() => transitionTo('attendance_history')}
            />
          );
        }
        return (
          <CheckInSuccessScreen
            checkInTime={checkInTime}
            locationName="HQ Block A"
            onGoToHistory={() => transitionTo('attendance_history')}
          />
        );
      }

      case 'location_failed': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        if (isManager) {
          return (
            <ManagerLocationFailedScreen
              distance={failedDistance}
              onRetry={() => transitionTo('checkin_location')}
              onBack={() => transitionTo('manager_dashboard', undefined, 'backward')}
            />
          );
        }
        return (
          <LocationFailedScreen
            distance={failedDistance}
            onRetry={() => transitionTo('checkin_location')}
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
          />
        );
      }

      case 'admin_alerts':
        return (
          <AdminAlertsScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => transitionTo('admin_dashboard', undefined, 'backward')}
          />
        );

      case 'admin_reports':
        return (
          <AdminReportsScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => transitionTo('admin_dashboard', undefined, 'backward')}
          />
        );

      case 'attendance_history': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        if (isManager) {
          return (
            <ManagerAttendanceHistoryScreen
              liveRecords={checkInHistory}
              onReturnHome={() => transitionTo('manager_dashboard', undefined, 'backward')}
            />
          );
        }
        return (
          <AttendanceHistoryScreen
            liveRecords={checkInHistory}
            onReturnHome={() => transitionTo('dashboard', undefined, 'backward')}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <View style={styles.container}>
        {/* Previous Screen */}
        {prevScreen && (
          <Animated.View style={[StyleSheet.absoluteFill, {
            zIndex: navDirection === 'forward' ? 0 : 10,
            transform: [{
              translateX: transitionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: navDirection === 'forward' ? [0, -SCREEN_WIDTH * 0.3] : [0, SCREEN_WIDTH]
              })
            }],
            shadowColor: '#000',
            shadowOffset: { width: -5, height: 0 },
            shadowOpacity: navDirection === 'backward' ? 0.3 : 0,
            shadowRadius: 10,
            elevation: navDirection === 'backward' ? 10 : 0,
          }]}>
            {renderScreenComponent(prevScreen, prevScreenParams)}
          </Animated.View>
        )}

        {/* Current/Incoming Screen */}
        <Animated.View style={[StyleSheet.absoluteFill, {
          zIndex: navDirection === 'forward' ? 10 : 0,
          transform: [{
            translateX: prevScreen ? transitionAnim.interpolate({
              inputRange: [0, 1],
              outputRange: navDirection === 'forward' ? [SCREEN_WIDTH, 0] : [-SCREEN_WIDTH * 0.3, 0]
            }) : 0
          }],
          shadowColor: '#000',
          shadowOffset: { width: -5, height: 0 },
          shadowOpacity: (prevScreen && navDirection === 'forward') ? 0.3 : 0,
          shadowRadius: 10,
          elevation: (prevScreen && navDirection === 'forward') ? 10 : 0,
        }]}>
          {renderScreenComponent(screen, screenParams)}
        </Animated.View>
      </View>
    </ThemeProvider>
  );
}

export default function MainApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
