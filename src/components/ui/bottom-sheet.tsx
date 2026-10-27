/* eslint-disable react-hooks/immutability -- Reanimated shared values are mutated via .value by design */
import { ReactNode, useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radius, shadows, spacing } from '@/theme';

const { height: SCREEN_H } = Dimensions.get('window');

export type SheetSnap = 'collapsed' | 'half' | 'expanded';

type BottomSheetProps = {
  children: ReactNode;
  /** Height of the collapsed "peek" state. */
  peekHeight?: number;
  /** Height of the middle snap. */
  halfHeight?: number;
  /** Max expanded height. */
  expandTo?: number;
  /** Current snap — the sheet also snaps on external changes. */
  snap?: SheetSnap;
  onSnapChange?: (snap: SheetSnap) => void;
};

const SNAP_ORDER: SheetSnap[] = ['collapsed', 'half', 'expanded'];

/**
 * Three-state draggable bottom sheet (collapsed / half / expanded) with a
 * grabber handle. Drag past a threshold and it snaps to the nearest stop.
 */
export function BottomSheet({ children, peekHeight = 120, halfHeight = SCREEN_H * 0.45, expandTo = SCREEN_H * 0.78, snap = 'collapsed', onSnapChange }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  // translateY relative to the expanded (tallest) position: 0 = expanded.
  const targets: Record<SheetSnap, number> = {
    expanded: 0,
    half: expandTo - halfHeight,
    collapsed: expandTo - peekHeight,
  };
  const translateY = useSharedValue(targets[snap]);
  const startTranslate = useSharedValue(0);

  const goTo = useCallback(
    (next: SheetSnap) => {
      translateY.value = withSpring(targets[next], { damping: 22, stiffness: 200, mass: 0.9 });
      onSnapChange?.(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- targets is derived from stable props
    [onSnapChange, expandTo, halfHeight, peekHeight, translateY],
  );

  // Follow external snap changes (e.g. selecting a route opens the sheet to half).
  useEffect(() => {
    translateY.value = withSpring(targets[snap], { damping: 22, stiffness: 200, mass: 0.9 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- targets is derived from stable props
  }, [snap]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTranslate.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startTranslate.value + e.translationY;
      translateY.value = Math.max(targets.expanded, Math.min(targets.collapsed, next));
    })
    .onEnd((e) => {
      // Pick the nearest stop from position, with a fling bias.
      const projected = translateY.value + e.velocityY * 0.08;
      let best: SheetSnap = 'collapsed';
      let bestDist = Infinity;
      for (const s of SNAP_ORDER) {
        const d = Math.abs(projected - targets[s]);
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      }
      runOnJS(goTo)(best);
    });

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.container, { height: expandTo, paddingBottom: insets.bottom + spacing.lg, ...shadows.floating }, animated]}>
          <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View>
          <View style={{ paddingHorizontal: spacing.lg, flex: 1 }}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  grabberWrap: { alignItems: 'center', paddingVertical: spacing.md },
  grabber: { width: 44, height: 5, borderRadius: radius.pill, backgroundColor: palette.border },
});
