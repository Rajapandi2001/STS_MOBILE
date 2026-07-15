import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface MaskedPIITextProps {
  value: string;
  type?: 'email' | 'phone' | 'text';
  style?: any;
}

export default function MaskedPIIText({ value, type = 'text', style }: MaskedPIITextProps) {
  const [revealed, setRevealed] = useState(false);

  const getMaskedValue = () => {
    if (!value || value === '---' || value === '—') return value;
    return '******';
  };

  const isMaskable = value && value !== '---' && value !== '—';

  if (!isMaskable) {
    return <Text style={style}>{value || '—'}</Text>;
  }

  // Flatten the style prop
  const flatStyle = StyleSheet.flatten(style) || {};

  // Extract layout vs text styles
  const {
    flex,
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    alignSelf,
    position,
    top,
    bottom,
    left,
    right,
    width,
    height,
    maxWidth,
    minWidth,
    flexDirection,
    alignItems,
    justifyContent,
    ...textStyle
  } = flatStyle;

  const layoutStyle = {
    flex,
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    alignSelf,
    position,
    top,
    bottom,
    left,
    right,
    width,
    height,
    maxWidth,
    minWidth,
  };

  const isRightAligned = flatStyle.textAlign === 'right';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setRevealed(!revealed)}
      style={[
        styles.container,
        layoutStyle,
        isRightAligned ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
      ]}
    >
      <Text style={textStyle}>
        {revealed ? value : getMaskedValue()}
      </Text>
      <Feather
        name={revealed ? "eye-off" : "eye"}
        size={14}
        color={(textStyle.color as string) || '#94A3B8'}
        style={styles.eyeIcon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginLeft: 6,
  },
});

