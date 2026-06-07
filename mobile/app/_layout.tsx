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

console.log('[diag] _layout.tsx module evaluated');
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  console.log('[diag] RootLayout render start');
  const [loaded, error] = useFonts({
    'Inter-SemiBold': require('@assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('@assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('@assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('@assets/fonts/Inter-Bold.otf'),
  });
  console.log('[diag] useFonts returned', { loaded, error: !!error });

  useEffect(() => {
    console.log('[diag] RootLayout useEffect fired', { loaded, error: !!error });
    if (loaded || error) {
      console.log('[diag] calling hideAsync');
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    console.log('[diag] returning null (fonts not ready)');
    return null;
  }
  console.log('[diag] rendering providers');

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
  console.log('[diag] RootNavigator render start');
  const { session, isLoading } = useSession();
  console.log('[diag] useSession returned', { session, isLoading });

  if (isLoading) {
    console.log('[diag] showing AnimatedSplash');
    return <AnimatedSplash loop />;
  }

  console.log('[diag] rendering Stack', { hasSession: !!session });
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
