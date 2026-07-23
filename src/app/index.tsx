import React, { useState, useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View, BackHandler, Alert } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import SplashScreen from '@/common/screens/SplashScreen';
import LoginScreen from '@/auth/screens/LoginScreen';
import ForgotPasswordScreen from '@/auth/screens/ForgotPasswordScreen';
import OtpScreen from '@/auth/screens/OtpScreen';
import NewPasswordScreen from '@/auth/screens/NewPasswordScreen';
import EmployeeDashboardScreen from '@/employee/screens/EmployeeDashboardScreen';
import EmployeeCheckInLocationScreen from '@/employee/screens/EmployeeCheckInLocationScreen';
import EmployeeCheckInSuccessScreen from '@/employee/screens/EmployeeCheckInSuccessScreen';
import EmployeeLocationFailedScreen from '@/employee/screens/EmployeeLocationFailedScreen';
import EmployeeAttendanceHistoryScreen, { AttendanceRecord } from '@/employee/screens/EmployeeAttendanceHistoryScreen';
import EmployeeProfileScreen from '@/employee/screens/EmployeeProfileScreen';
import EmployeeHelpScreen from '@/employee/screens/EmployeeHelpScreen';
import EmployeeAssetScreen from '@/employee/screens/EmployeeAssetScreen';
import EmployeeApplyLeaveScreen from '@/employee/screens/EmployeeApplyLeaveScreen';
import EmployeeCreateClaimScreen from '@/employee/screens/EmployeeCreateClaimScreen';
import EmployeeChangePasswordScreen from '@/employee/screens/EmployeeChangePasswordScreen';
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
import ManagerClaimManagementScreen from '@/manager/screens/ManagerClaimManagementScreen';
import ManagerClaimsHistoryScreen from '@/manager/screens/ManagerClaimsHistoryScreen';
import ManagerLeaveHistoryScreen from '@/manager/screens/ManagerLeaveHistoryScreen';
import ManagerAssetScreen from '@/manager/screens/ManagerAssetScreen';
import ManagerReportsScreen from '@/manager/screens/ManagerReportsScreen';
import ManagerCreateLeaveScreen from '@/manager/screens/ManagerCreateLeaveScreen';
import ManagerLeaveManagementScreen from '@/manager/screens/ManagerLeaveManagementScreen';
import AdminStaffScreen from '@/admin/screens/AdminStaffScreen';
import AdminClientScreen from '@/admin/screens/AdminClientScreen';
import AdminLeaveSettingsScreen from '@/admin/screens/AdminLeaveSettingsScreen';
import AdminUserGroupsScreen from '@/admin/screens/AdminUserGroupsScreen';
import AdminUserGroupDetailScreen from '@/admin/screens/AdminUserGroupDetailScreen';
import AdminProjectsScreen from '@/admin/screens/AdminProjectsScreen';
import AdminProfileScreen from '@/admin/screens/AdminProfileScreen';
import AdminHelpScreen from '@/admin/screens/AdminHelpScreen';
import AdminHolidayScreen from '@/admin/screens/AdminHolidayScreen';
import AdminCompanyScreen from '@/admin/screens/AdminCompanyScreen';
import AdminAssetScreen from '@/admin/screens/AdminAssetScreen';
import AdminOfficeLocationScreen from '@/admin/screens/AdminOfficeLocationScreen';
import AdminShiftMasterScreen from '@/admin/screens/AdminShiftMasterScreen';
import AdminShiftDetailScreen from '@/admin/screens/AdminShiftDetailScreen';
import AdminAttendanceRulesScreen from '@/admin/screens/AdminAttendanceRulesScreen';
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
import ManagerAlertScreen from '@/manager/screens/ManagerAlertScreen';
import AdminReportsScreen from '@/admin/screens/AdminReportsScreen';
import ManagerChangePasswordScreen from '@/manager/screens/ManagerChangePasswordScreen';
import ManagerTeamScreen from '@/manager/screens/ManagerTeamScreen';
import ManagerTimeScreen from '@/manager/screens/ManagerTimeScreen';
import ManagerShiftMasterScreen from '@/manager/screens/ManagerShiftMasterScreen';

type ScreenName =
  | 'splash'
  | 'login'
  | 'forgot_password'
  | 'otp_verification'
  | 'new_password'
  | 'dashboard'
  | 'admin_dashboard'
  | 'manager_dashboard'
  | 'manager_team'
  | 'manager_time'
  | 'manager_alerts'
  | 'checkin_location'
  | 'checkin_success'
  | 'location_failed'
  | 'attendance_history'
  | 'admin_staff'
  | 'admin_client'
  | 'admin_leave_settings'
  | 'admin_user_groups'
  | 'admin_user_group_detail'
  | 'admin_projects'
  | 'admin_profile'
  | 'admin_help'
  | 'admin_holidays'
  | 'admin_companies'
  | 'admin_assets'
  | 'admin_office_locations'
  | 'admin_shift_master'
  | 'admin_shift_detail'
  | 'admin_attendance_rules'
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
  | 'manager_claim_management'
  | 'manager_claims_history'
  | 'manager_leave_history'
  | 'manager_create_claim'
  | 'manager_assets'
  | 'manager_reports'
  | 'manager_create_leave'
  | 'manager_leave_management'
  | 'employee_profile'
  | 'employee_help'
  | 'employee_assets'
  | 'employee_apply_leave'
  | 'employee_create_claim'
  | 'employee_change_password'
  | 'manager_shift_master'
  | 'manager_change_password';

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
      case 'admin_assets':
      case 'admin_office_locations':
      case 'admin_shift_master':
      case 'admin_attendance_rules': {
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

      case 'admin_shift_detail':
        transitionTo('admin_shift_master', undefined, 'backward');
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

      case 'admin_user_group_detail':
        transitionTo('admin_user_groups', undefined, 'backward');
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
      case 'manager_change_password':
      case 'manager_shift_master':
        transitionTo('manager_dashboard', { menuOpen: true }, 'backward');
        return true;

      case 'manager_claim_management':
        transitionTo('manager_dashboard', undefined, 'backward');
        return true;

      case 'manager_claims_history':
        transitionTo('manager_claim_management', undefined, 'backward');
        return true;

      case 'manager_leave_history':
        transitionTo('manager_leave_management', undefined, 'backward');
        return true;

      case 'manager_leave_management':
        transitionTo('manager_dashboard', undefined, 'backward');
        return true;

      case 'manager_create_leave':
        transitionTo('manager_leave_management', undefined, 'backward');
        return true;

      case 'manager_create_claim':
        transitionTo('manager_claim_management', undefined, 'backward');
        return true;

      case 'manager_assets':
      case 'manager_reports': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        transitionTo(isManager ? 'manager_dashboard' : 'dashboard', undefined, 'backward');
        return true;
      }

      case 'checkin_location':
      case 'location_failed':
      case 'checkin_success':
      case 'attendance_history': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        transitionTo(isManager ? 'manager_dashboard' : 'dashboard', undefined, 'backward');
        return true;
      }

      case 'employee_profile':
      case 'employee_help':
      case 'employee_assets':
      case 'employee_apply_leave':
      case 'employee_create_claim':
      case 'employee_change_password':
        transitionTo('dashboard', undefined, 'backward');
        return true;

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
    if ((nextScreen === 'admin_staff' || nextScreen === 'admin_client' || nextScreen === 'admin_leave_settings' || nextScreen === 'admin_user_groups' || nextScreen === 'admin_projects' || nextScreen === 'admin_holidays' || nextScreen === 'admin_companies' || nextScreen === 'admin_assets' || nextScreen === 'admin_office_locations' || nextScreen === 'admin_shift_master' || nextScreen === 'admin_attendance_rules' || nextScreen === 'manager_shift_master') && params?.source) {
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
          <EmployeeDashboardScreen
            onSignOut={() => transitionTo('login', undefined, 'backward')}
            onCheckIn={() => transitionTo('checkin_location')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            routeParams={p}
            isCheckedInGlobal={isCheckedIn}
            checkInTimeGlobal={isCheckedIn ? checkInTime : null}
            onCheckOutPress={handleCheckOut}
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

      case 'manager_team':
        return (
          <ManagerTeamScreen
            onNavigate={(navS, navP) => transitionTo(navS as ScreenName, navP)}
            routeParams={p}
          />
        );

      case 'manager_time':
        return (
          <ManagerTimeScreen
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

      case 'admin_office_locations':
        return (
          <AdminOfficeLocationScreen
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

      case 'admin_shift_master':
        return (
          <AdminShiftMasterScreen
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

      case 'admin_shift_detail':
        return (
          <AdminShiftDetailScreen
            shiftId={p?.shiftId}
            onNavigate={(s, navP) => transitionTo(s as ScreenName, navP)}
            onBack={() => transitionTo('admin_shift_master', undefined, 'backward')}
          />
        );

      case 'admin_attendance_rules':
        return (
          <AdminAttendanceRulesScreen
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
            assetID={p?.assetID}
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

      case 'admin_user_group_detail':
        return (
          <AdminUserGroupDetailScreen
            groupID={p?.groupID}
            onBack={() => transitionTo('admin_user_groups', undefined, 'backward')}
            onNavigate={(s: string, navP?: any) => transitionTo(s as ScreenName, navP)}
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

      case 'manager_change_password':
        return (
          <ManagerChangePasswordScreen
            onBack={() => transitionTo('manager_dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_claim_management':
        return (
          <ManagerClaimManagementScreen
            onBack={() => transitionTo('manager_dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_claims_history':
        return (
          <ManagerClaimsHistoryScreen
            onBack={() => transitionTo('manager_claim_management', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_leave_history':
        return (
          <ManagerLeaveHistoryScreen
            onBack={() => transitionTo('manager_leave_management', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_create_claim':
        return (
          <ManagerCreateClaimScreen
            onBack={() => transitionTo('manager_claim_management', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_assets': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        return (
          <ManagerAssetScreen
            onBack={() => transitionTo(isManager ? 'manager_dashboard' : 'dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );
      }

      case 'manager_reports':
        return (
          <ManagerReportsScreen
            onBack={() => transitionTo('manager_dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'manager_create_leave': {
        return (
          <ManagerCreateLeaveScreen
            onBack={() => transitionTo('manager_leave_management', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            initialParams={screenParams}
          />
        );
      }

      case 'manager_leave_management': {
        const isManager = user?.userName?.toLowerCase() === 'manager' || user?.groupID === 3;
        return (
          <ManagerLeaveManagementScreen
            onBack={() => transitionTo(isManager ? 'manager_dashboard' : 'dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            initialParams={screenParams}
          />
        );
      }
      case 'manager_shift_master':
        return (
          <ManagerShiftMasterScreen
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            onBack={() => {
              if (navSource === 'menu') {
                transitionTo('manager_dashboard', { menuOpen: true }, 'backward');
              } else {
                transitionTo('manager_dashboard', undefined, 'backward');
              }
            }}
          />
        );

      case 'manager_alerts':
        return (
          <ManagerAlertScreen
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
          <EmployeeCheckInLocationScreen
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
              onGoToDashboard={() => transitionTo('manager_dashboard', { isCheckedInGlobal: true, checkInTimeGlobal: checkInTime.getTime() }, 'backward')}
            />
          );
        }
        return (
          <EmployeeCheckInSuccessScreen
            checkInTime={checkInTime}
            locationName="HQ Block A"
            onGoToDashboard={() => transitionTo('dashboard', { isCheckedInGlobal: true, checkInTimeGlobal: checkInTime.getTime() }, 'backward')}
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
          <EmployeeLocationFailedScreen
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
              onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
            />
          );
        }
        return (
          <EmployeeAttendanceHistoryScreen
            liveRecords={checkInHistory}
            onReturnHome={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );
      }

      case 'employee_profile':
        return (
          <EmployeeProfileScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'employee_help':
        return (
          <EmployeeHelpScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'employee_assets':
        return (
          <EmployeeAssetScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'employee_apply_leave':
        return (
          <EmployeeApplyLeaveScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'employee_create_claim':
        return (
          <EmployeeCreateClaimScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

      case 'employee_change_password':
        return (
          <EmployeeChangePasswordScreen
            onBack={() => transitionTo('dashboard', undefined, 'backward')}
            onNavigate={(s, p) => transitionTo(s as ScreenName, p)}
          />
        );

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
