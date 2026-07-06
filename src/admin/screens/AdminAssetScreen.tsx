import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

interface AdminAssetScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const ASSET_DATA = [
  {
    id: 'AST-001',
    name: 'MacBook Pro 16"',
    serial: 'C02F9823MD6R',
    image: require('../../../assets/images/asset_macbook.png'),
    condition: 'Good',
    status: 'In Use',
  },
  {
    id: 'AST-002',
    name: 'iPhone 14 Pro',
    serial: 'F4G987HKL2',
    image: require('../../../assets/images/asset_iphone.png'),
    condition: 'Minor Wear',
    status: 'In Use',
  },
  {
    id: 'AST-003',
    name: 'Dell UltraSharp 27"',
    serial: 'CN-0YVW33-74261',
    image: require('../../../assets/images/asset_monitor.png'),
    condition: 'Good',
    status: 'Available',
  },
  {
    id: 'AST-004',
    name: 'Mechanical Keyboard',
    serial: 'KB-20234-MX87',
    image: require('../../../assets/images/asset_keyboard.png'),
    condition: 'Good',
    status: 'In Use',
  },
];

export default function AdminAssetScreen({ onNavigate, onBack }: AdminAssetScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCardPress = (id: string) => {
    onNavigate?.('admin_asset_detail', { assetId: id });
  };

  const filteredAssets = ASSET_DATA.filter((asset) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      asset.name.toLowerCase().includes(query) ||
      asset.serial.toLowerCase().includes(query) ||
      asset.id.toLowerCase().includes(query)
    );
  });

  const getConditionStyle = (condition: string) => {
    if (condition === 'Good') {
      return {
        bg: colors.successBg,
        text: colors.success,
        icon: 'check-circle' as const,
      };
    } else if (condition === 'Minor Wear') {
      return {
        bg: colors.amberBg,
        text: colors.amber,
        icon: 'alert-triangle' as const,
      };
    }
    return {
      bg: colors.iconBg,
      text: colors.textSecond,
      icon: 'info' as const,
    };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Assets</Text>
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
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Feather name="search" size={18} color={colors.textSecond} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search assets..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Asset List */}
        {filteredAssets.map((asset) => {
          const condStyle = getConditionStyle(asset.condition);
          return (
            <TouchableOpacity
              key={asset.id}
              activeOpacity={0.8}
              onPress={() => handleCardPress(asset.id)}
              style={[styles.assetCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              {/* Top section: image thumbnail + info + type icon */}
              <View style={styles.cardTopRow}>
                {/* Product Image Thumbnail */}
                <View style={[styles.thumbnailBox, { backgroundColor: colors.iconBg }]}>
                  <Image
                    source={asset.image}
                    style={styles.thumbnailImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Info */}
                <View style={styles.assetInfo}>
                  <View style={styles.assetNameRow}>
                    <Text style={[styles.assetName, { color: colors.textPrimary }]} numberOfLines={2}>
                      {asset.name}
                    </Text>
                  </View>
                  <Text style={[styles.serialText, { color: colors.textSecond }]}>SN: {asset.serial}</Text>

                  {/* Condition Badge */}
                  <View style={[styles.conditionBadge, { backgroundColor: condStyle.bg }]}>
                    <Feather name={condStyle.icon} size={12} color={condStyle.text} />
                    <Text style={[styles.conditionText, { color: condStyle.text }]}>
                      {asset.condition === 'Good' ? 'Condition: Good' : asset.condition}
                    </Text>
                  </View>
                </View>
              </View>


            </TouchableOpacity>
          );
        })}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },

  /* Asset Card */
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },

  /* Thumbnail */
  thumbnailBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
  },

  /* Asset Info */
  assetInfo: {
    flex: 1,
    paddingTop: 2,
  },
  assetNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
    lineHeight: 22,
  },

  serialText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 10,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Card Divider */
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* Action Buttons */
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  reportBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  replaceBtn: {
    flex: 1.6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  replaceBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Bottom Tab Bar */
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    color: '#64748B',
    fontWeight: '500',
  },
});
