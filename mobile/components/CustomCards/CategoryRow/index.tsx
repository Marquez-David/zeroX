import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import {
  categoryColor,
  categoryIcon,
  formatCurrency,
  withOpacity,
} from '@lib/format';

import styles from './styles';

type CategoryRowProps = {
  name: string;
  amount: number;
  percentage: number;
  operationCount?: number;
  onPress?: () => void;
};

const CategoryRow = ({
  name,
  amount,
  percentage,
  operationCount,
  onPress,
}: CategoryRowProps) => {
  const Icon = categoryIcon(name);
  const tint = categoryColor(name);

  const Container: React.ElementType = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : undefined}
    >
      <View style={[styles.iconCircle, { backgroundColor: withOpacity(tint, 0.12) }]}>
        <Icon size={18} color={tint} strokeWidth={2.5} />
      </View>

      <View style={styles.info}>
        <View style={styles.topLine}>
          <View style={styles.leftGroup}>
            <View
              style={[
                styles.pill,
                { backgroundColor: withOpacity(tint, 0.15) },
              ]}
            >
              <Text style={[styles.pillText, { color: tint }]}>
                {percentage.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <Text style={styles.amount} numberOfLines={1}>
            -{formatCurrency(amount)}
          </Text>
        </View>

        {typeof operationCount === 'number' ? (
          <Text style={styles.meta}>
            {operationCount}{' '}
            {operationCount === 1 ? 'operation' : 'operations'}
          </Text>
        ) : null}

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(3, percentage))}%`,
                backgroundColor: tint,
              },
            ]}
          />
        </View>
      </View>
    </Container>
  );
};

export default CategoryRow;
