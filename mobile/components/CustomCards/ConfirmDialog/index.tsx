import React from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';

import { useModalFade } from '@hooks/useModalFade';
import { colors } from '@lib/theme';

import styles from './styles';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: 'destructive' | 'primary';
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  icon: Icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { mounted, opacity } = useModalFade(visible);

  if (!mounted) return null;

  const isDestructive = variant === 'destructive';
  const gradientColors: [string, string] = isDestructive
    ? ['#B91C1C', colors.error[500]]
    : [colors.primary[700], colors.primary[500]];

  return (
    <Modal
      visible={mounted}
      transparent
      animationType='none'
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Animated.View style={[styles.root, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.cardShadow}>
          <View style={styles.card}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              {Icon ? (
                <View style={styles.iconWrap}>
                  <Icon size={22} color={colors.white} strokeWidth={2.5} />
                </View>
              ) : null}
              <Text style={styles.headerTitle}>{title}</Text>
            </LinearGradient>

            {body ? (
              <View style={styles.bodySection}>
                <Text style={styles.body}>{body}</Text>
              </View>
            ) : null}

            <View style={[styles.buttons, !body && styles.buttonsNoBody]}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLabel}>{cancelLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  isDestructive ? styles.destructiveButton : styles.primaryButton,
                ]}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={isDestructive ? styles.destructiveLabel : styles.primaryLabel}>
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
