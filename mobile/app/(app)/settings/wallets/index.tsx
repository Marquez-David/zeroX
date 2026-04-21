import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bitcoin, ChevronLeft, Plus } from 'lucide-react-native';

import WalletRow from '@components/CustomCards/WalletRow';
import {
  useDeleteWalletMutation,
  useWallets,
} from '@hooks/queries/wallets';
import { walletsSettingsStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

const WalletsListScreen = () => {
  const router = useRouter();
  const { data: wallets = [], isLoading } = useWallets();
  const deleteMutation = useDeleteWalletMutation();

  const confirmDelete = (uuid: string) => {
    Alert.alert(
      walletsSettingsStrings.deleteWalletPrompt,
      walletsSettingsStrings.deleteWalletBody,
      [
        { text: walletsSettingsStrings.cancel, style: 'cancel' },
        {
          text: walletsSettingsStrings.confirm,
          style: 'destructive',
          onPress: () => deleteMutation.mutate(uuid),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{walletsSettingsStrings.title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/settings/wallets/add')}
          activeOpacity={0.7}
        >
          <Plus size={20} color={colors.primary[600]} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={wallets}
        keyExtractor={(w) => w.uuid}
        renderItem={({ item, index }) => (
          <WalletRow
            index={index}
            xpub={item.xpub}
            onPress={() =>
              router.push({
                pathname: '/settings/wallets/[uuid]',
                params: { uuid: item.uuid },
              })
            }
            onDelete={() => confirmDelete(item.uuid)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Bitcoin size={32} color={colors.text.muted} strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>
                {walletsSettingsStrings.emptyTitle}
              </Text>
              <Text style={styles.emptySubtitle}>
                {walletsSettingsStrings.emptySubtitle}
              </Text>
            </View>
          ) : null
        }
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
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  back: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: {
    ...typography.heading,
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.scrollBottom,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
});

export default WalletsListScreen;
