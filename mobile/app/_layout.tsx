import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';

import { SessionProvider, useSession } from '@contexts/auth';

import { Slot, Stack } from 'expo-router';
import StandardHeader from '@components/CustomHeaders/StandardHeader';
import colors from '@lib/colors';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    'Inter-SemiBold': require('@assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('@assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('@assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('@assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView style={styles.background}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </SafeAreaView>
  );
};

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack>
      <Stack.Protected guard={session}>
        <Stack.Screen name='(app)' options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen
          name='login'
          options={{ header: () => <StandardHeader /> }}
        />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    paddingBottom: StatusBar.currentHeight,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
});

export default RootLayout;
