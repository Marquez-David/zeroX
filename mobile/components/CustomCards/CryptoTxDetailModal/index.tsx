import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from 'lucide-react-native';

import { formatBTC, formatUnixDate, shortId, truncateMiddle } from '@lib/format';
import { cryptoStrings, cryptoTxDetailStrings } from '@lib/strings';
import { colors } from '@lib/theme';
import type { WalletTransaction } from '@lib/types';

import styles from './styles';

type CryptoTxDetailModalProps = {
  visible: boolean;
  transaction: WalletTransaction | null;
  onClose: () => void;
};

const CryptoTxDetailModal = ({
  visible,
  transaction,
  onClose,
}: CryptoTxDetailModalProps) => {
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, opacity]);

  // Retain the last transaction across the fade-out so content doesn't blink.
  const lastTxRef = useRef<WalletTransaction | null>(null);
  if (transaction) lastTxRef.current = transaction;
  const display = transaction ?? lastTxRef.current;

  if (!mounted) return null;
  if (!display) return null;

  const isReceived = display.type === 'received';
  const isInternal = display.type === 'internal';
  const accent = isReceived
    ? colors.success[500]
    : isInternal
      ? colors.text.secondary
      : colors.error[500];
  const accentBg = isReceived
    ? colors.success[50]
    : isInternal
      ? colors.surfaceMuted
      : colors.error[50];
  const TypeIcon = isReceived
    ? ArrowUpRight
    : isInternal
      ? ArrowLeftRight
      : ArrowDownLeft;
  const sign = isReceived ? '+' : isInternal ? '' : '-';
  // Hero keeps the on-chain terminology (Received / Sent / Internal); the
  // detail row uses the app's ledger terminology (Income / Expense) to match
  // how operations are labelled elsewhere.
  const heroLabel = isReceived
    ? 'Received'
    : isInternal
      ? 'Internal'
      : 'Sent';
  const detailTypeLabel = isReceived
    ? cryptoStrings.received
    : isInternal
      ? cryptoStrings.internal
      : cryptoStrings.sent;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType='none'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.root, { opacity }]}
        pointerEvents='box-none'
      >
        <Pressable style={styles.flex} onPress={onClose}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Pressable style={styles.cardShadow} onPress={() => {}}>
              <View style={styles.card}>
                <View style={styles.hero}>
                  <Text style={[styles.heroType, { color: accent }]}>
                    {heroLabel}
                  </Text>
                  <Text
                    style={[styles.heroAmount, { color: accent }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {sign}
                    {formatBTC(display.amount)}
                  </Text>
                </View>

                <View style={styles.seam}>
                  <View style={[styles.notch, styles.notchLeft]} />
                  <View style={styles.dashed}>
                    {Array.from({ length: 22 }).map((_, i) => (
                      <View key={i} style={styles.dashedDot} />
                    ))}
                  </View>
                  <View style={[styles.notch, styles.notchRight]} />
                </View>

                <ScrollView style={styles.details} bounces={false}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {cryptoTxDetailStrings.type}
                    </Text>
                    <View
                      style={[styles.typePill, { backgroundColor: accentBg }]}
                    >
                      <TypeIcon size={12} color={accent} strokeWidth={2.5} />
                      <Text style={[styles.typePillText, { color: accent }]}>
                        {detailTypeLabel}
                      </Text>
                    </View>
                  </View>
                  <Row
                    label={cryptoTxDetailStrings.date}
                    value={formatUnixDate(display.date)}
                  />
                  <Row
                    label={cryptoTxDetailStrings.amount}
                    value={`${sign}${formatBTC(display.amount)}`}
                    valueColor={accent}
                  />
                  <Row
                    label={cryptoTxDetailStrings.fee}
                    value={formatBTC(display.fee)}
                  />
                  <View style={styles.statusRow}>
                    <Text style={styles.detailLabel}>
                      {cryptoTxDetailStrings.status}
                    </Text>
                    <View style={styles.statusBlock}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: display.confirmed
                              ? colors.success[500]
                              : colors.warning[500],
                          },
                        ]}
                      />
                      <Text style={styles.detailValue}>
                        {display.confirmed
                          ? cryptoStrings.confirmed
                          : cryptoStrings.pending}
                      </Text>
                    </View>
                  </View>
                  {display.origin_address ? (
                    <Row
                      label={cryptoTxDetailStrings.from}
                      value={truncateMiddle(display.origin_address, 8, 6)}
                      mono
                    />
                  ) : null}
                  {display.destination_address ? (
                    <Row
                      label={cryptoTxDetailStrings.to}
                      value={truncateMiddle(display.destination_address, 8, 6)}
                      mono
                    />
                  ) : null}
                  <Row
                    label={cryptoTxDetailStrings.reference}
                    value={shortId(display.uuid)}
                    mono
                  />
                </ScrollView>
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

type RowProps = {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
};

const Row = ({ label, value, valueColor, mono }: RowProps) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[
        styles.detailValue,
        valueColor ? { color: valueColor } : null,
        mono ? styles.detailValueMono : null,
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

export default CryptoTxDetailModal;
