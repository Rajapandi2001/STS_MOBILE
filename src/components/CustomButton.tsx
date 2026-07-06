import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CustomButton({
  title,
  isLoading = false,
  iconName,
  buttonStyle,
  textStyle,
  disabled,
  ...props
}: CustomButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        isButtonDisabled && styles.buttonDisabled,
      ]}
      disabled={isButtonDisabled}
      activeOpacity={0.85}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <>
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          {iconName && (
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color="#ffffff"
              style={styles.buttonIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#0c44ac',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 32,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});