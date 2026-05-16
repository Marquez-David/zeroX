import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@lib/theme';

import styles from './styles';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** 'destructive' renders the confirm button red; 'primary' uses the brand purple. */
  variant?: 'destructive' | 'primary';
  /** Optional icon shown in a circle above the title (e.g. `Trash2`). */
  icon?: LucideIcon;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const FADE_MS = 120;

const ConfirmDialog = ({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  icon: Icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, opacity]);

  if (!mounted) return null;

  const isDestructive = variant === 'destructive';
  const iconColor = isDestructive ? colors.error[500] : colors.primary[600];

  return (
    <Modal
      visible={mounted}
      transparent
      animationType='none'
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Animated.View style={[styles.root, { opacity }]}>
        {/* Backdrop fills the screen and absorbs taps outside the card. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onCancel}
        />
        {/* Card is laid out by the parent's center alignment. */}
        <View style={styles.cardShadow}>
          <View style={styles.card}>
            {Icon ? (
              <View style={styles.iconCircle}>
                <Icon size={26} color={iconColor} strokeWidth={2.5} />
              </View>
            ) : null}
            <Text style={styles.title}>{title}</Text>
            {body ? <Text style={styles.body}>{body}</Text> : null}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLabel}>{cancelLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  isDestructive
                    ? styles.destructiveButton
                    : styles.primaryButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={onConfirm}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    isDestructive
                      ? styles.destructiveLabel
                      : styles.primaryLabel
                  }
                >
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default ConfirmDialog;
