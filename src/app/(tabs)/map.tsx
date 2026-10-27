import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/ui/text';
import { Badge } from '@/components/ui/pill';
import { formatDistance, pathLengthKm } from '@/data/geo';
import { RESOLVED_ROUTES } from '@/data/repository';
import { routesPassingNear } from '@/data/search';
import type { ResolvedRoute } from '@/data/types';
import { useUserLocation } from '@/hooks/use-user-location';
import { palette, radius, spacing } from '@/theme';

type Filter = 'all' | 'nearest' | 'popular';

/** How central a route is to the network — shared stops with other corridors. */
function connectivity(route: ResolvedRoute): number {
  const ids = new Set(route.stops.map((s) => s.id));
  return RESOLVED_ROUTES.filter((other) => other.id !== route.id && other.stops.some((s) => ids.has(s.id))).length;
}

/** Nearby-tab: full list of jeepney corridors with All / Nearest / Popular filters. */
export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ route?: string }>();
  const { lat, lng } = useUserLocation();
  const [filter, setFilter] = useState<Filter>('all');

  const nearby = useMemo(() => routesPassingNear(lat, lng, 20000), [lat, lng]);
  const rows = useMemo(() => {
    const distanceOf = (route: ResolvedRoute) => nearby.find((n) => n.route.id === route.id)?.nearestStop.distanceMeters ?? Number.MAX_SAFE_INTEGER;
    if (filter === 'nearest') return [...nearby].sort((a, b) => a.nearestStop.distanceMeters - b.nearestStop.distanceMeters).map((n) => ({ route: n.route, distance: n.nearestStop.distanceMeters }));
    if (filter === 'popular') return [...RESOLVED_ROUTES].sort((a, b) => connectivity(b) - connectivity(a)).map((route) => ({ route, distance: distanceOf(route) }));
    return RESOLVED_ROUTES.map((route) => ({ route, distance: distanceOf(route) }));
  }, [filter, nearby]);

  // Honor ?route= deep-links (e.g. from Saved) by opening that route's details.
  useEffect(() => {
    if (params.route) router.push({ pathname: '/route/[id]', params: { id: params.route } });
  }, [params.route]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface }}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}>
        <AppText variant="heading">Nearby jeepneys</AppText>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg }}>
          {(['all', 'nearest', 'popular'] as const).map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{ paddingHorizontal: spacing.lg, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: active ? palette.sky100 : palette.white, borderWidth: 1, borderColor: active ? palette.sky500 : palette.border }}>
                <AppText variant="caption" color={active ? palette.sky500 : palette.inkSecondary} style={{ textTransform: 'capitalize' }}>
                  {f}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl }}>
        {rows.map(({ route, distance }) => {
          const first = route.stops[0];
          const last = route.stops[route.stops.length - 1];
          return (
            <Pressable
              key={route.id}
              onPress={() => router.push({ pathname: '/route/[id]', params: { id: route.id } })}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: pressed ? route.color : palette.border, padding: spacing.md })}>
              <Badge text={route.code} color={route.color} size={40} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {first.shortName ?? first.name} – {last.shortName ?? last.name}
                </AppText>
                <AppText variant="caption" color={palette.inkTertiary}>
                  {pathLengthKm(route.path).toFixed(1)} km{Number.isFinite(distance) ? ` • ${formatDistance(distance)} away` : ''}
                </AppText>
              </View>
              <Icon name="chevron-forward" size={18} color={palette.inkTertiary} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
