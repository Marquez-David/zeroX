import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import CryptoTxCard from '@components/CustomCards/CryptoTxCard';
import CryptoTxDetailModal from '@components/CustomCards/CryptoTxDetailModal';
import LineChart from '@components/CustomCards/LineChart';
import WalletCard, {
  type WalletTypeFilter,
} from '@components/CustomCards/WalletCard';
import Select from '@components/CustomInputs/Select';
import { useBtcPriceHistory } from '@hooks/queries/btcPrice';
import { useWallet, useWallets } from '@hooks/queries/wallets';
import { truncateMiddle } from '@lib/format';
import { cryptoStrings } from '@lib/strings';
import { colors, radii, spacing, typography } from '@lib/theme';
import type { WalletTransaction } from '@lib/types';

type YearValue = 'all' | number;

const MONTH_LABEL = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: '2-digit',
});

const CHART_HEIGHT = 200;

const CryptoScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const { data: wallets = [], isLoading: walletsLoading } = useWallets();
  const router = useRouter();
  const params = useLocalSearchParams<{ walletUuid?: string }>();

  const [selectedWalletUuid, setSelectedWalletUuid] = useState<string | null>(
    null,
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<WalletTypeFilter>('all');
  const [activePanel, setActivePanel] = useState(0);
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

  useEffect(() => {
    if (wallets.length === 0) {
      setSelectedWalletUuid(null);
      return;
    }
    const stillThere = wallets.some((w) => w.uuid === selectedWalletUuid);
    if (!stillThere) setSelectedWalletUuid(wallets[0].uuid);
  }, [wallets, selectedWalletUuid]);

  useEffect(() => {
    if (!params.walletUuid) return;
    const exists = wallets.some((w) => w.uuid === params.walletUuid);
    if (exists) setSelectedWalletUuid(params.walletUuid);
    // Consume the param so subsequent renders (or navigating away and back)
    // don't keep overriding the user's selection.
    router.setParams({ walletUuid: undefined });
  }, [params.walletUuid, wallets, router]);

  const { data: walletDetail, isLoading: detailLoading } = useWallet(
    selectedWalletUuid ?? undefined,
  );
  const btcQuery = useBtcPriceHistory();

  const walletOptions = wallets.map((w, i) => ({
    value: w.uuid,
    label: `Wallet ${i + 1} · ${truncateMiddle(w.xpub, 6, 4)}`,
  }));

  const availableYears = useMemo(() => {
    if (!walletDetail) return [];
    const years = new Set<number>();
    walletDetail.transactions.forEach((tx) =>
      years.add(new Date(tx.date * 1000).getFullYear()),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [walletDetail]);

  const yearOptions: { value: YearValue; label: string }[] = [
    { value: 'all', label: cryptoStrings.allYearsLabel },
    ...availableYears.map((y) => ({ value: y, label: String(y) })),
  ];
  const currentYearValue: YearValue = selectedYear ?? 'all';

  const handleYearChange = (v: YearValue) => {
    setSelectedYear(v === 'all' ? null : v);
  };

  const toggleTypeFilter = (type: Exclude<WalletTypeFilter, 'all'>) => {
    setTypeFilter((current) => (current === type ? 'all' : type));
  };

  // Year-scoped transactions (independent of the type filter — stats always
  // reflect everything in the period, only the list is filtered by type).
  const yearTxs = useMemo(() => {
    if (!walletDetail) return [];
    if (selectedYear === null) return walletDetail.transactions;
    return walletDetail.transactions.filter(
      (tx) => new Date(tx.date * 1000).getFullYear() === selectedYear,
    );
  }, [walletDetail, selectedYear]);

  const filteredTxs = useMemo(() => {
    const sorted = [...yearTxs].sort((a, b) => b.date - a.date);
    if (typeFilter === 'all') return sorted;
    return sorted.filter((tx) => tx.type === typeFilter);
  }, [yearTxs, typeFilter]);

  // Year-aware aggregates — current_balance is always real-time from the API.
  const yearStats = useMemo(() => {
    if (!walletDetail) {
      return {
        received: 0,
        sent: 0,
        opsCount: 0,
        fees: 0,
        largest: 0,
        pendingCount: 0,
      };
    }
    const txsInScope =
      selectedYear === null
        ? walletDetail.transactions
        : walletDetail.transactions.filter(
            (tx) => new Date(tx.date * 1000).getFullYear() === selectedYear,
          );

    let received = 0;
    let sent = 0;
    let fees = 0;
    let largest = 0;
    let pendingCount = 0;
    txsInScope.forEach((tx) => {
      if (tx.type === 'received') received += tx.amount;
      else if (tx.type === 'sent') sent += tx.amount;
      fees += tx.fee ?? 0;
      const abs = Math.abs(tx.amount);
      if (abs > largest) largest = abs;
      if (!tx.confirmed) pendingCount += 1;
    });

    const receivedFromApi =
      selectedYear === null ? walletDetail.total_received : received;
    const sentFromApi = selectedYear === null ? walletDetail.total_sent : sent;

    return {
      received: receivedFromApi,
      sent: sentFromApi,
      opsCount: txsInScope.length,
      fees,
      largest,
      pendingCount,
    };
  }, [walletDetail, selectedYear]);

  const walletEvolution = useMemo(() => {
    if (!walletDetail) return { values: [], labels: [] };
    const sorted = [...walletDetail.transactions].sort(
      (a, b) => a.date - b.date,
    );
    let balance = 0;
    const points = sorted.map((tx) => {
      if (tx.type === 'received') balance += tx.amount;
      else if (tx.type === 'sent') balance -= tx.amount;
      return { timestamp: tx.date, balance };
    });
    const filtered =
      selectedYear === null
        ? points
        : points.filter(
            (p) => new Date(p.timestamp * 1000).getFullYear() === selectedYear,
          );
    return {
      values: filtered.map((p) => p.balance),
      labels: filtered.map((p) =>
        MONTH_LABEL.format(new Date(p.timestamp * 1000)),
      ),
    };
  }, [walletDetail, selectedYear]);

  const btcEvolution = useMemo(() => {
    const prices = btcQuery.data ?? [];
    const filtered =
      selectedYear === null
        ? prices
        : prices.filter(
            (p) => new Date(p.timestamp).getFullYear() === selectedYear,
          );
    return {
      values: filtered.map((p) => p.price),
      labels: filtered.map((p) => MONTH_LABEL.format(new Date(p.timestamp))),
    };
  }, [btcQuery.data, selectedYear]);

  const chartContentWidth = Math.max(
    0,
    windowWidth - spacing.screenPadding * 2 - spacing.lg * 2,
  );

  const handleCarouselScroll = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    if (idx !== activePanel) setActivePanel(idx);
  };

  const carouselRef = useRef<ScrollView>(null);

  useEffect(() => {
    carouselRef.current?.scrollTo({ x: 0, animated: false });
    setActivePanel(0);
  }, [selectedWalletUuid]);

  if (walletsLoading && wallets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      </SafeAreaView>
    );
  }

  if (wallets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{cryptoStrings.title}</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{cryptoStrings.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>
            {cryptoStrings.emptySubtitle}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartPanel = (
    title: string,
    hasData: boolean,
    loading: boolean,
    placeholder: string | null,
    chartNode: React.ReactNode,
  ) => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Select
          options={yearOptions}
          value={currentYearValue}
          onChange={handleYearChange}
        />
      </View>
      {loading ? (
        <View style={styles.panelLoading}>
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      ) : !hasData && placeholder ? (
        <View style={styles.panelLoading}>
          <Text style={styles.panelPlaceholder}>{placeholder}</Text>
        </View>
      ) : (
        chartNode
      )}
    </View>
  );

  const panelContents: React.ReactNode[] = [
    <View style={styles.walletCardWrapper} key='overview'>
      <WalletCard
        balance={walletDetail?.current_balance ?? 0}
        received={yearStats.received}
        sent={yearStats.sent}
        opsCount={yearStats.opsCount}
        fees={yearStats.fees}
        largest={yearStats.largest}
        pendingCount={yearStats.pendingCount}
        selectedYear={selectedYear}
        availableYears={availableYears}
        onYearChange={(v) => setSelectedYear(v)}
        activeTypeFilter={typeFilter}
        onToggleTypeFilter={toggleTypeFilter}
      />
    </View>,
    <View style={styles.chartPanelWrapper} key='wallet-evolution'>
      {chartPanel(
        cryptoStrings.walletEvolution,
        walletEvolution.values.length > 0,
        detailLoading && walletEvolution.values.length === 0,
        walletEvolution.values.length === 0 ? cryptoStrings.noTransactions : null,
        <LineChart
          values={walletEvolution.values}
          labels={walletEvolution.labels}
          width={chartContentWidth}
          height={CHART_HEIGHT}
          color={colors.primary[600]}
          formatY={formatBTCShort}
        />,
      )}
    </View>,
    <View style={styles.chartPanelWrapper} key='btc-price'>
      {chartPanel(
        cryptoStrings.btcPrice,
        btcEvolution.values.length > 0,
        false,
        cryptoStrings.btcPriceComingSoon,
        <LineChart
          values={btcEvolution.values}
          labels={btcEvolution.labels}
          width={chartContentWidth}
          height={CHART_HEIGHT}
          color={colors.warning[500]}
          formatY={formatEurShort}
        />,
      )}
    </View>,
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{cryptoStrings.title}</Text>
      </View>

      <FlatList
        data={filteredTxs}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <>
            {wallets.length > 1 ? (
              <View style={styles.walletSelectRow}>
                <Select
                  options={walletOptions}
                  value={selectedWalletUuid}
                  onChange={(v) => setSelectedWalletUuid(v)}
                />
              </View>
            ) : null}

            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleCarouselScroll}
              decelerationRate='fast'
            >
              {panelContents.map((panel, i) => (
                <View
                  key={i}
                  style={[styles.panelWrapper, { width: windowWidth }]}
                >
                  {panel}
                </View>
              ))}
            </ScrollView>

            <View style={styles.pageDots}>
              {panelContents.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pageDot,
                    activePanel === i && styles.pageDotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {cryptoStrings.transactions}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CryptoTxCard tx={item} onPress={() => setSelectedTx(item)} />
          </View>
        )}
        ListEmptyComponent={
          walletDetail ? (
            <View style={styles.inlineEmpty}>
              <Text style={styles.inlineEmptyText}>
                {cryptoStrings.noTransactions}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <CryptoTxDetailModal
        visible={selectedTx !== null}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </SafeAreaView>
  );
};

function formatBTCShort(v: number): string {
  if (v === 0) return '₿0';
  const abs = Math.abs(v);
  if (abs < 0.0001) return `₿${v.toExponential(1)}`;
  if (abs < 1) return `₿${parseFloat(v.toFixed(4))}`;
  return `₿${parseFloat(v.toFixed(3))}`;
}

function formatEurShort(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `€${(v / 1000).toFixed(1)}k`;
  return `€${Math.round(v)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heading,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
  walletSelectRow: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  panelWrapper: {
    paddingHorizontal: spacing.screenPadding,
  },
  walletCardWrapper: {
    flex: 1,
  },
  chartPanelWrapper: {
    flex: 1,
  },
  chartCard: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  panelLoading: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelPlaceholder: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  pageDots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.sectionGap,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.gray[300],
  },
  pageDotActive: {
    backgroundColor: colors.primary[600],
    width: 20,
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
  inlineEmpty: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  inlineEmptyText: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
});

export default CryptoScreen;
