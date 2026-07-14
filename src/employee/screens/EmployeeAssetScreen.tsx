import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import EmployeeMenu from '@/employee/components/EmployeeMenu';

interface EmployeeAssetScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

const ASSET_DATA = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    type: 'laptop',
    sn: 'C02F9823MD6R',
    condition: 'Good',
    conditionIcon: 'check-circle',
    conditionColor: '#10B981',
    conditionBg: '#ECFDF5',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    name: 'iPhone 14 Pro',
    type: 'mobile',
    sn: 'F4G987HKL2',
    condition: 'Minor Wear',
    conditionIcon: 'alert-triangle',
    conditionColor: '#F59E0B',
    conditionBg: '#FFFBEB',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    name: 'Dell UltraSharp 27"',
    type: 'monitor',
    sn: 'CN-0YVW33-74261',
    condition: 'Good',
    conditionIcon: 'check-circle',
    conditionColor: '#10B981',
    conditionBg: '#ECFDF5',
    image: null,
  },
];

export default function EmployeeAssetScreen({ onNavigate, onBack }: EmployeeAssetScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDeviceIcon = (type: string): any => {
    switch (type) {
      case 'laptop':
        return 'laptop';
      case 'mobile':
        return 'smartphone';
      case 'monitor':
        return 'monitor';
      default:
        return 'box';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen || '#F8FAFC', paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.borderHeader }]}>
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: colors.iconBg }]}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.brand }]}>My Assets</Text>
        <TouchableOpacity
          style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}
          activeOpacity={0.8}
          onPress={() => onNavigate?.('employee_profile')}
        >
          <Feather name="user" size={20} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Assigned Assets</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecond }]}>
          Review your company-issued equipment and request assistance.
        </Text>

        <View style={styles.assetList}>
          {ASSET_DATA.map((asset) => (
            <View key={asset.id} style={[styles.assetCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.assetMain}>
                {asset.image ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: asset.image }} style={styles.assetImage} />
                  </View>
                ) : (
                  <View style={[styles.placeholderContainer, { backgroundColor: colors.iconBg }]}>
                    <Feather name={getDeviceIcon(asset.type)} size={32} color={colors.brand} />
                  </View>
                )}

                <View style={styles.assetInfo}>
                  <View style={styles.assetTitleRow}>
                    <Text style={[styles.assetName, { color: colors.textPrimary }]}>{asset.name}</Text>
                    {asset.image && (
                      <Feather
                        name={getDeviceIcon(asset.type)}
                        size={16}
                        color={colors.textSecond}
                        style={styles.deviceTypeIcon}
                      />
                    )}
                  </View>
                  <Text style={[styles.assetSn, { color: colors.textSecond }]}>S/N: {asset.sn}</Text>

                  <View style={[styles.conditionBadge, { backgroundColor: asset.conditionBg }]}>
                    <Feather name={asset.conditionIcon as any} size={14} color={asset.conditionColor} />
                    <Text style={[styles.conditionText, { color: asset.conditionColor }]}>{asset.condition}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.borderLight }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Report issue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.brand, borderColor: colors.brand }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionBtnTextPrimary, { color: '#FFFFFF' }]}>Request upgrade</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard')}>
          <Feather name="home" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_create_claim')}>
          <MaterialCommunityIcons name="receipt-outline" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Claim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('dashboard', { openCalendar: true })}>
          <Feather name="clock" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={() => onNavigate?.('employee_apply_leave')}>
          <Feather name="calendar" size={22} color={colors.tabInactive} />
          <Text style={[styles.tabText, { color: colors.tabInactive }]}>Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <MaterialCommunityIcons name="laptop" size={22} color={colors.tabActive} />
          <Text style={[styles.tabText, { color: colors.tabActive }]}>Asset</Text>
        </TouchableOpacity>
      </View>

      <EmployeeMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginLeft: 12 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  assetList: { gap: 16 },
  assetCard: { borderRadius: 20, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  assetMain: { flexDirection: 'row', alignItems: 'flex-start' },
  imageContainer: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F5F9', marginRight: 16 },
  assetImage: { width: '100%', height: '100%' },
  placeholderContainer: { width: 80, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  assetInfo: { flex: 1, paddingTop: 2 },
  assetTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  assetName: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  deviceTypeIcon: { marginTop: 2 },
  assetSn: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  conditionBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 6 },
  conditionText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  actionBtnTextPrimary: { fontSize: 13, fontWeight: '600' },
  bottomTabBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
