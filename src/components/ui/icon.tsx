import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { palette } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

/** Thin wrapper over Ionicons with the app's default tint. */
export function Icon({ name, size = 22, color = palette.ink }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
