import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors, BorderRadius, Typography } from '@/constants/theme';
import { ThemedText } from '@/components/common/themed-text';

export function ConciergeBadge() {
  const translateY = useSharedValue(-5);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(5, {
        duration: 2000, // 4s total loop
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedText style={styles.number}>01</ThemedText>
      <ThemedText type="utility" style={styles.text}>Concierge</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#7DD3FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // Shadows
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  number: {
    ...Typography.hero,
    fontSize: 48,
    fontStyle: 'italic',
    color: Colors.light.primary,
    lineHeight: 48,
  },
  text: {
    ...Typography.utility,
    fontSize: 8,
    color: Colors.light.primary,
    marginTop: 4,
  },
});
