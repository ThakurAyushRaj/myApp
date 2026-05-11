import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography, Fonts, Shadows } from '@/constants/theme';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { RevealUp } from '@/components/common/reveal-up';
import * as Notifications from 'expo-notifications';
import { useState, useEffect } from 'react';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const formatted = scheduled.map(n => ({
        id: n.identifier,
        title: n.content.title || 'Task Reminder',
        message: n.content.body || '',
        time: n.trigger?.type === 'calendar' 
          ? new Date(n.trigger.value).toLocaleString() 
          : 'Scheduled',
        type: 'reminder',
        unread: true
      }));
      setNotifications(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    fetchNotifications();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.background }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.headerTitleText}>Notifications</ThemedText>
          </View>
          <TouchableOpacity 
            onPress={cancelAllNotifications}
            style={[styles.backButton, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="trash-outline" size={22} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notif, index) => (
          <RevealUp key={notif.id} delay={index * 100}>
            <TouchableOpacity 
              style={[
                styles.notifCard, 
                { backgroundColor: theme.surface, borderColor: notif.unread ? theme.accent : theme.border },
                notif.unread && { borderLeftWidth: 4, borderLeftColor: theme.accent }
              ]}
              activeOpacity={0.7}
              onPress={async () => {
                await Notifications.cancelScheduledNotificationAsync(notif.id);
                fetchNotifications();
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23, 30, 25, 0.05)' }]}>
                <Ionicons 
                  name={notif.type === 'reminder' ? 'alarm' : notif.type === 'success' ? 'checkmark-circle' : 'notifications'} 
                  size={24} 
                  color={notif.type === 'reminder' ? theme.warning : notif.type === 'success' ? theme.success : theme.accent} 
                />
              </View>
              <View style={styles.notifText}>
                <View style={styles.notifHeader}>
                  <ThemedText style={[styles.notifTitle, { color: theme.primary }]}>{notif.title}</ThemedText>
                  <ThemedText style={styles.notifTime}>{notif.time}</ThemedText>
                </View>
                <ThemedText style={styles.notifMessage} numberOfLines={2}>{notif.message}</ThemedText>
                <ThemedText style={styles.tapToDismiss}>Tap to dismiss</ThemedText>
              </View>
            </TouchableOpacity>
          </RevealUp>
        ))}

        {!loading && notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={Colors.light.secondary} />
            <ThemedText style={[styles.emptyText, { color: theme.primary }]}>All caught up!</ThemedText>
            <ThemedText style={styles.emptySub}>Check back later for updates.</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(23, 30, 25, 0.05)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 64 },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleText: { fontSize: 20, fontFamily: Fonts.black, textAlign: 'center' },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...Shadows.soft },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 100 },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.soft,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifText: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 16, fontFamily: Fonts.bold },
  notifTime: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.light.secondary },
  notifMessage: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.light.secondary, lineHeight: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 20, fontFamily: Fonts.bold },
  emptySub: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.light.secondary },
  tapToDismiss: { fontSize: 10, fontFamily: Fonts.regular, color: Colors.light.secondary, marginTop: 4, fontStyle: 'italic' },
});
