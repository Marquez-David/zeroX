import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import SummaryCards, {
  type SummaryFilter,
} from '@components/CustomCards/SummaryCards';
import TransactionCard from '@components/CustomCards/TransactionCard';
import TransactionDetailModal from '@components/CustomCards/TransactionDetailModal';
import { useCategories } from '@hooks/queries/categories';
import { useChangeOperationCategory } from '@hooks/queries/operations';
import { useReport } from '@hooks/queries/reports';
import { formatMonthYear } from '@lib/format';
import { reportStrings } from '@lib/strings';
import { colors, radii, spacing, typography } from '@lib/theme';
import type { Operation } from '@lib/types';

const ReportDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading } = useReport(id);
  const { data: categories = [] } = useCategories();
  const changeCategory = useChangeOperationCategory(id);

  const [filter, setFilter] = useState<SummaryFilter>('all');
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null,
  );

  const operations = report?.operations ?? [];

  // Totals always come from every operation — the filter only changes which
  // rows the user sees, not the summary numbers.
  const { income, expenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const op of operations) {
      if (op.amount >= 0) income += op.amount;
      else expenses += Math.abs(op.amount);
    }
    return { income, expenses, balance: income - expenses };
  }, [operations]);

  const visibleOperations = useMemo(() => {
    if (filter === 'income') return operations.filter((op) => op.amount >= 0);
    if (filter === 'expenses') return operations.filter((op) => op.amount < 0);
    return operations;
  }, [operations, filter]);

  const toggleFilter = (target: Exclude<SummaryFilter, 'all'>) => {
    setFilter((current) => (current === target ? 'all' : target));
  };

  const handleSaveCategory = (
    operationUuid: string,
    categoryUuid: string,
  ) => changeCategory.mutateAsync({ operationUuid, categoryUuid });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {report ? formatMonthYear(report.date) : ''}
        </Text>
        <View style={styles.backButton} />
      </View>

      {isLoading && !report ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={visibleOperations}
          keyExtractor={(item) => item.uuid}
          ListHeaderComponent={
            <>
              <SummaryCards
                income={income}
                expenses={expenses}
                balance={balance}
                activeFilter={filter}
                onToggleFilter={toggleFilter}
              />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {reportStrings.transactions}
                </Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TransactionCard
                concept={item.concept}
                category={item.category?.name}
                date={item.date}
                amount={item.amount}
                onPress={() => setSelectedOperation(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {reportStrings.noTransactions}
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TransactionDetailModal
        visible={selectedOperation !== null}
        operation={selectedOperation}
        categories={categories}
        onClose={() => setSelectedOperation(null)}
        onSaveCategory={handleSaveCategory}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.sectionTitle,
    flex: 1,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  cardWrapper: {
    paddingHorizontal: spacing.screenPadding,
  },
  list: {
    paddingBottom: spacing.scrollBottom,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
});

export default ReportDetailScreen;
