import React from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Typography, Fonts, Shadows, BorderRadius } from '@/constants/theme';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import GoogleLogin from '@/components/specific/GoogleLogin';
import { RevealUp } from '@/components/common/reveal-up';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Stack } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { setGoogleToken } = useAuth();
  const router = useRouter();
  const theme = Colors[isDark ? 'dark' : 'light'];

  const handleLoginSuccess = async (token: string) => {
    await setGoogleToken(token);
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={isDark ? ['#0F172A', '#020617'] : ['#F8FAFC', '#F1F5F9']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.topSection}>
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.header}>
            <ThemedText style={[styles.welcomeLabel, { color: theme.textSecondary }]}>Welcome to</ThemedText>
            <ThemedText style={styles.brandTitle}>Time Lineup</ThemedText>
            <View style={[styles.titleUnderline, { backgroundColor: theme.accent }]} />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(400).duration(1000)} style={styles.illustrationContainer}>
            <View style={[styles.glowCircle, { backgroundColor: theme.accent + '20' }]} />
            <Image 
              source={require('@/assets/images/onboarding.png')} 
              style={styles.illustration}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <View style={styles.bottomSection}>
          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              The most sophisticated way to manage your time. Sync your Google Calendar and start your journey to productivity.
            </ThemedText>
            
            <View style={styles.loginWrapper}>
              <GoogleLogin onSuccess={handleLoginSuccess} />
            </View>
            
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
                Continue without signing in
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeLabel: {
    fontSize: 12,
    fontFamily: Fonts.black,
    letterSpacing: 3,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 42,
    fontFamily: Fonts.display,
    textAlign: 'center',
    lineHeight: 48,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: 12,
  },
  illustrationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: width * 0.45,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    width: '100%',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  loginWrapper: {
    width: '100%',
    marginBottom: 20,
    ...Shadows.strong,
  },
  skipButton: {
    padding: Spacing.md,
  },
  skipText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    textDecorationLine: 'underline',
  },
});
