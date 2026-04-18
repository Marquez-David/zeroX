import { View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import FocusedTabBarButton from '@components/CustomButtons/FocusedTabBarButton';
import TabBarButton from '@components/CustomButtons/TabBarButton';
import styles from './styles';

import colors from '@lib/colors';

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => (
  <View style={styles.container}>
    {state.routes.map((route, index) => {
      const { options } = descriptors[route.key];
      const isFocused = state.index === index;

      const label = options.tabBarLabel as string;
      const icon = options.tabBarIcon?.({
        color: colors.white,
        size: 24,
        focused: isFocused,
      });
      return isFocused ? (
        <FocusedTabBarButton key={route.key} icon={icon} label={label} />
      ) : (
        <TabBarButton
          key={route.key}
          icon={icon}
          onPress={() => navigation.navigate(route.name)}
        />
      );
    })}
  </View>
);

export default CustomTabBar;
