import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider, useSession } from '@contexts/auth';
import { ModalProvider } from '@contexts/modal';
import { queryClient } from '@lib/queryClient';
import AnimatedSplash from '@components/CustomSplash/AnimatedSplash';

import { Stack } from 'expo-router';

console.log('[diag] 1: _layout.tsx module evaluated');
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  console.log('[diag] 2: RootLayout render start');
  const [loaded, error] = useFonts({
    'Inter-SemiBold': require('@assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('@assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('@assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('@assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <SessionProvider>
            <ModalProvider>
              <StatusBar style='dark' />
              <View style={{ flex: 1 }}>
                <RootNavigator />
              </View>
            </ModalProvider>
          </SessionProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

function RootNavigator() {
  const { session, isLoading } = useSession();

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
        <Stack.Protected guard={!isLoading && !!session}>
          <Stack.Screen name='(app)' />
        </Stack.Protected>
        <Stack.Protected guard={!isLoading && !session}>
          <Stack.Screen name='login' />
        </Stack.Protected>
      </Stack>
      {isLoading && <AnimatedSplash loop />}
    </View>
  );
}

export default RootLayout;
