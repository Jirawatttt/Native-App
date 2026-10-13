import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Sarabun_400Regular,
  Sarabun_500Medium,
  Sarabun_600SemiBold,
  Sarabun_700Bold,
} from '@expo-google-fonts/sarabun';
import { SessionProvider } from '@/lib/session';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Sarabun_400Regular,
    Sarabun_500Medium,
    Sarabun_600SemiBold,
    Sarabun_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      />
    </SessionProvider>
  );
}
