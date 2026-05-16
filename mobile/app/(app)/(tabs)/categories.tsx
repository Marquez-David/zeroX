import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import CategoryRow from '@components/CustomCards/CategoryRow';
import DonutChart from '@components/CustomCards/DonutChart';
import Select from '@components/CustomInputs/Select';
import { useFilters } from '@contexts/filters';
import { useCategoryBreakdown } from '@hooks/queries/categoryBreakdown';
import { categoryColor, formatCurrency } from '@lib/format';
import { categoriesStrings } from '@lib/strings';
import { colors, radii, spacing, typography } from '@lib/theme';

type YearValue = 'all' | number;

const Categories = () => {
  const { categoriesYear: selectedYear, setCategoriesYear: setSelectedYear } =
    useFilters();

  const { categories, totalExpenses, availableYears, isLoading } =
    useCategoryBreakdown(selectedYear);

  const yearOptions: { value: YearValue; label: string }[] = [
    { value: 'all', label: categoriesStrings.allYears },
    ...availableYears.map((y) => ({ value: y, label: String(y) })),
  ];

  const currentYearValue: YearValue = selectedYear ?? 'all';

  const handleYearChange = (v: YearValue) => {
    setSelectedYear(v === 'all' ? null : v);
  };

  const donutSegments = useMemo(
    () =>
      categories.map((c) => ({
        color: categoryColor(c.name),
        value: c.expenses,
      })),
    [categories],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{categoriesStrings.title}</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>
                  {categoriesStrings.breakdown}
                </Text>
                <Select
                  options={yearOptions}
                  value={currentYearValue}
                  onChange={handleYearChange}
                />
              </View>
              {isLoading && categories.length === 0 ? (
                <View style={styles.donutPlaceholder}>
                  <ActivityIndicator color={colors.primary[600]} />
                </View>
              ) : (
                <View style={styles.donutWrapper}>
                  <DonutChart
                    segments={donutSegments}
                    size={220}
                    strokeWidth={22}
                  >
                    <View style={styles.donutCenter}>
                      <Text style={styles.donutLabel}>
                        {categoriesStrings.totalExpenses}
                      </Text>
                      <Text
                        style={styles.donutAmount}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {formatCurrency(totalExpenses)}
                      </Text>
                    </View>
                  </DonutChart>
                </View>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.rowWrapper}>
            <CategoryRow
              name={item.name}
              amount={item.expenses}
              percentage={item.percentage}
              operationCount={item.operationCount}
              onPress={() =>
                router.push({
                  pathname: '/category/[uuid]',
                  params: { uuid: item.uuid },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          isLoading && categories.length === 0 ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.primary[600]} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {categoriesStrings.emptyTitle}
              </Text>
              <Text style={styles.emptySubtitle}>
                {categoriesStrings.emptySubtitle}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heading,
  },
  chartCard: {
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.md,
    marginBottom: spacing.sectionGap,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  donutWrapper: {
    alignItems: 'center',
  },
  donutPlaceholder: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  donutCenter: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  donutLabel: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  donutAmount: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  rowWrapper: {
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
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.sectionTitle,
  },
  emptySubtitle: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
});

export default Categories;
