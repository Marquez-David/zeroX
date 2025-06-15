import { Tabs } from 'expo-router';
import StandardHeader from '@components/CustomHeaders/StandardHeader';
import {
  HomeIcon,
  CategoryIcon,
  UploadIcon,
  CalendarIcon,
  UserIcon,
} from '@lib/icons';

import CustomTabBar from '@components/CustomTabBar/StandardTabBar';

const TabsLayout = () => (
  <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
    <Tabs.Screen
      name='home'
      options={{
        tabBarLabel: 'Resume',
        header: () => <StandardHeader />,
        tabBarIcon: ({ color, size, focused }) => (
          <HomeIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='categories'
      options={{
        tabBarLabel: 'Topics',
        header: () => <StandardHeader />,
        tabBarIcon: ({ color, size, focused }) => (
          <CategoryIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='upload'
      options={{
        tabBarLabel: 'Browse',
        header: () => <StandardHeader />,
        tabBarIcon: ({ color, size, focused }) => (
          <UploadIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='calendar'
      options={{
        tabBarLabel: 'Agenda',
        header: () => <StandardHeader />,
        tabBarIcon: ({ color, size, focused }) => (
          <CalendarIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tabs.Screen
      name='profile'
      options={{
        tabBarLabel: 'Profile',
        header: () => <StandardHeader />,
        tabBarIcon: ({ color, size, focused }) => (
          <UserIcon color={color} size={size} focused={focused} />
        ),
      }}
    />
  </Tabs>
);

export default TabsLayout;
