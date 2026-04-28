import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius } from '@/constants/theme';

interface GlassCardProps extends ViewProps {
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 60, ...props }: GlassCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { borderColor: theme.glassBorder, backgroundColor: theme.glass }, style]} {...props}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="default" />
      ) : (
        <View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: 'transparent',
              // @ts-ignore
              backdropFilter: `blur(${intensity / 1.5}px) saturate(200%) brightness(1.1)`,
              // @ts-ignore
              WebkitBackdropFilter: `blur(${intensity / 1.5}px) saturate(200%) brightness(1.1)`,
            }
          ]} 
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl, // 40px per spec
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
});
