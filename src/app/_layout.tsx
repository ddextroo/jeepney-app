import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SavedRoutesProvider } from '@/state/saved-routes';
import { palette, SkyTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: '(onboarding)/welcome' };

export default function RootLayout() {
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SavedRoutesProvider>
          <ThemeProvider value={SkyTheme}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.white } }}>
              <Stack.Screen name="(onboarding)/welcome" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="route/[id]" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="nav/[id]" options={{ animation: 'slide_from_bottom', contentStyle: { backgroundColor: palette.navSurfaceSolid } }} />
            </Stack>
          </ThemeProvider>
        </SavedRoutesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
