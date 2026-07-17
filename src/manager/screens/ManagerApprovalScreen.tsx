import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface PendingRequest {
  id: number;
  name: string;
  role?: string;
  type: string;
  date?: string;
  duration?: string;
  reason?: string;
  avatar: string;
  category?: 'time' | 'leave' | 'claim';
  detail?: string;
}

interface ManagerApprovalScreenProps {
  pendingRequests: PendingRequest[];
  pendingCount: number;
  approvedCount: number;
  handleApprove: (id: number, name: string) => void;
  handleReject: (id: number, name: string) => void;
}

export default function ManagerApprovalScreen({
  pendingRequests,
  pendingCount,
  approvedCount,
  handleApprove,
  handleReject,
}: ManagerApprovalScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeSubTab, setActiveSubTab] = useState<'time' | 'leave' | 'claim'>('leave');

  const filteredRequests = pendingRequests.filter(req => req.category === activeSubTab);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={{ marginTop: 8 }}>
          {/* Approvals Title Section */}
          <View style={styles.apprHeaderSection}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.apprTitleText, { color: colors.textPrimary }]}>Approvals</Text>
              <Text style={[styles.apprSubtitleText, { color: colors.textSecond }]}>Review and manage team requests.</Text>
            </View>
          </View>

          {/* KPI Cards Row */}
          <View style={styles.apprKpiContainer}>
            {/* Pending Card */}
            <View style={[styles.apprKpiCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.apprKpiPeachOverlay} />
              <View style={styles.apprKpiHeader}>
                <View style={[styles.apprKpiIconWrap, { backgroundColor: '#FFF5EB' }]}>
                  <MaterialCommunityIcons name="folder-clock-outline" size={18} color="#F97316" />
                </View>
                <Text style={[styles.apprKpiLabel, { color: colors.textSecond }]}>PENDING</Text>
              </View>
              <Text style={[styles.apprKpiValue, { color: colors.textPrimary }]}>{pendingCount}</Text>
            </View>

            {/* Approved Card */}
            <View style={[styles.apprKpiCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.apprKpiHeader}>
                <View style={[styles.apprKpiIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={18} color="#22C55E" />
                </View>
                <Text style={[styles.apprKpiLabel, { color: colors.textSecond }]}>APPROVED</Text>
              </View>
              <Text style={[styles.apprKpiValue, { color: colors.textPrimary }]}>{approvedCount}</Text>
            </View>
          </View>

          {/* Action Required Header */}
          <Text style={[styles.apprSectionHeaderTitle, { color: colors.textPrimary }]}>Action Required</Text>

          {/* Tab Selection */}
          <View style={[styles.apprTabSelectorContainer, { backgroundColor: colors.borderLight || '#F1F5F9' }]}>
            {(['time', 'leave', 'claim'] as const).map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.apprTabSelectorItem,
                    isActive && [styles.apprTabSelectorItemActive, { backgroundColor: colors.card }],
                  ]}
                  onPress={() => setActiveSubTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.apprTabSelectorText,
                      isActive
                        ? [styles.apprTabSelectorTextActive, { color: colors.brand }]
                        : { color: colors.textSecond },
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List of Detailed Cards */}
          {filteredRequests.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: 12 }]}>No pending {activeSubTab} requests</Text>
          ) : (
            filteredRequests.map((req) => {
              let badgeBg = '#F1F5F9';
              let badgeTextColor = '#64748B';
              if (req.type === 'Annual Leave') {
                badgeBg = '#EFF6FF';
                badgeTextColor = '#0A52D6';
              } else if (req.type === 'Sick Leave') {
                badgeBg = '#FEF2F2';
                badgeTextColor = '#EF4444';
              } else if (req.type === 'Overtime') {
                badgeBg = '#FFFBEB';
                badgeTextColor = '#D97706';
              } else if (req.type === 'Missed Punch') {
                badgeBg = '#F5F5F7';
                badgeTextColor = '#3A3A3C';
              } else if (req.type === 'Device Request') {
                badgeBg = '#F3E8FF';
                badgeTextColor = '#7C3AED';
              } else if (req.type === 'Travel Expense') {
                badgeBg = '#ECFDF5';
                badgeTextColor = '#059669';
              }

              return (
                <View
                  key={req.id}
                  style={[
                    styles.detailedCard,
                    { backgroundColor: colors.card, borderColor: colors.borderLight },
                  ]}
                >
                  {/* Card Header: Avatar, Name & Info, Tag */}
                  <View style={styles.detailedCardHeader}>
                    <Image source={{ uri: req.avatar }} style={styles.detailedCardAvatar} />
                    <View style={styles.detailedCardInfo}>
                      <Text style={[styles.detailedCardName, { color: colors.textPrimary }]}>{req.name}</Text>
                      <Text style={[styles.detailedCardRole, { color: colors.textSecond }]}>{req.role || 'Team Member'}</Text>
                    </View>
                    <View style={[styles.detailedCardTag, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.detailedCardTagText, { color: badgeTextColor }]}>{req.type}</Text>
                    </View>
                  </View>

                  {/* Details Gray Area */}
                  <View style={[styles.detailedCardBody, { backgroundColor: colors.bgScreen }]}>
                    <View style={styles.detailedCardGrid}>
                      <View style={styles.detailedCardCol}>
                        <Text style={[styles.detailedCardLabel, { color: colors.textSecond }]}>Dates</Text>
                        <Text style={[styles.detailedCardValue, { color: colors.textPrimary }]}>{req.date}</Text>
                      </View>
                      <View style={styles.detailedCardCol}>
                        <Text style={[styles.detailedCardLabel, { color: colors.textSecond }]}>Duration</Text>
                        <Text style={[styles.detailedCardValue, { color: colors.textPrimary }]}>{req.duration || 'N/A'}</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 12 }}>
                      <Text style={[styles.detailedCardLabel, { color: colors.textSecond }]}>Reason</Text>
                      <Text
                        style={[
                          styles.detailedCardReason,
                          { color: colors.textPrimary },
                          req.reason === 'No reason provided.' && { fontStyle: 'italic', opacity: 0.8 },
                        ]}
                      >
                        {req.reason || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Buttons Row */}
                  <View style={styles.detailedCardButtonsRow}>
                    <TouchableOpacity
                      style={[styles.detailedCardBtnReject, { borderColor: colors.border }]}
                      onPress={() => handleReject(req.id, req.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailedCardBtnRejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.detailedCardBtnApprove, { backgroundColor: colors.brand }]}
                      onPress={() => handleApprove(req.id, req.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailedCardBtnApproveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  apprHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  apprTitleText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  apprSubtitleText: {
    fontSize: 13,
    marginTop: 4,
  },

  apprKpiContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  apprKpiCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 105,
    justifyContent: 'center',
  },
  apprKpiPeachOverlay: {
    position: 'absolute',
    top: -35,
    right: -35,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E0',
    opacity: 0.75,
  },
  apprKpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  apprKpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  apprKpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  apprKpiValue: {
    fontSize: 24,
    fontWeight: '700',
    paddingLeft: 4,
  },
  apprSectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  apprTabSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  apprTabSelectorItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  apprTabSelectorItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  apprTabSelectorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  apprTabSelectorTextActive: {
    fontWeight: '700',
  },
  detailedCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  detailedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailedCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  detailedCardInfo: {
    flex: 1,
  },
  detailedCardName: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailedCardRole: {
    fontSize: 12,
    marginTop: 1,
  },
  detailedCardTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  detailedCardTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailedCardBody: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailedCardGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailedCardCol: {
    flex: 1,
  },
  detailedCardLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '500',
  },
  detailedCardValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailedCardReason: {
    fontSize: 12,
    lineHeight: 16,
  },
  detailedCardButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailedCardBtnReject: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedCardBtnRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
  },
  detailedCardBtnApprove: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedCardBtnApproveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
