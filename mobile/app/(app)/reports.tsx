import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';

import BalanceChart from '@components/CustomCards/BalanceChart';
import ChartStats from '@components/CustomCards/ChartStats';
import ReportCard from '@components/CustomCards/ReportCard';
import Select from '@components/CustomInputs/Select';
import { useFilters } from '@contexts/filters';
import { useModal } from '@contexts/modal';
import { useDeleteReportMutation, useYearStats } from '@hooks/queries/reports';
import { reportsListStrings, reportStrings } from '@lib/strings';
import { colors, radii, spacing, typography } from '@lib/theme';
import type { ReportSummary } from '@lib/types';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type YearValue = 'all' | number;

const ReportsScreen = () => {
  const { reportsYear: selectedYear, setReportsYear: setSelectedYear } =
    useFilters();

  const {
    filteredReports,
    statsByUuid,
    availableYears,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useYearStats(selectedYear);

  const deleteReport = useDeleteReportMutation();
  const { confirm, toast } = useModal();

  const handleLongPress = (uuid: string) => {
    confirm({
      title: reportStrings.deleteReport,
      body: reportStrings.deleteReportBody,
      confirmLabel: reportStrings.confirm,
      cancelLabel: reportStrings.cancel,
      variant: 'destructive',
      icon: Trash2,
      onConfirm: () => {
        toast({ message: 'Deleting report…', type: 'loading' });
        deleteReport.mutate(uuid, {
          onSuccess: () => toast({ message: 'Report deleted', type: 'success' }),
          onError: () => toast({ message: 'Could not delete report', type: 'error' }),
        });
      },
    });
  };

  const yearOptions: { value: YearValue; label: string }[] = [
    { value: 'all', label: reportsListStrings.allYears },
    ...availableYears.map((y) => ({ value: y, label: String(y) })),
  ];

  const currentYearValue: YearValue = selectedYear ?? 'all';

  const handleYearChange = (v: YearValue) => {
    setSelectedYear(v === 'all' ? null : v);
  };

  // Bars are aggregated (monthly when a year is selected, yearly in "All"
  // mode). Stats instead always operate on the raw per-report balances so
  // Best/Worst/Net reflect actual reports — an aggregate can mask the real
  // peak/trough (a year can net out to -€1 yet contain a -€40 month).
  const chart = useMemo(() => {
    if (selectedYear !== null) {
      const monthlyBalances = new Array(12).fill(0);
      filteredReports.forEach((r) => {
        const m = new Date(r.date).getUTCMonth();
        monthlyBalances[m] += r.balance;
      });
      return { labels: MONTH_LABELS, values: monthlyBalances };
    }
    const yearly = new Map<number, number>();
    filteredReports.forEach((r) => {
      const y = new Date(r.date).getUTCFullYear();
      yearly.set(y, (yearly.get(y) ?? 0) + r.balance);
    });
    const sorted = Array.from(yearly.entries()).sort((a, b) => a[0] - b[0]);
    return {
      labels: sorted.map(([y]) => String(y)),
      values: sorted.map(([, v]) => v),
    };
  }, [filteredReports, selectedYear]);

  const statsValues = useMemo(
    () => filteredReports.map((r) => r.balance),
    [filteredReports],
  );

  const navigateToReport = (uuid: string) => {
    router.push({ pathname: '/report/[id]', params: { id: uuid } });
  };

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
        <Text style={styles.title}>{reportsListStrings.title}</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>
                  {reportsListStrings.evolution}
                </Text>
                <Select
                  options={yearOptions}
                  value={currentYearValue}
                  onChange={handleYearChange}
                />
              </View>
              {isLoading && filteredReports.length === 0 ? (
                <View style={styles.chartPlaceholder}>
                  <ActivityIndicator color={colors.primary[600]} />
                </View>
              ) : (
                <>
                  <BalanceChart labels={chart.labels} values={chart.values} />
                  <View style={styles.chartStatsWrapper}>
                    <ChartStats values={statsValues} />
                  </View>
                </>
              )}
            </View>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{reportsListStrings.title}</Text>
            </View>
          </>
        }
        renderItem={({ item }: { item: ReportSummary }) => {
          const stats = statsByUuid.get(item.uuid);
          return (
            <View style={styles.cardWrapper}>
              <ReportCard
                uuid={item.uuid}
                date={item.date}
                balance={item.balance}
                income={stats?.income}
                expenses={stats?.expenses}
                operationCount={stats?.operationCount}
                onPress={navigateToReport}
                onLongPress={handleLongPress}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.primary[600]} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {reportsListStrings.emptyTitle}
              </Text>
              <Text style={styles.emptySubtitle}>
                {reportsListStrings.emptySubtitle}
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
        onEndReachedThreshold={1}
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
  chartCard: {
    marginHorizontal: spacing.screenPadding,
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
  chartStatsWrapper: {
    paddingHorizontal: spacing.lg,
  },
  chartPlaceholder: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  listHeader: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.md,
  },
  listTitle: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.sectionTitle,
  },
  emptySubtitle: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default ReportsScreen;
