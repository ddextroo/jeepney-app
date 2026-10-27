import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, Text, View } from 'react-native';

import { hasMapboxToken, MAPBOX_ACCESS_TOKEN } from '@/config';
import type { ResolvedRoute, Stop } from '@/data';
import { palette, SELECTED_ROUTE_COLOR } from '@/theme';

import { MapPlaceholder } from './MapPlaceholder';
import { MAP_STYLE_URL, routeBounds, routePaint } from './geojson';

export type ThemedMapMode = 'explore' | 'navigation';

export type ThemedMapProps = {
  center: { lat: number; lng: number };
  zoomLevel?: number;
  routes: ResolvedRoute[];
  stops: Stop[];
  selectedRouteId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  /** When true and a route is selected, the camera fits to that route's bounds. */
  fitToSelected?: boolean;
  /** `navigation` renders the active guidance treatment (thick glowing line + dashes). */
  mode?: ThemedMapMode;
  /** Camera tilt in degrees — used for the tilted navigation view where supported. */
  pitch?: number;
};

/** Imperative camera handles exposed by any map implementation (native or placeholder). */
export type MapCameraHandle = {
  recenter: (coordinate: { lat: number; lng: number }, zoom?: number) => void;
  fitRoute: (route: ResolvedRoute) => void;
};

/**
 * Lazily resolve the Mapbox native module. Returns null on web, without a token,
 * or when the native module isn't compiled into the build (e.g. Expo Go).
 */
function loadMapbox(): any | null {
  if (!hasMapboxToken || Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require('@rnmapbox/maps');
    const Mapbox = pkg.default ?? pkg;
    if (!Mapbox || !Mapbox.MapView) return null;
    Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
    return Mapbox;
  } catch {
    return null;
  }
}

/**
 * Renders the dark Mapbox map when a token + native build are present,
 * otherwise a designed dark placeholder that still shows the real corridors.
 */
export const ThemedMap = forwardRef<MapCameraHandle, ThemedMapProps>(function ThemedMap(props, ref) {
  const Mapbox = loadMapbox();
  if (!Mapbox) {
    return (
      <View style={{ flex: 1 }}>
        <MapPlaceholder
          ref={ref}
          routes={props.routes}
          stops={props.stops}
          selectedRouteId={props.selectedRouteId}
          userLocation={props.userLocation}
          mode={props.mode}
        />
      </View>
    );
  }
  return <MapboxMap ref={ref} {...props} Mapbox={Mapbox} />;
});

type MapboxMapProps = ThemedMapProps & { Mapbox: any };

const MapboxMap = forwardRef<MapCameraHandle, MapboxMapProps>(function MapboxMap({ Mapbox, center, zoomLevel = 13, routes, stops, selectedRouteId, userLocation, fitToSelected = true, mode = 'explore', pitch = 0 }, ref) {
  const cameraRef = useRef<any>(null);
  const selected = routes.find((r) => r.id === selectedRouteId) ?? null;
  const useBounds = fitToSelected && selected;

  useImperativeHandle(ref, () => ({
    recenter: ({ lat, lng }, zoom) => {
      cameraRef.current?.setCamera({ centerCoordinate: [lng, lat], zoomLevel: zoom ?? 15, animationDuration: 500 });
    },
    fitRoute: (route) => {
      const [w, s, e, n] = routeBounds(route);
      cameraRef.current?.setCamera({
        bounds: { ne: [e, n], sw: [w, s] },
        padding: { top: 140, right: 60, bottom: 340, left: 60 },
        animationDuration: 700,
      });
    },
  }));

  const selectedStops = useMemo(() => {
    if (!selected) return { boarding: null as Stop | null, destination: null as Stop | null };
    const nearUser = userLocation
      ? [...selected.stops].sort((a, b) => (a.lat - userLocation.lat) ** 2 + (a.lng - userLocation.lng) ** 2 - ((b.lat - userLocation.lat) ** 2 + (b.lng - userLocation.lng) ** 2))[0]
      : selected.stops[0];
    return { boarding: nearUser ?? null, destination: selected.stops[selected.stops.length - 1] ?? null };
  }, [selected, userLocation]);

  return (
    <Mapbox.MapView styleURL={MAP_STYLE_URL} style={{ flex: 1 }} tintColor={palette.white} rotateEnabled compassEnabled={false} scaleBarEnabled={false}>
      <Mapbox.Camera
        ref={cameraRef}
        key={useBounds ? `fit-${selected!.id}` : 'free'}
        defaultZoomLevel={zoomLevel}
        pitch={pitch}
        {...(useBounds
          ? {
              bounds: { ne: [routeBounds(selected!)[2], routeBounds(selected!)[3]], sw: [routeBounds(selected!)[0], routeBounds(selected!)[1]] },
              padding: { top: 140, right: 60, bottom: mode === 'navigation' ? 300 : 260, left: 60 },
            }
          : { centerCoordinate: [center.lng, center.lat], zoomLevel })}
        animationDuration={600}
      />

      {userLocation && <Mapbox.UserLocation tintColors={{ main: palette.mapUserLocation, control: palette.sky700 }} />}

      {/* Route corridors: dark halo underneath, bright line on top, dashed centerline while navigating */}
      {routes.map((route) => {
        const paint = routePaint(route, selectedRouteId, mode);
        const coords = route.path.map(([lat, lng]) => [lng, lat]);
        return (
          <Mapbox.ShapeSource
            key={route.id}
            id={`route-${route.id}`}
            shape={{ type: 'Feature', properties: { id: route.id }, geometry: { type: 'LineString', coordinates: coords } }}>
            <Mapbox.LineLayer
              id={`route-halo-${route.id}`}
              style={{
                lineColor: paint.haloColor,
                lineWidth: paint.haloWidth,
                lineOpacity: paint.opacity,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Mapbox.LineLayer
              id={`route-line-${route.id}`}
              style={{
                lineColor: paint.color,
                lineWidth: paint.lineWidth,
                lineOpacity: paint.opacity,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {paint.dashed && (
              <Mapbox.LineLayer
                id={`route-dash-${route.id}`}
                style={{
                  lineColor: palette.mapRouteCasing,
                  lineWidth: 2.5,
                  lineOpacity: 0.95,
                  lineDasharray: [1, 2],
                  lineCap: 'round',
                }}
              />
            )}
          </Mapbox.ShapeSource>
        );
      })}

      {/* Stops: small white dots; selected route's boarding + destination get emphasis */}
      <Mapbox.ShapeSource
        id="stops"
        shape={{
          type: 'FeatureCollection',
          features: stops.map((s) => ({
            type: 'Feature',
            properties: { id: s.id, kind: kindOf(s, selected, selectedStops.boarding) },
            geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
          })),
        }}>
        <Mapbox.CircleLayer
          id="stops-circle"
          style={{
            circleRadius: ['match', ['get', 'kind'], 'normal', 4, 'boarding', 7, 'destination', 7, 4],
            circleColor: ['match', ['get', 'kind'], 'normal', palette.white, 'boarding', SELECTED_ROUTE_COLOR, 'destination', palette.success, palette.white],
            circleStrokeWidth: ['match', ['get', 'kind'], 'normal', 2, 'boarding', 3, 'destination', 3, 2],
            circleStrokeColor: ['match', ['get', 'kind'], 'normal', palette.sky700, palette.white],
          }}
        />
      </Mapbox.ShapeSource>

      {/* Compact route badges so corridors are identifiable without color alone */}
      {routes.map((route) => {
        const mid = route.path[Math.floor(route.path.length / 2)];
        if (!mid) return null;
        const dim = selectedRouteId && route.id !== selectedRouteId;
        return (
          <Mapbox.Annotation key={`badge-${route.id}`} id={`badge-${route.id}`} coordinate={[mid[1], mid[0] - 0.004]} anchorY={0}>
            <RouteBadge code={route.code} color={route.color} dimmed={Boolean(dim)} />
          </Mapbox.Annotation>
        );
      })}

      {/* Boarding / destination labels for the selected corridor */}
      {selected && selectedStops.boarding && (
        <Mapbox.Annotation id="boarding-label" coordinate={[selectedStops.boarding.lng, selectedStops.boarding.lat]} anchorY={-28}>
          <StopLabel stop={selectedStops.boarding} kind="boarding" />
        </Mapbox.Annotation>
      )}
      {selected && selectedStops.destination && selectedStops.destination.id !== selectedStops.boarding?.id && (
        <Mapbox.Annotation id="destination-label" coordinate={[selectedStops.destination.lng, selectedStops.destination.lat]} anchorY={-28}>
          <StopLabel stop={selectedStops.destination} kind="destination" />
        </Mapbox.Annotation>
      )}
    </Mapbox.MapView>
  );
});

function kindOf(stop: Stop, selected: ResolvedRoute | null, boarding: Stop | null): 'normal' | 'boarding' | 'destination' {
  if (selected && boarding && stop.id === boarding.id) return 'boarding';
  if (selected && stop.id === selected.stops[selected.stops.length - 1]?.id) return 'destination';
  return 'normal';
}

/** Pill-shaped route identifier badge rendered on the map (same shape as list badges). */
function RouteBadge({ code, color, dimmed }: { code: string; color: string; dimmed?: boolean }) {
  return (
    <View style={{ opacity: dimmed ? 0.45 : 1 }}>
      <View style={{ minWidth: 34, height: 34, paddingHorizontal: 6, borderRadius: 10, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: palette.mapHalo }}>
        <Text numberOfLines={1} style={{ color: palette.white, fontSize: code.length > 3 ? 10 : 13, fontWeight: '800', letterSpacing: 0.3 }}>
          {code}
        </Text>
      </View>
    </View>
  );
}

/** Small dark card pinned above boarding / destination markers. */
function StopLabel({ stop, kind }: { stop: Stop; kind: 'boarding' | 'destination' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.navSurface, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: palette.navBorder }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: kind === 'boarding' ? SELECTED_ROUTE_COLOR : palette.success }} />
      <Text numberOfLines={1} style={{ color: palette.navInk, fontSize: 11, fontWeight: '700', maxWidth: 130 }}>
        {stop.shortName ?? stop.name}
      </Text>
    </View>
  );
}
