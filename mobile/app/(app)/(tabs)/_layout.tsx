import { Tabs } from 'expo-router';

import FloatingTabBar from '@components/CustomTabBar/FloatingTabBar';

const TabsLayout = () => (
  <Tabs
    tabBar={(props) => <FloatingTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tabs.Screen name='home' />
    <Tabs.Screen name='categories' />
    {/*
      The `upload` route stays registered (preserves deep links and keeps
      Expo Router's typed routes happy), but the floating action button in
      `FloatingTabBar` opens `DocumentPicker` directly instead of navigating
      here. The screen itself is a placeholder.
    */}
    <Tabs.Screen name='upload' />
    <Tabs.Screen name='crypto' />
    <Tabs.Screen name='profile' />
  </Tabs>
);

export default TabsLayout;
