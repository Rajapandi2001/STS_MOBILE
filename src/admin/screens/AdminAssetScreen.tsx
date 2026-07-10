import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/apiClient';
import AdminMenu from '@/admin/components/AdminMenu';

interface AdminAssetScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

interface AssetData {
  assetID: number;
  assetCode: string;
  assetType: string;
  dateOfPurchase: string;
  costOfPurchase: string;
  serialNumber: string | null;
  empName: string | null;
}

export default function AdminAssetScreen({ onNavigate, onBack }: AdminAssetScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Assigned' | 'Unassigned'>('All');
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('http://smartdigitalbuild360.com:91/STSMobileAPI/api/Asset');
      
      if (response.data && response.data.status && response.data.statusCode === 200) {
        setAssets(response.data.data || []);
      } else {
        setAssets([]);
        Alert.alert('Error', response.data?.message || 'Failed to fetch assets.');
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          await AsyncStorage.clear();
          onNavigate?.('login');
        } else if (error.response.status === 404) {
          Alert.alert('Not Found', 'The requested resource was not found.');
        } else if (error.response.status === 500) {
          Alert.alert('Server Error', 'Internal server error occurred.');
        } else {
          Alert.alert('Error', error.response.data?.message || 'An unexpected error occurred.');
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'No response received from the server. Please check your internet connection or timeout.');
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCardPress = (id: string) => {
    onNavigate?.('admin_asset_detail', { assetID: id });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${MM}/${yyyy}`;
  };

  const filteredAssets = assets.filter((asset) => {
    const query = search.toLowerCase().trim();
    
    // Check search query
    let matchesSearch = true;
    if (query) {
      matchesSearch = (
        (asset.assetCode?.toLowerCase() || '').includes(query) ||
        (asset.serialNumber?.toLowerCase() || '').includes(query) ||
        (asset.assetType?.toLowerCase() || '').includes(query) ||
        (asset.empName?.toLowerCase() || '').includes(query)
      );
    }

    // Check assignment filter
    let matchesFilter = true;
    const isAssigned = (asset.empName || '').trim().length > 0;
    
    if (filterType === 'Assigned') {
      matchesFilter = isAssigned;
    } else if (filterType === 'Unassigned') {
      matchesFilter = !isAssigned;
    }

    return matchesSearch && matchesFilter;
  });


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
        <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
          Search and manage organizational assets.
        </Text>

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

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {['All', 'Assigned', 'Unassigned'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                { borderColor: colors.brandBorder },
                filterType === type ? { backgroundColor: colors.brand } : { backgroundColor: 'transparent' }
              ]}
              onPress={() => setFilterType(type as any)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === type ? { color: '#FFFFFF' } : { color: colors.brand }
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Asset List */}
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : filteredAssets.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecond }}>No assets found.</Text>
          </View>
        ) : (
          filteredAssets.map((asset) => {
            const typeLower = (asset.assetType || '').toLowerCase();
            let imageSource = require('../../../assets/images/asset_macbook.png');
            if (typeLower.includes('phone') || typeLower.includes('mobile')) {
              imageSource = require('../../../assets/images/asset_iphone.png');
            } else if (typeLower.includes('monitor') || typeLower.includes('display')) {
              imageSource = require('../../../assets/images/asset_monitor.png');
            } else if (typeLower.includes('keyboard')) {
              imageSource = require('../../../assets/images/asset_keyboard.png');
            }

            return (
              <TouchableOpacity
                key={asset.assetID}
                activeOpacity={0.8}
                onPress={() => handleCardPress(asset.assetID.toString())}
                style={[styles.assetCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                {/* Top section: image thumbnail + info + type icon */}
                <View style={styles.cardTopRow}>
                  {/* Product Image Thumbnail */}
                  <View style={[styles.thumbnailBox, { backgroundColor: colors.iconBg }]}>
                    <Image
                      source={imageSource}
                      style={styles.thumbnailImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Info */}
                  <View style={styles.assetInfo}>
                    <View style={styles.assetNameRow}>
                      <Text style={[styles.assetName, { color: colors.textPrimary }]} numberOfLines={2}>
                        {asset.assetCode ? asset.assetCode.trim() : '-'}
                      </Text>
                    </View>
                    
                    <Text style={[styles.serialText, { color: colors.textSecond, marginBottom: 2 }]}>
                      Type: {asset.assetType ? asset.assetType.trim() : '-'}
                    </Text>
                    <Text style={[styles.serialText, { color: colors.textSecond, marginBottom: 2 }]}>
                      SN: {asset.serialNumber ? asset.serialNumber.trim() : '-'}
                    </Text>
                    <Text style={[styles.serialText, { color: colors.textSecond, marginBottom: 2 }]}>
                      Assigned: {asset.empName ? asset.empName.trim() : 'Not Assigned'}
                    </Text>
                    <Text style={[styles.serialText, { color: colors.textSecond, marginBottom: 10 }]}>
                      Cost: {asset.costOfPurchase ? asset.costOfPurchase.trim() : '-'}
                    </Text>

                    {/* Condition Badge (Reused for Date) */}
                    <View style={[styles.conditionBadge, { backgroundColor: colors.iconBg }]}>
                      <Feather name="calendar" size={12} color={colors.textSecond} />
                      <Text style={[styles.conditionText, { color: colors.textSecond }]}>
                        Date: {formatDate(asset.dateOfPurchase)}
                      </Text>
                    </View>
                  </View>
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
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 12,
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
  filterContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
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
