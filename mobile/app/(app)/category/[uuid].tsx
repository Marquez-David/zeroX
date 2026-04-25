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

import TransactionCard from '@components/CustomCards/TransactionCard';
import TransactionDetailModal from '@components/CustomCards/TransactionDetailModal';
import { useFilters } from '@contexts/filters';
import { useCategoryBreakdown } from '@hooks/queries/categoryBreakdown';
import { useCategories } from '@hooks/queries/categories';
import {
  useChangeOperationCategory,
  useOperations,
} from '@hooks/queries/operations';
import { categoryColor, formatCurrency, formatDate } from '@lib/format';
import { categoryDetailStrings } from '@lib/strings';
import { colors, radii, spacing, typography } from '@lib/theme';
import type { Operation } from '@lib/types';

const formatDateRange = (from: string, to: string): string => {
  const fromLabel = formatDate(from);
  const toLabel = formatDate(to);
  return fromLabel === toLabel ? fromLabel : `${fromLabel} – ${toLabel}`;
};

const CategoryDetailScreen = () => {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { categoriesYear } = useFilters();

  const { categories, totalExpenses, isLoading: breakdownLoading } =
    useCategoryBreakdown(categoriesYear);
  const {
    operations,
    isLoading: operationsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOperations({ year: categoriesYear, categoryUuid: uuid });
  const { data: categoriesList = [] } = useCategories();
  const changeCategory = useChangeOperationCategory(undefined);

  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null,
  );

  const category = useMemo(
    () => categories.find((c) => c.uuid === uuid) ?? null,
    [categories, uuid],
  );

  // Operations come back date DESC from the server; first item = most recent,
  // last loaded item = oldest *so far*. The "lastDate" displayed is therefore
  // the boundary of what we've fetched, not necessarily of the entire set —
  // good enough until the user scrolls to load more.
  const stats = useMemo(() => {
    if (!category || category.operationCount === 0) {
      return {
        average: 0,
        share: 0,
        firstDate: null as string | null,
        lastDate: null as string | null,
      };
    }
    const average = category.expenses / category.operationCount;
    const share =
      totalExpenses > 0 ? (category.expenses / totalExpenses) * 100 : 0;
    const firstDate = operations[operations.length - 1]?.date ?? null;
    const lastDate = operations[0]?.date ?? null;
    return { average, share, firstDate, lastDate };
  }, [category, totalExpenses, operations]);

  const handleSaveCategory = (
    operationUuid: string,
    categoryUuid: string,
  ) => changeCategory.mutateAsync({ operationUuid, categoryUuid });

  // The hero card waits for the breakdown so it can show the totals; the
  // list renders independently so the user sees data as soon as either
  // request resolves. We never gate the whole screen on a single hook.
  const heroLoading = breakdownLoading && !category;
  const listLoading = operationsLoading && operations.length === 0;

  const tint = categoryColor(category?.name);

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
          {category?.name ?? ''}
        </Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={operations}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          heroLoading ? (
            <View style={styles.heroPlaceholder}>
              <ActivityIndicator color={colors.primary[600]} />
            </View>
          ) : category ? (
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>
                {categoryDetailStrings.totalSpent}
              </Text>
              <Text
                style={[styles.heroAmount, { color: tint }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                -{formatCurrency(category.expenses)}
              </Text>
              {stats.firstDate && stats.lastDate ? (
                <Text style={styles.heroMeta}>
                  {formatDateRange(stats.firstDate, stats.lastDate)}
                </Text>
              ) : null}

              <View style={styles.heroDivider} />

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>
                    {categoryDetailStrings.average}
                  </Text>
                  <Text
                    style={styles.statValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    -{formatCurrency(stats.average)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>
                    {categoryDetailStrings.ofTotal}
                  </Text>
                  <Text
                    style={[styles.statValue, { color: tint }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {stats.share.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
          ) : null
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
          listLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.primary[600]} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {categoryDetailStrings.empty}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={colors.primary[600]} />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TransactionDetailModal
        visible={selectedOperation !== null}
        operation={selectedOperation}
        categories={categoriesList}
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
  hero: {
    alignItems: 'center',
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sectionGap,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.sm,
  },
  heroPlaceholder: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sectionGap,
    paddingVertical: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  heroLabel: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  heroMeta: {
    ...typography.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  heroDivider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
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
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default CategoryDetailScreen;
