import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption' | 'link' | 'hero' | 'utility';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getVariantStyle = () => {
    switch (type) {
      case 'hero': return Typography.hero;
      case 'h1': return Typography.h1;
      case 'h2': return Typography.h2;
      case 'h3': return Typography.h3;
      case 'utility': return Typography.utility;
      case 'small': return Typography.small;
      case 'caption': return Typography.caption;
      case 'link': return styles.link;
      case 'body':
      case 'default':
      default: return Typography.body;
    }
  };

  return (
    <Text
      style={[
        { color },
        getVariantStyle(),
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#3B82F6',
  },
});
