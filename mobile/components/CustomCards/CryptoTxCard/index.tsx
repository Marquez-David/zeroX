import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Coins,
} from 'lucide-react-native';

import { formatBTC, formatUnixDate, truncateMiddle } from '@lib/format';
import {
  cryptoStrings,
  cryptoTxDetailStrings,
} from '@lib/strings';
import { colors } from '@lib/theme';
import type { WalletTransaction } from '@lib/types';

import styles from './styles';

type CryptoTxCardProps = {
  tx: WalletTransaction;
  onPress?: () => void;
};

const CryptoTxCard = ({ tx, onPress }: CryptoTxCardProps) => {
  const Container: React.ElementType = onPress ? TouchableOpacity : View;
  const isReceived = tx.type === 'received';
  const isInternal = tx.type === 'internal';

  const Icon = isReceived
    ? ArrowDownLeft
    : isInternal
      ? ArrowLeftRight
      : ArrowUpRight;
  const accent = isReceived
    ? colors.success[500]
    : isInternal
      ? colors.text.secondary
      : colors.error[500];
  const bg = isReceived
    ? colors.success[50]
    : isInternal
      ? colors.surfaceMuted
      : colors.error[50];

  const sign = isReceived ? '+' : isInternal ? '' : '-';

  const counterpartyLabel = isReceived
    ? cryptoTxDetailStrings.from
    : cryptoTxDetailStrings.to;
  const counterpartyAddress = isReceived
    ? tx.origin_address
    : tx.destination_address;

  const statusColor = tx.confirmed ? colors.success[500] : colors.warning[500];
  const statusLabel = tx.confirmed
    ? cryptoStrings.confirmed
    : cryptoStrings.pending;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : undefined}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Icon size={20} color={accent} strokeWidth={2.5} />
        </View>

        <View style={styles.info}>
          <View style={styles.headerLine}>
            <Text style={styles.date} numberOfLines={1}>
              {formatUnixDate(tx.date)}
            </Text>
            <Text style={[styles.amount, { color: accent }]} numberOfLines={1}>
              {sign}
              {formatBTC(tx.amount)}
            </Text>
          </View>
          <Text style={styles.counterparty} numberOfLines={1}>
            <Text style={styles.counterpartyLabel}>{counterpartyLabel} </Text>
            {truncateMiddle(counterpartyAddress ?? '', 6, 6)}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statLabel}>{statusLabel}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Coins size={14} color={colors.text.secondary} strokeWidth={2.5} />
          <Text style={styles.statLabel}>{cryptoTxDetailStrings.fee}</Text>
          <Text style={styles.statAmount}>{formatBTC(tx.fee)}</Text>
        </View>
      </View>
    </Container>
  );
};

export default CryptoTxCard;
