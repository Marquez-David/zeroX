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
import { router } from 'expo-router';

import BalanceHeader from '@components/CustomCards/BalanceHeader';
import SpendingProgress from '@components/CustomCards/SpendingProgress';
import ReportCard from '@components/CustomCards/ReportCard';
import { useSession } from '@contexts/auth';
import { useYearStats } from '@hooks/queries/reports';
import { homeStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

const HomeScreen = () => {
  const { user } = useSession();
  // Default to "All" so the cold-login render only fires the unfiltered
  // `/reports` request — the selector lets the user narrow down explicitly.
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const {
    filteredReports,
    statsByUuid,
    totalBalance,
    income,
    expenses,
    availableYears,
    isLoading,
  } = useYearStats(selectedYear);

  const navigateToReport = (uuid: string) => {
    router.push({ pathname: '/report/[id]', params: { id: uuid } });
  };

  const HOME_REPORTS_PREVIEW = 3;

  const previewReports = useMemo(
    () => filteredReports.slice(0, HOME_REPORTS_PREVIEW),
    [filteredReports],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={previewReports}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <>
            <BalanceHeader
              userName={user?.username || user?.email || ''}
              totalBalance={totalBalance}
            />
            <SpendingProgress
              income={income}
              expenses={expenses}
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={setSelectedYear}
            />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {homeStrings.transferHistory}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/reports')}
                hitSlop={8}
              >
                <Text style={styles.seeAll}>{homeStrings.seeAll}</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
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
              <Text style={styles.emptyTitle}>{homeStrings.emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>
                {homeStrings.emptySubtitle}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sectionGap,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  seeAll: {
    ...typography.small,
    color: colors.primary[600],
    fontFamily: 'Inter-Medium',
  },
  cardWrapper: {
    paddingHorizontal: spacing.screenPadding,
  },
  list: {
    paddingBottom: spacing.scrollBottom,
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

export default HomeScreen;
