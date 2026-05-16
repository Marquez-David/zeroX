import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

import Select from '@components/CustomInputs/Select';
import { formatBTC } from '@lib/format';
import { cryptoStrings } from '@lib/strings';
import { colors } from '@lib/theme';

import styles from './styles';

export type WalletTypeFilter = 'all' | 'received' | 'sent';

type YearValue = 'all' | number;

type WalletCardProps = {
  balance: number;
  received: number;
  sent: number;
  opsCount: number;
  fees: number;
  largest: number;
  pendingCount: number;

  selectedYear: number | null;
  availableYears: number[];
  onYearChange: (year: number | null) => void;

  activeTypeFilter: WalletTypeFilter;
  onToggleTypeFilter: (type: Exclude<WalletTypeFilter, 'all'>) => void;
};

const WalletCard = ({
  balance,
  received,
  sent,
  opsCount,
  fees,
  largest,
  pendingCount,
  selectedYear,
  availableYears,
  onYearChange,
  activeTypeFilter,
  onToggleTypeFilter,
}: WalletCardProps) => {
  const net = received - sent;
  const netColor =
    net > 0
      ? colors.success[500]
      : net < 0
        ? colors.error[500]
        : colors.text.secondary;
  const netSign = net > 0 ? '+' : '';

  const yearOptions: { value: YearValue; label: string }[] = [
    { value: 'all', label: cryptoStrings.allYearsLabel },
    ...availableYears.map((y) => ({ value: y, label: String(y) })),
  ];
  const currentYearValue: YearValue = selectedYear ?? 'all';

  const handleYearChange = (v: YearValue) => {
    onYearChange(v === 'all' ? null : v);
  };

  const isReceivedActive = activeTypeFilter === 'received';
  const isSentActive = activeTypeFilter === 'sent';
  const receivedDimmed = activeTypeFilter === 'sent';
  const sentDimmed = activeTypeFilter === 'received';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{cryptoStrings.currentBalance}</Text>
        <Select
          options={yearOptions}
          value={currentYearValue}
          onChange={handleYearChange}
        />
      </View>

      <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {formatBTC(balance)}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {cryptoStrings.net}{' '}
          <Text style={[styles.metaStrong, { color: netColor }]}>
            {netSign}
            {formatBTC(net)}
          </Text>{' '}
          <Text style={styles.metaDivider}>·</Text>{' '}
          <Text style={styles.metaStrong}>
            {opsCount} {cryptoStrings.ops}
          </Text>
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{cryptoStrings.fees}</Text>
          <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatBTC(fees)}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{cryptoStrings.largest}</Text>
          <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatBTC(largest)}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{cryptoStrings.pending}</Text>
          <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
            {pendingCount}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[
            styles.stat,
            isReceivedActive && styles.statActiveIncome,
            receivedDimmed && styles.statDimmed,
          ]}
          onPress={() => onToggleTypeFilter('received')}
          activeOpacity={0.7}
        >
          <View style={styles.statIconIncome}>
            <ArrowUpRight
              size={14}
              color={colors.success[500]}
              strokeWidth={2.5}
            />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>{cryptoStrings.received}</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {formatBTC(received)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={[
            styles.stat,
            isSentActive && styles.statActiveExpense,
            sentDimmed && styles.statDimmed,
          ]}
          onPress={() => onToggleTypeFilter('sent')}
          activeOpacity={0.7}
        >
          <View style={styles.statIconExpense}>
            <ArrowDownLeft
              size={14}
              color={colors.error[500]}
              strokeWidth={2.5}
            />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>{cryptoStrings.sent}</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {formatBTC(sent)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletCard;
