import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

// ─── OFFICE CONFIG ────────────────────────────────────────────────────────────
// ⚠️  Set DEV_MODE = false and fill in real office coordinates for production.
const DEV_MODE = true;

const OFFICE_CONFIG = {
  latitude: 11.0168,     // ← Replace with your real office latitude
  longitude: 76.9558,   // ← Replace with your real office longitude
  name: 'HQ Block A',
  address: 'Headquarters Office',
  radiusMeters: 100,
};

// Haversine distance in metres
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Simple map-like visual using React Native Views
function MiniMap({
  inZone,
  accuracy,
}: {
  inZone: boolean;
  accuracy: number | null;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={mapStyles.container}>
      {/* Fake map grid lines */}
      {[...Array(6)].map((_, i) => (
        <View
          key={`h${i}`}
          style={[mapStyles.gridLine, { top: `${(i + 1) * 14}%` as any, width: '100%', height: 1 }]}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <View
          key={`v${i}`}
          style={[mapStyles.gridLine, { left: `${(i + 1) * 14}%` as any, height: '100%', width: 1 }]}
        />
      ))}

      {/* Zone circle */}
      <View style={mapStyles.zoneCircleOuter}>
        <View
          style={[
            mapStyles.zoneCircle,
            { borderColor: inZone ? 'rgba(10,82,214,0.3)' : 'rgba(253,141,60,0.3)' },
            { backgroundColor: inZone ? 'rgba(10,82,214,0.08)' : 'rgba(253,141,60,0.08)' },
          ]}
        />
      </View>

      {/* Pulse dot */}
      <View style={mapStyles.dotCenter}>
        <Animated.View
          style={[
            mapStyles.pulseDot,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: inZone ? 'rgba(10,82,214,0.15)' : 'rgba(253,141,60,0.15)',
            },
          ]}
        />
        <View
          style={[
            mapStyles.dotCore,
            { backgroundColor: inZone ? '#0A52D6' : '#FD8D3C' },
          ]}
        />
      </View>

      {/* Accuracy badge */}
      {accuracy !== null && (
        <View
          style={[
            mapStyles.accuracyBadge,
            { backgroundColor: inZone ? '#E8F0FE' : '#FFF3E0' },
          ]}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={11}
            color={inZone ? '#0A52D6' : '#FD8D3C'}
          />
          <Text style={[mapStyles.accuracyText, { color: inZone ? '#0A52D6' : '#FD8D3C' }]}>
            ±{Math.round(accuracy)}m
          </Text>
        </View>
      )}

      {/* Locate icon */}
      <TouchableOpacity style={mapStyles.locateFab} activeOpacity={0.8}>
        <MaterialCommunityIcons name="crosshairs" size={18} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E8EEF7',
    marginVertical: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(100,116,139,0.1)',
  },
  zoneCircleOuter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },
  dotCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  dotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  accuracyBadge: {
    position: 'absolute',
    bottom: 12,
    right: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  locateFab: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
interface Props {
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
  onValidationFailed: (distance: number) => void;
  onBack: () => void;
}

type FetchStatus = 'idle' | 'fetching' | 'success' | 'error';

export default function ManagerCheckInLocationScreen({ onConfirm, onValidationFailed, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('fetching');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [inZone, setInZone] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fadeIn = useRef(new Animated.Value(0)).current;

  const fetchLocation = async () => {
    setFetchStatus('fetching');
    setCoords(null);
    setDistance(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please enable it in Settings.');
        setFetchStatus('error');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = loc.coords;

      // In DEV_MODE we treat the user's own location as the office centre
      const officeLat = DEV_MODE ? latitude : OFFICE_CONFIG.latitude;
      const officeLng = DEV_MODE ? longitude : OFFICE_CONFIG.longitude;

      const dist = getDistanceMeters(latitude, longitude, officeLat, officeLng);

      setCoords({ latitude, longitude, accuracy });
      setDistance(dist);
      setInZone(dist <= OFFICE_CONFIG.radiusMeters);
      setFetchStatus('success');

      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (e: any) {
      setErrorMsg('Unable to get location. Please check GPS settings.');
      setFetchStatus('error');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleConfirm = () => {
    if (!coords) return;
    if (inZone) {
      onConfirm(coords);
    } else {
      onValidationFailed(distance ?? 0);
    }
  };

  const accuracyLabel = (): string => {
    const a = coords?.accuracy;
    if (a === null || a === undefined) return 'Unknown';
    if (a <= 10) return 'Very High';
    if (a <= 30) return 'High';
    if (a <= 100) return 'Medium';
    return 'Low';
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
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Feather name="bell" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {fetchStatus === 'fetching' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A52D6" />
          <Text style={styles.loadingText}>Fetching your location…</Text>
          <Text style={styles.loadingSubtext}>Please wait while we verify your GPS position</Text>
        </View>
      )}

      {/* Error state */}
      {fetchStatus === 'error' && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconBg}>
            <MaterialCommunityIcons name="map-marker-off" size={36} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorMsg}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} activeOpacity={0.8} onPress={fetchLocation}>
            <MaterialCommunityIcons name="refresh" size={18} color="#0A52D6" />
            <Text style={styles.retryBtnText}>Retry GPS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success state */}
      {fetchStatus === 'success' && coords && (
        <Animated.ScrollView
          style={{ opacity: fadeIn }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Zone Status Banner */}
          <View style={[styles.zoneBanner, { borderColor: inZone ? '#0A52D6' : '#FD8D3C' }]}>
            <View style={[styles.zoneBannerIcon, { backgroundColor: inZone ? '#EBF2FF' : '#FFF3E0' }]}>
              <MaterialCommunityIcons
                name={inZone ? 'check-circle' : 'alert-circle'}
                size={26}
                color={inZone ? '#0A52D6' : '#FD8D3C'}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.zoneBannerTitle, { color: inZone ? '#0A52D6' : '#FD8D3C' }]}>
                {inZone ? 'Inside Approved Zone' : 'Outside Approved Zone'}
              </Text>
              <Text style={styles.zoneBannerSubtitle}>
                {inZone
                  ? 'Location verified for attendance tracking.'
                  : `You are ${formatDist(distance!)} from the office.`}
              </Text>
            </View>
          </View>

          {/* Mini Map */}
          <MiniMap inZone={inZone} accuracy={coords.accuracy} />

          {/* GPS Details Card */}
          <View style={styles.gpsCard}>
            <Text style={styles.gpsCardLabel}>CURRENT GPS FIX</Text>

            <View style={styles.gpsRow}>
              <View style={styles.gpsIconWrap}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#0A52D6" />
              </View>
              <View style={styles.gpsTextBlock}>
                <Text style={styles.gpsAddress} numberOfLines={1}>
                  {OFFICE_CONFIG.address}
                </Text>
                <Text style={styles.gpsCoordsText}>
                  {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                </Text>
                {distance !== null && (
                  <Text style={styles.gpsDistText}>
                    {inZone
                      ? 'Within approved zone ✓'
                      : `Distance from office: ${formatDist(distance)}`}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.gpsDivider} />

            <View style={styles.gpsFooterRow}>
              <View style={styles.gpsFooterItem}>
                <MaterialCommunityIcons name="map-marker-radius" size={14} color="#64748B" />
                <Text style={styles.gpsFooterText}>Radius: {OFFICE_CONFIG.radiusMeters}m</Text>
              </View>
              <View style={styles.gpsFooterItem}>
                <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#64748B" />
                <Text style={styles.gpsFooterText}>Accuracy: {accuracyLabel()}</Text>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      )}

      {/* Bottom Actions */}
      {fetchStatus === 'success' && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: inZone ? '#0A52D6' : '#FD8D3C' },
            ]}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>
              {inZone ? 'Confirm & Continue' : 'Proceed Anyway'}
            </Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryGpsBtn} activeOpacity={0.8} onPress={fetchLocation}>
            <MaterialCommunityIcons name="refresh" size={16} color="#0A52D6" />
            <Text style={styles.retryGpsBtnText}>Retry GPS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  errorIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  errorMsg: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryBtnText: {
    color: '#0A52D6',
    fontWeight: '700',
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  zoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  zoneBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  zoneBannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  gpsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  gpsCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 14,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  gpsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  gpsTextBlock: {
    flex: 1,
    flexShrink: 1,
  },
  gpsAddress: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  gpsCoordsText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  gpsDistText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  gpsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  gpsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gpsFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsFooterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#F4F6FA',
    gap: 10,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  retryGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  retryGpsBtnText: {
    color: '#0A52D6',
    fontSize: 15,
    fontWeight: '700',
  },
});
