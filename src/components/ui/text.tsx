import { Text, type TextProps, TextStyle } from 'react-native';

import { palette, typography } from '@/theme';

type Variant = 'title' | 'heading' | 'section' | 'body' | 'bodyStrong' | 'caption' | 'micro';

const variantStyle: Record<Variant, TextStyle> = {
  title: typography.title,
  heading: typography.heading,
  section: typography.section,
  body: typography.body,
  bodyStrong: typography.bodyStrong,
  caption: typography.caption,
  micro: typography.micro,
};

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  center?: boolean;
};

/**
 * Typography-aware Text using the sky-blue design scale.
 */
export function AppText({ variant = 'body', color = palette.ink, center, style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[variantStyle[variant], { color }, center && { textAlign: 'center' }, style]} />;
}
