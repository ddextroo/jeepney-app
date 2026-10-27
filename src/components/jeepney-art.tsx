import { View } from 'react-native';

import { palette } from '@/theme';

/**
 * A stylized jeepney built from Views — sky-blue themed, used as onboarding / header art.
 * Scales with `size`.
 */
export function JeepneyArt({ size = 220 }: { size?: number }) {
  const s = size / 100; // scale unit
  return (
    <View style={{ width: size, height: size * 0.62 }}>
      {/* roof */}
      <View
        style={{
          position: 'absolute',
          left: 12 * s,
          top: 0,
          width: 76 * s,
          height: 12 * s,
          borderRadius: 8 * s,
          backgroundColor: palette.sky600,
        }}
      />
      {/* body */}
      <View
        style={{
          position: 'absolute',
          left: 4 * s,
          top: 8 * s,
          width: 92 * s,
          height: 52 * s,
          borderRadius: 16 * s,
          backgroundColor: palette.sky500,
        }}
      />
      {/* front hood (lower) */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 40 * s,
          width: 100 * s,
          height: 26 * s,
          borderRadius: 12 * s,
          backgroundColor: palette.sky700,
        }}
      />
      {/* windshield */}
      <View
        style={{
          position: 'absolute',
          left: 60 * s,
          top: 16 * s,
          width: 30 * s,
          height: 22 * s,
          borderRadius: 8 * s,
          backgroundColor: palette.sky100,
        }}
      />
      {/* side windows */}
      {[12, 28, 44].map((x) => (
        <View
          key={x}
          style={{
            position: 'absolute',
            left: x * s,
            top: 18 * s,
            width: 12 * s,
            height: 16 * s,
            borderRadius: 4 * s,
            backgroundColor: palette.sky100,
          }}
        />
      ))}
      {/* headlights */}
      <View style={{ position: 'absolute', left: 90 * s, top: 46 * s, width: 8 * s, height: 8 * s, borderRadius: 4 * s, backgroundColor: '#FFE9A8' }} />
      {/* grille bars */}
      {[52, 58, 64].map((y) => (
        <View key={y} style={{ position: 'absolute', left: 6 * s, top: y * s, width: 20 * s, height: 2 * s, borderRadius: 2, backgroundColor: palette.sky200 }} />
      ))}
      {/* wheels */}
      <Wheel left={20} s={s} />
      <Wheel left={72} s={s} />
    </View>
  );
}

function Wheel({ left, s }: { left: number; s: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: left * s,
        top: 58 * s,
        width: 18 * s,
        height: 18 * s,
        borderRadius: 9 * s,
        backgroundColor: palette.ink,
        borderWidth: 3 * s,
        borderColor: palette.sky100,
      }}
    />
  );
}
