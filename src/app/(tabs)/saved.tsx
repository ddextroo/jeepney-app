import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { RouteCard } from '@/components/route-card';
import { JeepneyArt } from '@/components/jeepney-art';
import { RESOLVED_ROUTES } from '@/data/repository';
import { useSavedRoutes } from '@/state/saved-routes';
import { palette, spacing } from '@/theme';

export default function Saved() {
  const insets = useSafeAreaInsets();
  const { savedIds } = useSavedRoutes();
  const saved = useMemo(() => RESOLVED_ROUTES.filter((r) => savedIds.includes(r.id)), [savedIds]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface }}>
      <View style={{ paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <AppText variant="title" style={{ fontSize: 26 }}>
          Saved routes
        </AppText>
        <AppText variant="caption" color={palette.inkSecondary}>
          Your go-to jeepneys in Metro Cebu.
        </AppText>
      </View>

      {saved.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.lg }}>
          <JeepneyArt size={200} />
          <AppText variant="section" center>
            Nothing saved yet
          </AppText>
          <AppText variant="body" color={palette.inkSecondary} center style={{ maxWidth: 300 }}>
            Tap the bookmark on any route to pin it here for quick access.
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm }}>
            <AppText variant="bodyStrong" color={palette.sky700} onPress={() => router.replace('/')}>
              Find a jeepney
            </AppText>
            <Icon name="arrow-forward" size={16} color={palette.sky700} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl * 2 }}>
          {saved.map((route) => (
            <RouteCard key={route.id} route={route} onPress={() => router.push({ pathname: '/route/[id]', params: { id: route.id } })} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
