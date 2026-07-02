import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';

interface AdminCompanyScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const COMPANY_DATA = [
  {
    id: 'CMP-2026-01',
    name: 'GLOBAL TECH SOLUTIONS',
    country: 'United States',
  },
  {
    id: 'CMP-2026-02',
    name: 'EURO SYSTEMS LTD',
    country: 'Germany',
  },
  {
    id: 'CMP-2026-03',
    name: 'PACIFIC TECH CORP',
    country: 'Australia',
  },
  {
    id: 'CMP-2026-04',
    name: 'ORIENT INNOVATIONS',
    country: 'Japan',
  },
];

export default function AdminCompanyScreen({ onNavigate, onBack }: AdminCompanyScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleCardPress = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredCompanies = COMPANY_DATA.filter((company) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    // Filter by name, country, or ID
    return (
      company.name.toLowerCase().includes(query) ||
      company.country.toLowerCase().includes(query) ||
      company.id.toLowerCase().includes(query)
    );
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>COMPANY DETAILS</Text>
        <View style={[styles.avatarCircle, { backgroundColor: colors.brandBorder }]}>
          <Feather name="user" size={20} color={colors.brand} />
        </View>
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
            placeholder="Search Registered Companies by Name..."
            placeholderTextColor={colors.textSecond}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Section Header */}
        <Text style={[styles.sectionHeader, { color: colors.textSecond }]}>REGISTERED ENTITIES LEDGER</Text>

        {/* Company List */}
        {filteredCompanies.map((company) => {
          const isSelected = selectedIds.has(company.id);
          return (
            <TouchableOpacity
              key={company.id}
              activeOpacity={0.8}
              onPress={() => handleCardPress(company.id)}
              style={[
                styles.companyCard,
                { 
                  backgroundColor: colors.card, 
                  borderColor: isSelected ? colors.brand : colors.borderLight 
                }
              ]}
            >
              <View style={styles.cardMainRow}>
                {/* Icon Container */}
                <View style={[
                  styles.iconContainer, 
                  { 
                    backgroundColor: isSelected ? colors.brandBg : colors.cardAlt,
                    borderColor: isSelected ? colors.brandBorder : colors.border
                  }
                ]}>
                  <MaterialCommunityIcons 
                    name="office-building" 
                    size={22} 
                    color={isSelected ? colors.brand : colors.textSecond} 
                  />
                </View>

                {/* Details */}
                <View style={styles.detailCol}>
                  <Text style={[styles.companyName, { color: colors.textPrimary }]}>{company.name}</Text>
                  <Text style={[styles.companyId, { color: colors.textSecond }]}>ID: {company.id}</Text>
                </View>

                {/* Country */}
                <View style={styles.countryCol}>
                  <Text style={[styles.companyCountry, { color: colors.textPrimary }]}>{company.country}</Text>
                  {isSelected && (
                    <View style={[styles.checkIndicator, { backgroundColor: colors.brand }]}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
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

        <TouchableOpacity style={styles.tabItem}>
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
    borderBottomWidth: 1,
  },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: { 
    width: 36, 
    height: 36, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 38,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 8,
    borderWidth: 1,
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
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  companyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
  },
  detailCol: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  companyId: {
    fontSize: 12,
    fontWeight: '500',
  },
  countryCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  companyCountry: {
    fontSize: 14,
    fontWeight: '700',
  },
  checkIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
