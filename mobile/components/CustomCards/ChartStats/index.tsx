import React from 'react';
import { View, Text } from 'react-native';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';

import { formatCurrency } from '@lib/format';
import { colors } from '@lib/theme';

import styles from './styles';

type ChartStatsProps = {
  values: number[];
};

const tintFor = (value: number) =>
  value >= 0 ? colors.success[500] : colors.error[500];

const ChartStats = ({ values }: ChartStatsProps) => {
  if (values.length === 0) return null;

  const best = Math.max(...values);
  const worst = Math.min(...values);
  const net = values.reduce((sum, v) => sum + v, 0);

  const bestTint = tintFor(best);
  const worstTint = tintFor(worst);
  const netTint = tintFor(net);

  return (
    <View style={styles.row}>
      <Stat
        icon={<TrendingUp size={14} color={bestTint} strokeWidth={2.5} />}
        label='Best'
        value={formatCurrency(best)}
        tint={bestTint}
      />
      <View style={styles.divider} />
      <Stat
        icon={<TrendingDown size={14} color={worstTint} strokeWidth={2.5} />}
        label='Worst'
        value={formatCurrency(worst)}
        tint={worstTint}
      />
      <View style={styles.divider} />
      <Stat
        icon={<Wallet size={14} color={netTint} strokeWidth={2.5} />}
        label='Net'
        value={formatCurrency(net)}
        tint={netTint}
      />
    </View>
  );
};

type StatProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tint?: string;
};

const Stat = ({ label, value, icon, tint }: StatProps) => (
  <View style={styles.stat}>
    <View style={styles.statTopRow}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text
      style={[styles.statValue, tint ? { color: tint } : null]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
  </View>
);

export default ChartStats;
