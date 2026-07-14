import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface MaskedPIITextProps {
  value: string;
  type?: 'email' | 'phone' | 'text';
  style?: any;
}

export default function MaskedPIIText({ value, type = 'text', style }: MaskedPIITextProps) {
  const [revealed, setRevealed] = useState(false);

  const getMaskedValue = () => {
    if (!value || value === '---' || value === '—') return value;

    if (type === 'email') {
      const parts = value.split('@');
      if (parts.length !== 2) return '••••••••';
      const [local, domain] = parts;
      const visibleLocal = local.length > 2 ? local.slice(0, 2) + '••••' : '••';
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return `${visibleLocal}@••••.com`;
      const domainName = domainParts[0];
      const ext = domainParts.slice(1).join('.');
      const visibleDomain = domainName.length > 2 ? domainName.slice(0, 2) + '••••' : '••';
      return `${visibleLocal}@${visibleDomain}.${ext}`;
    }

    if (type === 'phone') {
      // Keep country code and first digits, mask center, keep last 2 digits
      if (value.length <= 5) return '••••••••';
      return value.slice(0, 4) + '••••••' + value.slice(-2);
    }

    // Generic text masking
    if (value.length <= 4) return '••••';
    return value.slice(0, 2) + '••••' + value.slice(-2);
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => setRevealed(!revealed)}>
      <Text style={style}>
        {revealed ? value : getMaskedValue()}
      </Text>
    </TouchableOpacity>
  );
}
