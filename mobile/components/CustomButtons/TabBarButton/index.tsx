import React, { ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';

type TabBarButtonProps = {
  icon: ReactNode;
  onPress: () => void;
};

const TabBarButton = ({ icon, onPress }: TabBarButtonProps) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    {icon}
  </TouchableOpacity>
);

export default TabBarButton;
