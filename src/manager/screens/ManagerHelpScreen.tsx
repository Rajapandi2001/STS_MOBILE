import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ManagerMenu from '@/manager/components/ManagerMenu';
import ManagerHeader from '../components/ManagerHeader';
import ManagerBottomTabNavigator from '../components/ManagerBottomTabNavigator';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ManagerHelpScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function ManagerHelpScreen({ onNavigate, onBack }: ManagerHelpScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const asset = Asset.fromModule(require('../../../assets/images/Smart_Time_Sheet_User_Guide.pdf'));
      await asset.downloadAsync();

      const fileUri = `${FileSystem.documentDirectory}Smart_Time_Sheet_User_Guide.pdf`;
      const downloadedFile = await FileSystem.downloadAsync(asset.uri, fileUri);

      if (Platform.OS === 'android') {
        let directoryUri = await AsyncStorage.getItem('savedDownloadFolder');

        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            directoryUri = permissions.directoryUri;
            await AsyncStorage.setItem('savedDownloadFolder', directoryUri);
          } else {
            Alert.alert('Permission Required', 'Storage permission is needed to save the PDF.');
            return;
          }
        }

        if (directoryUri) {
          try {
            const base64 = await FileSystem.readAsStringAsync(downloadedFile.uri, { encoding: FileSystem.EncodingType.Base64 });
            const newUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, 'Smart_Time_Sheet_User_Guide', 'application/pdf');
            await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
            Alert.alert('Success', 'User Guide downloaded automatically to your folder!');
          } catch (err) {
            // If the saved folder was deleted or revoked, clear the cache and ask again next time
            await AsyncStorage.removeItem('savedDownloadFolder');
            Alert.alert('Error', 'Could not save to the previous folder. Please try again to select a new folder.');
          }
        }
      } else {
        // iOS requires the share sheet to save files locally to the Files app
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadedFile.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save User Manual',
            UTI: 'com.adobe.pdf',
          });
        }
      }
    } catch (e) {
      console.error('Error downloading PDF:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Header */}
<<<<<<< Updated upstream
      <ManagerHeader
        title="Help"
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => onNavigate?.('manager_alerts')}
        onProfilePress={() => onNavigate?.('manager_profile')}
      />
=======
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity style={[styles.hamburgerBtn, { backgroundColor: colors.cardAlt }]} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
            <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
            <View style={[styles.hamburgerLine, { width: 16, backgroundColor: colors.brand }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.brand }]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Help</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.iconBg || colors.cardAlt, marginRight: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.brand} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.iconBg || colors.cardAlt, marginRight: 12 }]} 
            activeOpacity={0.7}
            onPress={() => onNavigate?.('manager_alerts')}
          >
            <Feather name="bell" size={18} color={colors.brand} />
            <View style={styles.notifDot} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('manager_profile')}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150' }}
                style={styles.avatarImage}
              />
              <View style={styles.activeDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
>>>>>>> Stashed changes

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.brand }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={32} color={colors.brand} />
          </View>

          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Smart Timesheet User Guide</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecond }]}>Having difficulties in using this website?</Text>

          <Text style={[styles.cardBody, { color: colors.textPrimary }]}>
            Click the download button to download the user guide for the Smart Time Sheet Website. This user guide serves as a reference for using the Smart Time Sheet Website and provides an overview of the system.
          </Text>

          <View style={styles.downloadRow}>
            <Text style={[styles.downloadLabel, { color: colors.textPrimary }]}>Download User Manual: </Text>
            <TouchableOpacity
              style={[styles.downloadButton, isDownloading && { opacity: 0.5 }]}
              activeOpacity={0.7}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <MaterialCommunityIcons name="file-pdf-box" size={20} color={colors.danger} />
              )}
              <Text style={[styles.downloadButtonText, { color: colors.danger }]}>
                {isDownloading ? 'Downloading...' : 'Download (PDF)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <ManagerBottomTabNavigator
        activeTab={undefined}
        onTabPress={(tab) => {
          if (tab === 'home' || tab === 'approvals') {
            onNavigate?.('manager_dashboard', { tab });
          } else {
            onNavigate?.(`manager_${tab}`);
          }
        }}
      />

      {/* Admin Menu */}
      <ManagerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hamburgerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8 },
  hamburgerLine: { width: 20, height: 2, borderRadius: 2 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444' },
  iconButton: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  downloadLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  /* Bottom Tab Bar */
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
