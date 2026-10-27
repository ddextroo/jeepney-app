import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { palette, radius, shadows } from '@/theme';

/**
 * Floating circular map control (recenter, heading, ...). `dark` tints it for
 * use over the dark basemap; the default is the light chip used on explore.
 */
export function RoundButton({ icon, onPress, dark }: { icon: IconName; onPress: () => void; dark?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          width: 42,
          height: 42,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dark ? palette.navSurface : palette.white,
          borderWidth: 1,
          borderColor: dark ? palette.navBorder : palette.border,
          ...shadows.floating,
        },
        pressed && { opacity: 0.85 },
      ]}>
      <Icon name={icon} size={19} color={dark ? palette.navInk : palette.ink} />
    </Pressable>
  );
}
