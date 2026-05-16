import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Bitcoin, ChevronLeft, Copy } from 'lucide-react-native';

import PrimaryButton from '@components/CustomButtons/PrimaryButton';
import {
  useDeleteWalletMutation,
  useWallets,
} from '@hooks/queries/wallets';
import { walletsSettingsStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

const WalletDetailScreen = () => {
  const router = useRouter();
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { data: wallets = [] } = useWallets();
  const deleteMutation = useDeleteWalletMutation();
  const insets = useSafeAreaInsets();

  const walletIndex = wallets.findIndex((w) => w.uuid === uuid);
  const wallet = walletIndex >= 0 ? wallets[walletIndex] : null;

  const handleCopy = async () => {
    if (!wallet) return;
    await Clipboard.setStringAsync(wallet.xpub);
    Alert.alert(walletsSettingsStrings.copied);
  };

  const handleDelete = () => {
    if (!wallet) return;
    Alert.alert(
      walletsSettingsStrings.deleteWalletPrompt,
      walletsSettingsStrings.deleteWalletBody,
      [
        { text: walletsSettingsStrings.cancel, style: 'cancel' },
        {
          text: walletsSettingsStrings.confirm,
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(wallet.uuid, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  };

  const handleViewInCrypto = () => {
    if (!wallet) return;
    router.push({
      pathname: '/crypto',
      params: { walletUuid: wallet.uuid },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{walletsSettingsStrings.detailTitle}</Text>
      </View>

      {wallet ? (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.identity}>
              <View style={styles.iconCircle}>
                <Bitcoin size={28} color={colors.primary[600]} strokeWidth={2.5} />
              </View>
              <Text style={styles.walletTitle}>Wallet {walletIndex + 1}</Text>
              <Text style={styles.xpub} selectable>
                {wallet.xpub}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopy}
                activeOpacity={0.7}
              >
                <Copy size={14} color={colors.primary[600]} strokeWidth={2.5} />
                <Text style={styles.copyText}>{walletsSettingsStrings.copy}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View
            style={[
              styles.footer,
              {
                paddingBottom:
                  Math.max(insets.bottom, spacing.lg) + spacing.xs,
              },
            ]}
          >
            <PrimaryButton
              title={walletsSettingsStrings.viewInCrypto}
              variant='secondary'
              onPress={handleViewInCrypto}
            />
            <PrimaryButton
              title={walletsSettingsStrings.deleteWallet}
              variant='danger'
              onPress={handleDelete}
              loading={deleteMutation.isPending}
            />
          </View>
        </>
      ) : (
        <View style={styles.missing}>
          <Text style={styles.missingText}>Wallet not found.</Text>
        </View>
      )}
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
  },
  scroll: {
    padding: spacing.screenPadding,
  },
  identity: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  walletTitle: {
    ...typography.sectionTitle,
  },
  xpub: {
    ...typography.caption,
    fontFamily: 'Inter-Medium',
    color: colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary[50],
    marginTop: spacing.sm,
  },
  copyText: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary[600],
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.screenPadding,
    gap: spacing.sm,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    ...typography.bodyRegular,
    color: colors.text.muted,
  },
});

export default WalletDetailScreen;
