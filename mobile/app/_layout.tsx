import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider, useSession } from '@contexts/auth';
import { queryClient } from '@lib/queryClient';

import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    'Inter-SemiBold': require('@assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('@assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('@assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('@assets/fonts/Inter-Bold.otf'),
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <SessionProvider>
            <StatusBar style='dark' />
            <RootNavigator />
          </SessionProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

function RootNavigator() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name='(app)' />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name='login' />
      </Stack.Protected>
    </Stack>
  );
}

export default RootLayout;
