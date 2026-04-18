import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

import { colors } from '@lib/theme';
import { formatCurrency, formatMonthYear } from '@lib/format';
import { homeStrings } from '@lib/strings';

import styles from './styles';

type ReportCardProps = {
  uuid: string;
  date: string;
  balance: number;
  income?: number;
  expenses?: number;
  operationCount?: number;
  onPress: (uuid: string) => void;
};

const ReportCard = ({
  uuid,
  date,
  balance,
  income,
  expenses,
  operationCount,
  onPress,
}: ReportCardProps) => {
  const isPositive = balance >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownLeft;
  const accent = isPositive ? colors.success[500] : colors.error[500];
  const bg = isPositive ? colors.success[50] : colors.error[50];

  const hasStats =
    typeof income === 'number' && typeof expenses === 'number';

  return (
    <TouchableOpacity
      onPress={() => onPress(uuid)}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Icon size={20} color={accent} strokeWidth={2.5} />
        </View>

        <View style={styles.info}>
          <Text style={styles.month}>{formatMonthYear(date)}</Text>
          {typeof operationCount === 'number' ? (
            <Text style={styles.meta}>
              {operationCount} {homeStrings.operations}
            </Text>
          ) : null}
        </View>

        <Text style={[styles.balance, { color: accent }]}>
          {formatCurrency(balance)}
        </Text>
      </View>

      {hasStats ? (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ArrowUpRight size={14} color={colors.success[500]} strokeWidth={2.5} />
            <Text style={styles.statLabel}>{homeStrings.income}</Text>
            <Text style={styles.statAmountIncome}>
              {formatCurrency(income!)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ArrowDownLeft size={14} color={colors.error[500]} strokeWidth={2.5} />
            <Text style={styles.statLabel}>{homeStrings.expenses}</Text>
            <Text style={styles.statAmountExpenses}>
              {formatCurrency(expenses!)}
            </Text>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default ReportCard;
