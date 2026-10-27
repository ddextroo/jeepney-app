import { useRef, useState, type ComponentRef } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { JeepneyArt } from '@/components/jeepney-art';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { palette, radius, spacing } from '@/theme';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  { title: 'Find your jeepney', body: 'Know exactly which jeepney passes your street before you even step outside.' },
  { title: 'Fares & "Alang" made simple', body: 'See the fare and the stop to shout "Alang!" for every trip across Metro Cebu.' },
  { title: 'A map built for commuters', body: 'A sky-blue map tuned to jeepney corridors and neighborhoods — not just roads.' },
];

function enterApp() {
  router.replace('/');
}

export default function Welcome() {
  const [index, setIndex] = useState(0);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const isLast = index === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / W);
    if (next !== index) setIndex(next);
  };

  const next = () => {
    if (isLast) return enterApp();
    scroller.current?.scrollTo({ x: W * (index + 1), animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.sky100 }}>
      <LinearGradient colors={[palette.sky200, palette.sky100, palette.white]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%' }} />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl }}>
        <AppText variant="bodyStrong" color={palette.sky700} onPress={enterApp} style={{ padding: spacing.sm }}>
          Skip
        </AppText>
      </View>

      {/* Hero */}
      <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <View
          style={{
            width: W * 0.72,
            aspectRatio: 1,
            borderRadius: radius.lg,
            backgroundColor: palette.white,
            alignItems: 'center',
            justifyContent: 'center',
            ...({ shadowColor: palette.sky700, shadowOpacity: 0.15, shadowRadius: 30, shadowOffset: { width: 0, height: 16 }, elevation: 10 } as object),
          }}>
          <JeepneyArt size={W * 0.5} />
        </View>
      </View>

      {/* Pager */}
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ marginTop: spacing.xxl }}>
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width: W, paddingHorizontal: spacing.xl, alignItems: 'center' }}>
            <AppText variant="heading" center style={{ marginBottom: spacing.sm }}>
              {slide.title}
            </AppText>
            <AppText variant="body" color={palette.inkSecondary} center style={{ maxWidth: W - spacing.xxl * 2 }}>
              {slide.body}
            </AppText>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginVertical: spacing.xl }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: i === index ? palette.sky500 : palette.sky300,
            }}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl }}>
        <Button label={isLast ? 'Get started' : 'Continue'} onPress={next} />
        <Button label="I have an account" variant="ghost" onPress={enterApp} />
      </View>
    </View>
  );
}
