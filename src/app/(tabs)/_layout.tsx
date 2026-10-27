import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { palette, shadows, spacing } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.sky500,
        tabBarInactiveTintColor: palette.inkTertiary,
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopColor: palette.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: spacing.sm,
          ...shadows.card,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: spacing.sm },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'map' : 'map-outline'} color={color as string} size={22} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'pin' : 'pin-outline'} color={color as string} size={22} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'bookmark' : 'bookmark-outline'} color={color as string} size={22} />,
        }}
      />
    </Tabs>
  );
}
