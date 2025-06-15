import React, { ReactNode } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import styles from './styles';

type FocusedTabBarButtonProps = {
  icon: ReactNode;
  label: string;
};

const FocusedTabBarButton = ({ icon, label }: FocusedTabBarButtonProps) => (
  <TouchableOpacity style={styles.button}>
    {icon}
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

export default FocusedTabBarButton;
