import { type ComponentProps } from 'react';
import { View } from 'react-native';

import { pathLengthKm } from '@/data/geo';
import type { ResolvedRoute } from '@/data/types';
import { palette, spacing } from '@/theme';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';
import { Badge } from './ui/pill';
import { Card } from './ui/card';

type RouteCardProps = {
  route: ResolvedRoute;
  /** Context line, e.g. "Board at IT Park • 350 m away". */
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Premium route result card: colored badge, corridor, and meta row. */
export function RouteCard({ route, subtitle, selected, onPress }: RouteCardProps) {
  const first = route.stops[0];
  const last = route.stops[route.stops.length - 1];
  const km = pathLengthKm(route.path);

  return (
    <Card onPress={onPress} style={{ borderWidth: selected ? 1.5 : 1, borderColor: selected ? route.color : palette.border }}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <Badge text={route.code} color={route.color} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {route.name}
          </AppText>
          <AppText variant="caption" color={palette.inkSecondary} numberOfLines={1}>
            {first.shortName ?? first.name} → {last.shortName ?? last.name}
          </AppText>
        </View>
        <Icon name="chevron-forward" size={18} color={palette.inkTertiary} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md }}>
        <Meta icon="swap-vertical" text={`${route.stops.length} stops`} />
        <Meta icon="time-outline" text={`${km.toFixed(1)} km`} />
        <Meta icon="pricetag-outline" text={`₱${route.fare.min}–${route.fare.max}`} />
      </View>

      {subtitle ? (
        <AppText variant="caption" color={palette.sky700} style={{ marginTop: spacing.sm }}>
          {subtitle}
        </AppText>
      ) : null}
    </Card>
  );
}

function Meta({ icon, text }: { icon: ComponentProps<typeof Icon>['name']; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={14} color={palette.inkTertiary} />
      <AppText variant="caption" color={palette.inkSecondary}>
        {text}
      </AppText>
    </View>
  );
}
