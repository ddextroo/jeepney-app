import { StyleProp, View, type ViewStyle } from 'react-native';

import { AppText } from './ui/text';
import { palette, radius, spacing } from '@/theme';

type FareChipProps = {
  amount: number;
  label?: string;
  emphasis?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Peso fare chip. `emphasis` renders the larger, colored variant. */
export function FareChip({ amount, label, emphasis = false, style }: FareChipProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 3,
          paddingHorizontal: emphasis ? spacing.md : spacing.sm,
          paddingVertical: emphasis ? spacing.sm : 3,
          borderRadius: radius.pill,
          backgroundColor: emphasis ? palette.sky500 : palette.sky100,
        },
        style,
      ]}>
      <AppText variant="caption" color={emphasis ? palette.white : palette.sky700} style={{ fontWeight: '800' }}>
        ₱{amount}
      </AppText>
      {label ? (
        <AppText variant="micro" color={emphasis ? palette.sky100 : palette.sky600}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}
