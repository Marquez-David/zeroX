import { Stack } from 'expo-router';

import { FiltersProvider } from '@contexts/filters';

const AppLayout = () => (
  <FiltersProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='reports' />
      <Stack.Screen name='report/[id]' />
      <Stack.Screen name='category/[uuid]' />
      <Stack.Screen name='settings/wallets/index' />
      <Stack.Screen name='settings/wallets/add' />
      <Stack.Screen name='settings/wallets/[uuid]' />
      <Stack.Screen name='settings/password' />
      <Stack.Screen name='settings/username' />
    </Stack>
  </FiltersProvider>
);

export default AppLayout;
