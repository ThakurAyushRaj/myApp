import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { RevealUp } from '@/components/common/reveal-up';
import GoogleLogin from '@/components/specific/GoogleLogin';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { CustomAlert } from '@/components/common/themed-dialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useAppTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const theme = Colors[isDark ? 'dark' : 'light'];

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('notifications_enabled');
      if (value !== null) {
        setNotificationsEnabled(value === 'true');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notifications_enabled', value.toString());
      if (!value) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        showAlert("Notifications Disabled", "All scheduled reminders have been removed.");
      } else {
        showAlert("Notifications Enabled", "Reminders will now be scheduled for your activities.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void, confirmText = 'OK') => {
    setAlertConfig({ visible: true, title, message, onConfirm, confirmText });
  };

  const handleLogout = () => {
    showAlert(
      "Logout",
      "Are you sure you want to log out? You'll need to sign in again to sync your calendar activities.",
      async () => {
        await logout();
        router.replace('/onboarding');
      },
      "Logout"
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, type = 'chevron', onPress }: any) => (
    <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={22} color={theme.accent} />
      </View>
      <View style={styles.settingText}>
        <ThemedText style={[styles.settingTitle, { color: theme.primary }]}>{title}</ThemedText>
        {subtitle && <ThemedText style={styles.settingSub}>{subtitle}</ThemedText>}
      </View>
      {type === 'toggle' ? (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: Colors.light.secondary, true: theme.accent }}
          thumbColor={Colors.light.surface}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={Colors.light.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.headerTitleText}>Settings</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RevealUp delay={100}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
            <SettingItem 
              icon="moon-outline" 
              title="Dark Mode" 
              subtitle="Adjust the app's visual theme"
              type="toggle"
              value={isDark}
              onPress={toggleTheme}
            />
          </View>
        </RevealUp>

        <RevealUp delay={200}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
            <SettingItem 
              icon="notifications-outline" 
              title="Activity Reminders" 
              subtitle="View upcoming task notifications"
              onPress={() => router.push('/notifications')}
            />
            <SettingItem 
              icon="notifications-circle-outline" 
              title="Push Notifications" 
              subtitle="Enable or disable all reminders"
              type="toggle"
              value={notificationsEnabled}
              onPress={() => toggleNotifications(!notificationsEnabled)}
            />
          </View>
        </RevealUp>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Integrations</ThemedText>
          <GoogleLogin />
        </View>

        <RevealUp delay={300}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>
            <SettingItem 
              icon="shield-checkmark-outline" 
              title="Privacy & Security" 
              onPress={() => router.push('/privacy-security')}
            />
          </View>
        </RevealUp>

        <RevealUp delay={400}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Support</ThemedText>
            <SettingItem 
              icon="information-circle-outline" 
              title="About Time Lineup" 
              onPress={() => router.push('/about')}
            />
          </View>
        </RevealUp>

        <RevealUp delay={500}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: Colors.light.error }]}>Danger Zone</ThemedText>
            <TouchableOpacity 
              style={[styles.logoutItem, { backgroundColor: theme.surface, borderColor: '#ef4444' }]} 
              onPress={handleLogout}
            >
              <View style={[styles.iconBox, { backgroundColor: Colors.light.error + '15' }]}>
                <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
              </View>
              <View style={styles.settingText}>
                <ThemedText style={[styles.settingTitle, { color: Colors.light.error }]}>Logout</ThemedText>
                <ThemedText style={styles.settingSub}>Sign out of your account</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        </RevealUp>

    
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(23, 30, 25, 0.05)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 64 },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { fontSize: 20, fontFamily: Fonts.black, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 120 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontFamily: Fonts.black, color: Colors.light.secondary, letterSpacing: 1.5, marginLeft: 12, marginBottom: 12 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    ...Shadows.soft,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    ...Shadows.soft,
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontFamily: Fonts.bold },
  settingSub: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.light.secondary, marginTop: 2 },
  versionInfo: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  versionText: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.light.secondary },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.strong,
  },
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Fonts.black,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.7,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});
