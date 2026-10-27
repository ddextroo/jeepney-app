import { Pressable, StyleProp, TextInput, View, ViewStyle } from 'react-native';

import { Icon } from './icon';
import { palette, radius, shadows, spacing } from '@/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
};

/**
 * Floating pill search field with a leading magnifier — Grab-style.
 */
export function SearchBar({ value, onChangeText, placeholder = 'Search routes or destinations', onSubmit, style, autoFocus }: SearchBarProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: palette.white,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.lg,
          height: 54,
          borderWidth: 1,
          borderColor: palette.border,
          ...shadows.floating,
        },
        style,
      ]}>
      <Icon name="search" size={20} color={palette.inkTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={palette.inkTertiary}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={[{ flex: 1, fontSize: 15, color: palette.ink, paddingVertical: 0 }, ]}
      />
      {value.length > 0 && (
        <Pressable hitSlop={8} onPress={() => onChangeText('')}>
          <Icon name="close-circle" size={20} color={palette.inkTertiary} />
        </Pressable>
      )}
    </View>
  );
}
