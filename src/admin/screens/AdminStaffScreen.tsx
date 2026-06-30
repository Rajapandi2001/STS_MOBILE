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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdminStaffScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

const STAFF_DATA = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    empId: 'EMP-8492',
    role: 'Senior Analyst',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Michael Chen',
    empId: 'EMP-8211',
    role: 'Product Manager',
    department: 'Product',
    status: 'Active',
    initials: 'MC',
    color: '#DBEAFE',
    textColor: '#1D4ED8',
  },
  {
    id: '3',
    name: 'David Rossi',
    empId: 'EMP-7944',
    role: 'Finance Director',
    department: 'Finance',
    status: 'Inactive',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: '4',
    name: 'Amanda Patel',
    empId: 'EMP-8633',
    role: 'UX Designer',
    department: 'Design',
    status: 'Pending',
    initials: 'AP',
    color: '#FFEDD5',
    textColor: '#C2410C',
  },
];

export default function AdminStaffScreen({ onNavigate, onBack }: AdminStaffScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderStatusBadge = (status: string) => {
    let bgColor = '#DCFCE7';
    let textColor = '#16A34A';
    if (status === 'Inactive') {
      bgColor = '#F1F5F9';
      textColor = '#64748B';
    } else if (status === 'Pending') {
      bgColor = '#FFEDD5';
      textColor = '#EA580C';
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: textColor }]} />
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => onBack?.()}>
          <Feather name="arrow-left" size={24} color="#64748B" />
        </TouchableOpacity>
        <View style={styles.avatarCircle} />
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
            placeholder="Search users..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Staff List */}
        {STAFF_DATA.map((staff) => {
          const isSelected = selectedStaff.includes(staff.id);
          return (
            <View key={staff.id} style={styles.staffCard}>
              <View style={styles.staffHeaderRow}>
                <View style={styles.staffInfoRow}>
                  {staff.avatar ? (
                    <Image source={{ uri: staff.avatar }} style={styles.staffAvatar} />
                  ) : (
                    <View style={[styles.staffAvatarInitials, { backgroundColor: staff.color }]}>
                      <Text style={[styles.staffInitialsText, { color: staff.textColor }]}>
                        {staff.initials}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.staffName}>{staff.name}</Text>
                    <Text style={styles.staffEmpId}>{staff.empId}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                  onPress={() => toggleSelect(staff.id)}
                >
                  {isSelected && <Feather name="check" size={14} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>

              <View style={styles.staffDivider} />

              <View style={styles.staffDetailsRow}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <Text style={styles.detailValue}>{staff.role}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{staff.department}</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                {renderStatusBadge(staff.status)}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_dashboard')}>
          <Feather name="grid" size={22} color="#64748B" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color="#0A52D6" />
          <Text style={[styles.tabText, { color: '#0A52D6' }]}>Staffs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={22} color="#64748B" />
          <Text style={styles.tabText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bell" size={22} color="#64748B" />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate?.('admin_menu')}>
          <Feather name="settings" size={22} color="#64748B" />
          <Text style={styles.tabText}>Menu</Text>
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
  menuButton: {
    padding: 4,
    marginLeft: -4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#94A3B8', // Gray placeholder
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0A52D6',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  btnOutlineBlue: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0A52D6',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineBlueText: {
    color: '#0A52D6',
    fontWeight: '600',
    fontSize: 14,
  },
  btnOutlineGray: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineGrayText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  btnIcon: {
    marginRight: 6,
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
  staffCard: {
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
  staffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  staffInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  staffAvatarInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffInitialsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  staffEmpId: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0A52D6',
    borderColor: '#0A52D6',
  },
  staffDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  staffDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
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
