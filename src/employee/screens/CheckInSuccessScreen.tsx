import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface Props {
  checkInTime: Date;
  locationName: string;
  onGoToDashboard: () => void;
}

export default function CheckInSuccessScreen({ checkInTime, locationName, onGoToDashboard }: Props) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    // Automatically redirect after a short delay
    const timer = setTimeout(() => {
      onGoToDashboard();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const formatTime = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const formatDate = (d: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />

      <View style={styles.content}>
        {/* Check icon */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <MaterialCommunityIcons name="check-bold" size={44} color="#FFFFFF" />
          {/* Decorative ring */}
          <View style={styles.iconRing} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>Check-in Successful</Text>
          <Text style={styles.subtitle}>Have a productive day!</Text>
        </Animated.View>

        {/* Details Card */}
        <Animated.View
          style={[styles.detailsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Time row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#0A52D6" />
            </View>
            <View>
              <Text style={styles.detailLabel}>TIME</Text>
              <Text style={styles.detailValue}>{formatTime(checkInTime)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <MaterialCommunityIcons name="calendar-today" size={20} color="#0A52D6" />
            </View>
            <View>
              <Text style={styles.detailLabel}>DATE</Text>
              <Text style={styles.detailValue}>{formatDate(checkInTime)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Location row */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#0A52D6" />
            </View>
            <View>
              <Text style={styles.detailLabel}>LOCATION</Text>
              <Text style={styles.detailValue}>{locationName}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Status badge */}
        <Animated.View style={[styles.statusBadge, { opacity: fadeAnim }]}>
          <View style={styles.greenDot} />
          <Text style={styles.statusText}>Attendance Marked • Present</Text>
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0A52D6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  iconRing: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: 'rgba(10,82,214,0.2)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E2F6E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#F4F6FA',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0A52D6',
    borderRadius: 18,
    paddingVertical: 17,
    shadowColor: '#0A52D6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  historyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
