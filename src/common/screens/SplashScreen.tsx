import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  
  // Animation values for the three loading dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Staggered animation loop for dots
  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.stagger(200, [
            Animated.timing(dot1Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.stagger(200, [
            Animated.timing(dot1Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateDots();

    // Auto-transition to login screen after 2.8 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, [dot1Opacity, dot2Opacity, dot3Opacity, onFinish]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0c44ac', '#002574', '#00133c']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      <View style={styles.contentContainer}>
        {/* White Rounded Square Logo Container */}
        <View style={styles.logoCard}>
          <MaterialCommunityIcons name="office-building" size={64} color="#0c44ac" />
        </View>
        
        {/* Title */}
        <Text style={styles.title}>STS Mobile Extension</Text>
        
        {/* Subtitles */}
        <Text style={styles.subtitle}>Enterprise</Text>
        <Text style={styles.subtitleAccent}>HRMS</Text>
      </View>

      {/* Loading Indicator Dots at Bottom */}
      <View style={[styles.dotsContainer, { bottom: height * 0.08 }]}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoCard: {
    width: 140,
    height: 140,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 22,
  },
  subtitleAccent: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1.5,
    lineHeight: 22,
  },
  dotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
});
