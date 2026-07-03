import React from 'react';
import { StyleSheet, View, ActivityIndicator, Modal, Text } from 'react-native';

interface LoaderProps {
  visible: boolean;
  message?: string;
}

export default function Loader({ visible, message = 'Signing in...' }: LoaderProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#0c44ac" />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 60, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 150,
  },
  messageText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
});
