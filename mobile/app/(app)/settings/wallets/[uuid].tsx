import React from 'react';
import {
  ActivityIndicator,
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
import { Bitcoin, Check, ChevronLeft, Copy } from 'lucide-react-native';

import PrimaryButton from '@components/CustomButtons/PrimaryButton';
import {
  useDeleteWalletMutation,
  useWallets,
} from '@hooks/queries/wallets';
import { detectCrypto } from '@lib/format';
import { walletsSettingsStrings } from '@lib/strings';
import { colors, radii, spacing, typography } from '@lib/theme';

const WalletDetailScreen = () => {
  const router = useRouter();
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const { data: wallets = [], isLoading } = useWallets();
  const deleteMutation = useDeleteWalletMutation();
  const insets = useSafeAreaInsets();

  const normalizedUuid = String(uuid).toLowerCase();
  const walletIndex = wallets.findIndex(
    (w) => String(w.uuid).toLowerCase() === normalizedUuid,
  );
  const wallet = walletIndex >= 0 ? wallets[walletIndex] : null;
  const crypto = wallet ? detectCrypto(wallet.xpub) : null;

  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!wallet) return;
    await Clipboard.setStringAsync(wallet.xpub);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Dark hero card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  {crypto!.symbol === 'BTC'
                    ? <Bitcoin size={24} color={crypto!.color} strokeWidth={2} />
                    : <Text style={[styles.heroIconText, { color: crypto!.color }]}>{crypto!.symbol[0]}</Text>
                  }
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{crypto!.symbol} · Mainnet</Text>
                </View>
              </View>

              <Text style={styles.heroName}>{crypto!.name}</Text>
              <View style={styles.heroAddressTypePill}>
                <Text style={styles.heroAddressTypeText}>{crypto!.addressType}</Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.xpubRow}>
                <Text style={styles.heroXpubShort} numberOfLines={1}>
                  {wallet.xpub.slice(0, 12)}…{wallet.xpub.slice(-8)}
                </Text>
                <TouchableOpacity
                  style={styles.copyIconBtn}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  {copied
                    ? <Check size={15} color='rgba(255,255,255,0.9)' strokeWidth={2.5} />
                    : <Copy size={15} color='rgba(255,255,255,0.5)' strokeWidth={2.5} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Info rows */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DETAILS</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Network" value={`${crypto!.name} Mainnet`} />
                <View style={styles.divider} />
                <InfoRow label="Address format" value={crypto!.addressType} />
                <View style={styles.divider} />
                <InfoRow label="Derivation" value={crypto!.derivationPath} mono />
                <View style={styles.divider} />
                <InfoRow label="Access" value="Read-only" />
                <View style={styles.divider} />
                <InfoRow label="Encryption" value="AES-256 at rest" />
                <View style={styles.divider} />
                <InfoRow label="Wallet ID" value={wallet.uuid.split('-')[0].toUpperCase()} mono />
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xs },
            ]}
          >
            <PrimaryButton
              title={walletsSettingsStrings.deleteWallet}
              variant='danger'
              onPress={handleDelete}
              loading={deleteMutation.isPending}
            />
          </View>
        </>
      ) : isLoading ? (
        <View style={styles.missing}>
          <ActivityIndicator color={colors.primary[600]} />
        </View>
      ) : (
        <View style={styles.missing}>
          <Text style={styles.missingText}>Wallet not found.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

type InfoRowProps = { label: string; value: string; mono?: boolean };
const InfoRow = ({ label, value, mono }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, mono && styles.infoValueMono]}>{value}</Text>
  </View>
);

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
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },

  // Hero card
  heroCard: {
    backgroundColor: colors.primary[700],
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.white,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.6,
  },
  heroName: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: colors.white,
    marginTop: spacing.xs,
  },
  heroAddressTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  heroAddressTypeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.xs,
  },
  heroXpubShort: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    flex: 1,
  },

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.muted,
    letterSpacing: 1.4,
  },

  xpubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  copyIconBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info card
  infoCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  infoValueMono: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.text.secondary,
  },

  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.screenPadding,
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
