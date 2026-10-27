import { StyleProp, View, ViewStyle } from 'react-native';

import { AppText } from './text';
import { palette, radius, spacing, typography } from '@/theme';

type PillProps = {
  label: string;
  color?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
};

/** Small rounded chip used for fares and meta info. */
export function Pill({ label, color = palette.sky700, background = palette.sky100, style }: PillProps) {
  return (
    <View style={[{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill, backgroundColor: background }, style]}>
      <AppText variant="caption" color={color} style={typography.micro}>
        {label}
      </AppText>
    </View>
  );
}

type BadgeProps = {
  text: string;
  color: string;
  size?: number;
};

/** Square-ish colored route-number badge (e.g. "143"). */
export function Badge({ text, color, size = 44 }: BadgeProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.md,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText variant="section" color={palette.white} style={{ fontSize: size * 0.34, fontWeight: '800' }} center>
        {text}
      </AppText>
    </View>
  );
}
