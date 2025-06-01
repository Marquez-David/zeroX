import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import LoginScreen from './screens/LoginScreen';

import styles from './styles';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.otf'),
    'Inter-Regular': require('./assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.otf'),
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
      <LoginScreen />
    </SafeAreaView>
  );
}
