import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/common/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/themed-text';

interface WidgetProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accent?: boolean;
}

export function Widget({ title, subtitle, iconName, onPress, accent }: WidgetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.touchable}>
      <GlassCard style={[styles.card, accent && { backgroundColor: '#0052ff' }]}>
        <View style={styles.header}>
           <View style={[styles.iconHolder, { backgroundColor: accent ? 'rgba(255,255,255,0.2)' : 'rgba(202, 0, 19, 0.1)' }]}>
             <Ionicons name={iconName} size={28} color={accent ? '#ffffff' : '#0052ff'} />
           </View>
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, { color: accent ? '#ffffff' : '#171e19' }]}>{title}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: accent ? 'rgba(255,255,255,0.7)' : '#b7c6c2' }]}>{subtitle}</ThemedText>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: '45%',
    margin: Spacing.sm,
  },
  card: {
    height: 180,
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(183, 198, 194, 0.3)',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md, // 24px for nested/secondary widgets
  },
  iconHolder: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circular per spec rules for icons
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  textContainer: {
    marginTop: 'auto',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    marginTop: 4,
  },
});
