import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminMenu from '@/admin/components/AdminMenu';
import AdminHeader from '../components/AdminHeader';
import AdminBottomTabNavigator from '../components/AdminBottomTabNavigator';
import { getShifts, Shift, deleteShift } from './mockShiftStore';

interface AdminShiftMasterScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
  onBack?: () => void;
}

export default function AdminShiftMasterScreen({ onNavigate, onBack }: AdminShiftMasterScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this shift configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = deleteShift(id);
            if (success) {
              setShifts(getShifts());
              Alert.alert('Success', 'Shift configuration deleted successfully.');
            } else {
              Alert.alert('Error', 'Failed to delete shift configuration.');
            }
          },
        },
      ]
    );
  };

  // Load shifts on mount
  useEffect(() => {
    setShifts(getShifts());
  }, []);

  // Intercept hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) {
        onBack();
        return true;
      }
      onNavigate?.('admin_dashboard');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack, onNavigate]);

  const filteredShifts = shifts.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeColor = (type: 'Morning' | 'Evening' | 'Night') => {
    switch (type) {
      case 'Morning':
        return { bg: '#EFF6FF', icon: '#3B82F6', badgeBg: '#DBEAFE' };
      case 'Evening':
        return { bg: '#FFF7ED', icon: '#F97316', badgeBg: '#FFEDD5' };
      case 'Night':
        return { bg: '#F5F3FF', icon: '#8B5CF6', badgeBg: '#EDE9FE' };
      default:
        return { bg: '#F1F5F9', icon: '#64748B', badgeBg: '#E2E8F0' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.header} />

      <AdminHeader
        title="Shift Master"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('admin_alerts')}
        onProfilePress={() => onNavigate?.('admin_profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        <Text style={[styles.pageDescription, { color: colors.textSecond }]}>
          Configure and assign shift schedules, working hours, grace periods, and thresholds.
        </Text>

        {/* Top Controls Row */}
        <View style={styles.topBar}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Feather name="search" size={16} color={colors.textSecond} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search code or name..."
              placeholderTextColor={colors.textSecond}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brand }]}
            activeOpacity={0.8}
            onPress={() => onNavigate?.('admin_shift_detail')}
          >
            <Feather name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Create Shift</Text>
          </TouchableOpacity>
        </View>

        {/* Shifts List / Cards */}
        {filteredShifts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.iconBg }]}>
              <MaterialCommunityIcons name="calendar-clock" size={48} color={colors.brand} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Shifts Available</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecond }]}>
              Create your first shift using the button above.
            </Text>
          </View>
        ) : (
          filteredShifts.map(shift => {
            const typeStyle = getTypeColor(shift.type);
            return (
              <View
                key={shift.id}
                style={[
                  styles.shiftCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderLight,
                    shadowColor: '#0F172A',
                  },
                ]}
              >
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.shiftName, { color: colors.textPrimary }]}>{shift.name}</Text>
                    <Text style={[styles.codeText, { color: colors.textSecond }]}>Code: {shift.code}</Text>
                  </View>
                  <View style={styles.headerRightActions}>
                    <View style={[styles.typeBadge, { backgroundColor: typeStyle.badgeBg }]}>
                      <Text style={[styles.typeBadgeText, { color: typeStyle.icon }]}>{shift.type}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

                {/* Timing Row */}
                <View style={styles.timingRow}>
                  <Feather name="clock" size={14} color={colors.textSecond} style={{ marginRight: 6 }} />
                  <Text style={[styles.timingText, { color: colors.textSecond }]}>
                    Working Hours:{' '}
                    <Text style={[styles.timingHighlight, { color: colors.textPrimary }]}>
                      {shift.startTime} – {shift.endTime}
                    </Text>
                  </Text>
                </View>

                {/* Detail Grid Columns */}
                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <Text style={[styles.gridLabel, { color: colors.textSecond }]}>Grace Time</Text>
                    <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{shift.graceTime} Mins</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={[styles.gridLabel, { color: colors.textSecond }]}>Min Hours</Text>
                    <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{shift.minWorkingHours} Hrs</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={[styles.gridLabel, { color: colors.textSecond }]}>Half Day</Text>
                    <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{shift.halfDayHours} Hrs</Text>
                  </View>
                </View>

                <View style={[styles.actionRow, { borderTopColor: colors.borderLight }]}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: shift.status === 'Active' ? colors.successBg : colors.borderLight }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: shift.status === 'Active' ? colors.success : colors.textSecond }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: shift.status === 'Active' ? colors.successText : colors.textSecond }
                    ]}>
                      {shift.status}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.btnEdit, { borderColor: colors.brandBorder, backgroundColor: colors.brandBg }]} 
                      onPress={() => onNavigate?.('admin_shift_detail', { shiftId: shift.id })}
                    >
                      <Feather name="edit-2" size={13} color={colors.brand} />
                      <Text style={[styles.btnEditText, { color: colors.brand }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.btnDelete, { borderColor: isDark ? '#7F1D1D' : '#FCA5A5', backgroundColor: colors.dangerBg }]} 
                      onPress={() => handleDelete(shift.id)}
                    >
                      <Feather name="trash-2" size={13} color={colors.danger} />
                      <Text style={[styles.btnDeleteText, { color: colors.danger }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <AdminBottomTabNavigator
        activeTab={null}
        onTabPress={tab => {
          if (tab === 'home') onNavigate?.('admin_dashboard');
          else onNavigate?.(`admin_${tab}`);
        }}
      />

      <AdminMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  pageDescription: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, height: 44, borderRadius: 10, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  
  /* Shift Card styles */
  shiftCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  shiftName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  codeText: { fontSize: 12, fontWeight: '500' },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  editBtn: { padding: 6, borderRadius: 6 },
  cardDivider: { height: 1, marginVertical: 12 },
  timingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timingText: { fontSize: 12, fontWeight: '500' },
  timingHighlight: { fontWeight: '700' },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  gridValue: { fontSize: 13, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionRow: { borderTopWidth: 1, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  btnEdit: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  btnEditText: { fontSize: 13, fontWeight: '700' },
  btnDelete: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  btnDeleteText: { fontSize: 13, fontWeight: '700' },

  /* Empty State */
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
