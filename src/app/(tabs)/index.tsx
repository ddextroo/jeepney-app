import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapCameraHandle, ThemedMap } from '@/components/map/ThemedMap';
import { RoundButton } from '@/components/map/map-controls';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/ui/text';
import { SearchBar } from '@/components/ui/search-bar';
import { BottomSheet, SheetSnap } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import { formatDistance, metersBetween, pathLengthKm } from '@/data/geo';
import { matchRoutes, routesPassingNear } from '@/data/search';
import { RESOLVED_ROUTES } from '@/data/repository';
import { JEEPNEY_KMH } from '@/data/journey';
import type { NearbyStop, ResolvedRoute } from '@/data/types';
import { useUserLocation } from '@/hooks/use-user-location';
import { palette, radius, shadows, spacing } from '@/theme';

function rideMinutes(route: ResolvedRoute): number {
  return Math.max(1, Math.round((pathLengthKm(route.path) / JEEPNEY_KMH) * 60));
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const camera = useRef<MapCameraHandle>(null);
  const { lat, lng, isPrecise } = useUserLocation();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snap, setSnap] = useState<SheetSnap>('collapsed');

  const searching = query.trim().length > 0;
  const nearby = useMemo(() => (searching ? [] : routesPassingNear(lat, lng, 8000).slice(0, 8)), [searching, lat, lng]);
  const results = useMemo<ResolvedRoute[]>(() => (searching ? matchRoutes(query).slice(0, 8) : []), [searching, query]);
  const rows = searching ? results.map((route) => ({ route, nearestStop: nearestBoardingStop(route, lat, lng) })) : nearby;

  const shownRoutes = useMemo(() => {
    const ids = new Set(rows.map((r) => r.route.id));
    const list = rows.map((r) => r.route);
    if (selectedId && !ids.has(selectedId)) {
      const sel = RESOLVED_ROUTES.find((r) => r.id === selectedId);
      if (sel) return [sel, ...list];
    }
    return list;
  }, [rows, selectedId]);

  const shownStops = useMemo(() => {
    const map = new Map<string, (typeof RESOLVED_ROUTES)[number]['stops'][number]>();
    for (const route of shownRoutes) for (const s of route.stops) map.set(s.id, s);
    return [...map.values()];
  }, [shownRoutes]);

  const selected = selectedId ? RESOLVED_ROUTES.find((r) => r.id === selectedId) ?? null : null;
  const boardingOptions = useMemo(() => (selected ? boardingStops(selected, lat, lng) : []), [selected, lat, lng]);

  const selectRoute = (routeId: string) => {
    setSelectedId(routeId);
    setSnap('half');
    const route = shownRoutes.find((r) => r.id === routeId) ?? RESOLVED_ROUTES.find((r) => r.id === routeId);
    if (route) camera.current?.fitRoute(route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.navSurfaceSolid }}>
      {/* Edge-to-edge dark map — the primary visual element */}
      <ThemedMap
        ref={camera}
        center={{ lat, lng }}
        zoomLevel={13.5}
        routes={shownRoutes}
        stops={shownStops}
        selectedRouteId={selectedId}
        userLocation={{ lat, lng }}
      />

      {/* Compact top status area: search + location + recenter */}
      <View style={{ position: 'absolute', top: insets.top + spacing.md, left: spacing.lg, right: spacing.lg, gap: spacing.sm }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Where do you want to go?" />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => camera.current?.recenter({ lat, lng })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.white, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 7, ...shadows.card }}>
            <Icon name="locate" size={14} color={palette.sky500} />
            <AppText variant="caption" color={palette.ink}>
              {isPrecise ? 'Your current location' : 'IT Park, Cebu (default)'}
            </AppText>
          </Pressable>
          <RoundButton icon="navigate-outline" onPress={() => camera.current?.recenter({ lat, lng }, 15)} dark />
        </View>
      </View>

      {/* Nearby / results sheet */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}>
        <BottomSheet peekHeight={132} halfHeight={430} expandTo={560} snap={snap} onSnapChange={setSnap}>
          {selected ? (
            <SelectedRoutePanel
              route={selected}
              boardingOptions={boardingOptions}
              onClear={() => {
                setSelectedId(null);
                setSnap('collapsed');
              }}
            />
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
                <AppText variant="section">{searching ? 'Search results' : 'Jeepneys near you'}</AppText>
                <Pressable onPress={() => setSnap(snap === 'expanded' ? 'half' : 'expanded')}>
                  <AppText variant="caption" color={palette.sky500}>
                    See all
                  </AppText>
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}>
                {rows.length === 0 ? (
                  <EmptyState query={query} />
                ) : (
                  rows.map(({ route, nearestStop }) => <NearbyRow key={route.id} route={route} nearestStop={nearestStop} onPress={() => selectRoute(route.id)} />)
                )}
              </ScrollView>
            </>
          )}
        </BottomSheet>
      </View>
    </View>
  );
}

/** Compact list row matching the design reference: badge, corridor, time + distance. */
function NearbyRow({ route, nearestStop, onPress }: { route: ResolvedRoute; nearestStop?: NearbyStop; onPress: () => void }) {
  const first = route.stops[0];
  const last = route.stops[route.stops.length - 1];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.white, borderRadius: radius.md, borderWidth: 1, borderColor: pressed ? route.color : palette.border, padding: spacing.md }, pressed && { opacity: 0.95 }]}>
      <Badge text={route.code} color={route.color} size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {first.shortName ?? first.name} – {last.shortName ?? last.name}
        </AppText>
        <AppText variant="caption" color={palette.inkTertiary}>
          {rideMinutes(route)} min{nearestStop ? ` • ${formatDistance(nearestStop.distanceMeters)}` : ''}
        </AppText>
      </View>
      <Icon name="chevron-forward" size={18} color={palette.inkTertiary} />
    </Pressable>
  );
}

/** Expanded panel for the selected corridor: identity, boarding points, CTAs. */
function SelectedRoutePanel({ route, boardingOptions, onClear }: { route: ResolvedRoute; boardingOptions: NearbyStop[]; onClear: () => void }) {
  const destination = route.stops[route.stops.length - 1];
  return (
    <View style={{ flex: 1, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Badge text={route.code} color={route.color} size={44} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {route.name}
          </AppText>
          <AppText variant="caption" color={palette.inkTertiary} numberOfLines={1}>
            To {destination.shortName ?? destination.name} • {rideMinutes(route)} min ride
          </AppText>
        </View>
        <Pressable onPress={onClear} hitSlop={8}>
          <Icon name="close-circle" size={22} color={palette.inkTertiary} />
        </Pressable>
      </View>

      <View>
        <AppText variant="micro" color={palette.inkTertiary} style={{ marginBottom: spacing.sm }}>
          NEARBY BOARDING POINTS
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {boardingOptions.map((s) => (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: palette.sky100 }}>
              <Icon name="arrow-up-circle" size={14} color={palette.sky600} />
              <AppText variant="caption" color={palette.sky700}>
                {s.shortName ?? s.name}
              </AppText>
              <AppText variant="micro" color={palette.inkTertiary}>
                {formatDistance(s.distanceMeters)}
              </AppText>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 'auto', paddingBottom: spacing.sm }}>
        <Button
          label="View route"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/route/[id]', params: { id: route.id } })}
        />
        <Button
          label="Use this route"
          style={{ flex: 1 }}
          leftIcon={<Icon name="navigate" size={16} color={palette.white} />}
          onPress={() => router.push({ pathname: '/route/[id]', params: { id: route.id, autostart: '1' } })}
        />
      </View>
    </View>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm }}>
      <View style={{ width: 52, height: 52, borderRadius: radius.pill, backgroundColor: palette.sky100, alignItems: 'center', justifyContent: 'center', ...shadows.card }}>
        <Icon name="search-outline" size={24} color={palette.sky600} />
      </View>
      <AppText variant="bodyStrong" center>
        No jeepney matches
      </AppText>
      <AppText variant="caption" color={palette.inkSecondary} center>
        {query ? `Nothing for "${query.trim()}". Try "143" or "Mansilay".` : 'Try a route number like "143" or a place like "Mansilay".'}
      </AppText>
    </View>
  );
}

/** Stops on `route` closest to the user — the realistic places to hop on. */
function boardingStops(route: ResolvedRoute, lat: number, lng: number): NearbyStop[] {
  return route.stops
    .map((s) => ({ ...s, routeIds: [route.id], distanceMeters: metersBetween({ lat, lng }, s) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);
}

function nearestBoardingStop(route: ResolvedRoute, lat: number, lng: number): NearbyStop | undefined {
  return boardingStops(route, lat, lng)[0];
}
