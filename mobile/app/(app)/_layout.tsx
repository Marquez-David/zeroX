import { Stack } from 'expo-router';

import { FiltersProvider } from '@contexts/filters';

const AppLayout = () => (
  <FiltersProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='reports' />
      <Stack.Screen name='report/[id]' />
    </Stack>
  </FiltersProvider>
);

export default AppLayout;
