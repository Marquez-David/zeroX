import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

import Select from '@components/CustomInputs/Select';
import { formatCurrency } from '@lib/format';
import { homeStrings } from '@lib/strings';
import { colors } from '@lib/theme';

import styles from './styles';

type YearValue = 'all' | number;

type SpendingProgressProps = {
  income: number;
  expenses: number;
  selectedYear: number | null;
  availableYears: number[];
  onYearChange: (year: number | null) => void;
};

const SpendingProgress = ({
  income,
  expenses,
  selectedYear,
  availableYears,
  onYearChange,
}: SpendingProgressProps) => {
  const total = income + expenses;
  const incomePct = total > 0 ? (income / total) * 100 : 50;
  const expensesPct = total > 0 ? (expenses / total) * 100 : 50;

  const yearOptions: { value: YearValue; label: string }[] = [
    { value: 'all', label: homeStrings.allYears },
    ...availableYears.map((y) => ({ value: y, label: String(y) })),
  ];

  const currentValue: YearValue = selectedYear ?? 'all';

  const handleChange = (value: YearValue) => {
    onYearChange(value === 'all' ? null : value);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{homeStrings.incomeVsExpenses}</Text>
        <Select
          options={yearOptions}
          value={currentValue}
          onChange={handleChange}
        />
      </View>

      <View style={styles.bar}>
        <View
          style={[
            styles.incomeFill,
            { flex: Math.max(incomePct, total === 0 ? 1 : 0.001) },
          ]}
        />
        <View
          style={[
            styles.expensesFill,
            { flex: Math.max(expensesPct, total === 0 ? 1 : 0.001) },
          ]}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.iconCircleIncome}>
            <ArrowUpRight size={14} color={colors.success[500]} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.legendLabel}>{homeStrings.income}</Text>
            <Text style={styles.legendAmount}>{formatCurrency(income)}</Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.iconCircleExpenses}>
            <ArrowDownLeft size={14} color={colors.error[500]} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.legendLabel}>{homeStrings.expenses}</Text>
            <Text style={styles.legendAmount}>{formatCurrency(expenses)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SpendingProgress;
