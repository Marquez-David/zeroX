import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

import { formatCurrency } from '@lib/format';
import { reportStrings } from '@lib/strings';
import { colors } from '@lib/theme';

import styles from './styles';

export type SummaryFilter = 'all' | 'income' | 'expenses';

type SummaryCardsProps = {
  income: number;
  expenses: number;
  balance: number;
  activeFilter?: SummaryFilter;
  onToggleFilter?: (target: Exclude<SummaryFilter, 'all'>) => void;
};

const SummaryCards = ({
  income,
  expenses,
  balance,
  activeFilter = 'all',
  onToggleFilter,
}: SummaryCardsProps) => {
  const isPositive = balance >= 0;
  const balanceColor = isPositive ? colors.success[500] : colors.error[500];

  const interactive = !!onToggleFilter;
  const isIncomeActive = activeFilter === 'income';
  const isExpensesActive = activeFilter === 'expenses';
  const incomeDimmed = interactive && !isIncomeActive && activeFilter !== 'all';
  const expensesDimmed =
    interactive && !isExpensesActive && activeFilter !== 'all';

  return (
    <View style={styles.card}>
      <View style={styles.heroRow}>
        <Text style={styles.heroLabel}>{reportStrings.balance}</Text>
        <Text
          style={[styles.heroValue, { color: balanceColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(balance)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[
            styles.stat,
            isIncomeActive && styles.statActiveIncome,
            incomeDimmed && styles.statDimmed,
          ]}
          onPress={interactive ? () => onToggleFilter!('income') : undefined}
          activeOpacity={0.7}
          disabled={!interactive}
        >
          <View style={styles.iconCircleIncome}>
            <ArrowUpRight
              size={16}
              color={colors.success[500]}
              strokeWidth={2.5}
            />
          </View>
          <View style={styles.statTextBlock}>
            <Text style={styles.statLabel}>{reportStrings.income}</Text>
            <Text
              style={[styles.statAmount, { color: colors.success[500] }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(income)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.verticalDivider} />

        <TouchableOpacity
          style={[
            styles.stat,
            isExpensesActive && styles.statActiveExpenses,
            expensesDimmed && styles.statDimmed,
          ]}
          onPress={interactive ? () => onToggleFilter!('expenses') : undefined}
          activeOpacity={0.7}
          disabled={!interactive}
        >
          <View style={styles.iconCircleExpenses}>
            <ArrowDownLeft
              size={16}
              color={colors.error[500]}
              strokeWidth={2.5}
            />
          </View>
          <View style={styles.statTextBlock}>
            <Text style={styles.statLabel}>{reportStrings.expenses}</Text>
            <Text
              style={[styles.statAmount, { color: colors.error[500] }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(expenses)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SummaryCards;
