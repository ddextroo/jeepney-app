import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StopLadder } from '@/components/stop-ladder';
import { FareChip } from '@/components/fare-chip';
import { Icon } from '@/components/ui/icon';
import { AppText } from '@/components/ui/text';
import { Badge } from '@/components/ui/pill';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRoute } from '@/data/repository';
import { faresForRoute } from '@/data/search';
import { useSavedRoutes } from '@/state/saved-routes';
import { palette, radius, spacing } from '@/theme';

export default function RouteDetail() {
  const { id, autostart } = useLocalSearchParams<{ id: string; autostart?: string }>();
  const insets = useSafeAreaInsets();
  const route = getRoute(id);

  const [fromId, setFromId] = useState(route?.stops[0]?.id ?? '');
  const [toId, setToId] = useState(route?.stops[route.stops.length - 1]?.id ?? '');
  const { isSaved, toggle } = useSavedRoutes();

  const quote = useMemo(() => (route ? faresForRoute(route, fromId, toId) : null), [route, fromId, toId]);

  const startNavigation = () => {
    if (!route) return;
    router.push({ pathname: '/nav/[id]', params: { id: route.id, from: fromId, to: toId } });
  };

  // "Use this route" from the map jumps straight into guidance with full defaults.
  useEffect(() => {
    if (autostart && route) {
      router.replace({ pathname: '/nav/[id]', params: { id: route.id, from: route.stops[0]?.id, to: route.stops[route.stops.length - 1]?.id } });
    }
  }, [autostart, route]);

  if (!route) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white }}>
        <AppText variant="body" color={palette.inkSecondary}>
          Route not found.
        </AppText>
      </View>
    );
  }

  const saved = isSaved(route.id);

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface }}>
      {/* Header */}
      <View style={{ backgroundColor: route.color, paddingTop: insets.top + 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Badge text={route.code} color="rgba(255,255,255,0.22)" size={52} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading" color={palette.white}>
              {route.name}
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.9)" numberOfLines={2}>
              {route.description}
            </AppText>
          </View>
        </View>
      </View>

      {/* Floating top bar */}
      <View style={{ position: 'absolute', top: insets.top + spacing.md, left: spacing.lg, right: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
        <CloseButton />
        <SaveButton saved={saved} onPress={() => toggle(route.id)} />
      </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl * 2 }}>
          {/* Fare summary */}
          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText variant="section">Your trip</AppText>
              {quote ? <FareChip amount={quote.fare} label={`≈ ₱${route.fare.min}–${route.fare.max}`} emphasis /> : null}
            </View>
            {quote ? (
              <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                <Stat icon="arrow-up-circle-outline" label="Board" value={quote.from.shortName ?? quote.from.name} />
                <Stat icon="flag-outline" label="Alight" value={quote.to.shortName ?? quote.to.name} />
                <Stat icon="git-commit-outline" label="Hops" value={`${quote.hops}`} />
              </View>
            ) : (
              <AppText variant="caption" color={palette.danger}>
                Pick two different stops.
              </AppText>
            )}
          </Card>

          {/* Alang callout */}
          {quote ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.sky100, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }}>
              <Icon name="megaphone" size={18} color={palette.sky700} />
              <AppText variant="caption" color={palette.sky900} style={{ flex: 1 }}>
                {'Tell the driver '}
                <AppText variant="bodyStrong" color={palette.sky700}>{`"Alang, ${quote.alightAnnounce.shortName ?? quote.alightAnnounce.name}!"`}</AppText>
                {' as you approach.'}
              </AppText>
            </View>
          ) : null}

          {/* Board / alight pickers */}
          <Picker title="Board at" selectedId={fromId} stops={route.stops} color={route.color} onSelect={setFromId} />
          <Picker title="Get off at" selectedId={toId} stops={route.stops} color={route.color} onSelect={setToId} />

          {/* Stop ladder */}
          {quote ? (
            <Card style={{ marginTop: spacing.lg }}>
              <AppText variant="section" style={{ marginBottom: spacing.md }}>
                Stop by stop
              </AppText>
              <StopLadder stops={quote.segment} boardId={quote.from.id} alightId={quote.to.id} color={route.color} />
            </Card>
          ) : null}

          {/* Boarding guidance hint */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg }}>
            <Icon name="information-circle-outline" size={16} color={palette.inkTertiary} />
            <AppText variant="caption" color={palette.inkTertiary} style={{ flex: 1 }}>
              Times and distances are planning estimates from static route data — jeepneys have no live tracking.
            </AppText>
          </View>
        </ScrollView>

        {/* Sticky CTA — start immersive guidance for this trip */}
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, paddingTop: spacing.sm, backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.border }}>
          <Button
            label={quote ? `Use this route · ${quote.from.shortName ?? quote.from.name} → ${quote.to.shortName ?? quote.to.name}` : 'Select two stops to continue'}
            onPress={startNavigation}
            disabled={!quote}
            leftIcon={<Icon name="navigate" size={16} color={palette.white} />}
          />
        </View>
      </View>
  );
}

function CloseButton() {
  return (
    <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="close" size={20} color={palette.ink} />
    </Pressable>
  );
}

function SaveButton({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 36, height: 36, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={saved ? palette.sky600 : palette.ink} />
    </Pressable>
  );
}

function Stat({ icon, label, value }: { icon: ComponentProps<typeof Icon>['name']; label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name={icon} size={13} color={palette.inkTertiary} />
        <AppText variant="micro" color={palette.inkTertiary}>
          {label.toUpperCase()}
        </AppText>
      </View>
      <AppText variant="bodyStrong" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

function Picker({ title, selectedId, stops, color, onSelect }: { title: string; selectedId: string; stops: { id: string; name: string; shortName?: string }[]; color: string; onSelect: (id: string) => void }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <AppText variant="caption" color={palette.inkSecondary} style={{ marginBottom: spacing.sm }}>
        {title}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {stops.map((s) => {
          const active = s.id === selectedId;
          return (
            <Pressable
              key={s.id}
              onPress={() => onSelect(s.id)}
              style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: active ? color : palette.white, borderWidth: 1, borderColor: active ? color : palette.border }}>
              <AppText variant="caption" color={active ? palette.white : palette.ink}>
                {s.shortName ?? s.name}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
