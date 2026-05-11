import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { RevealUp } from '@/components/common/reveal-up';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const theme = Colors[isDark ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.background }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <ThemedText style={styles.headerTitleText}>About</ThemedText>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RevealUp delay={100}>
          <View style={styles.heroSection}>
            <View style={[styles.logoContainer, { backgroundColor: theme.surface }]}>
              <Image 
                source={require('@/assets/images/appicon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.appName}>Time Lineup</ThemedText>
            <ThemedText style={styles.appVersion}>Version 1.0.0</ThemedText>
          </View>
        </RevealUp>

        <RevealUp delay={200}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ThemedText style={styles.cardTitle}>Our Mission</ThemedText>
            <ThemedText style={styles.cardText}>
              Time Lineup is designed to simplify your daily planning. By seamlessly integrating with your Google Calendar, we provide a unified view of your commitments and tasks, helping you achieve more every day.
            </ThemedText>
          </View>
        </RevealUp>

        <RevealUp delay={300}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ThemedText style={styles.cardTitle}>Key Features</ThemedText>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="sync" size={18} color={theme.accent} />
                <ThemedText style={styles.featureText}>Real-time Google Calendar Sync</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="stats-chart" size={18} color={theme.accent} />
                <ThemedText style={styles.featureText}>Visual Progress Tracking</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="notifications" size={18} color={theme.accent} />
                <ThemedText style={styles.featureText}>Smart Task Reminders</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="color-palette" size={18} color={theme.accent} />
                <ThemedText style={styles.featureText}>Premium Dark & Light Modes</ThemedText>
              </View>
            </View>
          </View>
        </RevealUp>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Made for increase your productivity</ThemedText>
          <ThemedText style={styles.copyright}>© 2026 Time Lineup Inc.</ThemedText>
        </View>
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
  scrollContent: { padding: Spacing.md, paddingBottom: 60 },
  heroSection: { alignItems: 'center', marginVertical: 32 },
  logoContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 24, 
    padding: 10,
    ...Shadows.strong,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { width: '80%', height: '80%' },
  appName: { fontSize: 28, fontFamily: Fonts.black, marginBottom: 4 },
  appVersion: { fontSize: 14, fontFamily: Fonts.regular, opacity: 0.5 },
  card: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    ...Shadows.soft,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontFamily: Fonts.bold, marginBottom: 12 },
  cardText: { fontSize: 15, fontFamily: Fonts.regular, lineHeight: 24, opacity: 0.8 },
  featureList: { gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 15, fontFamily: Fonts.medium, opacity: 0.8 },
  footer: { alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 14, fontFamily: Fonts.medium, opacity: 0.6, marginBottom: 4 },
  copyright: { fontSize: 12, fontFamily: Fonts.regular, opacity: 0.4 },
});
