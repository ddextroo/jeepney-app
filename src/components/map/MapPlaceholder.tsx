import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { ResolvedRoute, Stop } from '@/data';
import { palette, radius, SELECTED_ROUTE_COLOR } from '@/theme';

import { makeProjector, boundsOf } from './projection';
import type { MapCameraHandle, ThemedMapMode } from './ThemedMap';

/** Deterministic PRNG so the "city" looks the same on every render. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type PolylineProps = {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity?: number;
  dashed?: boolean;
};

/** Draws a polyline using rotated segments (no SVG dependency). */
function Polyline({ points, color, width, opacity = 1, dashed = false }: PolylineProps) {
  const segments = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    if (dashed) {
      // White centerline: evenly spaced ticks along the segment.
      const tick = 6;
      const count = Math.max(1, Math.floor(length / (tick * 2)));
      for (let j = 0; j < count; j++) {
        const t0 = (j * 2 * tick + tick * 0.5) / length;
        const t1 = Math.min(1, t0 + tick / length);
        if (t0 >= 1) break;
        const ax = a.x + dx * t0;
        const ay = a.y + dy * t0;
        const bx = a.x + dx * t1;
        const by = a.y + dy * t1;
        const len = Math.hypot(bx - ax, by - ay);
        segments.push(
          <View
            key={`${i}-${j}`}
            style={{
              position: 'absolute',
              left: (ax + bx) / 2 - len / 2,
              top: (ay + by) / 2 - width / 2,
              width: len,
              height: width,
              borderRadius: width,
              backgroundColor: color,
              opacity,
              transform: [{ rotate: `${angle}rad` }],
            }}
          />,
        );
      }
      continue;
    }
    segments.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: midX - length / 2,
          top: midY - width / 2,
          width: length,
          height: width,
          borderRadius: width,
          backgroundColor: color,
          opacity,
          transform: [{ rotate: `${angle}rad` }],
        }}
      />,
    );
  }
  return <>{segments}</>;
}

type MapPlaceholderProps = {
  routes: ResolvedRoute[];
  stops: Stop[];
  selectedRouteId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  mode?: ThemedMapMode;
};

const NAV = {
  bg: '#0B1420',
  bgDeep: '#0A1626',
  streetMinor: '#1C2836',
  streetMajor: '#3A4859',
  streetPrimary: '#4A5B70',
  building: '#141F2C',
  park: '#16281F',
  water: '#0A1830',
  label: '#5E6B7A',
};

/**
 * Fallback map when Mapbox isn't available (no token, Expo Go, or web).
 * Renders a dark, cartographic-style mock basemap with the real route
 * corridors, stop pins, route badges and boarding/destination markers so
 * the design language matches the Mapbox `dark-v11` experience.
 */
export const MapPlaceholder = forwardRef<MapCameraHandle, MapPlaceholderProps>(function MapPlaceholder(
  { routes, stops, selectedRouteId, userLocation, mode = 'explore' },
  ref,
) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragFrom = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const scene = useMemo(() => {
    if (!size.width || !size.height) return null;
    const allPoints = routes.flatMap((r) => r.path);
    if (allPoints.length === 0) return null;
    const project = makeProjector(boundsOf(allPoints), size.width, size.height, 72);

    const routePts = routes.map((r) => ({
      id: r.id,
      code: r.code,
      color: r.color,
      points: r.path.map(([lat, lng]) => project(lat, lng)),
      mid: project(r.path[Math.floor(r.path.length / 2)][0], r.path[Math.floor(r.path.length / 2)][1]),
    }));
    const stopPts = stops.map((s) => ({ id: s.id, name: s.shortName ?? s.name, ...project(s.lat, s.lng) }));
    const userPt = userLocation ? project(userLocation.lat, userLocation.lng) : null;

    // Deterministic dark "city" behind the corridors.
    const rand = mulberry32(1337);
    const buildings = Array.from({ length: 70 }, () => ({
      x: rand() * size.width,
      y: rand() * size.height,
      w: 14 + rand() * 46,
      h: 10 + rand() * 34,
    }));
    const parks = Array.from({ length: 5 }, () => ({
      x: rand() * size.width * 0.9,
      y: rand() * size.height * 0.9,
      w: 60 + rand() * 90,
      h: 44 + rand() * 70,
    }));
    const minorV = Array.from({ length: 11 }, (_, i) => ((i + 0.5 + rand() * 0.4) / 11) * size.width);
    const minorH = Array.from({ length: 9 }, (_, i) => ((i + 0.5 + rand() * 0.4) / 9) * size.height);
    const majorV = [0.22, 0.55, 0.82].map((f) => f * size.width);
    const majorH = [0.3, 0.68].map((f) => f * size.height);

    return { routePts, stopPts, userPt, buildings, parks, minorV, minorH, majorV, majorH, project };
  }, [routes, stops, userLocation, size]);

  // Simple one-finger pan so the map feels interactive; clamped to the viewport.
  const clamp = (v: number, span: number) => Math.min(span * 0.35, Math.max(-span * 0.35, v));
  const onGrant = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    dragFrom.current = { px: locationX, py: locationY, ox: offset.x, oy: offset.y };
  };
  const onMove = (e: GestureResponderEvent) => {
    if (!dragFrom.current || !size.width) return;
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - dragFrom.current.px;
    const dy = locationY - dragFrom.current.py;
    setOffset({ x: clamp(dragFrom.current.ox + dx, size.width), y: clamp(dragFrom.current.oy + dy, size.height) });
  };
  const onRelease = () => {
    dragFrom.current = null;
  };

  useImperativeHandle(ref, () => ({
    recenter: ({ lat, lng }) => {
      if (!scene || !size.width) return;
      const p = scene.project(lat, lng);
      setOffset({ x: clamp(size.width / 2 - p.x, size.width), y: clamp(size.height / 2 - p.y, size.height) });
    },
    fitRoute: () => setOffset({ x: 0, y: 0 }),
  }));

  const selected = routes.find((r) => r.id === selectedRouteId) ?? null;
  const boarding = selected && userLocation
    ? [...selected.stops].sort(
        (a, b) =>
          (a.lat - userLocation.lat) ** 2 + (a.lng - userLocation.lng) ** 2 - ((b.lat - userLocation.lat) ** 2 + (b.lng - userLocation.lng) ** 2),
      )[0]
    : selected?.stops[0];
  const destination = selected?.stops[selected.stops.length - 1];

  if (!scene) return <View style={{ flex: 1, backgroundColor: NAV.bg }} onLayout={onLayout} />;

  return (
    <View
      style={{ flex: 1, backgroundColor: NAV.bg }}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onRelease}
    >
      <LinearGradient colors={[NAV.bg, NAV.bgDeep, '#0D1826']} style={StyleSheet.absoluteFill} />

      <View style={{ position: 'absolute', left: 0, top: 0, width: size.width, height: size.height, transform: [{ translateX: offset.x }, { translateY: offset.y }] }} pointerEvents="none">
        {/* bay / waterway */}
        <View style={{ position: 'absolute', left: -size.width * 0.25, top: size.height * 0.45, width: size.width * 0.42, height: size.height * 0.75, backgroundColor: NAV.water, borderRadius: 160, transform: [{ rotate: '18deg' }], opacity: 0.9 }} />

        {/* parks — restrained green */}
        {scene.parks.map((p, i) => (
          <View key={`park${i}`} style={{ position: 'absolute', left: p.x, top: p.y, width: p.w, height: p.h, backgroundColor: NAV.park, borderRadius: 14 }} />
        ))}

        {/* building footprints */}
        {scene.buildings.map((b, i) => (
          <View key={`bld${i}`} style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, backgroundColor: NAV.building, borderRadius: 3 }} />
        ))}

        {/* minor street grid */}
        {scene.minorV.map((x, i) => (
          <View key={`mv${i}`} style={{ position: 'absolute', left: x, top: -40, bottom: -40, width: 1.5, backgroundColor: NAV.streetMinor }} />
        ))}
        {scene.minorH.map((y, i) => (
          <View key={`mh${i}`} style={{ position: 'absolute', top: y, left: -40, right: -40, height: 1.5, backgroundColor: NAV.streetMinor }} />
        ))}

        {/* arterial roads — brighter, graded hierarchy */}
        {scene.majorV.map((x, i) => (
          <View key={`jv${i}`} style={{ position: 'absolute', left: x, top: -40, bottom: -40, width: 5, backgroundColor: NAV.streetMajor }} />
        ))}
        {scene.majorH.map((y, i) => (
          <View key={`jh${i}`} style={{ position: 'absolute', top: y, left: -40, right: -40, height: 5, backgroundColor: NAV.streetMajor }} />
        ))}
        <View style={{ position: 'absolute', left: -60, top: size.height * 0.12, width: size.width + 120, height: 7, backgroundColor: NAV.streetPrimary, transform: [{ rotate: '9deg' }], borderRadius: 4, opacity: 0.8 }} />

        {/* muted neighborhood labels */}
        <Text style={{ position: 'absolute', left: size.width * 0.08, top: size.height * 0.16, color: NAV.label, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 }}>Cebu IT Park</Text>
        <Text style={{ position: 'absolute', left: size.width * 0.58, top: size.height * 0.78, color: NAV.label, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 }}>Lahug</Text>
        <Text style={{ position: 'absolute', left: size.width * 0.16, top: size.height * 0.62, color: NAV.label, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 }}>Downtown</Text>

        {/* inactive corridors — thin muted lines */}
        {scene.routePts
          .filter((r) => r.id !== selectedRouteId)
          .map((r) => (
            <Polyline key={`halo-${r.id}`} points={r.points} color={NAV.bgDeep} width={10} opacity={selectedRouteId ? 0.5 : 0.9} />
          ))}
        {scene.routePts
          .filter((r) => r.id !== selectedRouteId)
          .map((r) => (
            <Polyline key={r.id} points={r.points} color={selectedRouteId ? palette.mapInactiveRoute : r.color} width={2.5} opacity={selectedRouteId ? 0.55 : 0.85} />
          ))}

        {/* selected corridor — halo + bright line + dashed centerline while navigating */}
        {scene.routePts
          .filter((r) => r.id === selectedRouteId)
          .map((r) => (
            <View key={`sel-${r.id}`} style={StyleSheet.absoluteFill}>
              <Polyline points={r.points} color={palette.mapHalo} width={14} opacity={1} />
              <Polyline points={r.points} color={SELECTED_ROUTE_COLOR} width={mode === 'navigation' ? 7 : 5} opacity={1} />
              {mode === 'navigation' && <Polyline points={r.points} color={palette.mapRouteCasing} width={2.5} opacity={0.95} dashed />}
            </View>
          ))}

        {/* stop dots */}
        {scene.stopPts.map((s) => {
          const isBoarding = boarding && s.id === boarding.id;
          const isDest = destination && s.id === destination.id;
          const ring = isBoarding ? SELECTED_ROUTE_COLOR : isDest ? palette.success : palette.sky700;
          return (
            <View
              key={s.id}
              style={{
                position: 'absolute',
                left: s.x - (isBoarding || isDest ? 7 : 5),
                top: s.y - (isBoarding || isDest ? 7 : 5),
                width: isBoarding || isDest ? 14 : 10,
                height: isBoarding || isDest ? 14 : 10,
                borderRadius: 8,
                backgroundColor: isBoarding || isDest ? ring : palette.white,
                borderWidth: 2,
                borderColor: isBoarding || isDest ? palette.white : ring,
              }}
            />
          );
        })}

        {/* boarding / destination pill labels */}
        {selected && boarding && (
          <MapPill x={scene.stopPts.find((s) => s.id === boarding.id)?.x ?? 0} y={scene.stopPts.find((s) => s.id === boarding.id)?.y ?? 0} text={boarding.shortName ?? boarding.name} dotColor={SELECTED_ROUTE_COLOR} />
        )}
        {selected && destination && destination.id !== boarding?.id && (
          <MapPill x={scene.stopPts.find((s) => s.id === destination.id)?.x ?? 0} y={scene.stopPts.find((s) => s.id === destination.id)?.y ?? 0} text={destination.shortName ?? destination.name} dotColor={palette.success} />
        )}

        {/* compact route badges keep corridors identifiable without color */}
        {scene.routePts.map((r) => {
          const dim = selectedRouteId && r.id !== selectedRouteId;
          return (
            <View key={`badge-${r.id}`} style={{ position: 'absolute', left: r.mid.x - 17, top: r.mid.y + 6, opacity: dim ? 0.45 : 1 }}>
              <View style={{ minWidth: 34, height: 26, paddingHorizontal: 6, borderRadius: radius.sm, backgroundColor: r.color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: NAV.bgDeep }}>
                <Text style={{ color: palette.white, fontSize: r.code.length > 3 ? 9 : 11, fontWeight: '800' }}>{r.code}</Text>
              </View>
            </View>
          );
        })}

        {/* user location */}
        {scene.userPt && (
          <View style={{ position: 'absolute', left: scene.userPt.x - 13, top: scene.userPt.y - 13 }}>
            <View style={{ position: 'absolute', left: -8, top: -8, width: 42, height: 42, borderRadius: 21, backgroundColor: palette.mapUserLocation, opacity: 0.18 }} />
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: palette.mapUserLocation, borderWidth: 3.5, borderColor: palette.white }} />
          </View>
        )}
      </View>

      {/* attribution-style hint so the fallback reads as a basemap, not decoration */}
      <View style={{ position: 'absolute', left: 8, bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.6 }} pointerEvents="none">
        <Text style={{ color: '#93A3B8', fontSize: 9, fontWeight: '700' }}>© JeepNav Maps</Text>
      </View>
    </View>
  );
});

function MapPill({ x, y, text, dotColor }: { x: number; y: number; text: string; dotColor: string }) {
  return (
    <View style={{ position: 'absolute', left: x - 8, top: y - 34, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.navSurface, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: palette.navBorder }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColor }} />
      <Text numberOfLines={1} style={{ color: palette.navInk, fontSize: 11, fontWeight: '700', maxWidth: 120 }}>
        {text}
      </Text>
    </View>
  );
}
