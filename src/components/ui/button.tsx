import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from 'react-native';

import { AppText } from './text';
import { palette, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

const variants: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: palette.sky500, fg: palette.white },
  secondary: { bg: palette.sky100, fg: palette.sky700 },
  ghost: { bg: 'transparent', fg: palette.sky700, border: palette.border },
};

/**
 * Pill-shaped premium button with three variants.
 */
export function Button({ label, onPress, variant = 'primary', loading, disabled, leftIcon, style, fullWidth = true }: ButtonProps) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 52,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.xl,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          flexDirection: 'row',
          gap: spacing.sm,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {leftIcon}
          <AppText variant="bodyStrong" color={v.fg} style={typography.body}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
