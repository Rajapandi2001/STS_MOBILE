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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdminLeaveSettingsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const LEAVE_DATA = [
  {
    id: '1',
    name: 'ANNUAL LEAVE',
    policyId: 'AL-2026',
    type: 'Paid',
    description: 'Vacation Block',
    days: '18 Days',
    icon: 'island',
    iconType: 'MaterialCommunityIcons',
    color: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: '2',
    name: 'MEDICAL LEAVE',
    policyId: 'ML-2026',
    type: 'Sick',
    description: 'Allocation Block',
    days: '12 Days',
    icon: 'hospital-building',
    iconType: 'MaterialCommunityIcons',
    color: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    id: '3',
    name: 'MATERNITY LEAVE',
    policyId: 'MAT-2026',
    type: 'Parental',
    description: 'Care Block',
    days: '24 Days',
    icon: 'baby-bottle-outline',
    iconType: 'MaterialCommunityIcons',
    color: '#E0F2FE',
    iconColor: '#0284C7',
  },
  {
    id: '4',
    name: 'CASUAL LEAVE',
    policyId: 'CL-2026',
    type: 'Contingency Allocation', // Wait, wireframe says: CL-2026 | Contingency Allocation (wait, "Contingency Allocation" is the description. Let's make it match description and type: "Contingency" / "Unpaid" etc. Let's use empty or Paid)
    typeText: 'Paid', // We can just display Policy ID: CL-2026 | Contingency Allocation
    description: 'Contingency Allocation',
    days: '08 Days',
    icon: 'email-outline',
    iconType: 'MaterialCommunityIcons',
    color: '#F1F5F9',
    iconColor: '#475569',
  },
];

export default function AdminLeaveSettingsScreen({ onNavigate, onBack }: AdminLeaveSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredLeaves = LEAVE_DATA.filter((leave) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      leave.name.toLowerCase().includes(query) ||
      leave.policyId.toLowerCase().includes(query) ||
      leave.description.toLowerCase().includes(query) ||
      leave.type.toLowerCase().includes(query)
    );
  });

  const renderIcon = (leave: typeof LEAVE_DATA[0]) => {
    if (leave.iconType === 'MaterialCommunityIcons') {
      return (
        <MaterialCommunityIcons
          name={leave.icon as any}
          size={24}
          color={leave.iconColor}
        />
      );
    }
    return <Feather name={leave.icon as any} size={24} color={leave.iconColor} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack?.()}>
          <Feather name="arrow-left" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Settings</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>AP</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leave parameters or limits..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Section Header */}
        <Text style={styles.sectionHeader}>STAFF LEAVE SETTINGS LEDGER</Text>

        {/* Leave List */}
        {filteredLeaves.map((leave) => (
          <View key={leave.id} style={styles.leaveCard}>
            <View style={styles.cardMainRow}>
              <View style={[styles.iconContainer, { backgroundColor: leave.color }]}>
                {renderIcon(leave)}
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.leaveName}>{leave.name}</Text>
                <Text style={styles.policyText}>
                  Policy ID: {leave.policyId} {leave.type ? `| ${leave.type}` : ''}
                </Text>
                <Text style={styles.descriptionText}>{leave.description}</Text>
              </View>
              <View style={styles.daysCol}>
                <Text style={styles.daysText}>{leave.days}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="home" size={22} color="#64748B" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_staff', { source: 'dashboard' })}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color="#64748B" />
          <Text style={styles.tabText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color="#64748B" />
          <Text style={styles.tabText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bell" size={22} color="#64748B" />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard', { menuOpen: true })}>
          <Feather name="grid" size={22} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Menu</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
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
  avatarText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
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
    fontSize: 14,
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  leaveName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  policyText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 1,
  },
  descriptionText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  daysCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  daysText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
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
