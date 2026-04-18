import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@lib/theme';

import styles from './styles';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
};

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary',
}: PrimaryButtonProps) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  const labelColor = isPrimary
    ? colors.white
    : isDanger
      ? colors.error[500]
      : colors.text.primary;

  const content = loading ? (
    <ActivityIndicator color={labelColor} />
  ) : (
    <Text style={[styles.label, { color: labelColor }]}>{title}</Text>
  );

  if (isPrimary) {
    return (
      <View
        style={[
          styles.shadowWrapper,
          (disabled || loading) && styles.disabled,
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.85}
          style={styles.touchable}
        >
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        isSecondary && styles.secondaryBg,
        isDanger && styles.dangerBg,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
