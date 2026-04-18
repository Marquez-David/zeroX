import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

import {
  categoryColor,
  categoryIcon,
  formatCurrency,
  formatDate,
} from '@lib/format';
import { colors } from '@lib/theme';

import styles from './styles';

type TransactionCardProps = {
  concept: string;
  category?: string;
  date: string;
  amount: number;
  onPress?: () => void;
};

const TransactionCard = ({
  concept,
  category,
  date,
  amount,
  onPress,
}: TransactionCardProps) => {
  const isIncome = amount >= 0;
  const iconColor = isIncome ? colors.success[500] : colors.error[500];
  const iconBg = isIncome ? colors.success[50] : colors.error[50];
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const CategoryIcon = categoryIcon(category);
  const categoryTint = categoryColor(category);

  const Container: React.ElementType = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : undefined}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} strokeWidth={2.5} />
      </View>

      <View style={styles.info}>
        <View style={styles.topLine}>
          <Text style={styles.concept} numberOfLines={1}>
            {concept}
          </Text>
          <Text style={[styles.amount, { color: iconColor }]}>
            {formatCurrency(amount)}
          </Text>
        </View>

        <View style={styles.metaLine}>
          {category ? (
            <>
              <View style={styles.chip}>
                <CategoryIcon
                  size={12}
                  color={categoryTint}
                  strokeWidth={2.5}
                />
                <Text style={styles.chipText} numberOfLines={1}>
                  {category}
                </Text>
              </View>
              <Text style={styles.separator}>|</Text>
            </>
          ) : null}
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>
    </Container>
  );
};

export default TransactionCard;
