import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PasswordInputProps extends TextInputProps {
  label: string;
  inputRef?: React.RefObject<TextInput | null>;
}

export default function PasswordInput({
  label,
  inputRef,
  style,
  ...props
}: PasswordInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TouchableWithoutFeedback onPress={() => inputRef?.current?.focus()}>
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
          ]}
        >
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={isFocused ? '#0c44ac' : '#94a3b8'}
            style={styles.inputIcon}
          />
          <TextInput
            ref={inputRef}
            style={[styles.textInput, style]}
            placeholderTextColor="#94a3b8"
            secureTextEntry={!isPasswordVisible}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            {...props}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.6}
            style={styles.eyeButton}
          >
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  inputWrapperFocused: {
    borderColor: '#0c44ac',
    backgroundColor: '#ffffff',
    shadowColor: '#0c44ac',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#0f172a',
    fontSize: 15,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
});