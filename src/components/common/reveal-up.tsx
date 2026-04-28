import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Animations } from '@/constants/theme';

interface RevealUpProps {
  children: React.ReactNode;
  delay?: number;
}

export function RevealUp({ children, delay = 0 }: RevealUpProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: Animations.duration,
        easing: Easing.bezier(...Animations.easing),
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: Animations.duration,
        easing: Easing.bezier(...Animations.easing),
      })
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
