import { ReactNode } from 'react';
import { Platform, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, spacing } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
  /** Adds bottom padding to clear the floating tab bar. */
  padded?: boolean;
  background?: string;
};

/**
 * Full-bleed screen container with safe-area handling and an optional scroll.
 */
export function Screen({ children, style, scroll = false, padded = true, background = palette.white }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = padded ? insets.bottom + spacing.xxxl : insets.bottom;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={{ paddingBottom: bottomPad + spacing.xl }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingBottom: bottomPad }}>{children}</View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: background, paddingTop: Platform.OS === 'android' ? insets.top : 0 }, style]}>
      {content}
    </View>
  );
}
