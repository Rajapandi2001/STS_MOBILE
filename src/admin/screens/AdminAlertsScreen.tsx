import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  read: boolean;
  actionText?: string;
  linkText?: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: '1',
    title: 'High Volume of Pending Claims',
    message: 'System has detected 45 new claims requiring immediate administrative approval within the last hour. SLA thresholds approaching.',
    time: '',
    type: 'warning',
    read: false,
    actionText: 'Review Queue',
  },
  {
    id: '2',
    title: 'New Role Created',
    message: "A new security role 'Compliance Officer Level 2' was provisioned by SuperAdmin. Review permissions matrix.",
    time: '1h ago',
    type: 'info',
    read: false,
  },
  {
    id: '3',
    title: 'System Update 2.4.0',
    message: 'Core deployment completed successfully. Global performance improvements and new reporting modules are now active.',
    time: '2h ago',
    type: 'success',
    read: true,
    linkText: 'View Release Notes',
  },
  {
    id: '4',
    title: 'Weekly Report Generated',
    message: 'The automated weekly usage and metric report is ready for download.',
    time: '1d ago',
    type: 'info',
    read: true,
  },
];

interface AdminAlertsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

export default function AdminAlertsScreen({ onNavigate, onBack }: AdminAlertsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, read: !alert.read } : alert
      )
    );
  };

  const getLeftAccentColor = (item: AlertItem) => {
    if (item.type === 'warning') return '#F97316'; // Orange/Amber accent
    if (item.type === 'success') return colors.success; // Green accent
    if (item.type === 'info') {
      return item.read ? '#CBD5E1' : colors.brand; // Gray if read, Blue if unread
    }
    return '#CBD5E1';
  };

  const getIconBgColor = (item: AlertItem) => {
    if (item.type === 'warning') {
      return isDark ? '#451A03' : '#FFF7ED'; // Amber/Orange light background
    }
    if (item.type === 'success') {
      return colors.successBg;
    }
    return colors.brandBg;
  };

  const getCustomAlertIcon = (item: AlertItem) => {
    switch (item.title) {
      case 'High Volume of Pending Claims':
        return <Feather name="alert-triangle" size={20} color="#F97316" />;
      case 'New Role Created':
        return <Feather name="shield" size={20} color={colors.brand} />;
      case 'System Update 2.4.0':
        return <Feather name="smartphone" size={20} color={colors.success} />;
      case 'Weekly Report Generated':
        return <Feather name="file-text" size={20} color={colors.textSecond} />;
      default:
        if (item.type === 'warning') return <Feather name="alert-triangle" size={20} color="#F97316" />;
        if (item.type === 'success') return <Feather name="check" size={20} color={colors.success} />;
        return <Feather name="bell" size={20} color={colors.brand} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Alerts & Notifications</Text>

        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
          activeOpacity={0.8}
          onPress={() => onNavigate?.('admin_profile', { source: 'header' })}
        >
          <Feather name="user" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Page Title & Description */}
        <View style={styles.pageHeaderContainer}>

          <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
            Review and manage system alerts and administrative updates.
          </Text>
        </View>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.brandBg }]}>
              <Feather name="bell-off" size={40} color={colors.brand} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>All caught up!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecond }]}>
              You have no alerts or notifications at the moment.
            </Text>
          </View>
        ) : (
          alerts.map((item) => {
            const cardBg = colors.card;
            const accentColor = getLeftAccentColor(item);
            const iconBgColor = getIconBgColor(item);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: colors.borderLight,
                    opacity: item.read ? 0.85 : 1,
                  }
                ]}
                activeOpacity={0.9}
                onPress={() => handleToggleRead(item.id)}
              >
                {/* Left Accent Bar */}
                <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

                {/* Icon Container */}
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                  {getCustomAlertIcon(item)}
                </View>

                {/* Details Container */}
                <View style={styles.detailsContainer}>
                  {/* Card Header Row */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.titleContainer}>
                      <Text style={[
                        styles.alertTitle,
                        { color: colors.textPrimary, fontWeight: item.read ? '600' : '700' }
                      ]}>
                        {item.title}
                      </Text>

                      {/* Blue dot for unread info alerts */}
                      {!item.read && item.type !== 'warning' && (
                        <View style={[styles.unreadDot, { backgroundColor: colors.brand }]} />
                      )}
                    </View>

                    {/* Time text / Unread Badge */}
                    <View style={styles.headerRightContainer}>
                      {item.type === 'warning' && !item.read ? (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>UNREAD</Text>
                        </View>
                      ) : (
                        item.time ? (
                          <Text style={[styles.timeText, { color: colors.textSecond }]}>
                            {item.time}
                          </Text>
                        ) : null
                      )}
                    </View>
                  </View>

                  {/* Message Text */}
                  <Text style={[
                    styles.messageText,
                    { color: colors.textSecond }
                  ]}>
                    {item.message}
                  </Text>

                  {/* Action Button */}
                  {item.actionText && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: colors.border }]}
                      activeOpacity={0.7}
                      onPress={() => handleToggleRead(item.id)}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>{item.actionText}</Text>
                    </TouchableOpacity>
                  )}

                  {/* Link Text */}
                  {item.linkText && (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      activeOpacity={0.7}
                      onPress={() => handleToggleRead(item.id)}
                    >
                      <Text style={[styles.linkBtnText, { color: colors.brand }]}>{item.linkText}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_reports')}>
          <Feather name="bar-chart-2" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      <AdminMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 8
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 2
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pageHeaderContainer: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  alertTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  headerRightContainer: {
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  linkBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  linkBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
