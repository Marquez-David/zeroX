import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from './styles';

export type ToastType = 'loading' | 'success' | 'error';

export type ToastEntry = {
  id: number;
  message: string;
  sub?: string;
  type: ToastType;
};

type ToastProps = ToastEntry & { onDismiss: () => void; bottomOffset: number };

const AUTO_CLOSE_MS: Record<ToastType, number | null> = {
  loading: null,
  success: 3000,
  error: 5000,
};

const Toast = ({ message, sub, type, onDismiss, bottomOffset }: ToastProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const ms = AUTO_CLOSE_MS[type];
    if (ms === null) return;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 60, duration: 240, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) onDismiss();
      });
    }, ms);

    return () => clearTimeout(timer);
  }, [type]);

  const containerStyle =
    type === 'loading'
      ? styles.containerLoading
      : type === 'success'
        ? styles.containerSuccess
        : styles.containerError;

  const iconBoxStyle =
    type === 'loading'
      ? styles.iconBoxLoading
      : type === 'success'
        ? styles.iconBoxSuccess
        : styles.iconBoxError;

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          bottom: bottomOffset > 0 ? bottomOffset + 4 : Math.max(insets.bottom, 16),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconBox, iconBoxStyle]}>
        {type === 'loading' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.iconText}>{type === 'success' ? '✓' : '!'}</Text>
        )}
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.message} numberOfLines={1}>{message}</Text>
        {sub ? <Text style={styles.sub} numberOfLines={1}>{sub}</Text> : null}
      </View>
    </Animated.View>
  );
};

export default Toast;
