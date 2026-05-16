import React from 'react';
import { TouchableOpacity, Text, View, type ViewStyle } from 'react-native';

import styles from './styles';

type SocialButtonProps = {
  label: string;
  icon: React.ReactNode;
  variant?: 'light' | 'dark';
  onPress: () => void;
  style?: ViewStyle;
};

const SocialButton = ({
  label,
  icon,
  variant = 'light',
  onPress,
  style,
}: SocialButtonProps) => {
  const isDark = variant === 'dark';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, isDark ? styles.darkBg : styles.lightBg, style]}
    >
      <View style={styles.icon}>{icon}</View>
      <Text style={[styles.label, isDark ? styles.darkLabel : styles.lightLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default SocialButton;
