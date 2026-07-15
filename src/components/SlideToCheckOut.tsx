import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface SlideToCheckOutProps {
  onCheckOut: () => void;
}

const BUTTON_WIDTH = 50;
const SLIDER_PADDING = 5;

export default function SlideToCheckOut({ onCheckOut }: SlideToCheckOutProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const [isCompleted, setIsCompleted] = useState(false);

  const maxSlide = containerWidth - BUTTON_WIDTH - SLIDER_PADDING * 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (isCompleted) return;
        let newX = gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > maxSlide) newX = maxSlide;
        pan.setValue({ x: newX, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isCompleted) return;
        if (gestureState.dx > maxSlide * 0.8) {
          Animated.spring(pan, {
            toValue: { x: maxSlide, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            setIsCompleted(true);
            onCheckOut();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.outerContainer}>
      <View
        style={[styles.container, { backgroundColor: '#EBF2FF' }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Text style={[styles.text, { color: '#1E293B' }]}>Slide to Check Out</Text>
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.button,
              { transform: [{ translateX: pan.x }] }
            ]}
            {...panResponder.panHandlers}
          >
            <Feather name="chevron-right" size={24} color="#FFF" />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 20,
  },
  container: {
    height: 56,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    zIndex: 1,
  },
  button: {
    height: BUTTON_WIDTH,
    width: BUTTON_WIDTH,
    borderRadius: BUTTON_WIDTH / 2,
    backgroundColor: '#0A52D6',
    position: 'absolute',
    left: SLIDER_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
