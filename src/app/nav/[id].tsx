import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedMap } from '@/components/map/ThemedMap';
import { RoundButton } from '@/components/map/map-controls';
import { Icon, type IconName } from '@/components/ui/icon';
import { AppText } from '@/components/ui/text';
import { formatDistance } from '@/data/geo';
import { arrivalLabel, buildJourney, type JourneyStage } from '@/data/journey';
import { getRoute } from '@/data/repository';
import { useUserLocation } from '@/hooks/use-user-location';
import { palette, radius, SELECTED_ROUTE_COLOR, spacing } from '@/theme';

/**
 * Navigation Mode — immersive guidance for a walk → ride → walk journey.
 * All distances / durations come from the static planning model; the app has
 * no vehicle tracking, so nothing here implies a live jeepney position.
 */
export default function NavigationScreen() {
  const { id, from, to } = useLocalSearchParams<{ id: string; from?: string; to?: string }>();
  const insets = useSafeAreaInsets();
  const { lat, lng } = useUserLocation();
  const route = getRoute(id);

  const journey = useMemo(() => {
    if (!route) return null;
    const boardId = from ?? route.stops[0]?.id ?? '';
    const alightId = to ?? route.stops[route.stops.length - 1]?.id ?? '';
    return buildJourney(route, { lat, lng }, boardId, alightId);
  }, [route, from, to, lat, lng]);

  if (!route || !journey) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.navSurfaceSolid, alignItems: 'center', justifyContent: 'center' }}>
        <AppText color={palette.navInkMuted}>This trip is unavailable.</AppText>
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <AppText color={palette.sky300}>Go back</AppText>
        </Pressable>
      </View>
    );
  }

  const current = journey.stages.find((s) => s.kind === 'walk') ?? journey.stages[0];
  const ride = journey.stages.find((s) => s.kind === 'ride');
  const now = arrivalLabel(0);
  const eta = arrivalLabel(journey.totalMinutes);

  return (
    <View style={{ flex: 1, backgroundColor: palette.navSurfaceSolid }}>
      {/* Tilted dark map with the selected corridor front and center */}
      <ThemedMap
        center={{ lat, lng }}
        zoomLevel={14.5}
        routes={[route]}
        stops={[journey.board, journey.alight]}
        selectedRouteId={route.id}
        userLocation={{ lat, lng }}
        mode="navigation"
        pitch={50}
      />

      {/* Top instruction banner */}
      <View style={{ position: 'absolute', top: insets.top + spacing.md, left: spacing.lg, right: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.navSurface, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: palette.navBorder }}>
          <View style={{ width: 48, height: 48, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={current.kind === 'walk' ? 'walk-outline' : 'bus-outline'} size={26} color={palette.navInk} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="title" color={palette.navInk} style={{ fontSize: 26 }}>
              {formatDistance(current.distanceMeters)}
            </AppText>
            <AppText variant="bodyStrong" color={palette.navInk}>
              {current.kind === 'walk' ? 'Head to your boarding point' : `Ride ${route.code} — alight at ${journey.alight.shortName ?? journey.alight.name}`}
            </AppText>
            <AppText variant="caption" color={palette.navInkMuted}>
              {current.toLabel}
            </AppText>
          </View>
        </View>
      </View>

      {/* Right-side map controls: heading + recenter fallback */}
      <View style={{ position: 'absolute', right: spacing.lg, top: insets.top + 150, gap: spacing.sm }}>
        <RoundButton icon="compass-outline" onPress={() => {}} dark />
        <RoundButton icon="locate" onPress={() => {}} dark />
      </View>

      {/* Bottom guidance panel */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: palette.navSurfaceSolid, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.lg, gap: spacing.md }}>
        <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.15)' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <AppText variant="title" color={palette.navInk}>
              {journey.totalMinutes} min
            </AppText>
            <AppText variant="caption" color={palette.navInkMuted}>
              {formatDistance(journey.totalMeters)} · arrive {eta}
            </AppText>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ backgroundColor: pressed ? '#B3393C' : '#5A2226', borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.md })}>
            <AppText variant="bodyStrong" color="#FF8A8A">
              End
            </AppText>
          </Pressable>
        </View>

        {/* Stage identity + honest planning caveat (no live vehicle data) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {ride ? (
            <>
              <View style={{ backgroundColor: SELECTED_ROUTE_COLOR, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
                <AppText variant="micro" color={palette.white} style={{ fontSize: 12, letterSpacing: 0.5 }}>
                  {route.code}
                </AppText>
              </View>
              <AppText variant="caption" color={palette.navInk} style={{ flex: 1 }} numberOfLines={1}>
                {ride.toLabel.charAt(0).toUpperCase() + ride.toLabel.slice(1)}
              </AppText>
            </>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.14)', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
            <Icon name="warning" size={11} color={palette.warning} />
            <AppText variant="micro" color={palette.warning}>
              ESTIMATES ONLY
            </AppText>
          </View>
        </View>

        {/* Journey progress: walk · board · ride · alight · walk */}
        <StageTrack stages={journey.stages} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="caption" color={palette.navInkMuted}>
            You {now}
          </AppText>
          <AppText variant="caption" color={palette.navInkMuted}>
            Jeepney {eta}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/** Horizontal stage diagram: dotted = walking, solid blue = riding. */
function StageTrack({ stages }: { stages: JourneyStage[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {stages.map((stage, i) => (
        <View key={i} style={{ flex: Math.max(1, stage.distanceMeters / 100), flexDirection: 'row', alignItems: 'center' }}>
          <StageDot kind={stage.kind} />
          <View style={{ flex: 1, height: stage.kind === 'ride' ? 3 : 0, borderWidth: stage.kind === 'ride' ? 0 : 2, borderBottomColor: stage.kind === 'ride' ? 'transparent' : 'rgba(255,255,255,0.35)', borderStyle: 'dotted', marginHorizontal: 2 }} />
        </View>
      ))}
      <StageIcon name="flag" />
    </View>
  );
}

function StageDot({ kind }: { kind: JourneyStage['kind'] }) {
  if (kind === 'ride') {
    return (
      <View style={{ width: 18, height: 18, borderRadius: radius.sm, backgroundColor: palette.danger, borderWidth: 2, borderColor: palette.white, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="bus" size={10} color={palette.white} />
      </View>
    );
  }
  return <View style={{ width: 12, height: 12, borderRadius: radius.pill, backgroundColor: SELECTED_ROUTE_COLOR, borderWidth: 2, borderColor: palette.white }} />;
}

function StageIcon({ name }: { name: IconName }) {
  return (
    <View style={{ width: 18, height: 18, borderRadius: radius.sm, backgroundColor: SELECTED_ROUTE_COLOR, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={11} color={palette.white} />
    </View>
  );
}
