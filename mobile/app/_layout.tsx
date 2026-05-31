import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider, useSession } from '@contexts/auth';
import { ModalProvider } from '@contexts/modal';
import { queryClient } from '@lib/queryClient';
import AnimatedSplash from '@components/CustomSplash/AnimatedSplash';

import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    'Inter-SemiBold': require('@assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('@assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('@assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('@assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <SessionProvider>
            <ModalProvider>
              <StatusBar style='dark' />
              <RootNavigator />
            </ModalProvider>
          </SessionProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

function RootNavigator() {
  const { session, isLoading } = useSession();

  if (isLoading) return <AnimatedSplash loop />;

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
