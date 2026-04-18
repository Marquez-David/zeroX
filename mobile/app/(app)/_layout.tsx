import { Tabs } from 'expo-router';
import {
  HomeIcon,
  CategoryIcon,
  UploadIcon,
  CalendarIcon,
  UserIcon,
} from '@lib/icons';

import CustomTabBar from '@components/CustomTabBar/StandardTabBar';

const TabsLayout = () => (
  <Tabs
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tabs.Screen
      name='home'
      options={{
        tabBarLabel: 'Resume',
        tabBarIcon: ({ color, size, focused }) => (
          <HomeIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='categories'
      options={{
        tabBarLabel: 'Topics',
        tabBarIcon: ({ color, size, focused }) => (
          <CategoryIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='upload'
      options={{
        tabBarLabel: 'Browse',
        tabBarIcon: ({ color, size, focused }) => (
          <UploadIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='calendar'
      options={{
        tabBarLabel: 'Agenda',
        tabBarIcon: ({ color, size, focused }) => (
          <CalendarIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='profile'
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size, focused }) => (
          <UserIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='report/[id]'
      options={{ href: null }}
    />
  </Tabs>
);

export default TabsLayout;
