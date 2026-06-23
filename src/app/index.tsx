import React, { useState, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import SplashScreen from '@/components/SplashScreen';
import LoginScreen from '@/components/LoginScreen';
import ForgotPasswordScreen from '@/components/ForgotPasswordScreen';
import OtpScreen from '@/components/OtpScreen';
import NewPasswordScreen from '@/components/NewPasswordScreen';
import DashboardScreen from '@/components/DashboardScreen';

export default function MainApp() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'forgot_password' | 'otp_verification' | 'new_password' | 'dashboard'>('splash');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Transition to a different screen with a smooth cross-fade animation
  const transitionTo = (nextScreen: typeof screen) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onFinish={() => transitionTo('login')} />;
      case 'login':
        return (
          <LoginScreen 
            onForgotPassword={() => transitionTo('forgot_password')} 
            onSignInSuccess={() => transitionTo('dashboard')}
          />
        );
      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onBack={() => transitionTo('login')}
            onSendCode={(emailOrId) => transitionTo('otp_verification')}
          />
        );
      case 'otp_verification':
        return (
          <OtpScreen
            onBack={() => transitionTo('forgot_password')}
            onVerify={() => transitionTo('new_password')}
          />
        );
      case 'new_password':
        return (
          <NewPasswordScreen
            onBack={() => transitionTo('otp_verification')}
            onResetComplete={() => transitionTo('login')}
          />
        );
      case 'dashboard':
        return <DashboardScreen onSignOut={() => transitionTo('login')} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00133c', // Matches splash dark background
  },
  innerContainer: {
    flex: 1,
  },
});

