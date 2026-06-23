import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface Props {
  distance: number;
  onRetry: () => void;
  onBack: () => void;
}

// Simple failure map visual
function FailureMap({ distance }: { distance: number }) {
  const dashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(dashAnim, { toValue: 1, duration: 2000, useNativeDriver: false })
    ).start();
  }, []);

  const formatDist = (m: number) =>
    m >= 1000 ? `~${(m / 1000).toFixed(1)}km` : `~${Math.round(m)}m`;

  return (
    <View style={mapStyles.container}>
      {/* Dark map background */}
      <View style={mapStyles.mapBg} />

      {/* Grid lines */}
      {[...Array(5)].map((_, i) => (
        <View key={`h${i}`} style={[mapStyles.gridLine, { top: `${(i + 1) * 16}%` as any, width: '100%', height: 1 }]} />
      ))}
      {[...Array(5)].map((_, i) => (
        <View key={`v${i}`} style={[mapStyles.gridLine, { left: `${(i + 1) * 16}%` as any, height: '100%', width: 1 }]} />
      ))}

      {/* Office center zone */}
      <View style={mapStyles.officeZone}>
        <View style={mapStyles.officeCircle} />
      </View>

      {/* Dashed line from user to office */}
      <View style={mapStyles.dashedLinePath}>
        <View style={mapStyles.dashedLine} />
      </View>

      {/* User location (far away) */}
      <View style={mapStyles.userDot}>
        <View style={mapStyles.userDotOuter} />
        <View style={mapStyles.userDotCore} />
      </View>

      {/* Distance badge */}
      <View style={mapStyles.distBadge}>
        <Text style={mapStyles.distText}>Distance: {formatDist(distance)}</Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 20,
    position: 'relative',
    backgroundColor: '#1E2A3A',
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E2A3A',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  officeZone: {
    position: 'absolute',
    left: '40%',
    top: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(10,82,214,0.5)',
    backgroundColor: 'rgba(10,82,214,0.12)',
  },
  dashedLinePath: {
    position: 'absolute',
    right: '20%',
    top: '30%',
    width: 60,
    height: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  dashedLine: {
    flex: 1,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FD8D3C',
    borderRadius: 1,
  },
  userDot: {
    position: 'absolute',
    right: '15%',
    top: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDotOuter: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(253,141,60,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(253,141,60,0.5)',
  },
  userDotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FD8D3C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  distBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  distText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default function LocationFailedScreen({ distance, onRetry, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.delay(3000),
        ]),
        { iterations: 3 }
      ),
    ]).start();
  }, []);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const formatDist = (m: number) =>
    m >= 1000 ? `~${(m / 1000).toFixed(1)}km` : `~${Math.round(m)}m`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* Shake icon */}
        <Animated.View
          style={[styles.iconCircle, { transform: [{ translateX: shakeAnim }] }]}
        >
          <MaterialCommunityIcons name="map-marker-off" size={40} color="#FD8D3C" />
        </Animated.View>

        <Text style={styles.title}>Location Validation Failed</Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="information" size={18} color="#FD8D3C" />
            <Text style={styles.infoText}>
              You are outside the approved 100m radius of Headquarters Office.
            </Text>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#94A3B8" />
            <Text style={styles.infoSubText}>
              Please ensure GPS is enabled and you are within the perimeter.
            </Text>
          </View>
        </View>

        {/* Failure Map */}
        <FailureMap distance={distance} />

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="map-marker-distance" size={18} color="#FD8D3C" />
            <Text style={styles.statLabel}>Your Distance</Text>
            <Text style={[styles.statValue, { color: '#FD8D3C' }]}>{formatDist(distance)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color="#0A52D6" />
            <Text style={styles.statLabel}>Allowed Radius</Text>
            <Text style={[styles.statValue, { color: '#0A52D6' }]}>100m</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="map-marker-alert" size={18} color="#EF4444" />
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>Outside</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85} onPress={onRetry}>
          <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryBtnText}>Retry Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsLink} activeOpacity={0.7} onPress={openSettings}>
          <Text style={styles.settingsLinkText}>Open Location Settings</Text>
          <Feather name="external-link" size={14} color="#0A52D6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 12,
    gap: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(253,141,60,0.3)',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '600',
  },
  infoSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoSubText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#F4F6FA',
    gap: 10,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FD8D3C',
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#FD8D3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  settingsLinkText: {
    color: '#0A52D6',
    fontSize: 15,
    fontWeight: '700',
  },
});
